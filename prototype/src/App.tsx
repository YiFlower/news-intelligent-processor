import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { ThemeProvider } from '@/context/ThemeContext'
import { Header } from '@/components/Header'
import { AnalysisPage } from '@/pages/Analysis'
import { api, type ApiNewsItem, type ApiStats, type ApiHotTopic } from '@/lib/api'

const NewsModal = lazy(() => import('@/components/NewsModal').then(m => ({ default: m.NewsModal })))
const AIChat = lazy(() => import('@/components/AIChat').then(m => ({ default: m.AIChat })))

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatUnread, setChatUnread] = useState(false)
  const [selectedNews, setSelectedNews] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('--:--')

  // Real data state
  const [news, setNews] = useState<ApiNewsItem[]>([])
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [hotTopics, setHotTopics] = useState<ApiHotTopic[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  const fetchAllData = useCallback(async () => {
    setDataError(null)
    try {
      const [newsData, statsData, topicsData] = await Promise.all([
        api.getNews(),
        api.getStats(),
        api.getHotTopics(),
      ])
      setNews(newsData)
      setStats(statsData)
      setHotTopics(topicsData)
      if (statsData.last_updated) {
        const d = new Date(statsData.last_updated)
        setLastUpdated(formatTime(d))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setDataError('无法连接到后端服务，请确认后端已启动（端口 8002）')
      } else if (msg.includes('API Error 5')) {
        setDataError('后端服务异常，请稍后重试')
      } else {
        setDataError(`数据加载失败：${msg}`)
      }
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const result = await api.refreshNews()
      if (result.success) {
        await fetchAllData()
        setLastUpdated(formatTime(new Date()))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误'
      if (msg.includes('Failed to fetch')) {
        setDataError('无法连接到后端服务，刷新失败')
      } else {
        setDataError(`刷新失败：${msg}`)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchAllData])

  // Esc key to close modal/chat
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (selectedNews) setSelectedNews(null)
        else if (chatOpen) setChatOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNews, chatOpen])

  return (
    <ThemeProvider>
      <div className='min-h-screen bg-background'>
        <Header
          onOpenChat={() => { setChatOpen(true); setChatUnread(false) }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          chatUnread={chatUnread}
        />

        <main className='pb-16'>
          {dataError ? (
            <div className='mx-auto max-w-6xl px-6 py-20 flex flex-col items-center gap-4'>
              <AlertCircle className='w-10 h-10' style={{ color: 'hsl(var(--primary))' }} />
              <p className='text-sm text-center' style={{ color: 'hsl(var(--muted-foreground))' }}>{dataError}</p>
              <button
                onClick={() => { setDataLoading(true); fetchAllData() }}
                className='flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all'
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }}
              >
                <RefreshCw className='w-4 h-4' />
                重新加载
              </button>
            </div>
          ) : (
            <AnalysisPage
              news={news}
              stats={stats}
              hotTopics={hotTopics}
              loading={dataLoading}
              onSelectNews={(id) => setSelectedNews(id)}
              lastUpdated={lastUpdated}
            />
          )}
        </main>

        <Suspense>
          {selectedNews && <NewsModal newsId={selectedNews} newsList={news} onClose={() => setSelectedNews(null)} />}
          {chatOpen && <AIChat open={chatOpen} onClose={() => setChatOpen(false)} />}
        </Suspense>
      </div>
    </ThemeProvider>
  )
}
