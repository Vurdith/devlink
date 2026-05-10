type IdleCallbackHandle = number;

type IdleCallbackOptions = {
  timeout?: number;
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleCallbackOptions) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

export function scheduleAfterInitialLoad(callback: () => void, timeout = 1500) {
  if (typeof window === "undefined") return () => {};

  const win = window as WindowWithIdleCallback;
  let idleHandle: IdleCallbackHandle | undefined;
  let timerHandle: number | undefined;
  let cancelled = false;

  const run = () => {
    if (cancelled) return;
    callback();
  };

  const scheduleIdle = () => {
    if (win.requestIdleCallback) {
      idleHandle = win.requestIdleCallback(run, { timeout });
      return;
    }

    timerHandle = window.setTimeout(run, Math.min(timeout, 800));
  };

  if (document.readyState === "complete") {
    scheduleIdle();
  } else {
    window.addEventListener("load", scheduleIdle, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", scheduleIdle);
    if (idleHandle !== undefined && win.cancelIdleCallback) {
      win.cancelIdleCallback(idleHandle);
    }
    if (timerHandle !== undefined) {
      window.clearTimeout(timerHandle);
    }
  };
}
