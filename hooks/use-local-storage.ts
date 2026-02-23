'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type LocalStorageValue<T> = T | null;

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: Error) => void;
}

export interface UseLocalStorageReturn<T> {
  value: LocalStorageValue<T>;
  setValue: (newValue: T | ((prev: LocalStorageValue<T>) => T)) => void;
  removeValue: () => void;
  isPersistent: boolean;
}

const defaultSerializer = <T>(value: T): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new Error(`Failed to serialize value: ${error}`);
  }
};

const defaultDeserializer = <T>(value: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`Failed to deserialize value: ${error}`);
  }
};

const isBrowser = typeof window !== 'undefined';

const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> => {
  const {
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    onError,
  } = options;

  const [storedValue, setStoredValue] = useState<LocalStorageValue<T>>(() => {
    if (!isBrowser) return initialValue ?? null;

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : (initialValue ?? null);
    } catch (error) {
      onError?.(error as Error);
      return initialValue ?? null;
    }
  });

  const [isPersistent, setIsPersistent] = useState(true);
  const initialValueRef = useRef(initialValue);
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  const setValue = useCallback(
    (newValue: T | ((prev: LocalStorageValue<T>) => T)) => {
      if (!isBrowser) return;

      try {
        const valueToStore =
          newValue instanceof Function
            ? newValue(storedValue)
            : newValue;

        setStoredValue(valueToStore);
        setIsPersistent(true);

        if (valueToStore === null) {
          window.localStorage.removeItem(keyRef.current);
        } else {
          window.localStorage.setItem(
            keyRef.current,
            serializer(valueToStore)
          );
        }
      } catch (error) {
        setIsPersistent(false);
        onError?.(error as Error);
      }
    },
    [storedValue, serializer, onError]
  );

  const removeValue = useCallback(() => {
    if (!isBrowser) return;

    try {
      setStoredValue(null);
      window.localStorage.removeItem(keyRef.current);
      setIsPersistent(true);
    } catch (error) {
      setIsPersistent(false);
      onError?.(error as Error);
    }
  }, [onError]);

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === keyRef.current && event.storageArea === window.localStorage) {
        try {
          const newValue = event.newValue
            ? deserializer(event.newValue)
            : initialValueRef.current ?? null;
          setStoredValue(newValue);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    };

    const testPersistence = () => {
      try {
        const testKey = `__persistence_test_${Date.now()}__`;
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        setIsPersistent(true);
      } catch (error) {
        setIsPersistent(false);
      }
    };

    testPersistence();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', testPersistence);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', testPersistence);
    };
  }, [deserializer, onError]);

  useEffect(() => {
    if (!isBrowser || !key) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserializer(item));
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, deserializer, onError]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isPersistent,
  };
};

export default useLocalStorage;

export const useLocalStorageArray = <T>(
  key: string,
  initialArray: T[] = []
) => {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<T[]>(
    key,
    initialArray
  );

  const addItem = useCallback(
    (item: T) => {
      setValue((prev) => [...(prev || []), item]);
    },
    [setValue]
  );

  const removeItem = useCallback(
    (index: number) => {
      setValue((prev) => {
        if (!prev) return [];
        return prev.filter((_, i) => i !== index);
      });
    },
    [setValue]
  );

  const updateItem = useCallback(
    (index: number, item: T) => {
      setValue((prev) => {
        if (!prev) return [];
        const newArray = [...prev];
        newArray[index] = item;
        return newArray;
      });
    },
    [setValue]
  );

  const clearArray = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    items: value || [],
    addItem,
    removeItem,
    updateItem,
    clearArray,
    removeAll: removeValue,
    isPersistent,
  };
};

export const useLocalStorageObject = <T extends Record<string, unknown>>(
  key: string,
  initialObject: Partial<T> = {}
) => {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<T>(
    key,
    initialObject as T
  );

  const updateField = useCallback(
    <K extends keyof T>(field: K, fieldValue: T[K]) => {
      setValue((prev) => {
        const newObject = { ...(prev || {}), [field]: fieldValue } as T;
        return newObject;
      });
    },
    [setValue]
  );

  const removeField = useCallback(
    <K extends keyof T>(field: K) => {
      setValue((prev) => {
        if (!prev) return {} as T;
        const { [field]: _, ...rest } = prev;
        return rest as T;
      });
    },
    [setValue]
  );

  return {
    object: value || ({} as T),
    updateField,
    removeField,
    removeAll: removeValue,
    isPersistent,
  };
};