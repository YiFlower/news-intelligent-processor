from fastapi import APIRouter, HTTPException
from models import RefreshResponse
from services.storage_service import load_news, save_news, update_last_updated, load_meta
from services.baidu_service import fetch_and_process_news
from services.openai_service import summarize_news, generate_hot_topics
from config import settings

router = APIRouter(prefix='/api/news', tags=['news'])


@router.get('')
async def get_news(category: str | None = None, search: str | None = None, sort: str = 'date'):
    """Get all news with optional filtering and sorting."""
    news_list = load_news()

    # Filter to last 30 days
    from datetime import datetime, timedelta
    cutoff = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    news_list = [n for n in news_list if n.get('publish_date', '') >= cutoff]

    if category:
        news_list = [n for n in news_list if n.get('category') == category]

    if search:
        q = search.lower()
        news_list = [
            n for n in news_list
            if q in n.get('title', '').lower()
            or q in n.get('summary', '').lower()
            or any(q in kw.lower() for kw in n.get('keywords', []))
        ]

    if sort == 'importance':
        news_list.sort(key=lambda x: x.get('importance', 0), reverse=True)
    else:
        news_list.sort(key=lambda x: x.get('publish_date', ''), reverse=True)

    return news_list


@router.get('/stats')
async def get_stats():
    """Get news statistics."""
    news_list = load_news()

    # Filter to last 30 days
    from datetime import datetime, timedelta
    cutoff = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    news_list = [n for n in news_list if n.get('publish_date', '') >= cutoff]

    categories = set(n.get('category', '') for n in news_list)
    meta = load_meta()

    return {
        'total': len(news_list),
        'days_covered': 30,
        'categories': len(categories),
        'hot_topics': 3,
        'last_updated': meta.get('last_updated'),
    }


@router.get('/hot-topics')
async def get_hot_topics():
    """Get AI-generated hot topics."""
    import os
    import json
    topics_file = os.path.join(settings.DATA_DIR, 'hot_topics.json')

    if os.path.exists(topics_file):
        with open(topics_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    news_list = load_news()
    if not news_list:
        return []

    if not settings.OPENAI_API_KEY:
        return _fallback_topics(news_list)

    topics = await generate_hot_topics(news_list)
    if topics:
        with open(topics_file, 'w', encoding='utf-8') as f:
            json.dump(topics, f, ensure_ascii=False, indent=2)

    return topics


@router.post('/refresh', response_model=RefreshResponse)
async def refresh_news():
    """Fetch fresh news from Baidu Search API."""
    if not settings.BAIDU_API_KEY:
        raise HTTPException(status_code=500, detail='Baidu API Key not configured')

    try:
        import asyncio
        news_list = await asyncio.wait_for(
            fetch_and_process_news(),
            timeout=settings.AI_PROCESSING_TIMEOUT + 60,
        )
        save_news(news_list)
        last_updated = update_last_updated()

        # Regenerate hot topics on refresh
        import os
        topics_file = os.path.join(settings.DATA_DIR, 'hot_topics.json')
        if os.path.exists(topics_file):
            os.remove(topics_file)

        if settings.OPENAI_API_KEY and news_list:
            # Generate hot topics from 30-day filtered news only
            from datetime import datetime, timedelta
            cutoff_30 = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            recent_news = [n for n in news_list if n.get('publish_date', '') >= cutoff_30]
            topics = await generate_hot_topics(recent_news if recent_news else news_list[:10])
            if topics:
                import json
                with open(topics_file, 'w', encoding='utf-8') as f:
                    json.dump(topics, f, ensure_ascii=False, indent=2)

        return RefreshResponse(
            success=True,
            count=len(news_list),
            last_updated=last_updated,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to fetch news: {str(e)}')


@router.get('/summary')
async def get_summary():
    """Get AI-generated news summary."""
    news_list = load_news()
    if not news_list:
        return {'summary': '暂无新闻数据'}

    if not settings.OPENAI_API_KEY:
        return {'summary': f'共收录 {len(news_list)} 篇软通动力近期新闻，涵盖多个业务领域。'}

    summary = await summarize_news(news_list)
    return {'summary': summary}


def _fallback_topics(news_list: list[dict]) -> list[dict]:
    """Fallback hot topics when OpenAI is not available."""
    from collections import Counter
    category_counts = Counter(n.get('category', '') for n in news_list)
    top_categories = category_counts.most_common(3)

    topics = []
    for i, (cat, count) in enumerate(top_categories):
        cat_news = [n for n in news_list if n.get('category') == cat][:5]
        topics.append({
            'id': f'topic_{i+1}',
            'title': f'{cat}动态（{count}篇）',
            'summary': f'近30天软通动力在{cat}领域共有{count}篇新闻报道',
            'keywords': list(set(kw for n in cat_news for kw in n.get('keywords', [])[:3]))[:4],
            'news_ids': [n['id'] for n in cat_news],
        })
    return topics
