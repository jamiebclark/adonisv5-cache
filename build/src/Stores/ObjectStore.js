"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const TaggableStore_1 = __importDefault(require("./TaggableStore"));
class ObjectStore extends TaggableStore_1.default {
    constructor() {
        super(...arguments);
        this.storage = {};
    }
    /**
     * Retrieve an item from the cache by key.
     */
    async get(key) {
        const cache = this.storage[key];
        if (cache === undefined) {
            return null;
        }
        if (Date.now() / 1000 >= cache.expiration) {
            this.forget(key);
            return null;
        }
        return (0, Util_1.deserialize)(cache.value);
    }
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     */
    async many(keys) {
        let values = await Promise.all(keys.map(key => this.get(key)));
        return keys.reduce((acc, key, i) => ({
            ...acc,
            [key]: values[i]
        }), {});
    }
    /**
     * Store an item in the cache for a given number of minutes.
     */
    async put(key, value, minutesInput = 0) {
        const expiration = Math.floor((Date.now() / 1000) + (0, Util_1.getMinutesOrZero)(minutesInput) * 60);
        this.storage[key] = {
            value: (0, Util_1.serialize)(value),
            expiration: expiration
        };
    }
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    async putMany(object, minutes) {
        return Promise.all(Object.keys(object).map((key) => this.put(key, object[key], minutes)));
    }
    /**
     * Increment the value of an item in the cache.
     */
    increment(key, value = 1) {
        return this.incrementOrDecrement(key, (currentValue) => {
            return currentValue + value;
        });
    }
    /**
     * Decrement the value of an item in the cache.
     */
    decrement(key, value = 1) {
        return this.incrementOrDecrement(key, (currentValue) => {
            return currentValue - value;
        });
    }
    /**
     * Increment or decrement the value of an item in the cache.
     */
    incrementOrDecrement(key, callback) {
        return new Promise((resolve) => {
            const cache = this.storage[key];
            if (cache === undefined) {
                resolve(false);
                return;
            }
            const currentValue = parseInt(cache.value);
            if (isNaN(currentValue)) {
                resolve(false);
                return;
            }
            const newValue = callback(currentValue);
            this.storage[key].value = newValue;
            resolve(newValue);
        });
    }
    /**
     * Store an item in the cache indefinitely.
     */
    forever(key, value) {
        return this.put(key, value, 5256000);
    }
    /**
     * Remove an item from the cache.
     */
    async forget(key) {
        delete this.storage[key];
        return true;
    }
    /**
     * Remove all items from the cache.
     */
    async flush() {
        this.storage = {};
    }
    /**
     * Get the cache key prefix.
     * @return string
     */
    getPrefix() {
        return '';
    }
}
exports.default = ObjectStore;
