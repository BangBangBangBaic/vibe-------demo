interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache<T> {
  private readonly storage = new Map<string, CacheEntry<T>>();

  public get(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.storage.delete(key);
      return null;
    }

    return entry.value;
  }

  public set(key: string, value: T, ttlMs: number): void {
    this.storage.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }
}
