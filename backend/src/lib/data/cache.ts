/**
 * Tiny in-memory TTL cache. Single process, no external deps.
 *
 * Use it to wrap expensive read paths that are tolerant of stale-up-to-N-seconds
 * data — dashboard aggregates, settings reads, user list, etc.
 *
 * Mutations elsewhere can call `cache.invalidate(key)` or `cache.clear(prefix)`
 * to bust stale entries on demand.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export interface TtlCache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs: number): void;
  /** Returns cached value if fresh, otherwise calls loader, stores, and returns. */
  wrap<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T>;
  invalidate(key: string): void;
  /** Invalidate all keys with this prefix (use for namespaced groups). */
  clearPrefix(prefix: string): void;
  clearAll(): void;
}

export const cache: TtlCache = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value as T;
  },

  set<T>(key: string, value: T, ttlMs: number): void {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  async wrap<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const hit = this.get<T>(key);
    if (hit !== undefined) return hit;
    const value = await loader();
    this.set(key, value, ttlMs);
    return value;
  },

  invalidate(key: string): void {
    store.delete(key);
  },

  clearPrefix(prefix: string): void {
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  },

  clearAll(): void {
    store.clear();
  },
};
