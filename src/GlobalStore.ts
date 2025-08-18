// GlobalStore.ts
import { produce } from "immer";

export type Listener<T> = (state: T) => void;
export type Middleware<T> = (prev: T | undefined, next: T, key: string) => void;

// Custom HashMap implementation for better performance
class FastHashMap<V> {
  private buckets: Array<Array<{ key: string; value: V }>> = [];
  private size = 0;
  private capacity = 16;
  private loadFactor = 0.75;

  constructor() {
    this.buckets = new Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) {
      this.buckets[i] = [];
    }
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0x7fffffff;
    }
    return hash % this.capacity;
  }

  private resize(): void {
    const oldBuckets = this.buckets;
    this.capacity *= 2;
    this.buckets = new Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) {
      this.buckets[i] = [];
    }
    this.size = 0;

    for (const bucket of oldBuckets) {
      for (const { key, value } of bucket) {
        this.set(key, value);
      }
    }
  }

  set(key: string, value: V): void {
    if (this.size >= this.capacity * this.loadFactor) {
      this.resize();
    }

    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        return;
      }
    }

    bucket.push({ key, value });
    this.size++;
  }

  get(key: string): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const item of bucket) {
      if (item.key === key) {
        return item.value;
      }
    }
    return undefined;
  }

  has(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const item of bucket) {
      if (item.key === key) {
        return true;
      }
    }
    return false;
  }

  delete(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }
    return false;
  }

  keys(): string[] {
    const result: string[] = [];
    for (const bucket of this.buckets) {
      for (const item of bucket) {
        result.push(item.key);
      }
    }
    return result;
  }
}

// Custom Set implementation for listeners
class FastSet<T> {
  private items: T[] = [];

  add(item: T): void {
    if (!this.has(item)) {
      this.items.push(item);
    }
  }

  has(item: T): boolean {
    for (const existing of this.items) {
      if (existing === item) {
        return true;
      }
    }
    return false;
  }

  delete(item: T): boolean {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] === item) {
        this.items.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  get size(): number {
    return this.items.length;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  clear(): void {
    this.items.length = 0;
  }
}

export class GlobalStore {
  private store = new FastHashMap<unknown>();
  private listeners = new FastHashMap<FastSet<Listener<unknown>>>();
  private middlewares = new FastSet<Middleware<unknown>>();

  private isBatching = false;
  private batchedKeys = new FastSet<string>();

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    const prev = this.store.get(key) as T | undefined;

    // 값이 같으면 early return (얕은 비교)
    if (prev === value) {
      return;
    }

    this.store.set(key, value);

    // 미들웨어가 있을 때만 실행
    if (this.middlewares.size > 0) {
      for (const middleware of this.middlewares) {
        middleware(prev, value, key);
      }
    }

    if (this.isBatching) {
      this.batchedKeys.add(key);
    } else {
      // 리스너가 있을 때만 실행
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
      keyListeners = new FastSet<Listener<unknown>>();
      this.listeners.set(key, keyListeners);
    }
    keyListeners.add(listener as Listener<unknown>);

    // 클로저에서 참조를 캐시하여 lookup 최소화
    return () => {
      keyListeners!.delete(listener as Listener<unknown>);
      // 빈 Set 정리
      if (keyListeners!.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  use<T>(middleware: Middleware<T>): void {
    this.middlewares.add(middleware as Middleware<unknown>);
  }

  batch(fn: () => void): void {
    // 이미 배치 중이면 중첩 배치 방지
    if (this.isBatching) {
      fn();
      return;
    }

    this.isBatching = true;
    try {
      fn();
    } finally {
      this.isBatching = false;

      // 배치된 키들에 대해서만 리스너 실행
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

//SingleInstance
export const globalStore = new GlobalStore();
