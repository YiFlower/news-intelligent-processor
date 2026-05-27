import { useState } from "react"
import { Link } from "react-router-dom"
import {
  RefreshCw, Brain, TrendingUp, Newspaper, Tag, Calendar,
  ArrowRight, Zap, ChevronRight, BarChart2
} from "lucide-react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBadge, ImportanceDot } from "@/components/CategoryBadge"
import { NEWS_DATA, CATEGORY_STATS, HOT_TOPICS } from "@/lib/data"

const WEEKLY_DATA = [
  { week: "4/1-7", count: 5 },
  { week: "4/8-14", count: 4 },
  { week: "4/15-21", count: 6 },
  { week: "4/22-28", count: 7 },
]

const TOP_KEYWORDS = [
  { word: "AI大模型", count: 8 },
  { word: "战略合作", count: 6 },
  { word: "智慧城市", count: 5 },
  { word: "数字化转型", count: 5 },
  { word: "数据要素", count: 4 },
  { word: "低空经济", count: 2 },
  { word: "碳中和", count: 2 },
  { word: "国际化", count: 2 },
]

const RECENT_NEWS = NEWS_DATA.slice(0, 8)

export default function Dashboard() {
  const [fetchLoading, setFetchLoading] = useState(false)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [fetchDone, setFetchDone] = useState(false)
  const [analyzeDone, setAnalyzeDone] = useState(false)

  function handleFetch() {
    setFetchLoading(true)
    setTimeout(() => { setFetchLoading(false); setFetchDone(true) }, 2200)
  }
  function handleAnalyze() {
    setAnalyzeLoading(true)
    setTimeout(() => { setAnalyzeLoading(false); setAnalyzeDone(true) }, 2800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
          <p className="text-sm text-muted-foreground mt-1">软通动力 · 近30天新闻智能整理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={fetchDone ? "secondary" : "gradient"}
            size="default"
            onClick={handleFetch}
            disabled={fetchLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${fetchLoading ? "animate-spin" : ""}`} />
            {fetchLoading ? "抓取中..." : fetchDone ? "已更新" : "一键抓取"}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleAnalyze}
            disabled={analyzeLoading}
          >
            <Brain className={`w-4 h-4 mr-2 ${analyzeLoading ? "animate-pulse" : ""}`} />
            {analyzeLoading ? "分析中..." : analyzeDone ? "已分析" : "AI 分析"}
          </Button>
        </div>
      </div>

      {/* Status banner */}
      {(fetchDone || analyzeDone) && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-glow bg-primary/5 text-sm animate-fade-in">
          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-foreground">
            {analyzeDone ? "AI 分析完成！22 篇新闻已生成摘要、分类与关键词。" : "数据抓取完成！共获取 22 篇最新新闻。"}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "新闻总数", value: "22", sub: "近30天", icon: Newspaper, color: "hsl(350, 82%, 42%)" },
          { label: "覆盖天数", value: "30", sub: "2024/03/05–04/28", icon: Calendar, color: "hsl(350, 82%, 52%)" },
          { label: "新闻分类", value: "5", sub: "类别覆盖", icon: Tag, color: "hsl(350, 75%, 62%)" },
          { label: "热点事件", value: "3", sub: "聚合识别", icon: TrendingUp, color: "hsl(350, 70%, 70%)" },
        ].map((s) => (
          <Card key={s.label} className="bg-gradient-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pie chart */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              分类分布
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={CATEGORY_STATS}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {CATEGORY_STATS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(230,14%,10%)", border: "1px solid hsl(230,10%,18%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(210,20%,94%)" }}
                  itemStyle={{ color: "hsl(210,20%,80%)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
              {CATEGORY_STATS.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-muted-foreground truncate">{c.name}</span>
                  <span className="text-foreground font-medium ml-auto">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              周度发布趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,10%,16%)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(215,15%,50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,50%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(230,14%,10%)", border: "1px solid hsl(230,10%,18%)", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "hsl(350,82%,52%,0.06)" }}
                />
                <Bar dataKey="count" name="篇数" fill="hsl(350,82%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              热门关键词
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {TOP_KEYWORDS.map((k, i) => (
              <div key={k.word} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${(k.count / 8) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-foreground font-medium w-16 truncate">{k.word}</span>
                <span className="text-xs text-muted-foreground w-4">{k.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hot topics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            热点聚合
          </h2>
          <Link to="/report">
            <Button variant="ghost" size="sm" className="text-xs">
              查看完整报告 <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {HOT_TOPICS.map((topic) => (
            <Card key={topic.id} className="bg-gradient-card border-border hover:border-glow transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-gradient transition-all leading-snug">
                    {topic.title}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{topic.newsIds.length}篇</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {topic.summary}
                </p>
                <div className="flex flex-wrap gap-1">
                  {topic.keywords.map((kw) => (
                    <span key={kw} className="text-xs px-1.5 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                      {kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent news */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-accent" />
            最新新闻
          </h2>
          <Link to="/news">
            <Button variant="ghost" size="sm" className="text-xs">
              查看全部 <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          {RECENT_NEWS.map((item) => (
            <Link to={`/news/${item.id}`} key={item.id}>
              <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:bg-surface hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={item.category} />
                    <span className="text-xs text-muted-foreground">{item.publishDate}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground group-hover:text-gradient transition-all truncate">
                    {item.title}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ImportanceDot level={item.importance} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
