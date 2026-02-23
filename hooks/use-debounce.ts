import { useState, useEffect, useCallback, useRef } from 'react';

export type DebounceOptions = {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
};

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait,
  } = options;

  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastInvokeTimeRef = useRef<number>(0);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
  }, []);

  const invokeCallback = useCallback((time: number) => {
    if (pendingArgsRef.current) {
      callbackRef.current(...pendingArgsRef.current);
      lastInvokeTimeRef.current = time;
      pendingArgsRef.current = null;
      setIsPending(false);
    }
  }, []);

  const startTimer = useCallback(
    (pendingFunc: () => void, wait: number) => {
      clearTimers();
      timeoutRef.current = setTimeout(pendingFunc, wait);
    },
    [clearTimers]
  );

  const shouldInvoke = useCallback((time: number) => {
    if (!lastCallTimeRef.current) return false;

    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const trailingEdge = useCallback((time: number) => {
    timeoutRef.current = null;

    if (trailing && pendingArgsRef.current) {
      invokeCallback(time);
    }
  }, [trailing, invokeCallback]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }

    const remainingDelay = delay - (time - (lastCallTimeRef.current || 0));
    startTimer(timerExpired, remainingDelay);
  }, [delay, shouldInvoke, startTimer, trailingEdge]);

  const leadingEdge = useCallback((time: number) => {
    lastInvokeTimeRef.current = time;
    
    if (maxWait !== undefined) {
      clearTimeout(maxWaitTimeoutRef.current!);
      maxWaitTimeoutRef.current = setTimeout(() => {
        const currentTime = Date.now();
        if (shouldInvoke(currentTime)) {
          trailingEdge(currentTime);
        }
      }, maxWait);
    }
    
    if (leading) {
      invokeCallback(time);
    }
    
    startTimer(timerExpired, delay);
  }, [delay, leading, maxWait, shouldInvoke, startTimer, timerExpired, trailingEdge, invokeCallback]);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    pendingArgsRef.current = args;
    lastCallTimeRef.current = time;
    setIsPending(true);

    if (isInvoking) {
      if (!timeoutRef.current) {
        leadingEdge(time);
      } else if (maxWait !== undefined) {
        clearTimers();
        leadingEdge(time);
      }
    } else if (!timeoutRef.current) {
      startTimer(timerExpired, delay);
    }
  }, [delay, leadingEdge, maxWait, shouldInvoke, startTimer, timerExpired, clearTimers]);

  const cancel = useCallback(() => {
    clearTimers();
    lastCallTimeRef.current = null;
    pendingArgsRef.current = null;
    setIsPending(false);
  }, [clearTimers]);

  const flush = useCallback(() => {
    if (timeoutRef.current && pendingArgsRef.current) {
      invokeCallback(Date.now());
      clearTimers();
    }
  }, [invokeCallback, clearTimers]);

  const pending = useCallback(() => isPending, [isPending]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const debouncedWithMethods = Object.assign(
    debouncedFunction,
    { cancel, flush, pending }
  );

  return debouncedWithMethods;
}

export function useDebounceValue<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 300);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay?: number,
  options?: Omit<DebounceOptions, 'delay'>
): DebouncedFunction<T> {
  return useDebounce(callback, { delay, ...options });
}