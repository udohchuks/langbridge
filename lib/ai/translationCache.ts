
interface CacheEntry {
    value: string;
    timestamp: number;
}

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const MAX_CACHE_SIZE = 1000;

class TranslationCache {
    private cache: Map<string, CacheEntry>;

    constructor() {
        this.cache = new Map();
    }

    private getKey(text: string, targetLanguage: string): string {
        return `${text.trim()}:${targetLanguage}`;
    }

    get(text: string, targetLanguage: string): string | null {
        const key = this.getKey(text, targetLanguage);
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() - entry.timestamp > CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    set(text: string, targetLanguage: string, value: string): void {
        const key = this.getKey(text, targetLanguage);

        // Simple eviction if full
        if (this.cache.size >= MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
}

export const translationCache = new TranslationCache();
