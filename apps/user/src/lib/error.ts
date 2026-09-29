import { toast } from "sonner";
import { AxiosError } from "axios";

/**
 * Globally handles API errors to eliminate repetitive toast.error boilerplates.
 */
export function handleApiError(error: unknown, fallbackMessage = "An error occurred. Please try again.") {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = (data?.message as string | undefined) || (typeof data?.error === 'string' ? data.error : undefined) || fallbackMessage;
    toast.error(message);
    return;
  }
  
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error(fallbackMessage);
}
