import { CacheStoreContract } from '@ioc:AdonisV5Cache';
import crypto from 'crypto';

export default class TagSet {

  private store: CacheStoreContract;
  private names: string[] = []

  /**
   * Create a new TagSet instance.
   *
   */
  constructor(store: CacheStoreContract, names: string[] = []) {
    this.store = store
    this.names = names
  }

  /**
   * Reset all tags in the set.
   *
   */
  public reset() {
    return Promise.all(this.names.map((name) => this.resetTag(name)))
  }

  /**
   * Get the unique tag identifier for a given tag.
   *
   */
  public async tagId(name: string) {
    const id = await this.store.get(this.tagKey(name))
    return id || this.resetTag(name)
  }

  /**
   * Get an array of tag identifiers for all of the tags in the set.
   *
   */
  private tagIds() {
    return Promise.all(this.names.map(name => this.tagId(name)))
  }

  /**
   * Get a unique namespace that changes when any of the tags are flushed.
   *
   */
  public async getNamespace() {
    return (await this.tagIds()).join('|')
  }

  /**
   * Reset the tag and return the new tag identifier.
   *
   */
  public async resetTag(name: string) {
    const id = crypto.randomBytes(8).toString('hex')
    await this.store.forever(this.tagKey(name), id)
    return id
  }

  /**
   * Get the tag identifier key for a given tag.
   *
   */
  public tagKey(name: string) {
    return `tag:${name}:key`
  }

  /**
   * Get all of the tag names in the set.
   *
   */
  public getNames() {
    return this.names
  }
}

