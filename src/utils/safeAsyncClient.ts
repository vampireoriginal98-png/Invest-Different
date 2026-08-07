export function safeAsync<T extends (...args: any[]) => any>(fn: T, fallback?: any) {
  return function (...args: Parameters<T>) {
    try {
      const maybe = fn(...args);
      if (maybe && typeof (maybe as any).then === 'function') {
        return (maybe as Promise<any>).catch((err) => {
          try { console.error('[safeAsyncClient] caught', err); } catch (_) {}
          if (typeof fallback === 'function') return fallback(err);
          return fallback;
        });
      }
      return maybe;
    } catch (err) {
      try { console.error('[safeAsyncClient] sync caught', err); } catch (_) {}
      if (typeof fallback === 'function') return fallback(err);
      return fallback;
    }
  };
}
