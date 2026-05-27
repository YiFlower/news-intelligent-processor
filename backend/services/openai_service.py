from openai import OpenAI
from config import settings

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
        )
    return _client


SYSTEM_PROMPT = """你是"软通动力新闻智能整理与分析平台"的AI助手。你的职责是帮助用户分析和理解软通动力（iSoftstone）近期的新闻动态。

你可以：
1. 总结和分析软通动力的新闻趋势
2. 解释特定新闻事件的意义和影响
3. 对比不同新闻之间的关联
4. 提供行业背景和发展前景分析

回答要求：
- 使用中文回答
- 简洁明了，重点突出
- 如果用户的问题与软通动力新闻无关，礼貌引导回主题
- 基于提供的新闻数据回答，不要编造不存在的信息"""


async def summarize_news(news_list: list[dict]) -> str:
    """Generate an AI summary of the news collection."""
    client = _get_client()

    news_text = '\n'.join(
        f'- [{n["publish_date"]}] {n["title"]}（{n["category"]}）'
        for n in news_list[:30]
    )

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': f'以下是软通动力近30天的新闻列表，请生成一段简要的新闻总结报告（200字以内），突出核心战略方向和重要事件：\n\n{news_text}'},
        ],
        max_tokens=500,
    )
    return response.choices[0].message.content or ''


async def generate_hot_topics(news_list: list[dict]) -> list[dict]:
    """Use AI to identify and aggregate hot topics from news."""
    client = _get_client()
    import json

    news_text = '\n'.join(
        f'{i+1}. [{n["category"]}] {n["title"]} - {n["summary"][:80]}'
        for i, n in enumerate(news_list[:30])
    )

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {'role': 'system', 'content': '你是一个新闻分析专家。请从新闻列表中识别3个核心热点话题，每个话题包含标题、摘要和关键词。返回JSON格式。'},
            {'role': 'user', 'content': f'请分析以下软通动力新闻，识别3个核心热点话题。返回JSON数组格式：\n[{{"title": "话题标题", "summary": "50字摘要", "keywords": ["关键词1", "关键词2"], "news_indices": [0, 1]}}]\n\n新闻列表：\n{news_text}'},
        ],
        max_tokens=1000,
    )

    content = response.choices[0].message.content or '[]'
    try:
        content = content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1].rsplit('```', 1)[0].strip()
        topics = json.loads(content)
        news_slice = news_list[:30]
        for i, topic in enumerate(topics):
            topic['id'] = f'topic_{i+1}'
            # Convert indices to actual news IDs for reliable frontend linking
            indices = topic.get('news_indices', [])
            topic['news_ids'] = [
                news_slice[idx]['id'] for idx in indices
                if isinstance(idx, int) and 0 <= idx < len(news_slice)
            ]
        return topics
    except (json.JSONDecodeError, KeyError):
        return []


async def chat(message: str, history: list[dict], news_context: list[dict]) -> str:
    """Process a chat message with news context."""
    client = _get_client()

    news_summary = '\n'.join(
        f'- [{n["publish_date"]}] [{n["category"]}] {n["title"]}: {n["summary"][:100]}'
        for n in news_context[:30]
    )

    messages = [
        {'role': 'system', 'content': f'{SYSTEM_PROMPT}\n\n以下是当前新闻数据供你参考：\n{news_summary}'},
    ]

    for msg in history[-10:]:
        messages.append({
            'role': msg.get('role', 'user'),
            'content': msg.get('content', ''),
        })

    messages.append({'role': 'user', 'content': message})

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        max_tokens=800,
    )
    return response.choices[0].message.content or ''
