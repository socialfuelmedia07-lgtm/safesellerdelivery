import { Package, TrendingUp, Clock, DollarSign, Star, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: 'package' | 'trending' | 'clock' | 'dollar' | 'star' | 'truck';
  className?: string;
}

const icons = {
  package: Package,
  trending: TrendingUp,
  clock: Clock,
  dollar: DollarSign,
  star: Star,
  truck: Truck,
};

export const StatCard = ({ title, value, change, changeType = 'neutral', icon, className }: StatCardProps) => {
  const Icon = icons[icon];
  
  return (
    <div className={cn("stat-card animate-fade-in", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={cn(
              "text-xs mt-1",
              changeType === 'positive' && "text-success",
              changeType === 'negative' && "text-destructive",
              changeType === 'neutral' && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
};
