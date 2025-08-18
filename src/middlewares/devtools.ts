// middlewares/devtools.ts
import type { Middleware } from "../GlobalStore";

// Type definition for Redux DevTools Extension
interface ReduxDevToolsExtension {
  connect(options?: { name?: string }):
    | {
        send(action: string, state: Record<string, unknown>): void;
      }
    | undefined;
}

// Extend the Window interface to include Redux DevTools
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension;
  }
}

export function devStatio(name = "Statio"): Middleware<unknown> {
  const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
    name,
  });

  return (_prev, next, key) => {
    devtools?.send(`${String(key)} -> ${JSON.stringify(next)}`, {
      [key]: next,
    });
  };
}
