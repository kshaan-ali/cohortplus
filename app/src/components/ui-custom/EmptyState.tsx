import { Package, BookOpen, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateIcon = 'default' | 'courses' | 'enrollments' | 'sessions' | 'users';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: EmptyStateIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const iconMap = {
  default: Package,
  courses: BookOpen,
  enrollments: Calendar,
  sessions: Users,
  users: Users,
};

export function EmptyState({
  title,
  description,
  icon = 'default',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300',
      className
    )}>
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
