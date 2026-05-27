import { cn } from "@/lib/utils"
import { type NewsCategory, CATEGORY_COLORS } from "@/lib/data"

interface CategoryBadgeProps {
  category: NewsCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        CATEGORY_COLORS[category],
        className
      )}
    >
      {category}
    </span>
  )
}

interface KeywordTagProps {
  keyword: string
  className?: string
}

export function KeywordTag({ keyword, className }: KeywordTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs border",
        "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground transition-colors cursor-default",
        className
      )}
    >
      {keyword}
    </span>
  )
}

interface ImportanceDotProps {
  level: number // 1-5
}

export function ImportanceDot({ level }: ImportanceDotProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            i <= level ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}
