"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
class Repository {
    /**
     * Create a new cache repository instance.
     */
    constructor(store) {
        this.store = store;
        return new Proxy(this, {
            get: function (target, name) {
                if (target[name] !== undefined) {
                    return target[name];
                }
                // Pass missing functions to the store.
                if (typeof target.store[name] === 'function') {
                    return target.store[name].bind(target.store);
                }
            }
        });
    }
    /**
     * Set the event dispatcher instance.
     */
    setEventDispatcher(events) {
        this.events = events;
    }
    /**
     * Fire an event for this cache instance.
     */
    async fireCacheEvent(event, payload) {
        if (this.events == null) {
            return;
        }
        const eventName = `Cache.${event}`;
        return this.events.emit(eventName, payload);
    }
    /**
     * Determine if an item exists in the cache.
     *
     */
    async has(key) {
        return (await this.get(key)) != null;
    }
    /**
     * Retrieve an item from the cache by key.
     *
     */
    async get(key) {
        const value = await this.store.get(await this.itemKey(key));
        if (value == null) {
            this.fireCacheEvent('missed', { key });
        }
        else {
            this.fireCacheEvent('hit', { key, value });
        }
        return value;
    }
    /**
     * Retrieve multiple items from the cache by key.
     *
     * Items not found in the cache will have a null value.
     *
     */
    async many(keys) {
        const values = await this.store.many(keys);
        for (let key in values) {
            if (values[key] == null) {
                this.fireCacheEvent('missed', { key });
            }
            else {
                this.fireCacheEvent('hit', { key, value: values[key] });
            }
        }
        return values;
    }
    /**
     * Retrieve an item from the cache and delete it.
     */
    async pull(key) {
        const value = await this.get(key);
        await this.forget(key);
        return value;
    }
    async flush() {
        throw new Error('flush not implemented on this class');
    }
    /**
     * Store an item in the cache.
     */
    async put(key, value, minutesInput) {
        if (value == null) {
            return;
        }
        const minutes = (0, Util_1.getMinutes)(minutesInput);
        if (minutes != null) {
            await this.store.put(await this.itemKey(key), value, minutes);
            this.fireCacheEvent('keyWritten', { key, value, minutes });
        }
    }
    /**
     * Store multiple items in the cache for a given number of minutes.
     */
    async putMany(values, minutesInput) {
        const minutes = (0, Util_1.getMinutesOrZero)(minutesInput);
        const result = await this.store.putMany(values, minutes);
        for (let key in values) {
            this.fireCacheEvent('keyWritten', { key, value: values[key], minutes });
        }
        return result;
    }
    /**
     * Store an item in the cache if the key does not exist.
     */
    async add(key, value, minutesInput) {
        const minutes = (0, Util_1.getMinutes)(minutesInput);
        if (minutes == null) {
            return false;
        }
        if (typeof this.store['add'] === 'function') {
            return this.store.add(await this.itemKey(key), value, minutes);
        }
        if ((await this.get(key)) == null) {
            await this.put(key, value, minutes);
            return true;
        }
        return false;
    }
    /**
     * Increment the value of an item in the cache.
     */
    increment(key, value = 1) {
        return this.store.increment(key, value);
    }
    /**
     * Decrement the value of an item in the cache.
     */
    decrement(key, value = 1) {
        return this.store.decrement(key, value);
    }
    /**
     * Store an item in the cache indefinitely.
     */
    async forever(key, value) {
        this.store.forever(await this.itemKey(key), value);
        this.fireCacheEvent('keyWritten', { key, value, minutes: 0 });
    }
    /**
     * Get an item from the cache, or store the default value.
     */
    async remember(key, minutes, closure) {
        // If the item exists in the cache we will just return this immediately
        // otherwise we will execute the given Closure and cache the result
        // of that execution for the given number of minutes in storage.
        const value = await this.get(key);
        if (value !== null) {
            return value;
        }
        const closureValue = await (0, Util_1.valueOf)(closure);
        await this.put(key, closureValue, minutes);
        return (0, Util_1.deserialize)((0, Util_1.serialize)(closureValue));
    }
    /**
     * Get an item from the cache, or store the default value forever.
     */
    sear(key, closure) {
        return this.rememberForever(key, closure);
    }
    /**
     * Get an item from the cache, or store the default value forever.
     */
    async rememberForever(key, closure) {
        // If the item exists in the cache we will just return this immediately
        // otherwise we will execute the given Closure and cache the result
        // of that execution for the given number of minutes. It's easy.
        let value = await this.get(key);
        if (value != null) {
            return value;
        }
        value = await (0, Util_1.valueOf)(closure);
        await this.forever(key, value);
        return (0, Util_1.deserialize)((0, Util_1.serialize)(value));
    }
    /**
     * Remove an item from the cache.
     *
     */
    async forget(key) {
        const success = await this.store.forget(await this.itemKey(key));
        this.fireCacheEvent('keyForgotten', { key });
        return success;
    }
    /**
     * Begin executing a new tags operation if the store supports it.
     *
     */
    tags(...names) {
        if (typeof this.store.tags === 'function') {
            const taggedCache = this.store.tags((0, Util_1.getTags)(names));
            if (this.events !== undefined) {
                taggedCache.setEventDispatcher(this.events);
            }
            return taggedCache;
        }
        throw new Error('BadMethodCallException: This cache store does not support tagging.');
    }
    /**
     * Format the key for a cache item.
     *
     */
    async itemKey(key) {
        return key;
    }
    /**
     * Get the cache store implementation.
     *
     */
    getStore() {
        return this.store;
    }
}
exports.default = Repository;
