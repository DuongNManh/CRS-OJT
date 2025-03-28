import { useLoading } from '@/contexts/LoadingContext';
import { useCallback } from 'react';

export const useApi = () => {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = useCallback(async <T>(
    promise: Promise<T>, 
    delay: number = 500, 
    timeout: number = 30000 // Set a default timeout of 10 seconds
  ): Promise<T> => {
    showLoading();
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      );

      // Race the original promise against the timeout promise
      const result = await Promise.race([promise, timeoutPromise]);
      
      // Introduce a delay before hiding the loading indicator
      await new Promise(resolve => setTimeout(resolve, delay));
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return { withLoading };
};