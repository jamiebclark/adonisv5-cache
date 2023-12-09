"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const BaseStore_1 = __importDefault(require("./BaseStore"));
class DatabaseStore extends BaseStore_1.default {
    constructor(connection, tableName, prefix = '') {
        super();
        /**
         * Probability (parts per million) that garbage collection (GC) should be performed
         * when storing a piece of data in the cache. Defaults to 100, meaning 0.01% chance.
         * This number should be between 0 and 1000000. A value 0 meaning no GC will be performed at all.
         */
        this.gcProbability = 100;
        this.connection = connection;
        this.tableName = tableName;
        this.prefix = prefix;
    }
    /**
     * Return a new query builder instance with cache's table set
     *
     */
    query() {
        return this.connection.query().from(this.tableName);
    }
    /**
     * Retrieve an item from the cache by key.
     *
     */
    async get(key) {
        const cache = await this.query().where('key', this.prefix + key).first();
        if (cache === undefined) {
            return null;
        }
        if (Date.now() / 1000 >= cache.expiration) {
            await this.forget(key);
            return null;
        }
        return (0, Util_1.deserialize)(cache.value);
    }
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     *
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
     *
     */
    async put(key, value, minutesInput = 0) {
        const minutes = (0, Util_1.getMinutesOrZero)(minutesInput);
        const prefixedKey = this.prefix + key;
        const serializedValue = typeof value === 'object' ? (0, Util_1.serialize)(value) : value;
        const expiration = Math.floor((Date.now() / 1000) + minutes * 60);
        try {
            await this.connection.insertQuery().table(this.tableName).insert({ key: prefixedKey, value: serializedValue, expiration: expiration });
        }
        catch (e) {
            await this.query().where('key', prefixedKey).update({ value: serializedValue, expiration: expiration });
        }
        // Call garbage collection function
        await this.gc();
    }
    /**
     * Store multiple items in the cache for a given number of minutes.
     *
     */
    async putMany(object, minutes) {
        return Promise.all(Object.keys(object).map((key) => this.put(key, object[key], minutes)));
    }
    /**
     * Increment the value of an item in the cache.
     *
     */
    increment(key, value = 1) {
        return this.incrementOrDecrement(key, (currentValue) => currentValue + value);
    }
    /**
     * Decrement the value of an item in the cache.
     *
     */
    decrement(key, value = 1) {
        return this.incrementOrDecrement(key, (currentValue) => currentValue - value);
    }
    /**
     * Increment or decrement the value of an item in the cache.
     *
     */
    incrementOrDecrement(key, callback) {
        return new Promise((resolve, reject) => {
            this.connection.transaction(trx => {
                const prefixedKey = this.prefix + key;
                return trx.query().from(this.tableName).where('key', prefixedKey).forUpdate().first()
                    .then(r => {
                    if (r === undefined) {
                        resolve(false);
                        return;
                    }
                    const currentValue = parseInt(r.value);
                    if (isNaN(currentValue)) {
                        resolve(false);
                        return;
                    }
                    const newValue = callback(currentValue);
                    return trx.query().from(this.tableName).where('key', prefixedKey).update('value', newValue)
                        .then(() => resolve(newValue));
                })
                    .catch(error => reject(error));
            });
        });
    }
    /**
     * Store an item in the cache indefinitely.
     *
     */
    forever(key, value) {
        return this.put(key, value, 5256000);
    }
    /**
     * Remove an item from the cache.
     *
     */
    async forget(key) {
        await this.query().where('key', this.prefix + key).delete();
        return true;
    }
    /**
     * Remove all items from the cache.
     *
     */
    async flush() {
        await this.query().delete();
    }
    /**
     * Get the underlying database connection.
     *
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get the cache key prefix.
     *
     */
    getPrefix() {
        return this.prefix;
    }
    /**
     * Removes the expired data values.
     * @param {bool} force whether to enforce the garbage collection regardless of [[gcProbability]].
     * Defaults to false, meaning the actual deletion happens with the probability as specified by [[gcProbability]].
     */
    async gc(force = false) {
        if (force || (0, Util_1.randomIntBetween)(0, 1000000) < this.gcProbability) {
            await this.query().where('expiration', '<=', Math.floor(Date.now() / 1000)).delete();
        }
    }
}
exports.default = DatabaseStore;
