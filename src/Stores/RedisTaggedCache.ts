import { CacheKey, CacheValue, MinutesInput } from '@ioc:AdonisV5Cache'
import crypto from 'crypto'
import _ from 'lodash'
import { getMinutesOrZero } from '../Util'
import RedisStore from './RedisStore'
import TaggedCache from './TaggedCache'

/**
 * Forever reference key.
 */
export const REFERENCE_KEY_FOREVER = 'forever_ref'

/**
 * Standard reference key.
 */
export const REFERENCE_KEY_STANDARD = 'standard_ref'

export default class RedisTaggedCache extends TaggedCache {
  protected store: RedisStore

  /**
   * Store an item in the cache.
   */
  public async put(key: CacheKey, value: CacheValue, minutesInput: MinutesInput = 0) {
    const minutes = getMinutesOrZero(minutesInput)
    await this.pushStandardKeys(await this.tagSet.getNamespace(), key)
    await super.put(key, value, minutes)
  }

  /**
   * Store an item in the cache indefinitely.
   */
  public async forever(key: CacheKey, value: CacheValue) {
    await this.pushForeverKeys(await this.tagSet.getNamespace(), key)
    await super.forever(key, value)
  }

  /**
   * Remove all items from the cache.
   */
  public async flush() {
    await this.deleteForeverKeys()
    await this.deleteStandardKeys()
    await super.flush()
  }

  /**
   * Store standard key references into store.
   */
  private pushStandardKeys(namespace: string, key: CacheKey) {
    return this.pushKeys(namespace, key, REFERENCE_KEY_STANDARD)
  }

  /**
   * Store forever key references into store.
   */
  private pushForeverKeys(namespace: string, key: CacheKey) {
    return this.pushKeys(namespace, key, REFERENCE_KEY_FOREVER)
  }

  /**
   * Store a reference to the cache key against the reference key.
   */
  async pushKeys(namespace: string, key: CacheKey, reference: string) {
    const fullKey = this.store.getPrefix() + crypto.createHash('sha1').update(namespace).digest('hex') + ':' + key
    for (let segment of namespace.split('|')) {
      await this.store.connection().sadd(this.referenceKey(segment, reference), fullKey)
    }
  }

  /**
   * Delete all of the items that were stored forever.
   */
  private deleteForeverKeys() {
    return this.deleteKeysByReference(REFERENCE_KEY_FOREVER)
  }

  /**
   * Delete all standard items.
   */
  private deleteStandardKeys() {
    return this.deleteKeysByReference(REFERENCE_KEY_STANDARD)
  }

  /**
   * Find and delete all of the items that were stored against a reference.
   */
  private async deleteKeysByReference(reference: string) {
    for (let segment of await this.tagSet.getNamespace()) {
      await this._deleteValues(segment = this.referenceKey(segment, reference))
      await this.store.connection().del(segment)
    }
  }

  /**
   * Delete item keys that have been stored against a reference.
   */
  private async _deleteValues(referenceKey: string) {
    const values = _.uniq(await this.store.connection().smembers(referenceKey))
    for (let i = 0; i < values.length; i++) {
      await this.store.connection().del(values[i])
    }
  }

  /**
   * Get the reference key for the segment.
   */
  private referenceKey(segment, suffix) {
    return this.store.getPrefix() + segment + ':' + suffix
  }
}



