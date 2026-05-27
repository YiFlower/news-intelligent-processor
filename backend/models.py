from pydantic import BaseModel


class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    content: str
    category: str
    keywords: list[str]
    source: str
    source_name: str = ''
    source_url: str
    publish_date: str
    importance: int
    related_ids: list[str] = []


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str


class RefreshResponse(BaseModel):
    success: bool
    count: int
    last_updated: str


class StatsResponse(BaseModel):
    total: int
    days_covered: int
    categories: int
    hot_topics: int
