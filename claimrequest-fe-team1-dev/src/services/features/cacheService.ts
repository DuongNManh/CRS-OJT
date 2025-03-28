type CacheEntry<T> = {
  data: T;
  timestamp: number;
  tags?: string[]; // Add tags for better cache invalidation
};

// Add specific tag constants for better consistency
export const CACHE_TAGS = {
  CLAIMS: "claims",
  CLAIM_LISTS: "claim_lists",
  FINANCE_MODE: "finance_mode",
  APPROVER_MODE: "approver_mode",
  CLAIMER_MODE: "claimer_mode",
} as const;

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private ttl: number;
  private tags: Map<string, Set<string>> = new Map(); // Track keys by tags

  constructor(ttl: number = 300000) {
    // Increase default TTL to 5 minutes
    this.ttl = ttl;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.invalidateKey(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, tags: string[] = []): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      tags,
    };

    this.cache.set(key, entry);

    // Add key to each tag's set
    tags.forEach((tag) => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)?.add(key);
    });
  }

  private invalidateKey(key: string): void {
    const entry = this.cache.get(key);
    if (entry?.tags) {
      entry.tags.forEach((tag) => {
        const tagSet = this.tags.get(tag);
        if (tagSet) {
          tagSet.delete(key);
          if (tagSet.size === 0) {
            this.tags.delete(tag);
          }
        }
      });
    }
    this.cache.delete(key);
  }

  invalidateByTag(tag: string): void {
    const keys = this.tags.get(tag);
    if (keys) {
      keys.forEach((key) => this.invalidateKey(key));
      this.tags.delete(tag);
    }
  }

  invalidateByTags(tags: string[]): void {
    tags.forEach((tag) => this.invalidateByTag(tag));
  }

  clear(): void {
    this.cache.clear();
    this.tags.clear();
  }

  // Helper method to get all keys for debugging
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Helper method to get cache stats
  getStats(): { size: number; tagCount: number } {
    return {
      size: this.cache.size,
      tagCount: this.tags.size,
    };
  }

  // Add helper method for claim list cache key generation
  generateClaimListCacheKey(
    mode: string,
    status: string = "",
    startDate: string = "",
    endDate: string = "",
  ): string {
    return `claim_list_${mode}_${status}_${startDate}_${endDate}`.toLowerCase();
  }

  // Add helper method for claim detail cache key generation
  generateClaimDetailCacheKey(claimId: string): string {
    return `claim_detail_${claimId}`;
  }
}

export const cacheService = new CacheService();
