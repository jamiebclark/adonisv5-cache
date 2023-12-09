"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const Repository_1 = __importDefault(require("./Repository"));
class TaggedCache extends Repository_1.default {
    constructor(store, tagSet) {
        super(store);
        this.tagSet = tagSet;
    }
    async fireCacheEvent(event, payload) {
        payload.tags = this.tagSet.getNames();
        return super.fireCacheEvent(event, payload);
    }
    /**
     * Increment the value of an item in the cache.
     *
     */
    async increment(key, value = 1) {
        return this.store.increment(await this.itemKey(key), value);
    }
    /**
     * Increment the value of an item in the cache.
     *
     */
    async decrement(key, value = 1) {
        return this.store.decrement(await this.itemKey(key), value);
    }
    /**
     * Remove all items from the cache.
     *
     */
    async flush() {
        await this.tagSet.reset();
    }
    itemKey(key) {
        return this.taggedItemKey(key);
    }
    /**
     * Get a fully qualified key for a tagged item.
     *
     */
    async taggedItemKey(key) {
        return crypto_1.default.createHash('sha1').update(await this.tagSet.getNamespace()).digest('hex') + ':' + key;
    }
}
exports.default = TaggedCache;
