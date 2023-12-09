import { EmitterContract } from "@ioc:Adonis/Core/Event";
import { CacheEvents, CacheKey, CacheManyValues, CacheNumericValue, CacheRememberClosure, CacheStoreContract, CacheValue, MinutesInput, RepositoryContract } from "@ioc:AdonisV5Cache";
import { deserialize, getMinutes, getMinutesOrZero, serialize, valueOf } from "../Util";



export default class Repository implements RepositoryContract {
  /**
   * The cache store implementation
   */
  protected store: CacheStoreContract

  /**
   * The event dispatcher implementation
   */
  protected events?: EmitterContract;

  /**
   * Create a new cache repository instance.
   */
  constructor(store: CacheStoreContract) {
    this.store = store

    return new Proxy(this, {
      get: function (target, name) {
        if (target[name] !== undefined) {
          return target[name]
        }
        // Pass missing functions to the store.
        if (typeof target.store[name] === 'function') {
          return target.store[name].bind(target.store)
        }
      }
    })
  }

  /**
   * Set the event dispatcher instance.
   */
  public setEventDispatcher(events: EmitterContract) {
    this.events = events
  }

  /**
   * Fire an event for this cache instance.
   */
  protected async fireCacheEvent<E extends keyof CacheEvents>(event: E, payload: CacheEvents[E]) {
    if (this.events == null) {
      return
    }
    const eventName = `Cache.${event}`
    return this.events.emit(eventName, payload)
  }

  /**
   * Determine if an item exists in the cache.
   *
   */
  public async has(key: CacheKey) {
    return (await this.get(key)) != null
  }

  /**
   * Retrieve an item from the cache by key.
   *
   */
  public async get(key: CacheKey) {
    const value = await this.store.get(await this.itemKey(key))
    if (value == null) {
      this.fireCacheEvent('missed', { key })
    } else {
      this.fireCacheEvent('hit', { key, value })
    }

    return value
  }

  /**
   * Retrieve multiple items from the cache by key.
   *
   * Items not found in the cache will have a null value.
   *
   */
  public async many(keys: CacheKey[]) {
    const values = await this.store.many(keys)
    for (let key in values) {
      if (values[key] == null) {
        this.fireCacheEvent('missed', { key })
      } else {
        this.fireCacheEvent('hit', { key, value: values[key] })
      }
    }
    return values
  }

  /**
   * Retrieve an item from the cache and delete it.
   */
  public async pull(key: CacheKey) {
    const value = await this.get(key)
    await this.forget(key)
    return value
  }

  public async flush() {
    throw new Error('flush not implemented on this class')
  }

  /**
   * Store an item in the cache.
   */
  public async put(key: CacheKey, value: CacheValue, minutesInput: MinutesInput) {
    if (value == null) {
      return
    }

    const minutes = getMinutes(minutesInput)

    if (minutes != null) {
      await this.store.put(await this.itemKey(key), value, minutes)
      this.fireCacheEvent('keyWritten', { key, value, minutes })
    }
  }

  /**
   * Store multiple items in the cache for a given number of minutes.
   */
  public async putMany(values: CacheManyValues, minutesInput: MinutesInput) {
    const minutes = getMinutesOrZero(minutesInput)
    const result = await this.store.putMany(values, minutes)
    for (let key in values) {
      this.fireCacheEvent('keyWritten', { key, value: values[key], minutes })
    }
    return result;
  }

  /**
   * Store an item in the cache if the key does not exist.
   */
  public async add(key: CacheKey, value: CacheValue, minutesInput: MinutesInput) {
    const minutes = getMinutes(minutesInput)

    if (minutes == null) {
      return false
    }

    if (typeof this.store['add'] === 'function') {
      return this.store.add(await this.itemKey(key), value, minutes)
    }

    if ((await this.get(key)) == null) {
      await this.put(key, value, minutes)
      return true
    }

    return false
  }

  /**
   * Increment the value of an item in the cache.
   */
  public increment(key: CacheKey, value: CacheNumericValue = 1) {
    return this.store.increment(key, value)
  }

  /**
   * Decrement the value of an item in the cache.
   */
  public decrement(key: CacheKey, value: CacheNumericValue = 1) {
    return this.store.decrement(key, value)
  }

  /**
   * Store an item in the cache indefinitely.
   */
  public async forever(key: CacheKey, value: CacheValue) {
    this.store.forever(await this.itemKey(key), value)
    this.fireCacheEvent('keyWritten', { key, value, minutes: 0 })
  }

  /**
   * Get an item from the cache, or store the default value.
   */
  public async remember(key: CacheKey, minutes: MinutesInput, closure: CacheRememberClosure) {
    // If the item exists in the cache we will just return this immediately
    // otherwise we will execute the given Closure and cache the result
    // of that execution for the given number of minutes in storage.
    const value = await this.get(key)
    if (value !== null) {
      return value
    }

    const closureValue = await valueOf(closure)
    await this.put(key, closureValue, minutes)
    return deserialize(serialize(closureValue))
  }

  /**
   * Get an item from the cache, or store the default value forever.
   */
  public sear(key: CacheKey, closure: CacheRememberClosure) {
    return this.rememberForever(key, closure)
  }

  /**
   * Get an item from the cache, or store the default value forever.
   */
  public async rememberForever(key: CacheKey, closure: CacheRememberClosure) {
    // If the item exists in the cache we will just return this immediately
    // otherwise we will execute the given Closure and cache the result
    // of that execution for the given number of minutes. It's easy.
    let value = await this.get(key)
    if (value != null) {
      return value
    }

    value = await valueOf(closure)
    await this.forever(key, value)
    return deserialize(serialize(value))
  }

  /**
   * Remove an item from the cache.
   *
   */
  public async forget(key: CacheKey) {
    const success = await this.store.forget(await this.itemKey(key))
    this.fireCacheEvent('keyForgotten', { key })
    return success
  }

  /**
   * Begin executing a new tags operation if the store supports it.
   *
   */
  public tags(namesInput: string[]) {
    const names = Array.isArray(namesInput) ? namesInput : Array.from(arguments)

    if (typeof this.store.tags === 'function') {
      const taggedCache = this.store.tags(names)

      if (this.events !== undefined) {
        taggedCache.setEventDispatcher(this.events)
      }

      return taggedCache
    }
    throw new Error('BadMethodCallException: This cache store does not support tagging.')
  }

  /**
   * Format the key for a cache item.
   *
   */
  protected async itemKey(key: CacheKey) {
    return key
  }

  /**
   * Get the cache store implementation.
   *
   */
  public getStore() {
    return this.store
  }


}

