import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ExternalLink, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryBadge, KeywordTag, ImportanceDot } from "@/components/CategoryBadge"
import { NEWS_DATA } from "@/lib/data"

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const item = NEWS_DATA.find((n) => n.id === id)

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <p className="text-lg mb-4">新闻不存在</p>
        <Button variant="outline" onClick={() => navigate("/news")}>返回列表</Button>
      </div>
    )
  }

  const related = NEWS_DATA.filter((n) => item.relatedIds.includes(n.id))

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link to="/news">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      {/* Main card */}
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-6 space-y-5">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={item.category} />
            <span className="text-xs text-muted-foreground">{item.publishDate}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {item.source}
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">重要性</span>
              <ImportanceDot level={item.importance} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground leading-snug">{item.title}</h1>

          {/* AI Summary */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI 智能摘要</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{item.summary}</p>
          </div>

          {/* Keywords */}
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-2">关键词</div>
            <div className="flex flex-wrap gap-1.5">
              {item.keywords.map((kw) => (
                <KeywordTag key={kw} keyword={kw} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Full content */}
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-3">原文内容</div>
            <p className="text-sm text-foreground leading-[1.9] whitespace-pre-line">{item.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Related news */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">相关新闻</h2>
          <div className="space-y-2">
            {related.map((r) => (
              <Link to={`/news/${r.id}`} key={r.id}>
                <Card className="bg-gradient-card border-border hover:border-primary/40 transition-all group cursor-pointer">
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryBadge category={r.category} />
                          <span className="text-xs text-muted-foreground">{r.publishDate}</span>
                        </div>
                        <div className="text-sm font-medium text-foreground group-hover:text-gradient transition-all truncate">
                          {r.title}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
