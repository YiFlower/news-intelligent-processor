import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Sparkles } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { api } from '@/lib/api'

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

interface AIChatProps {
  open: boolean
  onClose: () => void
}

const SAMPLE_QUESTIONS = [
  '软通动力近期的核心战略是什么？',
  'AI大模型方面有哪些动作？',
  '合作签约情况如何？',
  '生成一份简要新闻总结报告',
]

export function AIChat({ open, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: '你好！我是软通新闻AI助手。我可以帮你分析新闻、总结趋势、回答问题。试试下面的问题，或直接输入你的问题：' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { theme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const history = messages
        .filter((m) => m.content !== '你好！我是软通新闻AI助手。我可以帮你分析新闻、总结趋势、回答问题。试试下面的问题，或直接输入你的问题：')
        .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))

      const resp = await api.chat(text, history)
      setMessages((m) => [...m, { role: 'ai', content: resp.reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', content: '抱歉，AI服务暂时不可用。请稍后再试，或检查后端服务是否正常运行。' }])
    } finally {
      setIsTyping(false)
    }
  }

  if (!open) return null

  const isDark = theme === 'dark'

  return (
    <div
      className='fixed right-6 bottom-6 z-50 w-[380px] max-h-[calc(100vh-100px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up'
      style={{
        background: isDark ? 'hsl(230, 15%, 8%)' : 'hsl(0, 0%, 100%)',
        border: `1px solid hsl(var(--border))`,
      }}
    >
        {/* Header */}
        <div
          className='flex items-center justify-between px-4 py-3 border-b'
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className='flex items-center gap-2'>
            <div
              className='w-7 h-7 rounded-lg flex items-center justify-center'
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Bot className='w-3.5 h-3.5' style={{ color: 'hsl(var(--primary-foreground))' }} />
            </div>
            <span className='text-sm font-semibold text-foreground'>AI 新闻助手</span>
            <span className='text-xs px-1.5 py-0.5 rounded-full font-medium' style={{
              background: 'hsl(var(--primary) / 0.15)',
              color: 'hsl(var(--primary))',
            }}>在线</span>
          </div>
          <button
            onClick={onClose}
            className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors'
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className='flex-1 overflow-y-auto px-4 py-3 space-y-3' style={{ maxHeight: 400 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className='w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'
                style={{
                  background: msg.role === 'ai' ? 'var(--gradient-primary)' : 'hsl(var(--surface))',
                }}
              >
                {msg.role === 'ai' ? (
                  <Sparkles className='w-3 h-3' style={{ color: 'hsl(var(--primary-foreground))' }} />
                ) : (
                  <User className='w-3 h-3' style={{ color: 'hsl(var(--muted-foreground))' }} />
                )}
              </div>
              <div
                className='max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed'
                style={{
                  background: msg.role === 'user' ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--surface))',
                  color: 'hsl(var(--foreground))',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                }}
              >
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-1.5' : ''} dangerouslySetInnerHTML={{
                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: hsl(var(--primary))">$1</strong>')
                      .replace(/^- /g, '· ')
                      .replace(/^(\d)\. /g, '<span style="color: hsl(var(--primary))">$1.</span> ')
                  }} />
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className='flex gap-2'>
              <div className='w-6 h-6 rounded-full flex items-center justify-center' style={{ background: 'var(--gradient-primary)' }}>
                <Sparkles className='w-3 h-3' style={{ color: 'hsl(var(--primary-foreground))' }} />
              </div>
              <div className='px-3 py-2 rounded-2xl text-xs' style={{ background: 'hsl(var(--surface))', border: `1px solid hsl(var(--border))` }}>
                <span className='flex gap-1'>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className='w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot' style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className='px-4 pb-2 flex flex-wrap gap-1.5'>
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className='text-xs px-2.5 py-1 rounded-full transition-all hover:scale-105'
                style={{
                  background: 'hsl(var(--primary) / 0.08)',
                  color: 'hsl(var(--primary))',
                  border: '1px solid hsl(var(--primary) / 0.2)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className='px-3 py-3 border-t' style={{ borderColor: 'hsl(var(--border))' }}>
          <div className='flex gap-2 items-center'>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder='问一个关于新闻的问题...'
              className='flex-1 px-3 py-2 rounded-xl text-xs outline-none transition-colors'
              style={{
                background: 'hsl(var(--surface))',
                color: 'hsl(var(--foreground))',
                border: `1px solid hsl(var(--border))`,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className='w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40'
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Send className='w-3.5 h-3.5' style={{ color: 'hsl(var(--primary-foreground))' }} />
            </button>
          </div>
        </div>
    </div>
  )
}
