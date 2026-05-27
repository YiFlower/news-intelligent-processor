import asyncio
import hashlib
import logging
from urllib.parse import urlparse

import httpx

from config import settings

logger = logging.getLogger('baidu_search')


# --- Non-news filtering ---

EXCLUDE_URL_PATTERNS = [
    '/careers', '/jobs', '/career',
    'baike.baidu', 'wikipedia',
    'tradingview.com', 'stock.finance',
    '/gongsijianjie', '/aboutUs', '/about-us',
    '.pdf', '.PDF', '.doc', '.docx',
    'static.cninfo.com.cn', 'pdf.dfcfw.com',
    'notice.10jqka.com.cn',
    'basic.10jqka.com.cn', 'vip.stock.finance.sina',
    'money.finance.sina.com.cn/corp/view',
    'stockpage.10jqka.com.cn',
    'quotes.sina.cn', 'k.sina.com.cn',
    'q.10jqka.com.cn',
    '配资', 'zumberri.com',
    'matrixbcg.com', 'forbes.com/companies',
    'wscrc.org', 'linkedin.com',
    # Stock data / financial data pages (not news articles)
    'finance.yahoo.com/quote',
    'data.eastmoney.com/stockdata',
    'emweb.eastmoney.com',
    'moomoo.com',
    'quote.eastmoney.com',
    'guba.eastmoney.com',
    'q.stock.sohu.com',
    'stock.10jqka.com.cn',
    'futunn.com',
    'rs.zqrb.cn',
    '/disclosure/',
    # Company homepage / listing pages (not individual articles)
    'isoftstone.com/en',
    'isoftstone.com/zh-cn',
    'isoftstone.com/sg-en',
    'isoftstone.com/my-en',
    'isoftstonedigital.com/pressreleases',
    'isoftstone.com/zh-cn/news',
    'isoftstone.com/en/news',
    'isoftstoneinc.com/business-automation',
    'isoftstoneinc.com/privacy',
    # Community / developer pages (not news)
    'hiascend.com',
    'api-clouds.com',
    'ncss.cn',
]

EXCLUDE_TITLE_PATTERNS = [
    '[PDF]',
    '公司资料',
    '年度报告',
    '季度报告',
    '半年度报告',
    'Class A',
    'Growth Strategy and Future',
    'Press Releases',
    'What is',
    '新闻资讯-isoftstone',
    'isoftstone软通动力',
    'Trusted Partner for Enterprise',
    '股票_数据_资料',
    '财报-',
    'iSoftStone Information Technology (Group)',
    'Privacy Policy',
    '经营分析',
    '管理层 -',
    '公司高管',
    'Insights | iSoftStone',
    'Receipt of Non-Binding',
    'Merger Agreement',
    'Completes the Acquisition',
]

RELEVANCE_KEYWORDS = ['isoftstone', '软通动力', '软通', 'iSoftStone']

# Friendly source names for known domains
SOURCE_NAMES = {
    'stcn.com': '证券时报',
    'jjckb.xinhuanet.com': '经济参考报',
    'wap.eastmoney.com': '东方财富',
    'caifuhao.eastmoney.com': '东方财富',
    'data.eastmoney.com': '东方财富',
    'cls.cn': '财联社',
    'hk.prnasia.com': '亚洲公关网',
    'prnasia.com': '亚洲公关网',
    'prnewswire.com': '美通社',
    'regional.chinadaily.com.cn': '中国日报',
    'cn.chinadaily.com.cn': '中国日报',
    'devicepartner.huawei.com': '华为开发者',
    'kmworld.com': 'KMWorld',
    'pnpchina.com': 'PNP中国',
    'community.aijishu.com': '极术社区',
    'isoftstone.com': '软通动力官网',
    'isoftstoneinc.com': '软通动力官网',
    'mp.weixin.qq.com': '微信公众号',
    'news.sina.com.cn': '新浪新闻',
    'finance.sina.com.cn': '新浪财经',
    '36kr.com': '36氪',
    'ithome.com': 'IT之家',
    'tmtpost.com': '钛媒体',
    'sohu.com': '搜狐',
    '163.com': '网易',
    'qq.com': '腾讯新闻',
    'techweb.com.cn': 'TechWeb',
    'cninfo.com.cn': '巨潮资讯',
    'sse.com.cn': '上交所',
    'szse.cn': '深交所',
    'eet-china.com': '电子工程专辑',
    'elecfans.com': '电子发烧友',
    'icloudnews.net': '云新闻',
    'delab.uibe.edu.cn': '对外经贸大学',
}

