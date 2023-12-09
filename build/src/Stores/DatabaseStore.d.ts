/// <reference path="../../adonis-typings/cache.d.ts" />
/// <reference types="@adonisjs/lucid" />
/// <reference types="@adonisjs/lucid" />
import { QueryClientContract } from '@ioc:Adonis/Lucid/Database';
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache';
import BaseStore from './BaseStore';
export default class DatabaseStore extends BaseStore {
    private connection;
    private tableName;
    private prefix;
    /**
     * Probability (parts per million) that garbage collection (GC) should be performed
     * when storing a piece of data in the cache. Defaults to 100, meaning 0.01% chance.
     * This number should be between 0 and 1000000. A value 0 meaning no GC will be performed at all.
     */
    private gcProbability;
    constructor(connection: QueryClientContract, tableName: string, prefix?: string);
    /**
     * Return a new query builder instance with cache's table set
     *
     */
    private query;
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
    many(keys: CacheKey[]): Promise<{}>;
    /**
     * Store an item in the cache for a given number of minutes.
     *
     */
    put(key: CacheKey, value: CacheValue, minutesInput?: MinutesInput): Promise<void>;
    /**
     * Store multiple items in the cache for a given number of minutes.
     *
     */
    putMany(object: CacheManyValues, minutes: MinutesInput): Promise<void[]>;
    /**
     * Increment the value of an item in the cache.
     *
     */
    increment(key: CacheKey, value?: CacheNumericValue): Promise<unknown>;
    /**
     * Decrement the value of an item in the cache.
     *
     */
    decrement(key: CacheKey, value?: CacheNumericValue): Promise<unknown>;
    /**
     * Increment or decrement the value of an item in the cache.
     *
     */
    private incrementOrDecrement;
    /**
     * Store an item in the cache indefinitely.
     *
     */
    forever(key: CacheKey, value: CacheValue): Promise<void>;
    /**
     * Remove an item from the cache.
     *
     */
    forget(key: CacheKey): Promise<boolean>;
    /**
     * Remove all items from the cache.
     *
     */
    flush(): Promise<void>;
    /**
     * Get the underlying database connection.
     *
     */
    getConnection(): QueryClientContract;
    /**
     * Get the cache key prefix.
     *
     */
    getPrefix(): string;
    /**
     * Removes the expired data values.
     * @param {bool} force whether to enforce the garbage collection regardless of [[gcProbability]].
     * Defaults to false, meaning the actual deletion happens with the probability as specified by [[gcProbability]].
     */
    gc(force?: boolean): Promise<void>;
}
