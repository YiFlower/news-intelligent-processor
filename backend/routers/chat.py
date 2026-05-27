from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from services.openai_service import chat as ai_chat
from services.storage_service import load_news
from config import settings

router = APIRouter(prefix='/api/chat', tags=['chat'])


@router.post('', response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Process a chat message with AI, using news data as context."""
    if not settings.OPENAI_API_KEY:
        return ChatResponse(
            reply='AI对话功能需要配置 OpenAI API Key 后才能使用。请在 .env 文件中设置 OPENAI_API_KEY。'
        )

    try:
        news_list = load_news()
        reply = await ai_chat(request.message, request.history, news_list)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'AI chat error: {str(e)}')
