import React, { useState, useCallback, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface UseLoadingStateReturn {
  loadingStates: Record<string, LoadingState>;
  setLoading: (key: string, isLoading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  isLoading: (key?: string) => boolean;
  hasError: (key: string) => boolean;
  getError: (key: string) => string | null;
  reset: (key: string) => void;
  resetAll: () => void;
}

interface SimpleLoadingState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

interface UseLoadingStateOptions {
  initialLoading?: boolean;
}

// Overload signatures
export function useLoadingState(options: UseLoadingStateOptions): SimpleLoadingState;
export function useLoadingState(): UseLoadingStateReturn;

// Implementation
export function useLoadingState(options?: UseLoadingStateOptions) {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
  const [isLoadingState, setIsLoadingState] = useState<boolean>(options?.initialLoading ?? false);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading,
        ...(isLoading && { error: null }) // Clear error when loading starts
      }
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error
      }
    }));
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key]?.isLoading || false;
    }
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  const hasError = useCallback((key: string) => {
    return !!loadingStates[key]?.error;
  }, [loadingStates]);

  const getError = useCallback((key: string) => {
    return loadingStates[key]?.error || null;
  }, [loadingStates]);

  const reset = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const resetAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  // If options are provided, return the simple loading state interface
  if (options) {
    return {
      isLoading: isLoadingState,
      startLoading: () => setIsLoadingState(true),
      stopLoading: () => setIsLoadingState(false)
    };
  }

  // Otherwise return the full interface
  return {
    loadingStates,
    setLoading,
    setError,
    isLoading,
    hasError,
    getError,
    reset,
    resetAll
  };
}

// Hook for managing a single loading state
export const useSingleLoadingState = (initialKey?: string) => {
  const { loadingStates, setLoading, setError, isLoading, hasError, getError, reset } = useLoadingState();
  
  const key = initialKey || 'default';
  
  return {
    isLoading: isLoading(key),
    hasError: hasError(key),
    error: getError(key),
    setLoading: (loading: boolean) => setLoading(key, loading),
    setError: (error: string | null) => setError(key, error),
    reset: () => reset(key)
  };
};

// Hook for managing multiple loading states
export const useMultipleLoadingStates = (initialKeys?: string[]) => {
  const { loadingStates, setLoading, setError, isLoading, hasError, getError, reset, resetAll } = useLoadingState();
  
  // Initialize with provided keys if any
  useEffect(() => {
    if (initialKeys && initialKeys.length > 0) {
      initialKeys.forEach(key => {
        // Only initialize if the key doesn't exist yet
        if (loadingStates[key] === undefined) {
          setLoading(key, false); // Initialize to false, let the component set to true when needed
        }
      });
    }
  }, [initialKeys, loadingStates, setLoading]);
  
  // Check if any states are currently loading
  const isLoadingAny = useCallback(() => {
    return Object.values(loadingStates).some(state => state?.isLoading);
  }, [loadingStates]);
  
  // Check if a specific key is loading
  const isLoadingKey = useCallback((key: string) => {
    return loadingStates[key]?.isLoading || false;
  }, [loadingStates]);
  
  return {
    states: loadingStates,
    setLoading,
    setError,
    isLoadingAny,
    isLoading: isLoadingKey,
    hasError,
    getError,
    reset,
    resetAll
  };
};
