/// <reference path="../../adonis-typings/cache.d.ts" />
/// <reference types="@adonisjs/application/build/adonis-typings" />
/// <reference types="@adonisjs/http-server/build/adonis-typings" />
/// <reference types="@adonisjs/core" />
/// <reference types="@adonisjs/events/build/adonis-typings" />
/// <reference types="@adonisjs/hash/build/adonis-typings" />
/// <reference types="@adonisjs/encryption/build/adonis-typings" />
/// <reference types="@adonisjs/validator" />
/// <reference types="@adonisjs/drive/build/adonis-typings" />
/// <reference types="@adonisjs/lucid" />
/// <reference types="@adonisjs/redis" />
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { CacheDriver, CacheStoreContract } from '@ioc:AdonisV5Cache';
import Repository from './Repository';
export default class CacheManager {
    /**
     * The application instance
     */
    private app;
    /**
     * The array of resolve cache stores
     */
    private stores;
    /**
     * The registered custom driver creators
     */
    private customCreators;
    private createDriver;
    constructor(app: ApplicationContract);
    /**
     * Get a cache store instance by name.
     *
     */
    store(customName?: CacheDriver): any;
    /**
     * Get a cache driver instance.
     *
     */
    driver(driver?: CacheDriver): any;
    /**
     * Attempt to get the store from the local cache.
     *
     */
    private get;
    /**
     * Resolve the given store.
     *
     */
    private resolve;
    /**
     * Call a custom driver creator.
     *
     */
    private callCustomCreator;
    /**
    * Create a new cache repository with the given implementation.
    *
    */
    repository(store: CacheStoreContract): Repository;
    /**
     * Get the cache prefix.
     *
     */
    private getPrefix;
    /**
     * Get the cache connection configuration.
     *
     */
    private getConfig;
    /**
     * Get the default cache driver name.
     *
     */
    getDefaultDriver(): CacheDriver;
    /**
     * Register a custom driver creator Closure.
     *
     * @param  {string}    driver
     * @param  {function}  closure
     * @return {this}
     */
    extend(driver: CacheDriver, closure: Function): this;
}
