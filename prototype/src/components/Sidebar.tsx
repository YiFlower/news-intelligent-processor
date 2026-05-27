import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Newspaper, BarChart3, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/news", label: "新闻列表", icon: Newspaper },
  { href: "/report", label: "分析报告", icon: BarChart3 },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-border bg-card flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elegant flex-shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground leading-tight truncate">软通新闻</div>
          <div className="text-xs text-muted-foreground leading-tight">智能整理器</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium text-foreground mb-0.5">数据说明</div>
          <div>覆盖近 30 天新闻</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span>22 篇已分析</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
