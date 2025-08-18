// useStatioSelector.ts
import { useEffect, useRef, useState } from "react";
import { globalStore } from "./GlobalStore";

export function useStatioSelector<T, R>(
  key: string,
  selector: (state: T) => R
): R {
  const base = globalStore.get<T>(key);
  const [selected, setSelected] = useState(() => selector(base!));

  const selectedRef = useRef(selected);

  useEffect(() => {
    return globalStore.subscribe<T>(key, (newState) => {
      const nextSelected = selector(newState);
      if (!Object.is(selectedRef.current, nextSelected)) {
        selectedRef.current = nextSelected;
        setSelected(nextSelected);
      }
    });
  }, [key, selector]);

  return selected;
}
