/// <reference path="../../adonis-typings/cache.d.ts" />
import { CacheKey, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache';
import RedisStore from './RedisStore';
import TaggedCache from './TaggedCache';
/**
 * Forever reference key.
 */
export declare const REFERENCE_KEY_FOREVER = "forever_ref";
/**
 * Standard reference key.
 */
export declare const REFERENCE_KEY_STANDARD = "standard_ref";
export default class RedisTaggedCache extends TaggedCache {
    protected store: RedisStore;
    /**
     * Store an item in the cache.
     */
    put(key: CacheKey, value: CacheValue, minutesInput?: MinutesInput): Promise<void>;
    /**
     * Store an item in the cache indefinitely.
     */
    forever(key: CacheKey, value: CacheValue): Promise<void>;
    /**
     * Remove all items from the cache.
     */
    flush(): Promise<void>;
    /**
     * Store standard key references into store.
     */
    private pushStandardKeys;
    /**
     * Store forever key references into store.
     */
    private pushForeverKeys;
    /**
     * Store a reference to the cache key against the reference key.
     */
    pushKeys(namespace: string, key: CacheKey, reference: string): Promise<void>;
    /**
     * Delete all of the items that were stored forever.
     */
    private deleteForeverKeys;
    /**
     * Delete all standard items.
     */
    private deleteStandardKeys;
    /**
     * Find and delete all of the items that were stored against a reference.
     */
    private deleteKeysByReference;
    /**
     * Delete item keys that have been stored against a reference.
     */
    private _deleteValues;
    /**
     * Get the reference key for the segment.
     */
    private referenceKey;
}
