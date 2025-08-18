import type { Middleware } from "../GlobalStore";

//For Service
export function effectStatio<T>(
  key: string,
  effect: (val: T) => void
): Middleware<T> {
  return (prev, next, k) => {
    if (k === key && prev !== next) {
      effect(next);
    }
  };
}

interface PersistOptions {
  keyPrefix?: string;
  storage?: Storage;
  whitelist?: string[];
}

export function persistStatio({
  keyPrefix = "statio:",
  storage = localStorage,
  whitelist,
}: PersistOptions = {}): Middleware<unknown> {
  return (_prev, next, key) => {
    if (whitelist && !whitelist.includes(key)) return;
    try {
      const itemKey = `${keyPrefix}${key}`;
      storage.setItem(itemKey, JSON.stringify(next));
    } catch (e) {
      console.warn(`Persist failed for key: ${key}`, e);
    }
  };
}

//For Dev
export function loggerStatio<T>(): Middleware<T> {
  return (prev, next, key) => {
    console.log(`[Statio] ${key}:`, prev, "→", next);
  };
}

interface PersistOptions {
  keyPrefix?: string;
  storage?: Storage;
  whitelist?: string[];
}

export function validateStatio<T>(
  key: string,
  validator: (val: T) => boolean
): Middleware<T> {
  return (_prev, next, k) => {
    if (k === key && !validator(next)) {
      console.warn(`Invalid value for key "${key}":`, next);
    }
  };
}
