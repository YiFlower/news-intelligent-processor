import { X, ExternalLink, Sparkles, ArrowLeft, Star } from 'lucide-react'
import { CATEGORY_COLORS } from '@/lib/data'
import { useTheme } from '@/context/ThemeContext'
import type { ApiNewsItem } from '@/lib/api'

interface NewsModalProps {
  newsId: string | null
  newsList: ApiNewsItem[]
  onClose: () => void
}

/** Split raw content into readable paragraphs */
function formatParagraphs(content: string): string[] {
  const raw = content.split(/\n+/).map((s) => s.trim()).filter(Boolean)
  if (raw.length >= 2) return raw

  const sentences = content.split(/(?<=。|！|？|；)/g).filter((s) => s.trim())
  if (sentences.length <= 3) return [content]

  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, i + 3).join('')
    if (chunk.trim()) paragraphs.push(chunk.trim())
  }
  return paragraphs
}

export function NewsModal({ newsId, newsList, onClose }: NewsModalProps) {
  const { theme } = useTheme()
  if (!newsId) return null
  const item = newsList.find((n) => n.id === newsId)
  if (!item) return null

  const related = newsList.filter((n) => item.related_ids.includes(n.id))
  const paragraphs = formatParagraphs(item.content)
  const displayName = item.source_name || item.source

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div
        className='fixed inset-x-4 top-16 bottom-8 z-50 mx-auto max-w-2xl rounded-2xl shadow-2xl overflow-y-auto animate-slide-up'
        style={{
          background: theme === 'dark' ? 'hsl(230, 15%, 8%)' : 'hsl(0, 0%, 100%)',
          border: '1px solid hsl(var(--border))',
        }}
      >
        {/* Top bar */}
        <div className='sticky top-0 flex items-center justify-between px-5 py-3 border-b z-10' style={{ borderColor: 'hsl(var(--border))', background: 'inherit' }}>
          <button onClick={onClose} className='flex items-center gap-1.5 text-xs font-medium' style={{ color: 'hsl(var(--muted-foreground))' }}>
            <ArrowLeft className='w-3.5 h-3.5' /> 返回
          </button>
          <button onClick={onClose} className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface'>
            <X className='w-4 h-4' style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
        </div>

        <div className='px-6 py-5 space-y-5'>
          {/* Meta row */}
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-xs font-medium px-2 py-0.5 rounded-md border' style={{
              background: 'hsl(var(--primary) / 0.1)',
              color: 'hsl(var(--primary))',
              borderColor: 'hsl(var(--primary) / 0.25)',
            }}>{item.category}</span>
            <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>{item.publish_date}</span>
            <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>·</span>
            <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>来源：{displayName}</span>
            <div className='ml-auto flex items-center gap-1'>
              <Star className='w-3 h-3' style={{ color: 'hsl(var(--primary))' }} />
              <span className='text-xs' style={{ color: 'hsl(var(--muted-foreground))' }}>重要性 {item.importance}/5</span>
            </div>
          </div>

          {/* Title */}
          <h1 className='text-lg font-bold leading-snug' style={{ color: 'hsl(var(--foreground))' }}>{item.title}</h1>

          {/* AI Summary */}
          <div className='rounded-xl p-4' style={{
            background: 'hsl(var(--primary) / 0.06)',
            border: '1px solid hsl(var(--primary) / 0.15)',
          }}>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4' style={{ color: 'hsl(var(--primary))' }} />
              <span className='text-xs font-semibold uppercase tracking-wide' style={{ color: 'hsl(var(--primary))' }}>AI 智能摘要</span>
            </div>
            <p className='text-sm leading-relaxed' style={{ color: 'hsl(var(--foreground))' }}>{item.summary}</p>
          </div>

          {/* Keywords */}
          {item.keywords.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {item.keywords.map((kw) => (
                <span key={kw} className='text-xs px-2 py-0.5 rounded-md border' style={{
                  background: 'hsl(var(--surface))',
                  color: 'hsl(var(--muted-foreground))',
                  borderColor: 'hsl(var(--border))',
                }}>{kw}</span>
              ))}
            </div>
          )}

          <div className='border-t' style={{ borderColor: 'hsl(var(--border))' }} />

          {/* Content - formatted as paragraphs */}
          <div>
            <div className='text-xs font-medium mb-3' style={{ color: 'hsl(var(--muted-foreground))' }}>原文内容</div>
            <div className='space-y-3'>
              {paragraphs.map((p, i) => (
                <p key={i} className='text-sm leading-[1.9]' style={{ color: 'hsl(var(--foreground))' }}>{p}</p>
              ))}
            </div>
          </div>

          <div className='border-t' style={{ borderColor: 'hsl(var(--border))' }} />

          {/* Read original link */}
          <a
            href={item.source_url}
            target='_blank'
            rel='noreferrer'
            className='flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80'
            style={{
              background: 'hsl(var(--primary) / 0.08)',
              color: 'hsl(var(--primary))',
              border: '1px solid hsl(var(--primary) / 0.2)',
            }}
          >
            阅读原文 <ExternalLink className='w-3.5 h-3.5' />
          </a>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <div className='text-xs font-medium mb-2' style={{ color: 'hsl(var(--muted-foreground))' }}>相关新闻</div>
              <div className='space-y-2'>
                {related.map((r) => (
                  <a key={r.id} href={r.source_url} target='_blank' rel='noreferrer' className='block p-3 rounded-xl border transition-all hover:shadow-card' style={{ borderColor: 'hsl(var(--border))' }}>
                    <div className='text-xs font-medium' style={{ color: 'hsl(var(--primary))' }}>{r.category} · {r.publish_date}</div>
                    <div className='text-sm mt-1' style={{ color: 'hsl(var(--foreground))' }}>{r.title}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || ''
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${colorClass}`}>
      {category}
    </span>
  )
}
