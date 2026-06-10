import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  loading?: boolean
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  loading = false,
}: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className={cn(
      'rounded-xl border bg-card p-5 flex items-start gap-4 shadow-sm',
      c.border
    )}>
      <div className={cn('rounded-lg p-2.5 shrink-0', c.bg)}>
        <Icon size={20} className={c.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{title}</p>
        {loading ? (
          <div className="h-7 w-24 bg-muted animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-semibold text-foreground mt-0.5">{value}</p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
