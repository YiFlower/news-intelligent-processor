import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    OPENAI_BASE_URL: str = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
    OPENAI_MODEL: str = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    BAIDU_API_KEY: str = os.getenv('BAIDU_API_KEY', '')
    BAIDU_SEARCH_URL: str = os.getenv('BAIDU_SEARCH_URL', 'https://qianfan.baidubce.com/v2/ai_search/web_search')
    BACKEND_PORT: int = int(os.getenv('BACKEND_PORT', '8000'))
    FRONTEND_URL: str = os.getenv('FRONTEND_URL', 'http://localhost:5180')
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    # AI processing settings
    AI_BATCH_SIZE: int = int(os.getenv('AI_BATCH_SIZE', '8'))
    AI_MAX_CONCURRENT: int = int(os.getenv('AI_MAX_CONCURRENT', '5'))
    AI_CONTENT_MAX_CHARS: int = int(os.getenv('AI_CONTENT_MAX_CHARS', '1500'))
    AI_PROCESSING_TIMEOUT: int = int(os.getenv('AI_PROCESSING_TIMEOUT', '300'))


settings = Settings()
