import { Sun, Moon, MessageCircle, Zap, RefreshCw } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

interface HeaderProps {
  onOpenChat: () => void
  onRefresh: () => void
  isRefreshing: boolean
  chatUnread: boolean
}

export function Header({ onOpenChat, onRefresh, isRefreshing, chatUnread }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-elegant" style={{ background: "var(--gradient-primary)" }}>
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--primary-foreground))" }} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground leading-none">软通动力新闻智能整理与分析平台</div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-surface disabled:opacity-50"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="获取最新新闻，预计耗时约3分钟"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "刷新中" : "刷新"}
          </button>

          {/* AI chat */}
          <button
            onClick={onOpenChat}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
              border: "1px solid hsl(var(--primary) / 0.2)",
            }}
          >
            <MessageCircle className="w-4 h-4" />
            AI 对话
            {chatUnread && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-surface"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
