/// <reference path="../../adonis-typings/cache.d.ts" />
/// <reference types="@adonisjs/redis" />
import { RedisManagerContract } from '@ioc:Adonis/Addons/Redis';
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput, TagsInput } from '@ioc:AdonisV5Cache';
import RedisTaggedCache from './RedisTaggedCache';
import TaggableStore from './TaggableStore';
export default class RedisStore extends TaggableStore {
    private redis;
    private prefix;
    private connectionName;
    constructor(Redis: RedisManagerContract, prefix: string | undefined, connectionName: string);
    /**
     * Retrieve an item from the cache by key.
     */
    get(key: CacheKey): Promise<any>;
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     */
    many(keys: CacheKey[]): Promise<Record<string, any>>;
    /**
     * Store an item in the cache for a given number of minutes.
     */
    put(key: CacheKey, value: CacheValue, minutesInput?: MinutesInput): Promise<void>;
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    putMany(object: CacheManyValues, minutesInput: MinutesInput): Promise<void[]>;
    /**
     * Increment the value of an item in the cache.
     */
    increment(key: CacheKey, value?: CacheNumericValue): Promise<number | false>;
    /**
     * Decrement the value of an item in the cache.
     */
    decrement(key: CacheKey, value?: CacheNumericValue): Promise<number | false>;
    /**
     * Store an item in the cache indefinitely.
     */
    forever(key: CacheKey, value: CacheValue): Promise<void>;
    /**
     * Remove an item from the cache.
     */
    forget(key: CacheKey): Promise<boolean>;
    /**
     * Remove all items from the cache.
     */
    flush(): Promise<void>;
    /**
     * Begin executing a new tags operation.
     */
    tags(...names: TagsInput[]): RedisTaggedCache;
    /**
     * Get the Redis connection instance
     */
    connection(): import("@ioc:Adonis/Addons/Redis").RedisClusterConnectionContract | import("@ioc:Adonis/Addons/Redis").RedisConnectionContract;
    /**
     * Set the connection name to be used
     */
    setConnection(connectionName: string): void;
    /**
     * Get the Redis database instance
     */
    getRedis(): RedisManagerContract;
    /**
     * Get the cache key prefix
     */
    getPrefix(): string;
    /**
     * Set the cache key prefix
     */
    setPrefix(prefix: string): void;
}
