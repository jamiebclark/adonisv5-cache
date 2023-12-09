import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache'
import TaggableStore from './TaggableStore'


export default class NullStore extends TaggableStore {
  /**
   * Retrieve an item from the cache by key.
   */
  public async get(_key: CacheKey) {
    return null
  }

  /**
   * Retrieve multiple items from the cache by key.
   *
   * Items not found in the cache will have a null value.
   */
  public async many(keys: CacheKey[]) {
    return keys.reduce((acc, key) => ({
      ...acc,
      [key]: null
    }), {} as Record<keyof typeof keys, null>)
  }

  /**
   * Store an item in the cache for a given number of minutes.
   */
  async put(_key: CacheKey, _value: CacheValue, _minutes: MinutesInput) {
    return undefined
  }

  /**
   * Store multiple items in the cache for a given number of minutes.
   */
  public async putMany(_object: CacheManyValues, _minutes: MinutesInput) {
    return []
  }

  /**
   * Increment the value of an item in the cache.
   */
  public async increment(_key: CacheKey, _value: CacheNumericValue = 1) {
    return false
  }

  /**
   * Decrement the value of an item in the cache.
   */
  public async decrement(_key: CacheKey, _value: CacheNumericValue = 1) {
    return false
  }

  /**
   * Store an item in the cache indefinitely.
   */
  public async forever(_key: CacheKey, _value: CacheValue) {
    return undefined
  }

  /**
   * Remove an item from the cache.
   */
  public async forget(_key: CacheKey) {
    return true
  }

  /**
   * Remove all items from the cache.
   */
  public async flush() {
    return undefined
  }

  /**
   * Get the cache key prefix.
   */
  public getPrefix() {
    return ''
  }
}

module.exports = NullStore
