import asyncio
import json
import logging
from datetime import datetime

import json_repair

from config import settings
from services.openai_service import _get_client

logger = logging.getLogger('ai_processing')

VALID_CATEGORIES = {'战略发展', '技术创新', '人事动态', '合作签约', '行业活动'}
FALLBACK_CATEGORY = '战略发展'
FALLBACK_IMPORTANCE = 3

ENRICHMENT_SYSTEM_PROMPT = """你是软通动力新闻数据处理助手。你的任务是对新闻文章进行结构化处理和信息提取。

你需要对每篇文章完成以下6项处理：
1. 内容清洗：去除导航栏、页脚、版权声明、评论区、广告、推荐阅读、相关文章列表等无关内容，去除Markdown格式符号（如#、*、[]、```等），只保留新闻正文内容
2. 摘要生成：用1-3句完整的中文句子概括文章核心内容，要求语义完整、不截断、不带"..."
3. 分类：从以下5个类别中选择最匹配的一个：战略发展、技术创新、人事动态、合作签约、行业活动
4. 关键词提取：提取最多6个最能代表文章主题的关键词（每个2-6个字）
5. 重要性评分：1-5分（1=一般动态，3=重要事件，5=重大战略/里程碑事件）
6. 发布日期：优先使用提供的"搜索提供日期"字段，如果该字段有效（非"无"），直接使用该日期。仅当搜索日期为"无"时，才根据URL路径中的日期数字（如/202605/表示2026年5月）、内容中的明确日期描述来推断发布日期。格式必须为YYYY-MM-DD。不要编造日期。

返回要求：严格返回JSON数组，不要包含任何其他文字、解释或Markdown标记。"""


def _build_batch_prompt(batch: list[dict]) -> str:
    """Build the user prompt for a batch of articles."""
    n = len(batch)
    parts = [f'请处理以下{n}篇新闻文章，返回JSON数组：\n']

    for i, article in enumerate(batch, 1):
        content = article.get('content', '')
        max_chars = settings.AI_CONTENT_MAX_CHARS
        if len(content) > max_chars:
            content = content[:max_chars] + '...[已截断]'

        parts.append(
            f'--- 文章 {i} ---\n'
            f'标题：{article["title"]}\n'
            f'来源URL：{article["source_url"]}\n'
            f'搜索提供日期：{article.get("raw_published_date", "无")}\n'
            f'内容（可能包含杂质）：\n{content}\n'
        )

    parts.append(
        f'返回格式（JSON数组，包含{n}个对象，顺序与上面一致）：\n'
        '[\n'
        '  {\n'
        '    "index": 1,\n'
        '    "clean_content": "清洗后的正文内容",\n'
        '    "summary": "1-3句完整摘要",\n'
        '    "category": "分类（五选一）",\n'
        '    "keywords": ["关键词1", "关键词2"],\n'
        '    "importance": 3,\n'
        '    "publish_date": "2025-08-28"\n'
        '  }\n'
        ']'
    )
    return '\n'.join(parts)


def _validate_category(category: str) -> str:
    """Validate category against the allowed list."""
    if category in VALID_CATEGORIES:
        return category
    return FALLBACK_CATEGORY


def _validate_importance(score) -> int:
    """Validate and clamp importance score to [1, 5]."""
    try:
        val = int(score)
        return max(1, min(5, val))
    except (TypeError, ValueError):
        return FALLBACK_IMPORTANCE


def _parse_ai_response(raw_content: str, batch_size: int) -> list[dict]:
    """Parse AI response with robust JSON handling."""
    text = raw_content.strip()

    # Strip markdown code fences
    if text.startswith('```'):
        # Remove first line (```json or ```)
        first_nl = text.find('\n')
        if first_nl != -1:
            text = text[first_nl + 1:]
        # Remove trailing ```
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()

    # Try standard JSON parsing first
    parsed = None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback to json_repair
    if parsed is None:
        try:
            parsed = json_repair.repair_json(text, return_objects=True)
        except Exception:
            raise ValueError(f'Failed to parse AI response as JSON: {text[:200]}')

    # Validate it's a list
    if not isinstance(parsed, list):
        raise ValueError(f'AI response is not a list: {type(parsed)}')

    # Validate and fix each item
    required_fields = {'index', 'clean_content', 'summary', 'category', 'keywords', 'importance', 'publish_date'}
    results = []

    for item in parsed:
        if not isinstance(item, dict):
            continue
        # Fill missing fields with defaults
        for field in required_fields:
            if field not in item:
                if field == 'keywords':
                    item[field] = []
                elif field == 'importance':
                    item[field] = FALLBACK_IMPORTANCE
                elif field == 'category':
                    item[field] = FALLBACK_CATEGORY
                elif field == 'publish_date':
                    item[field] = datetime.now().strftime('%Y-%m-%d')
                else:
                    item[field] = ''

        # Validate specific fields
        item['category'] = _validate_category(item['category'])
        item['importance'] = _validate_importance(item['importance'])
        if not isinstance(item['keywords'], list):
            item['keywords'] = []
        item['keywords'] = [str(kw) for kw in item['keywords'] if len(str(kw)) >= 2][:6]

        results.append(item)

    return results


