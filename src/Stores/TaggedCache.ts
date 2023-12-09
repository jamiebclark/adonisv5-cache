import { CacheEvents, CacheKey, CacheNumericValue, CacheStoreContract } from '@ioc:AdonisV5Cache';
import crypto from 'crypto';
import Repository from './Repository';
import TagSet from './TagSet';

export default class TaggedCache extends Repository {
  protected tagSet: TagSet

  constructor(store: CacheStoreContract, tagSet: TagSet) {
    super(store)
    this.tagSet = tagSet
  }

  protected async fireCacheEvent<E extends keyof CacheEvents>(event: E, payload: CacheEvents[E]) {
    payload.tags = this.tagSet.getNames()
    return super.fireCacheEvent(event, payload)
  }

  /**
   * Increment the value of an item in the cache.
   *
   */
  public async increment(key: CacheKey, value: CacheNumericValue = 1) {
    return this.store.increment(await this.itemKey(key), value)
  }

  /**
   * Increment the value of an item in the cache.
   *
   */
  public async decrement(key: CacheKey, value: CacheNumericValue = 1) {
    return this.store.decrement(await this.itemKey(key), value)
  }

  /**
   * Remove all items from the cache.
   *
   */
  public async flush() {
    await this.tagSet.reset()
  }

  protected itemKey(key: CacheKey) {
    return this.taggedItemKey(key)
  }

  /**
   * Get a fully qualified key for a tagged item.
   *
   */
  public async taggedItemKey(key: CacheKey) {
    return crypto.createHash('sha1').update(await this.tagSet.getNamespace()).digest('hex') + ':' + key
  }
}

