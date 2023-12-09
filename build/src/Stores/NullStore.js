"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TaggableStore_1 = __importDefault(require("./TaggableStore"));
class NullStore extends TaggableStore_1.default {
    /**
     * Retrieve an item from the cache by key.
     */
    async get(_key) {
        return null;
    }
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     */
    async many(keys) {
        return keys.reduce((acc, key) => ({
            ...acc,
            [key]: null
        }), {});
    }
    /**
     * Store an item in the cache for a given number of minutes.
     */
    async put(_key, _value, _minutes) {
        return undefined;
    }
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    async putMany(_object, _minutes) {
        return [];
    }
    /**
     * Increment the value of an item in the cache.
     */
    async increment(_key, _value = 1) {
        return false;
    }
    /**
     * Decrement the value of an item in the cache.
     */
    async decrement(_key, _value = 1) {
        return false;
    }
    /**
     * Store an item in the cache indefinitely.
     */
    async forever(_key, _value) {
        return undefined;
    }
    /**
     * Remove an item from the cache.
     */
    async forget(_key) {
        return true;
    }
    /**
     * Remove all items from the cache.
     */
    async flush() {
        return undefined;
    }
    /**
     * Get the cache key prefix.
     */
    getPrefix() {
        return '';
    }
}
exports.default = NullStore;
module.exports = NullStore;
