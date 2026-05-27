import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)s: %(message)s')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import news, chat
from services.baidu_service import fetch_and_process_news
from services.storage_service import save_news, update_last_updated
from services.openai_service import generate_hot_topics

logger = logging.getLogger('scheduler')

# Schedule: daytime (8-22) every 4h → 8:00, 12:00, 16:00, 20:00
#           nighttime (22-8) every 6h → 2:00
SCHEDULE_HOURS = [2, 8, 12, 16, 20]


async def _auto_refresh_task():
    """Background task that auto-fetches news on schedule."""
    logger.info('Auto-refresh scheduler started. Schedule hours: %s', SCHEDULE_HOURS)
    last_run_hour = -1

    while True:
        now = datetime.now()
        current_hour = now.hour

        # Check if we should run now (on the hour, and haven't run this hour yet)
        if current_hour in SCHEDULE_HOURS and current_hour != last_run_hour and now.minute < 2:
            last_run_hour = current_hour
            logger.info('Auto-refresh triggered at %s', now.strftime('%Y-%m-%d %H:%M'))
            try:
                if settings.BAIDU_API_KEY:
                    news_list = await asyncio.wait_for(
                        fetch_and_process_news(),
                        timeout=settings.AI_PROCESSING_TIMEOUT + 60,
                    )
                    save_news(news_list)
                    update_last_updated()
                    logger.info('Auto-refresh: fetched %d articles', len(news_list))

                    # Regenerate hot topics from 30-day filtered news
                    if settings.OPENAI_API_KEY and news_list:
                        from datetime import timedelta as _td
                        _cutoff = (datetime.now() - _td(days=30)).strftime('%Y-%m-%d')
                        _recent = [n for n in news_list if n.get('publish_date', '') >= _cutoff]
                        topics = await generate_hot_topics(_recent if _recent else news_list[:10])
                        if topics:
                            import json, os
                            _topics_file = os.path.join(settings.DATA_DIR, 'hot_topics.json')
                            with open(_topics_file, 'w', encoding='utf-8') as f:
                                json.dump(topics, f, ensure_ascii=False, indent=2)
                        logger.info('Auto-refresh: hot topics regenerated')
                else:
                    logger.warning('Auto-refresh skipped: Baidu API key not configured')
            except Exception as e:
                logger.error('Auto-refresh failed: %s', e)

        # Check every 60 seconds
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the auto-refresh scheduler on startup
    task = asyncio.create_task(_auto_refresh_task())
    yield
    # Cancel the scheduler on shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title='软通动力新闻智能整理与分析平台 API',
    description='iSoftstone News Intelligent Organizer Backend',
    version='1.0.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
        'http://localhost:5180', 'http://localhost:5181',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(news.router)
app.include_router(chat.router)


@app.get('/api/health')
async def health_check():
    return {
        'status': 'ok',
        'baidu_configured': bool(settings.BAIDU_API_KEY),
        'openai_configured': bool(settings.OPENAI_API_KEY),
        'schedule_hours': SCHEDULE_HOURS,
    }
