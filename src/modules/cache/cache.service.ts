import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Stores a value in cache. TTL must be specified in minutes.
   * @param key Cache key
   * @param value Value to store
   * @param ttlInMinutes Time to live in minutes (optional)
   */
  async set<T>(key: string, value: T, ttlInMinutes?: number): Promise<void> {
    const ttlMs = ttlInMinutes ? ttlInMinutes * 60 * 1000 : undefined;
    await this.cacheManager.set(key, value, ttlMs);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const keys = await this.getAllKeys(prefix);
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  async isHealthy(): Promise<boolean> {
    const probeKey = '__health_check__';

    try {
      await this.cacheManager.set(probeKey, Date.now(), 1000);
      return (await this.cacheManager.get(probeKey)) !== undefined;
    } catch {
      return false;
    }
  }

  private async getAllKeys(searchText: string): Promise<string[]> {
    const store = this.cacheManager.stores[0];
    const keys: string[] = [];

    if (!store?.iterator) return keys;

    for await (const [key] of store.iterator({})) {
      const keyStr = String(key);
      if (keyStr.includes(searchText)) {
        keys.push(keyStr);
      }
    }

    return keys;
  }
}
