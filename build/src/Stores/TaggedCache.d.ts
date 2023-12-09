/// <reference path="../../adonis-typings/cache.d.ts" />
import { CacheEvents, CacheKey, CacheNumericValue, CacheStoreContract } from '@ioc:AdonisV5Cache';
import Repository from './Repository';
import TagSet from './TagSet';
export default class TaggedCache extends Repository {
    protected tagSet: TagSet;
    constructor(store: CacheStoreContract, tagSet: TagSet);
    protected fireCacheEvent<E extends keyof CacheEvents>(event: E, payload: CacheEvents[E]): Promise<void>;
    /**
     * Increment the value of an item in the cache.
     *
     */
    increment(key: CacheKey, value?: CacheNumericValue): Promise<any>;
    /**
     * Increment the value of an item in the cache.
     *
     */
    decrement(key: CacheKey, value?: CacheNumericValue): Promise<any>;
    /**
     * Remove all items from the cache.
     *
     */
    flush(): Promise<void>;
    protected itemKey(key: CacheKey): Promise<string>;
    /**
     * Get a fully qualified key for a tagged item.
     *
     */
    taggedItemKey(key: CacheKey): Promise<string>;
}
