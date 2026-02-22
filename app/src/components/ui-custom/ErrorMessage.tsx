import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, className, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <Alert 
      variant="destructive" 
      className={cn('mb-4', className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-sm underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
