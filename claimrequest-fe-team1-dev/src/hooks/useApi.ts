import { useLoading } from "@/contexts/LoadingContext";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
  timeoutMs?: number;
  shouldRetry?: (error: any) => boolean;
}

export const useApi = () => {
  const { showLoading, hideLoading } = useLoading();
  const { t } = useTranslation();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const withRetry = async <T>(
    promise: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      delayMs = 1000,
      timeoutMs = 30000,
      shouldRetry = (error) => {
        // Default retry condition: retry on network errors or 5xx server errors
        return (
          error.message.includes('network') ||
          (error.response && error.response.status >= 500)
        );
      }
    } = config;

    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(t("api.timeout_error"))), timeoutMs)
        );

        // Race between the actual request and timeout
        const result = await Promise.race([promise(), timeoutPromise]);
        return result;
      } catch (error: any) {
        lastError = error;

        if (!shouldRetry(error) || attempt === maxRetries - 1) {
          throw error;
        }

        // Show retry toast
        toast.info(
          t("api.retrying", { attempt: attempt + 1, max: maxRetries }),
          { autoClose: delayMs }
        );

        // Wait before retrying
        await sleep(delayMs * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    throw lastError;
  };

  const withLoading = useCallback(
    async <T>(
      promiseOrFn: Promise<T> | (() => Promise<T>),
      config: RetryConfig = {}
    ): Promise<T> => {
      showLoading();
      try {
        const promiseFn = typeof promiseOrFn === 'function'
          ? promiseOrFn
          : () => promiseOrFn;

        return await withRetry(promiseFn, config);
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return { withLoading };
};
