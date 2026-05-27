const API_BASE = 'http://localhost:8002'

export interface ApiNewsItem {
  id: string
  title: string
  summary: string
  content: string
  category: string
  keywords: string[]
  source: string
  source_name?: string
  source_url: string
  publish_date: string
  importance: number
  related_ids: string[]
}

export interface ApiStats {
  total: number
  days_covered: number
  categories: number
  hot_topics: number
  last_updated: string | null
}

export interface ApiHotTopic {
  id: string
  title: string
  summary: string
  keywords: string[]
  news_indices?: number[]
  news_ids?: string[]
}

export interface ApiChatResponse {
  reply: string
}

export interface ApiRefreshResponse {
  success: boolean
  count: number
  last_updated: string
}

export interface ApiSummaryResponse {
  summary: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!resp.ok) {
    const detail = await resp.text().catch(() => resp.statusText)
    throw new Error(`API Error ${resp.status}: ${detail}`)
  }
  return resp.json()
}

export const api = {
  getNews(params?: { category?: string; search?: string; sort?: string }) {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.search) query.set('search', params.search)
    if (params?.sort) query.set('sort', params.sort)
    const qs = query.toString()
    return request<ApiNewsItem[]>(`/api/news${qs ? `?${qs}` : ''}`)
  },

  getStats() {
    return request<ApiStats>('/api/news/stats')
  },

  getHotTopics() {
    return request<ApiHotTopic[]>('/api/news/hot-topics')
  },

  getSummary() {
    return request<ApiSummaryResponse>('/api/news/summary')
  },

  refreshNews() {
    return request<ApiRefreshResponse>('/api/news/refresh', { method: 'POST' })
  },

  chat(message: string, history: { role: string; content: string }[] = []) {
    return request<ApiChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    })
  },

  health() {
    return request<{ status: string; baidu_configured: boolean; openai_configured: boolean }>('/api/health')
  },
}
