
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache';
import { deserialize, getMinutesOrZero, serialize } from '../Util';
import TaggableStore from './TaggableStore';

export default class ObjectStore extends TaggableStore {
  private storage: Record<string, any> = {};

  /**
   * Retrieve an item from the cache by key.
   */
  public async get(key: CacheKey) {
    const cache = this.storage[key]
    if (cache === undefined) {
      return null
    }
    if (Date.now() / 1000 >= cache.expiration) {
      this.forget(key)
      return null
    }
    return deserialize(cache.value)
  }

  /**
   * Retrieve multiple items from the cache by key.
   *
   * Items not found in the cache will have a null value.
   */
  public async many(keys: CacheKey[]) {
    let values = await Promise.all(keys.map(key => this.get(key)))
    return keys.reduce((acc, key, i) => ({
      ...acc,
      [key]: values[i]
    }), {} as CacheManyValues)
  }

  /**
   * Store an item in the cache for a given number of minutes.
   */
  public async put(key: CacheKey, value: CacheValue, minutesInput: MinutesInput = 0) {
    const expiration = Math.floor((Date.now() / 1000) + getMinutesOrZero(minutesInput) * 60)
    this.storage[key] = {
      value: serialize(value),
      expiration: expiration
    }
  }

  /**
   * Store multiple items in the cache for a given number of minutes.
   */
  public async putMany(object: Record<string, any>, minutes: number) {
    return Promise.all(Object.keys(object).map((key) => this.put(key, object[key], minutes)))
  }

  /**
   * Increment the value of an item in the cache.
   */
  public increment(key: CacheKey, value: CacheNumericValue = 1) {
    return this.incrementOrDecrement(key, (currentValue) => {
      return currentValue + value
    })
  }

  /**
   * Decrement the value of an item in the cache.
   */
  public decrement(key: CacheKey, value: CacheNumericValue = 1) {
    return this.incrementOrDecrement(key, (currentValue) => {
      return currentValue - value
    })
  }

  /**
   * Increment or decrement the value of an item in the cache.
   */
  private incrementOrDecrement(key: string, callback: (v: number) => number) {
    return new Promise((resolve) => {
      const cache = this.storage[key]
      if (cache === undefined) {
        resolve(false)
        return
      }
      const currentValue = parseInt(cache.value)
      if (isNaN(currentValue)) {
        resolve(false)
        return
      }
      const newValue = callback(currentValue)
      this.storage[key].value = newValue
      resolve(newValue)
    })
  }

  /**
   * Store an item in the cache indefinitely.
   */
  public forever(key: string, value: any) {
    return this.put(key, value, 5256000)
  }

  /**
   * Remove an item from the cache.
   */
  public async forget(key: string) {
    delete this.storage[key]
    return true
  }

  /**
   * Remove all items from the cache.
   */
  public async flush() {
    this.storage = {}
  }

  /**
   * Get the cache key prefix.
   * @return string
   */
  public getPrefix() {
    return ''
  }
}

