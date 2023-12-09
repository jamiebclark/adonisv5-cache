import { CacheKey, CacheManyValues, CacheNullableValue, CacheNumericValue, CacheStoreContract, CacheValue, MinutesInput, RepositoryContract } from '@ioc:AdonisV5Cache'
import Repository from './Repository'

export default abstract class BaseStore implements CacheStoreContract {

  public tags(_names: string[]): RepositoryContract {
    console.warn('Tags are being ignored')
    return new Repository(this)
  }

  public async get(_key: CacheKey): Promise<CacheNullableValue> {
    throw new Error('Get method not implemented')
  }

  public async many(_kes: CacheKey[]): Promise<CacheManyValues> {
    throw new Error('Many method not implemented')
  }

  public async put(_key: CacheKey, _value: CacheValue, _minutes: MinutesInput) {
    throw new Error('Put method not implemented')
  }

  public async putMany(_object: CacheManyValues, _minutes: MinutesInput): Promise<void[]> {
    throw new Error('putMany method not implemented')
  }

  public async increment(_key: CacheKey, _value: CacheNumericValue): Promise<any> {
    throw new Error('increment method not implemented')
  }

  public async decrement(_key: CacheKey, _value: CacheNumericValue): Promise<any> {
    throw new Error('decrement method not implemented')
  }

  public async forever(_key: CacheKey, _value: CacheValue) {
    throw new Error('forever method not implemented')
  }

  public async forget(_key: CacheKey): Promise<boolean> {
    throw new Error('forget method not implemented')
  }

  public async flush() {
    throw new Error('flush method not implemented')
  }

}

