import { useState, useEffect } from "react";
import { globalStore } from "./GlobalStore";

export function useStatio<T>(key: string): [T | undefined, (val: T) => void];
export function useStatio<T>(key: string, initial: T): [T, (val: T) => void];
export function useStatio<T>(
  key: string,
  initial?: T
): [T | undefined, (val: T) => void] {
  const [state, setState] = useState<T | undefined>(() => {
    const existing = globalStore.get<T>(key);
    return existing !== undefined ? existing : initial;
  });

  useEffect(() => {
    const existing = globalStore.get<T>(key);
    if (existing === undefined && initial !== undefined) {
      globalStore.set<T>(key, initial);
    }

    const unsubscribe = globalStore.subscribe<T>(key, setState);
    return unsubscribe;
  }, [key, initial]);

  const setGlobalState = (val: T) => {
    globalStore.set<T>(key, val);
  };

  return [state, setGlobalState];
}
