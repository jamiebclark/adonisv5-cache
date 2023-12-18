/// <reference path="../../adonis-typings/cache.d.ts" />
/// <reference types="@adonisjs/events/build/adonis-typings" />
/// <reference types="@adonisjs/lucid" />
/// <reference types="@adonisjs/redis" />
import { EmitterContract } from "@ioc:Adonis/Core/Event";
import { CacheEvents, CacheKey, CacheManyValues, CacheNumericValue, CacheRememberClosure, CacheStoreContract, CacheValue, MinutesInput, RepositoryContract, TagsInput } from "@ioc:AdonisV5Cache";
export default class Repository implements RepositoryContract {
    /**
     * The cache store implementation
     */
    protected store: CacheStoreContract;
    /**
     * The event dispatcher implementation
     */
    protected events?: EmitterContract;
    /**
     * Create a new cache repository instance.
     */
    constructor(store: CacheStoreContract);
    /**
     * Set the event dispatcher instance.
     */
    setEventDispatcher(events: EmitterContract): void;
    /**
     * Fire an event for this cache instance.
     */
    protected fireCacheEvent<E extends keyof CacheEvents>(event: E, payload: CacheEvents[E]): Promise<void>;
    /**
     * Determine if an item exists in the cache.
     *
     */
    has(key: CacheKey): Promise<boolean>;
    /**
     * Retrieve an item from the cache by key.
     *
     */
    get(key: CacheKey): Promise<any>;
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     *
     */
    many(keys: CacheKey[]): Promise<CacheManyValues>;
    /**
     * Retrieve an item from the cache and delete it.
     */
    pull(key: CacheKey): Promise<any>;
    flush(): Promise<void>;
    /**
     * Store an item in the cache.
     */
    put(key: CacheKey, value: CacheValue, minutesInput: MinutesInput): Promise<void>;
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    putMany(values: CacheManyValues, minutesInput: MinutesInput): Promise<void[]>;
    /**
     * Store an item in the cache if the key does not exist.
     */
    add(key: CacheKey, value: CacheValue, minutesInput: MinutesInput): Promise<any>;
    /**
     * Increment the value of an item in the cache.
     */
    increment(key: CacheKey, value?: CacheNumericValue): Promise<any>;
    /**
     * Decrement the value of an item in the cache.
     */
    decrement(key: CacheKey, value?: CacheNumericValue): Promise<any>;
    /**
     * Store an item in the cache indefinitely.
     */
    forever(key: CacheKey, value: CacheValue): Promise<void>;
    /**
     * Get an item from the cache, or store the default value.
     */
    remember(key: CacheKey, minutes: MinutesInput, closure: CacheRememberClosure): Promise<any>;
    /**
     * Get an item from the cache, or store the default value forever.
     */
    sear(key: CacheKey, closure: CacheRememberClosure): Promise<any>;
    /**
     * Get an item from the cache, or store the default value forever.
     */
    rememberForever(key: CacheKey, closure: CacheRememberClosure): Promise<any>;
    /**
     * Remove an item from the cache.
     *
     */
    forget(key: CacheKey): Promise<boolean>;
    /**
     * Begin executing a new tags operation if the store supports it.
     *
     */
    tags(...names: TagsInput[]): RepositoryContract;
    /**
     * Format the key for a cache item.
     *
     */
    protected itemKey(key: CacheKey): Promise<string>;
    /**
     * Get the cache store implementation.
     *
     */
    getStore(): CacheStoreContract;
}
