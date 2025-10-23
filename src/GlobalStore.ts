import { produce } from "immer";

export type Listener<T> = (state: T) => void;
export type Middleware<T> = (prev: T | undefined, next: T, key: string) => void;

export class GlobalStore {
  private store = new Map<string, unknown>();
  private listeners = new Map<string, Set<Listener<unknown>>>();
  private middlewares = new Set<Middleware<unknown>>();

  private isBatching = false;
  private batchedKeys = new Set<string>();

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    const prev = this.store.get(key) as T | undefined;

    if (prev === value) {
      return;
    }

    this.store.set(key, value);

    if (this.middlewares.size > 0) {
      for (const middleware of this.middlewares) {
        middleware(prev, value, key);
      }
    }

    if (this.isBatching) {
      this.batchedKeys.add(key);
    } else {
      const keyListeners = this.listeners.get(key);
      if (keyListeners && keyListeners.size > 0) {
        for (const listener of keyListeners) {
          (listener as Listener<T>)(value);
        }
      }
    }
  }

  update<T>(key: string, updater: (draft: T) => void): void {
    const prev = this.store.get(key) as T | undefined;
    if (prev === undefined) {
      throw new Error(`Cannot update "${key}": no initial value`);
    }
    const next = produce(prev, updater);
    this.set<T>(key, next);
  }

  subscribe<T>(key: string, listener: Listener<T>): () => void {
    let keyListeners = this.listeners.get(key);
    if (!keyListeners) {
      keyListeners = new Set<Listener<unknown>>();
      this.listeners.set(key, keyListeners);
    }
    keyListeners.add(listener as Listener<unknown>);

    return () => {
      keyListeners!.delete(listener as Listener<unknown>);
      if (keyListeners!.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  use<T>(middleware: Middleware<T>): void {
    this.middlewares.add(middleware as Middleware<unknown>);
  }

  batch(fn: () => void): void {
    if (this.isBatching) {
      fn();
      return;
    }

    this.isBatching = true;
    try {
      fn();
    } finally {
      this.isBatching = false;

      if (this.batchedKeys.size > 0) {
        for (const key of this.batchedKeys) {
          const state = this.store.get(key);
          const keyListeners = this.listeners.get(key);
          if (keyListeners && keyListeners.size > 0) {
            for (const listener of keyListeners) {
              listener(state);
            }
          }
        }
        this.batchedKeys.clear();
      }
    }
  }
}

export const globalStore = new GlobalStore();
