import { RedisManagerContract } from '@ioc:Adonis/Addons/Redis'
import { CacheKey, CacheManyValues, CacheNumericValue, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache'
import _ from 'lodash'
import { deserialize, getMinutesOrZero, serialize } from '../Util'
import RedisTaggedCache from './RedisTaggedCache'
import TagSet from './TagSet'
import TaggableStore from './TaggableStore'

/**
TODO: We should merge TaggableCacheStore and CacheStore interfaces into one single Interface
The default tags() function should just throw an error saying it's not implemented yet
TaggableStore can overwrite that
 */
export default class RedisStore extends TaggableStore {
  private redis: RedisManagerContract;
  private prefix: string;
  private connectionName: string;

  constructor(Redis: RedisManagerContract, prefix: string = '', connectionName: string) {
    super()
    this.redis = Redis
    this.prefix = prefix
    this.setPrefix(prefix)
    this.setConnection(connectionName)
  }

  /**
   * Retrieve an item from the cache by key.
   */
  public async get(key: CacheKey) {
    const value = await this.connection().get(this.prefix + key);
    return value ? deserialize(value) : null
  }

  /**
   * Retrieve multiple items from the cache by key.
   *
   * Items not found in the cache will have a null value.
   */
  public async many(keys: CacheKey[]) {
    let values = await Promise.all(keys.map(key => this.get(key)))
    let mappedValues = {}
    for (let i = 0; i < keys.length; i++) {
      mappedValues[keys[i]] = values[i]
    }
    return mappedValues
  }

  /**
   * Store an item in the cache for a given number of minutes.
   */
  public async put(key: CacheKey, value: CacheValue, minutesInput: MinutesInput = 0) {
    const minutes = getMinutesOrZero(minutesInput)
    const prefixedKey = this.prefix + key
    let expiration = Math.floor(minutes * 60)
    const serializedValue = serialize(value)
    if (isNaN(expiration) || expiration < 1) {
      expiration = 1
    }
    await this.connection().setex(prefixedKey, expiration, serializedValue)
  }

  /**
   * Store multiple items in the cache for a given number of minutes.
   */
  public async putMany(object: CacheManyValues, minutesInput: MinutesInput) {
    const minutes = getMinutesOrZero(minutesInput)
    return Promise.all(Object.keys(object).map((prop) => this.put(prop, object[prop], minutes)))
  }

  /**
   * Increment the value of an item in the cache.
   */
  public async increment(key: CacheKey, value: CacheNumericValue = 1) {
    try {
      return await this.connection().incrby(this.prefix + key, value)
    } catch (error) {
      if (error.name === 'ReplyError') {
        return false
      } else {
        throw error
      }
    }
  }

  /**
   * Decrement the value of an item in the cache.
   */
  public async decrement(key: CacheKey, value: CacheNumericValue = 1) {
    try {
      return await this.connection().decrby(this.prefix + key, value)
    } catch (error) {
      if (error.name === 'ReplyError') {
        return false
      } else {
        throw error
      }
    }
  }

  /**
   * Store an item in the cache indefinitely.
   */
  public async forever(key: CacheKey, value: CacheValue) {
    await this.connection().set(this.prefix + key, serialize(value))
  }

  /**
   * Remove an item from the cache.
   */
  public async forget(key: CacheKey) {
    await this.connection().del(this.prefix + key)
    return true
  }

  /**
   * Remove all items from the cache.
   */
  public async flush() {
    await this.connection().flushdb()
  }

  /**
   * Begin executing a new tags operation.
   */
  public tags(namesInput: string[]) {
    const names = Array.isArray(namesInput) ? namesInput : Array.from(arguments)
    return new RedisTaggedCache(this, new TagSet(this, names))
  }

  /**
   * Get the Redis connection instance
   */
  connection() {
    return this.redis.connection(this.connectionName)
  }

  /**
   * Set the connection name to be used
   */
  setConnection(connectionName: string) {
    this.connectionName = connectionName
  }

  /**
   * Get the Redis database instance
   */
  getRedis() {
    return this.redis
  }

  /**
   * Get the cache key prefix
   */
  getPrefix() {
    return this.prefix
  }

  /**
   * Set the cache key prefix
   */
  setPrefix(prefix: string) {
    this.prefix = !_.isEmpty(prefix) ? prefix + ':' : ''
  }
}

