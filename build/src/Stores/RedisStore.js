"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const Util_1 = require("../Util");
const RedisTaggedCache_1 = __importDefault(require("./RedisTaggedCache"));
const TagSet_1 = __importDefault(require("./TagSet"));
const TaggableStore_1 = __importDefault(require("./TaggableStore"));
class RedisStore extends TaggableStore_1.default {
    constructor(Redis, prefix = '', connectionName) {
        super();
        this.redis = Redis;
        this.prefix = prefix;
        this.setPrefix(prefix);
        this.setConnection(connectionName);
    }
    /**
     * Retrieve an item from the cache by key.
     */
    async get(key) {
        console.log('REDIS FETCH', this.prefix + key);
        const value = await this.connection().get(this.prefix + key);
        return value ? (0, Util_1.deserialize)(value) : null;
    }
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     */
    async many(keys) {
        let values = await Promise.all(keys.map(key => this.get(key)));
        let mappedValues = {};
        for (let i = 0; i < keys.length; i++) {
            mappedValues[keys[i]] = values[i];
        }
        return mappedValues;
    }
    /**
     * Store an item in the cache for a given number of minutes.
     */
    async put(key, value, minutesInput = 0) {
        const minutes = (0, Util_1.getMinutesOrZero)(minutesInput);
        const prefixedKey = this.prefix + key;
        let expiration = Math.floor(minutes * 60);
        const serializedValue = (0, Util_1.serialize)(value);
        if (isNaN(expiration) || expiration < 1) {
            expiration = 1;
        }
        console.log('REDIS PUT', prefixedKey, expiration);
        await this.connection().setex(prefixedKey, expiration, serializedValue);
    }
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    async putMany(object, minutesInput) {
        const minutes = (0, Util_1.getMinutesOrZero)(minutesInput);
        return Promise.all(Object.keys(object).map((prop) => this.put(prop, object[prop], minutes)));
    }
    /**
     * Increment the value of an item in the cache.
     */
    async increment(key, value = 1) {
        try {
            return await this.connection().incrby(this.prefix + key, value);
        }
        catch (error) {
            if (error.name === 'ReplyError') {
                return false;
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Decrement the value of an item in the cache.
     */
    async decrement(key, value = 1) {
        try {
            return await this.connection().decrby(this.prefix + key, value);
        }
        catch (error) {
            if (error.name === 'ReplyError') {
                return false;
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Store an item in the cache indefinitely.
     */
    async forever(key, value) {
        await this.connection().set(this.prefix + key, (0, Util_1.serialize)(value));
    }
    /**
     * Remove an item from the cache.
     */
    async forget(key) {
        await this.connection().del(this.prefix + key);
        return true;
    }
    /**
     * Remove all items from the cache.
     */
    async flush() {
        await this.connection().flushdb();
    }
    /**
     * Begin executing a new tags operation.
     */
    tags(...names) {
        return new RedisTaggedCache_1.default(this, new TagSet_1.default(this, (0, Util_1.getTags)(names)));
    }
    /**
     * Get the Redis connection instance
     */
    connection() {
        return this.redis.connection(this.connectionName);
    }
    /**
     * Set the connection name to be used
     */
    setConnection(connectionName) {
        this.connectionName = connectionName;
    }
    /**
     * Get the Redis database instance
     */
    getRedis() {
        return this.redis;
    }
    /**
     * Get the cache key prefix
     */
    getPrefix() {
        return this.prefix;
    }
    /**
     * Set the cache key prefix
     */
    setPrefix(prefix) {
        this.prefix = !lodash_1.default.isEmpty(prefix) ? prefix + ':' : '';
    }
}
exports.default = RedisStore;
