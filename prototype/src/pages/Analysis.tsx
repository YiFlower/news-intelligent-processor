import { useState, useMemo } from 'react'
import { Newspaper, Calendar, Tag, TrendingUp, Brain, Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Loader2, Star } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useTheme } from '@/context/ThemeContext'
import { CategoryBadge } from '@/components/NewsModal'
import { CATEGORY_COLORS } from '@/lib/data'
import type { ApiNewsItem, ApiStats, ApiHotTopic } from '@/lib/api'

const ALL_CATEGORIES = ['战略发展', '技术创新', '人事动态', '合作签约', '行业活动']
const ITEMS_PER_PAGE = 8

const CATEGORY_COLOR_MAP: Record<string, string> = {
  '战略发展': 'hsl(350, 82%, 42%)',
  '技术创新': 'hsl(350, 82%, 52%)',
  '人事动态': 'hsl(350, 75%, 62%)',
  '合作签约': 'hsl(350, 70%, 70%)',
  '行业活动': 'hsl(350, 65%, 78%)',
}

interface AnalysisPageProps {
  news: ApiNewsItem[]
  stats: ApiStats | null
  hotTopics: ApiHotTopic[]
  loading: boolean
  onSelectNews: (id: string) => void
  lastUpdated: string
}

export function AnalysisPage({ news, stats, hotTopics, loading, onSelectNews, lastUpdated }: AnalysisPageProps) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'importance'>('date')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTopic, setSelectedTopic] = useState<ApiHotTopic | null>(null)

  const isDark = theme === 'dark'
  const tooltipBg = isDark ? 'hsl(230,14%,10%)' : 'hsl(0,0%,100%)'
  const tooltipBorder = isDark ? 'hsl(230,10%,18%)' : 'hsl(0,8%,89%)'
  const textColor = isDark ? 'hsl(220,10%,50%)' : 'hsl(220,8%,46%)'
  const gridColor = isDark ? 'hsl(230,10%,16%)' : 'hsl(0,8%,90%)'

  // Category stats
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const n of news) {
      counts[n.category] = (counts[n.category] || 0) + 1
    }
    return ALL_CATEGORIES
      .filter((c) => counts[c])
      .map((c) => ({ name: c, count: counts[c] || 0, color: CATEGORY_COLOR_MAP[c] || 'hsl(0,0%,50%)' }))
  }, [news])

  // Keyword frequency Top 5 (exclude generic/meaningless terms)
  const EXCLUDE_KEYWORDS = new Set(['软通动力', '软通', 'isoftstone', 'iSoftstone', '软通华方', '鸿湖万联'])
  const keywordStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const n of news) {
      for (const kw of n.keywords) {
        if (kw.length >= 2 && !EXCLUDE_KEYWORDS.has(kw)) {
          counts[kw] = (counts[kw] || 0) + 1
        }
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [news])

  // Weekly trend (last 30 days)
  const weeklyData = useMemo(() => {
    if (news.length === 0) return []

    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 30)

    // Filter news to last 30 days and count by date
    const dateCounts: Record<string, number> = {}
    for (const n of news) {
      const d = n.publish_date
      if (!d) continue
      const dt = new Date(d)
      if (dt >= cutoff && dt <= now) {
        dateCounts[d] = (dateCounts[d] || 0) + 1
      }
    }

    // Generate week buckets for the last 30 days
    // Start from the Monday of 30 days ago
    const start = new Date(cutoff)
    const dayOfWeek = start.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + mondayOffset)

    const weeks: { week: string; count: number }[] = []
    const cursor = new Date(start)

    while (cursor <= now) {
      const weekEnd = new Date(cursor)
      weekEnd.setDate(weekEnd.getDate() + 6)

      let count = 0
      const d = new Date(cursor)
      while (d <= weekEnd && d <= now) {
        const key = d.toISOString().slice(0, 10)
        count += dateCounts[key] || 0
        d.setDate(d.getDate() + 1)
      }

      const label = `${cursor.getMonth() + 1}/${cursor.getDate()}-${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
      weeks.push({ week: label, count })
      cursor.setDate(cursor.getDate() + 7)
    }

    return weeks
  }, [news])

  const filteredNews = useMemo(() => {
    let list = [...news]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    if (activeCategory) {
      list = list.filter((n) => n.category === activeCategory)
    }
    if (sortBy === 'importance') {
      list.sort((a, b) => b.importance - a.importance)
    } else {
      list.sort((a, b) => b.publish_date.localeCompare(a.publish_date))
    }
    return list
  }, [news, search, activeCategory, sortBy])

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const pagedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function getTopicNews(topic: ApiHotTopic): ApiNewsItem[] {
    if (topic.news_ids && topic.news_ids.length > 0) {
      return topic.news_ids
        .map((id) => news.find((n) => n.id === id))
        .filter((n): n is ApiNewsItem => !!n)
    }
    const kws = topic.keywords.map((k) => k.toLowerCase())
    return news.filter((n) => {
      const text = `${n.title} ${n.summary}`.toLowerCase()
      return kws.some((kw) => text.includes(kw))
    }).slice(0, 8)
  }

  function handleSearch(val: string) {
    setSearch(val)
    setCurrentPage(1)
  }
  function handleCategory(cat: string | null) {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-6 py-20 flex flex-col items-center gap-4'>
        <Loader2 className='w-8 h-8 animate-spin' style={{ color: 'hsl(var(--primary))' }} />
        <p className='text-sm' style={{ color: 'hsl(var(--muted-foreground))' }}>正在加载新闻数据...</p>
      </div>
    )
  }

  const totalNews = stats?.total ?? news.length
  const daysCovered = stats?.days_covered ?? 0
  const categoryCount = stats?.categories ?? categoryStats.length
  const hotTopicCount = stats?.hot_topics ?? hotTopics.length

  return (
    <div className='mx-auto max-w-6xl px-6 py-6 space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-4 gap-4'>
        {[
          { label: '新闻总数', value: String(totalNews), sub: '近期', icon: Newspaper, color: 'hsl(350, 82%, 42%)' },
          { label: '覆盖天数', value: String(daysCovered), sub: '天', icon: Calendar, color: 'hsl(350, 82%, 52%)' },
          { label: '新闻分类', value: String(categoryCount), sub: '类别覆盖', icon: Tag, color: 'hsl(350, 75%, 62%)' },
          { label: '热点事件', value: String(hotTopicCount), sub: '聚合识别', icon: TrendingUp, color: 'hsl(350, 70%, 70%)' },
        ].map((s) => (
          <div key={s.label} className='rounded-xl p-4 shadow-card' style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <div className='flex items-start justify-between mb-2'>
              <span className='text-xs font-medium' style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</span>
              <s.icon className='w-4 h-4' style={{ color: s.color }} />
            </div>
            <div className='text-2xl font-bold' style={{ color: 'hsl(var(--foreground))' }}>{s.value}</div>
            <div className='text-xs mt-0.5' style={{ color: 'hsl(var(--muted-foreground))' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts: 新闻类别 + 关键词频率 + 发布趋势 */}
      <div className='grid grid-cols-3 gap-4'>
        {/* Pie - 新闻类别 */}
        <div className='rounded-xl p-4 shadow-card flex flex-col' style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
          <div className='text-sm font-semibold mb-3' style={{ color: 'hsl(var(--foreground))' }}>新闻类别</div>
          {categoryStats.length > 0 ? (
            <>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie data={categoryStats} cx='50%' cy='50%' innerRadius='38%' outerRadius='72%' paddingAngle={3} dataKey='count'>
                      {categoryStats.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='grid grid-cols-2 gap-x-3 gap-y-1 mt-1'>
                {categoryStats.map((c) => (
                  <div key={c.name} className='flex items-center gap-1.5 text-xs'>
                    <span className='w-2 h-2 rounded-full flex-shrink-0' style={{ background: c.color }} />
                    <span className='truncate' style={{ color: 'hsl(var(--muted-foreground))' }}>{c.name}</span>
                    <span className='ml-auto font-medium' style={{ color: 'hsl(var(--foreground))' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='text-center py-12 text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>暂无分类数据</div>
          )}
        </div>

        {/* Keyword frequency */}
        <div className='rounded-xl p-4 shadow-card flex flex-col' style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
          <div className='text-sm font-semibold mb-3' style={{ color: 'hsl(var(--foreground))' }}>热门关键词</div>
          {keywordStats.length > 0 ? (
            <div className='flex-1 min-h-0' style={{ height: 280 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={keywordStats} layout='vertical' margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke={gridColor} horizontal={false} />
                  <XAxis type='number' tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type='category' dataKey='name' tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey='count' name='出现次数' fill='hsl(350,82%,52%)' radius={[0, 4, 4, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='text-center py-12 text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>暂无数据</div>
          )}
        </div>

        {/* Weekly Bar - 发布趋势 */}
        <div className='rounded-xl p-4 shadow-card flex flex-col' style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
          <div className='text-sm font-semibold mb-3' style={{ color: 'hsl(var(--foreground))' }}>发布趋势</div>
          {weeklyData.length > 0 ? (
            <div className='flex-1 min-h-0' style={{ height: 280 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={weeklyData} margin={{ top: 8, right: 12, left: -8, bottom: 28 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke={gridColor} vertical={false} />
                  <XAxis dataKey='week' tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: isDark ? 'hsl(350,82%,52%,0.06)' : 'hsl(350,82%,45%,0.06)' }} />
                  <Bar dataKey='count' name='篇数' fill='hsl(350,82%,52%)' radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='text-center py-12 text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>暂无趋势数据</div>
          )}
        </div>
      </div>

      {/* AI Hot topics */}
      {hotTopics.length > 0 && (
        <div>
          <div className='text-sm font-semibold mb-3 flex items-center gap-2' style={{ color: 'hsl(var(--foreground))' }}>
            <Brain className='w-4 h-4' style={{ color: 'hsl(var(--primary))' }} />
            热点聚合
          </div>
          <div className='grid grid-cols-3 gap-3'>
            {hotTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className='text-left rounded-xl p-4 shadow-card transition-all hover:shadow-lg cursor-pointer group'
                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              >
                <div className='text-sm font-semibold leading-snug mb-2 group-hover:underline' style={{ color: 'hsl(var(--foreground))' }}>{topic.title}</div>
                <p className='text-xs leading-relaxed line-clamp-2 mb-2.5' style={{ color: 'hsl(var(--muted-foreground))' }}>{topic.summary}</p>
                <div className='flex flex-wrap gap-1'>
                  {topic.keywords.map((kw) => (
                    <span key={kw} className='text-xs px-1.5 py-0.5 rounded' style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }}>{kw}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topic detail modal */}
      {selectedTopic && (
        <>
          <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' onClick={() => setSelectedTopic(null)} />
          <div
            className='fixed inset-x-4 top-20 bottom-12 z-50 mx-auto max-w-xl rounded-2xl shadow-2xl overflow-y-auto animate-slide-up'
            style={{
              background: theme === 'dark' ? 'hsl(230, 15%, 8%)' : 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <div className='sticky top-0 flex items-center justify-between px-5 py-3 border-b z-10' style={{ borderColor: 'hsl(var(--border))', background: 'inherit' }}>
              <div className='flex items-center gap-2'>
                <Brain className='w-4 h-4' style={{ color: 'hsl(var(--primary))' }} />
                <span className='text-xs font-semibold' style={{ color: 'hsl(var(--primary))' }}>热点详情</span>
              </div>
              <button onClick={() => setSelectedTopic(null)} className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface'>
                <X className='w-4 h-4' style={{ color: 'hsl(var(--muted-foreground))' }} />
              </button>
            </div>
            <div className='px-5 py-4 space-y-4'>
              <h2 className='text-base font-bold' style={{ color: 'hsl(var(--foreground))' }}>{selectedTopic.title}</h2>
              <p className='text-sm leading-relaxed' style={{ color: 'hsl(var(--muted-foreground))' }}>{selectedTopic.summary}</p>
              <div className='flex flex-wrap gap-1.5'>
                {selectedTopic.keywords.map((kw) => (
                  <span key={kw} className='text-xs px-2 py-0.5 rounded-md' style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary) / 0.2)' }}>{kw}</span>
                ))}
              </div>
              <div className='border-t' style={{ borderColor: 'hsl(var(--border))' }} />
              <div>
                <div className='text-xs font-medium mb-2.5' style={{ color: 'hsl(var(--muted-foreground))' }}>
                  相关新闻 ({getTopicNews(selectedTopic).length}篇)
                </div>
                <div className='space-y-2'>
                  {getTopicNews(selectedTopic).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { setSelectedTopic(null); onSelectNews(n.id) }}
                      className='w-full text-left p-3 rounded-xl border transition-all hover:shadow-card'
                      style={{ borderColor: 'hsl(var(--border))' }}
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <CategoryBadge category={n.category} />
                        <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>{n.publish_date}</span>
                        <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>· {n.source_name || n.source}</span>
                      </div>
                      <div className='text-sm font-medium' style={{ color: 'hsl(var(--foreground))' }}>{n.title}</div>
                      <p className='text-xs mt-1 line-clamp-1' style={{ color: 'hsl(var(--muted-foreground))' }}>{n.summary}</p>
                    </button>
                  ))}
                  {getTopicNews(selectedTopic).length === 0 && (
                    <div className='text-center py-6 text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>暂无关联新闻</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* News section */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-sm font-semibold' style={{ color: 'hsl(var(--foreground))' }}>
            全部新闻 ({filteredNews.length}篇)
          </h2>
          <div className='flex items-center gap-2 text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span>上次更新: {lastUpdated}</span>
          </div>
        </div>

        {/* Search + Filter + Sort */}
        <div className='space-y-2.5 mb-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4' style={{ color: 'hsl(var(--muted-foreground))' }} />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='搜索标题、摘要、关键词...'
              className='w-full pl-9 pr-9 py-2 rounded-xl text-sm outline-none transition-colors'
              style={{
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              }}
            />
            {search && (
              <button onClick={() => handleSearch('')} className='absolute right-3 top-1/2 -translate-y-1/2'>
                <X className='w-3.5 h-3.5' style={{ color: 'hsl(var(--muted-foreground))' }} />
              </button>
            )}
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <div className='flex items-center gap-1.5 flex-wrap'>
              <button
                onClick={() => handleCategory(null)}
                className='px-2.5 py-1 rounded-lg text-xs font-medium transition-colors'
                style={{
                  background: activeCategory === null ? 'hsl(var(--primary))' : 'hsl(var(--surface))',
                  color: activeCategory === null ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  border: `1px solid ${activeCategory === null ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                }}
              >
                全部
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(activeCategory === cat ? null : cat)}
                  className='px-2.5 py-1 rounded-lg text-xs font-medium transition-colors'
                  style={{
                    background: activeCategory === cat ? 'hsl(var(--primary))' : 'hsl(var(--surface))',
                    color: activeCategory === cat ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                    border: `1px solid ${activeCategory === cat ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className='ml-auto flex items-center gap-1.5'>
              <SlidersHorizontal className='w-3.5 h-3.5' style={{ color: 'hsl(var(--muted-foreground))' }} />
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'importance' : 'date')}
                className='text-xs transition-colors'
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {sortBy === 'date' ? '按时间排序' : '按重要性排序'}
              </button>
            </div>
          </div>
        </div>

        {/* News list */}
        {pagedNews.length === 0 ? (
          <div className='text-center py-12 text-sm' style={{ color: 'hsl(var(--muted-foreground))' }}>
            未找到匹配的新闻
          </div>
        ) : (
          <div className='space-y-2'>
            {pagedNews.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectNews(item.id)}
                className='w-full text-left flex items-center gap-4 p-3.5 rounded-xl transition-all hover:shadow-card group'
                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1.5'>
                    <CategoryBadge category={item.category} />
                    <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>{item.publish_date}</span>
                    <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>· {item.source_name || item.source}</span>
                  </div>
                  <div className='text-sm font-medium leading-snug truncate' style={{ color: 'hsl(var(--foreground))' }}>
                    {item.title}
                  </div>
                  <p className='text-xs mt-1 line-clamp-1' style={{ color: 'hsl(var(--muted-foreground))' }}>{item.summary}</p>
                </div>
                <div className='flex items-center gap-0.5 flex-shrink-0'>
                  <Star className='w-3 h-3' style={{ color: item.importance >= 4 ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }} />
                  <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>{item.importance}</span>
                </div>
                <ChevronRight className='w-4 h-4 flex-shrink-0 transition-colors' style={{ color: 'hsl(var(--muted-foreground))' }} />
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-2 mt-4'>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30'
              style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className='w-8 h-8 rounded-lg text-xs font-medium transition-colors'
                style={{
                  background: currentPage === p ? 'hsl(var(--primary))' : 'hsl(var(--surface))',
                  color: currentPage === p ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                  border: `1px solid ${currentPage === p ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30'
              style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}
            >
              <ChevronRight className='w-4 h-4' />
            </button>
            <span className='text-xs ml-2' style={{ color: 'hsl(var(--muted-foreground))' }}>
              {currentPage}/{totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