def _apply_fallback(article: dict) -> dict:
    """Apply fallback enrichment when AI processing fails."""
    title = article.get('title', '')
    raw_content = article.get('content', '')

    # Extract basic keywords from title
    kw_candidates = ['软通动力', '软通华方', '鸿蒙', 'AI', '人工智能', '大模型',
                     '合作', '签约', '战略', '峰会', '获奖', '营收', '开源']
    fallback_kw = [kw for kw in kw_candidates if kw in title]

    return {
        **article,
        'summary': title,
        'content': raw_content[:500] if raw_content else title,
        'category': FALLBACK_CATEGORY,
        'keywords': fallback_kw[:4],
        'importance': FALLBACK_IMPORTANCE,
        'publish_date': datetime.now().strftime('%Y-%m-%d'),
    }


async def _process_single_batch(
    batch: list[dict],
    semaphore: asyncio.Semaphore,
    batch_index: int,
    total_batches: int,
) -> list[dict]:
    """Process a single batch of articles through AI."""
    async with semaphore:
        try:
            client = _get_client()
            user_prompt = _build_batch_prompt(batch)

            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {'role': 'system', 'content': ENRICHMENT_SYSTEM_PROMPT},
                        {'role': 'user', 'content': user_prompt},
                    ],
                    max_tokens=4096,
                    temperature=0.1,
                ),
            )

            raw_content = response.choices[0].message.content or '[]'
            parsed = _parse_ai_response(raw_content, len(batch))

            # Build index->result mapping for reliable matching
            index_map = {}
            for item in parsed:
                idx = item.get('index', 0)
                if isinstance(idx, int):
                    index_map[idx] = item

            # Merge AI results back onto original articles
            enriched = []
            for i, article in enumerate(batch, 1):
                ai_data = index_map.get(i)
                if ai_data:
                    enriched.append({
                        'id': article['id'],
                        'title': article['title'],
                        'summary': ai_data.get('summary', article['title']),
                        'content': ai_data.get('clean_content', article.get('content', '')),
                        'category': ai_data.get('category', FALLBACK_CATEGORY),
                        'keywords': ai_data.get('keywords', []),
                        'source': article['source'],
                        'source_name': article.get('source_name', article['source']),
                        'source_url': article['source_url'],
                        'publish_date': ai_data.get('publish_date', datetime.now().strftime('%Y-%m-%d')),
                        'importance': ai_data.get('importance', FALLBACK_IMPORTANCE),
                        'related_ids': [],
                    })
                else:
                    logger.warning('Batch %d/%d: missing item %d, using fallback', batch_index, total_batches, i)
                    enriched.append(_apply_fallback(article))

            logger.info('Batch %d/%d: AI enrichment succeeded (%d articles)', batch_index, total_batches, len(enriched))
            return enriched

        except Exception as e:
            logger.warning('Batch %d/%d: AI enrichment failed, using fallback: %s', batch_index, total_batches, e)
            return [_apply_fallback(article) for article in batch]


async def enrich_articles_batch(articles: list[dict]) -> list[dict]:
    """Main entry: enrich all raw articles via batched AI calls."""
    if not articles:
        return []

    batch_size = settings.AI_BATCH_SIZE
    batches = []
    for i in range(0, len(articles), batch_size):
        batches.append(articles[i:i + batch_size])

    total = len(batches)
    semaphore = asyncio.Semaphore(settings.AI_MAX_CONCURRENT)

    logger.info('Starting AI enrichment: %d articles in %d batches (size=%d, max_concurrent=%d)',
                len(articles), total, batch_size, settings.AI_MAX_CONCURRENT)

    try:
        tasks = [
            _process_single_batch(batch, semaphore, i + 1, total)
            for i, batch in enumerate(batches)
        ]
        results = await asyncio.gather(*tasks)

        # Flatten results
        enriched = []
        for batch_result in results:
            enriched.extend(batch_result)

        logger.info('AI enrichment complete: %d articles enriched', len(enriched))
        return enriched

    except Exception as e:
        logger.error('Phase 2 AI enrichment completely failed, using fallback for all %d articles: %s',
                     len(articles), e)
        return [_apply_fallback(article) for article in articles]
