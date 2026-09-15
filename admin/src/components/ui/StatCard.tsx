import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, className }: StatCardProps) {
  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              {trend >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {Math.abs(trend)}% {trendLabel || 'vs last month'}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
