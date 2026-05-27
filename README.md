# 软通动力新闻智能整理与分析平台

基于 AI 的软通动力新闻自动采集、分类、摘要与趋势分析平台。通过百度搜索 API 抓取新闻，利用大语言模型进行智能分类、摘要生成和关键词提取，并以可视化图表呈现数据趋势。

## 功能特性

- **自动新闻采集**：定时通过百度千帆搜索 API 抓取软通动力相关新闻
- **AI 智能处理**：自动分类（战略发展/技术创新/人事动态/合作签约/行业活动）、摘要生成、关键词提取、重要性评分
- **数据可视化**：新闻类别饼图、热门关键词柱状图、发布趋势图
- **AI 对话**：基于新闻数据的智能问答助手
- **热点聚合**：AI 自动识别和聚合热点新闻事件
- **主题切换**：支持明暗主题，统一软通红设计语言

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + TailwindCSS + Recharts |
| 后端 | FastAPI + Uvicorn + Python asyncio |
| 搜索 | 百度千帆 ai_search API |
| AI | OpenAI 兼容 API (GLM-5-Turbo) |
| 存储 | JSON 文件（轻量无数据库方案） |

## 项目结构

```
├── backend/
│   ├── main.py                    # FastAPI 入口，定时调度
│   ├── config.py                  # 配置管理
│   ├── models.py                  # 数据模型
│   ├── requirements.txt           # Python 依赖
│   ├── routers/
│   │   ├── news.py                # 新闻 API 路由
│   │   └── chat.py                # AI 对话路由
│   ├── services/
│   │   ├── baidu_service.py       # 百度搜索服务
│   │   ├── ai_processing_service.py # AI 批量处理
│   │   ├── openai_service.py      # LLM 调用服务
│   │   └── storage_service.py     # JSON 存储服务
│   └── data/                      # 运行时数据（不提交）
├── prototype/
│   ├── src/
│   │   ├── App.tsx                # 应用主组件
│   │   ├── pages/Analysis.tsx     # 分析页面（图表+列表）
│   │   ├── components/
│   │   │   ├── Header.tsx         # 导航栏
│   │   │   ├── AIChat.tsx         # AI 对话组件
│   │   │   └── NewsModal.tsx      # 新闻详情弹窗
│   │   ├── lib/
│   │   │   ├── api.ts             # API 客户端
│   │   │   └── data.ts            # 静态数据与类型
│   │   └── context/ThemeContext.tsx # 主题管理
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── .env.example                   # 环境变量模板
└── README.md
```

## 快速开始

### 前置要求

- Python 3.10+
- Node.js 18+
- 百度千帆 API Key（[申请地址](https://cloud.baidu.com/doc/qianfan-api/s/Wmbq4z7e5)）
- OpenAI 兼容 API Key（可选，用于 AI 对话和热点聚合）

### 1. 克隆项目

```bash
git clone https://github.com/YiFlower/news-intelligent-processor.git
cd news-intelligent-processor
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```env
# 百度搜索 API（必填）
BAIDU_API_KEY=bce-v3/your-key-here

# OpenAI 兼容 API（可选，用于 AI 功能）
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

### 3. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

后端运行在 `http://localhost:8000`，API 文档：`http://localhost:8000/docs`

### 4. 启动前端

```bash
cd prototype
npm install
npx vite --port 5180
```

前端运行在 `http://localhost:5180`

## 数据刷新

- **自动刷新**：后端定时调度（2:00, 8:00, 12:00, 16:00, 20:00）
- **手动刷新**：点击页面右上角「刷新」按钮，预计耗时约 3 分钟

## 构建生产版本

```bash
cd prototype
npm run build
```

构建产物在 `prototype/dist/` 目录。

## 设计说明

- **配色**：统一软通红渐变色系 `hsl(350, 82%, 42%~78%)`
- **图表**：三栏等高布局，饼图自适应，柱状图统一 280px 高度
- **代码分割**：Recharts 独立 chunk，AIChat 懒加载，主包仅 40KB
- **响应式**：基于 TailwindCSS 的响应式设计

## License

MIT
