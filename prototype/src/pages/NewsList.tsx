import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, ChevronRight, SlidersHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryBadge, KeywordTag, ImportanceDot } from "@/components/CategoryBadge"
import { NEWS_DATA, type NewsCategory } from "@/lib/data"

const ALL_CATEGORIES: NewsCategory[] = ['战略发展', '技术创新', '人事动态', '合作签约', '行业活动']
const TIME_FILTERS = [
  { label: '全部', days: 0 },
  { label: '近7天', days: 7 },
  { label: '近15天', days: 15 },
  { label: '近30天', days: 30 },
]

export default function NewsList() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)
  const [activeTime, setActiveTime] = useState(0)
  const [sortBy, setSortBy] = useState<"date" | "importance">("date")

  const filtered = useMemo(() => {
    let list = [...NEWS_DATA]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (n) => n.title.includes(q) || n.summary.includes(q) || n.keywords.some((k) => k.includes(q))
      )
    }
    if (activeCategory) {
      list = list.filter((n) => n.category === activeCategory)
    }
    if (activeTime > 0) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - activeTime)
      list = list.filter((n) => new Date(n.publishDate) >= cutoff)
    }
    if (sortBy === "importance") {
      list.sort((a, b) => b.importance - a.importance)
    }
    return list
  }, [search, activeCategory, activeTime, sortBy])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">新闻列表</h1>
        <p className="text-sm text-muted-foreground mt-1">共 {NEWS_DATA.length} 篇 · 当前筛选 {filtered.length} 篇</p>
      </div>

      {/* Search & filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索标题、摘要、关键词..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              全部分类
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Time filter */}
          <div className="flex items-center gap-1.5">
            {TIME_FILTERS.map((t) => (
              <button
                key={t.days}
                onClick={() => setActiveTime(t.days)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTime === t.days
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <button
              onClick={() => setSortBy(sortBy === "date" ? "importance" : "date")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {sortBy === "date" ? "按时间排序" : "按重要性排序"}
            </button>
          </div>
        </div>
      </div>

      {/* News list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          未找到匹配的新闻
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <Link to={`/news/${item.id}`} key={item.id}>
              <Card className="bg-gradient-card border-border hover:border-primary/40 hover:shadow-elegant transition-all group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Index */}
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CategoryBadge category={item.category} />
                        <span className="text-xs text-muted-foreground">{item.publishDate}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                        <div className="ml-auto">
                          <ImportanceDot level={item.importance} />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-gradient transition-all mb-1.5 leading-snug">
                        {item.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                        {item.summary}
                      </p>

                      {/* Keywords */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.keywords.slice(0, 4).map((kw) => (
                          <KeywordTag key={kw} keyword={kw} />
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
