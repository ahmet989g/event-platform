/**
 * Type guard to check if error has message property
 */
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
}