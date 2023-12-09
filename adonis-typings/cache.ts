
declare module '@ioc:AdonisV5Cache' {
  import { EmitterContract } from "@ioc:Adonis/Core/Event";

  export type CacheDriver = 'null' | 'redis' | 'database' | 'object';

  export type CacheKey = string;
  export type CacheValue = any;
  export type CacheNumericValue = number;
  export type CacheNullableValue = CacheValue | null;
  export type CacheManyValues = Record<CacheKey, CacheValue>
  export type MinutesInput = number | Date;

  export type CacheRememberClosure = () => CacheValue | Promise<CacheValue>

  export interface BaseCacheConfig {
    driver: CacheDriver
    prefix?: string
  }
  export interface NullCacheConfig extends BaseCacheConfig {
    driver: 'null'
  }

  export interface RedisCacheConfig extends BaseCacheConfig {
    driver: 'redis'
    connection: string
  }

  export interface DatabaseCacheConfig extends BaseCacheConfig {
    driver: 'database'
    table: string
    connection: string
  }

  export interface ObjectCacheConfig extends BaseCacheConfig {
    driver: 'object'
  }

  export interface CacheConfig {
    default: CacheDriver
    prefix?: string
    stores: {
      object: ObjectCacheConfig
      database: DatabaseCacheConfig
      redis: RedisCacheConfig
      null: NullCacheConfig
    }
  }

  export interface CacheStoreContract {
    get: (key: CacheKey) => Promise<CacheNullableValue>
    many: (keys: CacheKey[]) => Promise<CacheManyValues>
    put: (key: CacheKey, value: CacheValue, minutes: MinutesInput) => Promise<any>
    putMany: (object: CacheManyValues, minutes: MinutesInput) => Promise<void[]>

    /**
     * Increment the value of an item in the cache.
     */
    increment: (key: CacheKey, value: CacheNumericValue) => Promise<any>

    /**
     * Decrement the value of an item in the cache.
     */
    decrement: (key: CacheKey, value: CacheNumericValue) => Promise<any>

    forever: (key: CacheKey, value: CacheValue) => Promise<any>
    forget: (key: CacheKey) => Promise<boolean>

    /**
     * Remove all items from the cache.
     */
    flush: () => Promise<void>

    add?: (key: CacheKey, value: any, minutes: MinutesInput) => Promise<any>
    tags: (names: string[]) => RepositoryContract
  }


  export interface CacheEvents {
    hit: {
      key: CacheKey,
      value: CacheValue,
      tags?: string[],
    },
    missed: {
      key: CacheKey,
      tags?: string[],
    },
    keyForgotten: {
      key: CacheKey,
      tags?: string[],
    },
    keyWritten: {
      key: CacheKey,
      value: CacheValue,
      tags?: string[],
      minutes: number,
    }
  }

  export interface RepositoryContract extends CacheStoreContract {
    setEventDispatcher: (events: EmitterContract) => void
    getStore: () => CacheStoreContract
    has: (key: CacheKey) => Promise<boolean>
    pull: (key: CacheKey, defaultValue: CacheNullableValue) => Promise<CacheNullableValue>
    remember: (key: CacheKey, minutes: MinutesInput, closure: CacheRememberClosure) => Promise<CacheValue>
    rememberForever: (key: CacheKey, closure: CacheRememberClosure) => Promise<CacheValue>
    sear: (key: CacheKey, closure: CacheRememberClosure) => Promise<CacheValue>
  }

  export interface CacheManagerContract {
    store: (name?: CacheDriver) => CacheStoreContract
    driver: (driver?: CacheDriver) => CacheStoreContract
    repository: (store: CacheStoreContract) => any
    getDefaultDriver: () => CacheDriver
    extend: (driver: CacheDriver, closure: Function) => CacheManagerContract
  }

  const CacheManager: CacheManagerContract
  export default CacheManager;
}



