/// <reference path="../../adonis-typings/cache.d.ts" />
import { CacheKey, CacheManyValues, CacheNullableValue, CacheNumericValue, CacheStoreContract, CacheValue, MinutesInput, RepositoryContract, TagsInput } from '@ioc:AdonisV5Cache';
export default abstract class BaseStore implements CacheStoreContract {
    tags(..._names: TagsInput[]): RepositoryContract;
    get(_key: CacheKey): Promise<CacheNullableValue>;
    many(_kes: CacheKey[]): Promise<CacheManyValues>;
    put(_key: CacheKey, _value: CacheValue, _minutes: MinutesInput): Promise<void>;
    putMany(_object: CacheManyValues, _minutes: MinutesInput): Promise<void[]>;
    increment(_key: CacheKey, _value: CacheNumericValue): Promise<any>;
    decrement(_key: CacheKey, _value: CacheNumericValue): Promise<any>;
    forever(_key: CacheKey, _value: CacheValue): Promise<void>;
    forget(_key: CacheKey): Promise<boolean>;
    flush(): Promise<void>;
}
