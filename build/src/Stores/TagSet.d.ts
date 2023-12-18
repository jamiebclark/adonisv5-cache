/// <reference path="../../adonis-typings/cache.d.ts" />
import { CacheStoreContract } from '@ioc:AdonisV5Cache';
export default class TagSet {
    private store;
    private names;
    /**
     * Create a new TagSet instance.
     */
    constructor(store: CacheStoreContract, names?: string[]);
    /**
     * Reset all tags in the set.
     */
    reset(): Promise<string[]>;
    /**
     * Get the unique tag identifier for a given tag.
     */
    tagId(name: string): Promise<any>;
    /**
     * Get an array of tag identifiers for all of the tags in the set.
     */
    private tagIds;
    /**
     * Get a unique namespace that changes when any of the tags are flushed.
     */
    getNamespace(): Promise<string>;
    /**
     * Reset the tag and return the new tag identifier.
     */
    resetTag(name: string): Promise<string>;
    /**
     * Get the tag identifier key for a given tag.
     */
    tagKey(name: string): string;
    /**
     * Get all of the tag names in the set.
     */
    getNames(): string[];
}