SEARCH_QUERIES = [
    # Core Chinese news queries
    {'query': '软通动力 最新新闻 动态', 'recency': 'year'},
    {'query': '软通动力 AI 人工智能 大模型 鸿蒙', 'recency': 'year'},
    {'query': '软通动力 合作 签约 战略协议', 'recency': 'year'},
    {'query': '软通动力 业绩 营收 年报 财报', 'recency': 'year'},
    {'query': '软通动力 鸿蒙 OpenHarmony 开源鸿蒙', 'recency': 'year'},
    {'query': '软通动力 中标 项目 招标 政府采购', 'recency': 'year'},
    {'query': '软通动力 华为 鲲鹏 昇腾 算力', 'recency': 'year'},
    {'query': '软通华方 信创 服务器 工作站 同方', 'recency': 'year'},
    {'query': '软通动力 股东 减持 增持 公告', 'recency': 'year'},
    {'query': '软通动力 出海 国际化 MerakAI', 'recency': 'year'},
    {'query': '软通动力 数字化 转型 智能制造', 'recency': 'year'},
    {'query': '软通动力 人事 高管 管理层 任命', 'recency': 'year'},
    # English queries
    {'query': 'isoftstone news latest 2025 2026', 'recency': 'year'},
    {'query': 'isoftstone AI digital transformation', 'recency': 'year'},
    # Official site & press releases
    {'query': 'isoftstone press release announcement', 'recency': 'year'},
]


def _is_news_article(url: str, title: str) -> bool:
    """Filter out non-news content."""
    url_lower = url.lower()
    for pattern in EXCLUDE_URL_PATTERNS:
        if pattern.lower() in url_lower:
            return False
    for pattern in EXCLUDE_TITLE_PATTERNS:
        if pattern in title:
            return False
    if len(title) < 12:
        return False
    if title.startswith('http'):
        return False
    return True


def _make_id(url: str, title: str) -> str:
    raw = f'{url}:{title}'
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def _get_domain(url: str) -> str:
    """Extract domain from URL, stripping www. prefix."""
    try:
        return urlparse(url).netloc.replace('www.', '')
    except Exception:
        return '未知来源'


def _find_source_name(domain: str) -> str:
    """Find friendly source name by checking if domain ends with any known domain."""
    if domain in SOURCE_NAMES:
        return SOURCE_NAMES[domain]
    # Check if domain is a subdomain of a known source
    for known_domain, name in SOURCE_NAMES.items():
        if domain.endswith(known_domain) or domain == known_domain:
            return name
    return domain


# --- Baidu Search API client ---

