import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Download, Brain, TrendingUp, Layers, Sparkles, ChevronRight, FileText
} from "lucide-react"
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBadge } from "@/components/CategoryBadge"
import { NEWS_DATA, HOT_TOPICS, CATEGORY_STATS } from "@/lib/data"

const TREND_DATA = [
  { date: "03/05", 战略发展: 1, 技术创新: 0, 合作签约: 1, 人事动态: 0, 行业活动: 0 },
  { date: "03/08", 战略发展: 0, 技术创新: 1, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "03/12", 战略发展: 0, 技术创新: 0, 合作签约: 1, 人事动态: 0, 行业活动: 0 },
  { date: "03/15", 战略发展: 0, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 1 },
  { date: "03/18", 战略发展: 0, 技术创新: 0, 合作签约: 1, 人事动态: 0, 行业活动: 0 },
  { date: "03/20", 战略发展: 0, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 1 },
  { date: "03/25", 战略发展: 0, 技术创新: 0, 合作签约: 0, 人事动态: 1, 行业活动: 0 },
  { date: "03/29", 战略发展: 1, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "04/01", 战略发展: 1, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "04/05", 战略发展: 1, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "04/08", 战略发展: 0, 技术创新: 1, 合作签约: 0, 人事动态: 0, 行业活动: 1 },
  { date: "04/12", 战略发展: 0, 技术创新: 1, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "04/15", 战略发展: 1, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "04/18", 战略发展: 0, 技术创新: 0, 合作签约: 1, 人事动态: 0, 行业活动: 0 },
  { date: "04/20", 战略发展: 0, 技术创新: 0, 合作签约: 0, 人事动态: 1, 行业活动: 0 },
  { date: "04/22", 战略发展: 0, 技术创新: 0, 合作签约: 0, 人事动态: 0, 行业活动: 1 },
  { date: "04/25", 战略发展: 0, 技术创新: 1, 合作签约: 0, 人事动态: 0, 行业活动: 0 },
  { date: "04/28", 战略发展: 0, 技术创新: 0, 合作签约: 1, 人事动态: 0, 行业活动: 0 },
]

const RADAR_DATA = [
  { subject: "战略布局", A: 90 },
  { subject: "技术创新", A: 82 },
  { subject: "合作生态", A: 88 },
  { subject: "人才建设", A: 70 },
  { subject: "品牌影响", A: 76 },
  { subject: "国际化", A: 65 },
]

const KEYWORDS_CLOUD = [
  { word: "AI大模型", size: 5 }, { word: "战略合作", size: 4 }, { word: "智慧城市", size: 4 },
  { word: "数字化转型", size: 4 }, { word: "数据要素", size: 3 }, { word: "华为云", size: 3 },
  { word: "低空经济", size: 2 }, { word: "碳中和", size: 2 }, { word: "工业大模型", size: 3 },
  { word: "国际化", size: 2 }, { word: "融资", size: 2 }, { word: "专精特新", size: 2 },
  { word: "雄安新区", size: 3 }, { word: "SaaS", size: 2 }, { word: "隐私计算", size: 2 },
]

const AI_SUMMARY = `2024年3月至4月，软通动力在多个核心赛道展现出强劲的战略执行力与业务爆发力。

**AI 大模型商业化提速**：公司发布自研 iSoftStone AI 平台，引入百度系技术高管担任 CTO，联合北大建立 AI 联合实验室，并面向中小企业推出低门槛 SaaS 工具矩阵，构建起从基础研究到商业落地的完整 AI 生态链。

**战略合作密集落地**：30 天内与华为云、中国移动、阿里云、北京大学及新加坡 LTA 五方签署战略协议，合作领域横跨云计算、工业互联网、学术研究及国际市场，生态构建速度处于行业前列。

**智慧城市业务高速扩张**：承接雄安新区二期、国家医疗数据平台等旗舰项目，并成功进军新加坡智慧交通市场，国内外双线并举态势明显。

**资本与品牌双重背书**：完成 10 亿元战略融资，Q1 营收同比增长 23%，AI 业务贡献突破 30%，同期入选财富中国科技 50 强及国家数字经济试点示范企业，公司资本市场信心与行业影响力持续提升。`

