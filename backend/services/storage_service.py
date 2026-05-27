import json
import os
from datetime import datetime
from config import settings
from models import NewsItem


NEWS_FILE = os.path.join(settings.DATA_DIR, 'news.json')
META_FILE = os.path.join(settings.DATA_DIR, 'meta.json')


def _ensure_data_dir():
    os.makedirs(settings.DATA_DIR, exist_ok=True)


def load_news() -> list[dict]:
    _ensure_data_dir()
    if not os.path.exists(NEWS_FILE):
        return []
    with open(NEWS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_news(news_list: list[dict]):
    _ensure_data_dir()
    with open(NEWS_FILE, 'w', encoding='utf-8') as f:
        json.dump(news_list, f, ensure_ascii=False, indent=2)


def load_meta() -> dict:
    _ensure_data_dir()
    if not os.path.exists(META_FILE):
        return {'last_updated': None, 'total_fetches': 0}
    with open(META_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_meta(meta: dict):
    _ensure_data_dir()
    with open(META_FILE, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)


def update_last_updated():
    meta = load_meta()
    meta['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    meta['total_fetches'] = meta.get('total_fetches', 0) + 1
    save_meta(meta)
    return meta['last_updated']
