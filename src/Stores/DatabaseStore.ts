import { QueryClientContract } from '@ioc:Adonis/Lucid/Database';
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache';
import { deserialize, getMinutesOrZero, randomIntBetween, serialize } from '../Util';
import BaseStore from './BaseStore';

export default class DatabaseStore extends BaseStore {
  private connection: QueryClientContract;
  private tableName: string;
  private prefix: string;


  /**
   * Probability (parts per million) that garbage collection (GC) should be performed
   * when storing a piece of data in the cache. Defaults to 100, meaning 0.01% chance.
   * This number should be between 0 and 1000000. A value 0 meaning no GC will be performed at all.
   */
  private gcProbability = 100;

  constructor(connection: QueryClientContract, tableName: string, prefix: string = '') {
    super()
    this.connection = connection
    this.tableName = tableName
    this.prefix = prefix
  }

  /**
   * Return a new query builder instance with cache's table set
   *
   */
  private query() {
    return this.connection.query().from(this.tableName)
  }

  /**
   * Retrieve an item from the cache by key.
   *
   */
  public async get(key: CacheKey) {
    const cache = await this.query().where('key', this.prefix + key).first()

    if (cache === undefined) {
      return null
    }

    if (Date.now() / 1000 >= cache.expiration) {
      await this.forget(key)
      return null
    }

    return deserialize(cache.value)
  }

  /**
   * Retrieve multiple items from the cache by key.
   *
   * Items not found in the cache will have a null value.
   *
   */
  public async many(keys: CacheKey[]) {
    let values = await Promise.all(keys.map(key => this.get(key)))
    return keys.reduce((acc, key, i) => ({
      ...acc,
      [key]: values[i]
    }), {})
  }

  /**
   * Store an item in the cache for a given number of minutes.
   *
   */
  public async put(key: CacheKey, value: CacheValue, minutesInput: MinutesInput = 0) {
    const minutes = getMinutesOrZero(minutesInput)
    const prefixedKey = this.prefix + key
    const serializedValue = typeof value === 'object' ? serialize(value) : value
    const expiration = Math.floor((Date.now() / 1000) + minutes * 60)

    try {
      await this.connection.insertQuery().table(this.tableName).insert({ key: prefixedKey, value: serializedValue, expiration: expiration })
    } catch (e) {
      await this.query().where('key', prefixedKey).update({ value: serializedValue, expiration: expiration })
    }

    // Call garbage collection function
    await this.gc()
  }

  /**
   * Store multiple items in the cache for a given number of minutes.
   *
   */
  public async putMany(object: CacheManyValues, minutes: MinutesInput) {
    return Promise.all(Object.keys(object).map((key) => this.put(key, object[key], minutes)))
  }

  /**
   * Increment the value of an item in the cache.
   *
   */
  public increment(key: CacheKey, value: CacheNumericValue = 1) {
    return this.incrementOrDecrement(key, (currentValue) => currentValue + value)
  }

  /**
   * Decrement the value of an item in the cache.
   *
   */
  public decrement(key: CacheKey, value: CacheNumericValue = 1) {
    return this.incrementOrDecrement(key, (currentValue) => currentValue - value)
  }

  /**
   * Increment or decrement the value of an item in the cache.
   *
   */
  private incrementOrDecrement(key: CacheKey, callback: (v: number) => number) {
    return new Promise((resolve, reject) => {
      this.connection.transaction(trx => {
        const prefixedKey = this.prefix + key
        return trx.query().from(this.tableName).where('key', prefixedKey).forUpdate().first()
          .then(r => {
            if (r === undefined) {
              resolve(false)
              return
            }
            const currentValue = parseInt(r.value)
            if (isNaN(currentValue)) {
              resolve(false)
              return
            }
            const newValue = callback(currentValue)
            return trx.query().from(this.tableName).where('key', prefixedKey).update('value', newValue)
              .then(() => resolve(newValue))
          })
          .catch(error => reject(error))
      })
    })
  }

  /**
   * Store an item in the cache indefinitely.
   *
   */
  public forever(key: CacheKey, value: CacheValue) {
    return this.put(key, value, 5256000)
  }

  /**
   * Remove an item from the cache.
   *
   */
  public async forget(key: CacheKey) {
    await this.query().where('key', this.prefix + key).delete()
    return true
  }

  /**
   * Remove all items from the cache.
   *
   */
  public async flush() {
    await this.query().delete()
  }

  /**
   * Get the underlying database connection.
   *
   */
  public getConnection() {
    return this.connection
  }

  /**
   * Get the cache key prefix.
   *
   */
  public getPrefix() {
    return this.prefix
  }

  /**
   * Removes the expired data values.
   * @param {bool} force whether to enforce the garbage collection regardless of [[gcProbability]].
   * Defaults to false, meaning the actual deletion happens with the probability as specified by [[gcProbability]].
   */
  async gc(force: boolean = false) {
    if (force || randomIntBetween(0, 1000000) < this.gcProbability) {
      await this.query().where('expiration', '<=', Math.floor(Date.now() / 1000)).delete()
    }
  }
}
