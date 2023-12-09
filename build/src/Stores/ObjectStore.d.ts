/// <reference path="../../adonis-typings/cache.d.ts" />
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache';
import TaggableStore from './TaggableStore';
export default class ObjectStore extends TaggableStore {
    private storage;
    /**
     * Retrieve an item from the cache by key.
     */
    get(key: CacheKey): Promise<any>;
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     */
    many(keys: CacheKey[]): Promise<CacheManyValues>;
    /**
     * Store an item in the cache for a given number of minutes.
     */
    put(key: CacheKey, value: CacheValue, minutesInput?: MinutesInput): Promise<void>;
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    putMany(object: Record<string, any>, minutes: number): Promise<void[]>;
    /**
     * Increment the value of an item in the cache.
     */
    increment(key: CacheKey, value?: CacheNumericValue): Promise<unknown>;
    /**
     * Decrement the value of an item in the cache.
     */
    decrement(key: CacheKey, value?: CacheNumericValue): Promise<unknown>;
    /**
     * Increment or decrement the value of an item in the cache.
     */
    private incrementOrDecrement;
    /**
     * Store an item in the cache indefinitely.
     */
    forever(key: string, value: any): Promise<void>;
    /**
     * Remove an item from the cache.
     */
    forget(key: string): Promise<boolean>;
    /**
     * Remove all items from the cache.
     */
    flush(): Promise<void>;
    /**
     * Get the cache key prefix.
     * @return string
     */
    getPrefix(): string;
}
