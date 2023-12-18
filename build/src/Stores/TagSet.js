"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class TagSet {
    /**
     * Create a new TagSet instance.
     */
    constructor(store, names = []) {
        this.names = [];
        this.store = store;
        this.names = names;
    }
    /**
     * Reset all tags in the set.
     */
    reset() {
        return Promise.all(this.names.map((name) => this.resetTag(name)));
    }
    /**
     * Get the unique tag identifier for a given tag.
     */
    async tagId(name) {
        const id = await this.store.get(this.tagKey(name));
        return id || this.resetTag(name);
    }
    /**
     * Get an array of tag identifiers for all of the tags in the set.
     */
    tagIds() {
        return Promise.all(this.names.map(name => this.tagId(name)));
    }
    /**
     * Get a unique namespace that changes when any of the tags are flushed.
     */
    async getNamespace() {
        return (await this.tagIds()).join('|');
    }
    /**
     * Reset the tag and return the new tag identifier.
     */
    async resetTag(name) {
        const id = crypto_1.default.randomBytes(8).toString('hex');
        await this.store.forever(this.tagKey(name), id);
        return id;
    }
    /**
     * Get the tag identifier key for a given tag.
     */
    tagKey(name) {
        return `tag:${name}:key`;
    }
    /**
     * Get all of the tag names in the set.
     */
    getNames() {
        return this.names;
    }
}
exports.default = TagSet;
