"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFERENCE_KEY_STANDARD = exports.REFERENCE_KEY_FOREVER = void 0;
const crypto_1 = __importDefault(require("crypto"));
const lodash_1 = __importDefault(require("lodash"));
const Util_1 = require("../Util");
const TaggedCache_1 = __importDefault(require("./TaggedCache"));
/**
 * Forever reference key.
 */
exports.REFERENCE_KEY_FOREVER = 'forever_ref';
/**
 * Standard reference key.
 */
exports.REFERENCE_KEY_STANDARD = 'standard_ref';
class RedisTaggedCache extends TaggedCache_1.default {
    /**
     * Store an item in the cache.
     */
    async put(key, value, minutesInput = 0) {
        const minutes = (0, Util_1.getMinutesOrZero)(minutesInput);
        await this.pushStandardKeys(await this.tagSet.getNamespace(), key);
        await super.put(key, value, minutes);
    }
    /**
     * Store an item in the cache indefinitely.
     */
    async forever(key, value) {
        await this.pushForeverKeys(await this.tagSet.getNamespace(), key);
        await super.forever(key, value);
    }
    /**
     * Remove all items from the cache.
     */
    async flush() {
        await this.deleteForeverKeys();
        await this.deleteStandardKeys();
        await super.flush();
    }
    /**
     * Store standard key references into store.
     */
    pushStandardKeys(namespace, key) {
        return this.pushKeys(namespace, key, exports.REFERENCE_KEY_STANDARD);
    }
    /**
     * Store forever key references into store.
     */
    pushForeverKeys(namespace, key) {
        return this.pushKeys(namespace, key, exports.REFERENCE_KEY_FOREVER);
    }
    /**
     * Store a reference to the cache key against the reference key.
     */
    async pushKeys(namespace, key, reference) {
        const fullKey = this.store.getPrefix() + crypto_1.default.createHash('sha1').update(namespace).digest('hex') + ':' + key;
        for (let segment of namespace.split('|')) {
            await this.store.connection().sadd(this.referenceKey(segment, reference), fullKey);
        }
    }
    /**
     * Delete all of the items that were stored forever.
     */
    deleteForeverKeys() {
        return this.deleteKeysByReference(exports.REFERENCE_KEY_FOREVER);
    }
    /**
     * Delete all standard items.
     */
    deleteStandardKeys() {
        return this.deleteKeysByReference(exports.REFERENCE_KEY_STANDARD);
    }
    /**
     * Find and delete all of the items that were stored against a reference.
     */
    async deleteKeysByReference(reference) {
        for (let segment of await this.tagSet.getNamespace()) {
            await this._deleteValues(segment = this.referenceKey(segment, reference));
            await this.store.connection().del(segment);
        }
    }
    /**
     * Delete item keys that have been stored against a reference.
     */
    async _deleteValues(referenceKey) {
        const values = lodash_1.default.uniq(await this.store.connection().smembers(referenceKey));
        for (let i = 0; i < values.length; i++) {
            await this.store.connection().del(values[i]);
        }
    }
    /**
     * Get the reference key for the segment.
     */
    referenceKey(segment, suffix) {
        return this.store.getPrefix() + segment + ':' + suffix;
    }
}
exports.default = RedisTaggedCache;