const CHART_COLORS: Record<string, string> = {
  战略发展: "hsl(15,85%,55%)",
  技术创新: "hsl(270,70%,60%)",
  合作签约: "hsl(210,85%,55%)",
  人事动态: "hsl(150,60%,50%)",
  行业活动: "hsl(40,90%,55%)",
}

export default function Report() {
  const [exporting, setExporting] = useState(false)

  function handleExport() {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      window.print()
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">智能分析报告</h1>
          <p className="text-sm text-muted-foreground mt-1">软通动力 · 2024/03/05–04/28 · AI 生成</p>
        </div>
        <Button variant="gradient" size="default" onClick={handleExport} disabled={exporting}>
          <Download className={`w-4 h-4 mr-2 ${exporting ? "animate-bounce" : ""}`} />
          {exporting ? "准备中..." : "导出 PDF"}
        </Button>
      </div>

      {/* AI Summary */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI 综合总结
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground leading-[1.9] space-y-2">
            {AI_SUMMARY.split("\n\n").map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{
                __html: para.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-gradient">$1</span>')
              }} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trend line chart */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              各类新闻发布时间线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,10%,16%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,15%,45%)" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215,15%,45%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(230,14%,10%)", border: "1px solid hsl(230,10%,18%)", borderRadius: 8, fontSize: 11 }}
                />
                {Object.keys(CHART_COLORS).map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={CHART_COLORS[key]}
                    fill={CHART_COLORS[key]}
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {Object.entries(CHART_COLORS).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-0.5 inline-block rounded" style={{ background: color }} />
                  {name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              综合维度评估
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={RADAR_DATA} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
                <PolarGrid stroke="hsl(230,10%,18%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} />
                <Radar
                  name="软通动力"
                  dataKey="A"
                  stroke="hsl(350,82%,52%)"
                  fill="hsl(350,82%,52%)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ background: "hsl(230,14%,10%)", border: "1px solid hsl(230,10%,18%)", borderRadius: 8, fontSize: 11 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Keywords cloud */}
      <Card className="bg-gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            关键词热力图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 py-2">
            {KEYWORDS_CLOUD.map((item) => (
              <span
                key={item.word}
                className="transition-all cursor-default"
                style={{
                  fontSize: `${10 + item.size * 3}px`,
                  color: item.size >= 4
                    ? "hsl(350,82%,62%)"
                    : item.size === 3
                    ? "hsl(35,90%,60%)"
                    : "hsl(215,15%,55%)",
                  fontWeight: item.size >= 4 ? 700 : item.size === 3 ? 600 : 400,
                  opacity: 0.5 + item.size * 0.1,
                }}
              >
                {item.word}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hot topics detail */}
      <div>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-accent" />
          热点事件深度解析
        </h2>
        <div className="space-y-4">
          {HOT_TOPICS.map((topic, idx) => {
            const topicNews = NEWS_DATA.filter((n) => topic.newsIds.includes(n.id))
            return (
              <Card key={topic.id} className="bg-gradient-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-2">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{topic.summary}</p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {topic.keywords.map((kw) => (
                          <span key={kw} className="text-xs px-2 py-0.5 rounded-md border border-border bg-surface text-muted-foreground">
                            {kw}
                          </span>
                        ))}
                      </div>

                      {/* Related news links */}
                      <div className="space-y-1.5">
                        <div className="text-xs text-muted-foreground font-medium mb-1.5">涉及新闻（{topicNews.length}篇）</div>
                        {topicNews.map((n) => (
                          <Link to={`/news/${n.id}`} key={n.id}>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary/40 hover:bg-surface-elevated transition-all group cursor-pointer">
                              <CategoryBadge category={n.category} />
                              <span className="text-xs text-foreground group-hover:text-gradient transition-all flex-1 truncate">
                                {n.title}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{n.publishDate}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
