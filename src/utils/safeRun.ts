// Lightweight helpers to isolate and fallback on errors.
export async function safeRun<T = any>(fn: () => T | Promise<T>, fallback?: T | ((err: any) => T)) {
  try {
    const res = await fn();
    return res;
  } catch (err) {
    try { console.error('[safeRun] caught:', err); } catch (_) {}
    if (typeof fallback === 'function') {
      try { return (fallback as any)(err); } catch (e) { console.error('[safeRun] fallback failed', e); }
    }
    return fallback;
  }
}

export function safeAsync<T extends (...args: any[]) => any>(fn: T, fallback?: any) {
  return function (...args: Parameters<T>) {
    try {
      const maybe = fn(...args);
      if (maybe && typeof (maybe as any).then === 'function') {
        return (maybe as Promise<any>).catch((err: any) => {
          try { console.error('[safeAsync] caught:', err); } catch (_) {}
          if (typeof fallback === 'function') return fallback(err);
          return fallback;
        });
      }
      return maybe;
    } catch (err) {
      try { console.error('[safeAsync] sync caught:', err); } catch (_) {}
      if (typeof fallback === 'function') return fallback(err);
      return fallback;
    }
  };
}

// For Express route handlers:
export function wrapAsync(handler: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(handler(req, res, next)).catch((err) => {
      // mark isolated and forward to error handler
      try { (err as any).__isolated = true; } catch (_) {}
      next(err);
    });
  };
}
