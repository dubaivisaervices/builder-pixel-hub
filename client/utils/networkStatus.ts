// Network status utilities for handling API connectivity issues

export interface NetworkError {
  type:
    | "timeout"
    | "fetch_failed"
    | "server_down"
    | "invalid_response"
    | "unknown";
  message: string;
  userMessage: string;
  shouldRetry: boolean;
}

export const parseNetworkError = (error: any): NetworkError => {
  const errorMessage = error?.message || error || "Unknown error";

  if (error?.name === "AbortError" || errorMessage.includes("timeout")) {
    return {
      type: "timeout",
      message: errorMessage,
      userMessage:
        "The server is taking too long to respond. Please try again.",
      shouldRetry: true,
    };
  }

  if (errorMessage === "Failed to fetch") {
    return {
      type: "fetch_failed",
      message: errorMessage,
      userMessage:
        "Unable to connect to the server. Please check your internet connection.",
      shouldRetry: true,
    };
  }

  if (errorMessage.includes("Network error")) {
    return {
      type: "server_down",
      message: errorMessage,
      userMessage:
        "The server appears to be unavailable. Please try again later.",
      shouldRetry: true,
    };
  }

  if (
    errorMessage.includes("JSON") ||
    errorMessage.includes("HTML instead of JSON")
  ) {
    return {
      type: "invalid_response",
      message: errorMessage,
      userMessage:
        "The server returned an unexpected response. Please try again.",
      shouldRetry: true,
    };
  }

  return {
    type: "unknown",
    message: errorMessage,
    userMessage: "An unexpected error occurred. Please try again.",
    shouldRetry: false,
  };
};

export const createFetchWithTimeout = (timeoutMs: number = 10000) => {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }

      throw error;
    }
  };
};

export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const fetchWithTimeout = createFetchWithTimeout(5000);
    const response = await fetchWithTimeout("/api/health");
    return response.ok;
  } catch (error) {
    console.warn("API health check failed:", error);
    return false;
  }
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      const networkError = parseNetworkError(error);
      if (!networkError.shouldRetry) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(
          `Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const getOfflineMessage = (): string => {
  if (!navigator.onLine) {
    return "You appear to be offline. Please check your internet connection.";
  }

  return "Unable to connect to our servers. Showing cached or sample data.";
};

export const isNetworkError = (error: any): boolean => {
  const errorMessage = error?.message || error || "";
  return (
    errorMessage === "Failed to fetch" ||
    errorMessage.includes("Network error") ||
    errorMessage.includes("timeout") ||
    error?.name === "AbortError"
  );
};
