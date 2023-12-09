/// <reference path="../../adonis-typings/cache.d.ts" />
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache';
import TaggableStore from './TaggableStore';
export default class NullStore extends TaggableStore {
    /**
     * Retrieve an item from the cache by key.
     */
    get(_key: CacheKey): Promise<null>;
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     */
    many(keys: CacheKey[]): Promise<Record<keyof string[], null>>;
    /**
     * Store an item in the cache for a given number of minutes.
     */
    put(_key: CacheKey, _value: CacheValue, _minutes: MinutesInput): Promise<undefined>;
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    putMany(_object: CacheManyValues, _minutes: MinutesInput): Promise<never[]>;
    /**
     * Increment the value of an item in the cache.
     */
    increment(_key: CacheKey, _value?: CacheNumericValue): Promise<boolean>;
    /**
     * Decrement the value of an item in the cache.
     */
    decrement(_key: CacheKey, _value?: CacheNumericValue): Promise<boolean>;
    /**
     * Store an item in the cache indefinitely.
     */
    forever(_key: CacheKey, _value: CacheValue): Promise<undefined>;
    /**
     * Remove an item from the cache.
     */
    forget(_key: CacheKey): Promise<boolean>;
    /**
     * Remove all items from the cache.
     */
    flush(): Promise<undefined>;
    /**
     * Get the cache key prefix.
     */
    getPrefix(): string;
}
