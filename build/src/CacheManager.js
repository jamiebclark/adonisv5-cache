"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseStore_1 = __importDefault(require("./Stores/DatabaseStore"));
const NullStore_1 = __importDefault(require("./Stores/NullStore"));
const ObjectStore_1 = __importDefault(require("./Stores/ObjectStore"));
const RedisStore_1 = __importDefault(require("./Stores/RedisStore"));
const Repository_1 = __importDefault(require("./Stores/Repository"));
class CacheManager {
    constructor(app) {
        /**
         * The array of resolve cache stores
         */
        this.stores = [];
        /**
         * The registered custom driver creators
         */
        this.customCreators = [];
        this.createDriver = {
            null: () => {
                return this.repository(new NullStore_1.default());
            },
            object: () => {
                return this.repository(new ObjectStore_1.default());
            },
            redis: (config) => {
                if (!this.app.container.hasBinding('Adonis/Addons/Redis')) {
                    throw new Error('"@adonisjs/redis" is required to use the "redis" token provider');
                }
                const redis = this.app.container.use('Adonis/Addons/Redis');
                const connection = config.connection ?? 'local';
                return this.repository(new RedisStore_1.default(redis, this.getPrefix(config), connection));
            },
            database: (config) => {
                const connection = this.app.container.use('Adonis/Src/Database').connection(config['connection']);
                return this.repository(new DatabaseStore_1.default(connection, config['table'], this.getPrefix(config)));
            }
        };
        this.app = app;
        return new Proxy(this, {
            get: function (target, name) {
                if (target[name] !== undefined) {
                    return target[name];
                }
                // Dynamically call the default driver instance
                const store = target.store();
                if (typeof store[name] === 'function') {
                    return store[name].bind(store);
                }
            }
        });
    }
    /**
     * Get a cache store instance by name.
     */
    store(customName) {
        const name = customName || this.getDefaultDriver();
        this.stores[name] = this.get(name);
        if (!this.stores[name]) {
            throw new Error(`Store not found: ${name}`);
        }
        return this.stores[name];
    }
    /**
     * Get a cache driver instance.
     */
    driver(driver) {
        return this.store(driver);
    }
    /**
     * Attempt to get the store from the local cache.
     */
    get(name) {
        return this.stores[name] != null ? this.stores[name] : this.resolve(name);
    }
    /**
     * Resolve the given store.
     */
    resolve(name) {
        const config = this.getConfig(name);
        if (!config) {
            throw new Error(`InvalidArgumentException: Cache store [${name}] is not defined.`);
        }
        const { driver } = config;
        if (this.customCreators[driver] != null) {
            return this.callCustomCreator(config);
        }
        if (this.createDriver[driver]) {
            return this.createDriver[driver](config);
        }
        throw new Error(`InvalidArgumentException: Driver [${driver}] is not supported.`);
    }
    /**
     * Call a custom driver creator.
     */
    callCustomCreator(config) {
        return this.customCreators[config.driver](this.app, config);
    }
    /**
    * Create a new cache repository with the given implementation.
    */
    repository(store) {
        const repository = new Repository_1.default(store);
        const Event = this.app.container.use('Adonis/Core/Event');
        if (Event != null) {
            repository.setEventDispatcher(Event);
        }
        return repository;
    }
    /**
     * Get the cache prefix.
     */
    getPrefix(config) {
        return config.prefix ?? this.app.container.use('Adonis/Core/Config').get('cache.prefix');
    }
    /**
     * Get the cache connection configuration.
     */
    getConfig(name) {
        return this.app.container.use('Adonis/Core/Config').get(`adonisv5-cache.stores.${name}`);
    }
    /**
     * Get the default cache driver name.
     */
    getDefaultDriver() {
        return this.app.container.use('Adonis/Core/Config').get('adonisv5-cache.default');
    }
    /**
     * Register a custom driver creator Closure.
     */
    extend(driver, closure) {
        // this.customCreators[driver] = closure.bindTo(this, this)
        this.customCreators[driver] = closure.bind(this);
        return this;
    }
}
exports.default = CacheManager;
