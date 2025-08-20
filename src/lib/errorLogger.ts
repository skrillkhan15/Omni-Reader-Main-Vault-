import { toast } from '@/hooks/use-toast';

export const errorLogger = {
  log: (error: unknown, context?: string) => {
    console.error('Application Error:', context, error);
    // In a real application, you would send this error to a logging service
    // e.g., Sentry, LogRocket, or a custom backend endpoint
  },

  showUserFacingError: (title: string, description: string, variant: "default" | "destructive" | null | undefined = "destructive") => {
    toast({
      title,
      description,
      variant,
    });
  },
};