async def _call_baidu_search(query: str, recency: str = 'year', top_k: int = 20) -> list[dict]:
    """
    Call Baidu qianfan ai_search/web_search API.

    Response references[] fields:
      id, title, url, website, content (~20 chars), date, type,
      rerank_score, authority_score, web_anchor
    """
    headers = {
        'Authorization': f'Bearer {settings.BAIDU_API_KEY}',
        'Content-Type': 'application/json',
    }
    payload = {
        'messages': [{'role': 'user', 'content': query}],
        'search_source': 'baidu_search_v2',
        'resource_type_filter': [{'type': 'web', 'top_k': top_k}],
        'search_recency_filter': recency,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            settings.BAIDU_SEARCH_URL,
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    # Check for API error
    if 'code' in data and data['code']:
        raise RuntimeError(f'Baidu API error: {data.get("code")} - {data.get("message", "")}')

    return data.get('references', [])


# --- Phase 1: Fetch raw articles ---

async def fetch_raw_articles() -> list[dict]:
    """Fetch news from Baidu Search API and apply basic filtering."""
    all_results: dict[str, dict] = {}

    for i, query_config in enumerate(SEARCH_QUERIES):
        query = query_config['query']
        recency = query_config.get('recency', 'year')

        # 请求间隔，避免触发限流
        if i > 0:
            await asyncio.sleep(3)

        # 重试逻辑：429 限流时等待后重试
        references = []
        for attempt in range(3):
            try:
                references = await _call_baidu_search(query, recency=recency)
                logger.info('Query "%s" returned %d results', query, len(references))
                break
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 and attempt < 2:
                    wait = 10 * (attempt + 1)
                    logger.warning('Query "%s" rate limited, retrying in %ds...', query, wait)
                    await asyncio.sleep(wait)
                else:
                    logger.warning('Query "%s" failed: %s', query, e)
                    break
            except Exception as e:
                logger.warning('Query "%s" failed: %s', query, e)
                break

        for ref in references:
            url = ref.get('url', '')
            title = (ref.get('title', '') or '').strip()
            if not title or not url or url in all_results:
                continue
            all_results[url] = ref

    raw_articles = []
    for url, ref in all_results.items():
        title = (ref.get('title', '') or '').strip()
        content = ref.get('content', '') or ''
        full_text = f'{title} {content}'.lower()

        # Relevance check
        if not any(kw in full_text for kw in RELEVANCE_KEYWORDS):
            continue

        # Non-news filter
        if not _is_news_article(url, title):
            continue

        domain = _get_domain(url)
        raw_date = ref.get('date', '') or ''

        raw_articles.append({
            'id': _make_id(url, title),
            'title': title,
            'content': content,
            'source': domain,
            'source_name': _find_source_name(domain),
            'source_url': url,
            'raw_published_date': raw_date,
        })

    logger.info('Phase 1 summary: %d raw URLs collected, %d passed filters', len(all_results), len(raw_articles))
    return raw_articles


# --- Orchestrator ---

def _normalize_baidu_date(raw_date: str) -> str:
    """Normalize Baidu date string (e.g. '2025-04-27 18:02:00') to YYYY-MM-DD."""
    if not raw_date:
        return ''
    try:
        # Baidu dates can be "2025-04-27 18:02:00" or "2025-04-27" or ISO with T
        if 'T' in raw_date:
            return raw_date.split('T')[0]
        if ' ' in raw_date:
            return raw_date.split(' ')[0]
        if len(raw_date) >= 10 and raw_date[4] == '-':
            return raw_date[:10]
        return ''
    except Exception:
        return ''


def _postprocess_dates(enriched: list[dict], raw_date_map: dict[str, str]) -> list[dict]:
    """Post-process AI-extracted dates using Baidu's raw date as ground truth."""
    from datetime import datetime, timedelta

    today = datetime.now().strftime('%Y-%m-%d')
    cutoff_old = (datetime.now() - timedelta(days=365 * 2)).strftime('%Y-%m-%d')

    for article in enriched:
        aid = article.get('id', '')
        ai_date = article.get('publish_date', '')
        baidu_date = _normalize_baidu_date(raw_date_map.get(aid, ''))

        if baidu_date:
            if not ai_date or ai_date == today:
                article['publish_date'] = baidu_date
            elif ai_date < cutoff_old:
                article['publish_date'] = baidu_date

    return enriched


async def fetch_and_process_news() -> list[dict]:
    """Orchestrate the full pipeline: Phase 1 (fetch) -> Phase 2 (AI enrich) -> postprocess -> sort."""
    from services.ai_processing_service import enrich_articles_batch

    # Phase 1: Fetch raw articles via Baidu Search
    raw_articles = await fetch_raw_articles()
    if not raw_articles:
        return []

    # Build raw_published_date map for post-processing
    raw_date_map = {a['id']: a.get('raw_published_date', '') for a in raw_articles}

    # Phase 2: AI batch enrichment
    enriched = await enrich_articles_batch(raw_articles)

    # Phase 2.5: Post-process dates using Baidu data
    enriched = _postprocess_dates(enriched, raw_date_map)

    # Sort by publish_date descending
    enriched.sort(key=lambda x: x.get('publish_date', ''), reverse=True)

    logger.info('Pipeline complete: %d articles ready', len(enriched))
    return enriched
