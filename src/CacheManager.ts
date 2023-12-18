import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { EmitterContract } from '@ioc:Adonis/Core/Event'
import { QueryClientContract } from '@ioc:Adonis/Lucid/Database'
import { BaseCacheConfig, CacheConfig, CacheDriver, CacheStoreContract, DatabaseCacheConfig, RedisCacheConfig, RepositoryContract } from '@ioc:AdonisV5Cache'
import DatabaseStore from './Stores/DatabaseStore'
import NullStore from './Stores/NullStore'
import ObjectStore from './Stores/ObjectStore'
import RedisStore from './Stores/RedisStore'
import Repository from './Stores/Repository'

export default class CacheManager {
  /**
   * The application instance
   */
  private app: ApplicationContract;

  /**
   * The array of resolve cache stores
   */
  private stores: Partial<Record<CacheDriver, RepositoryContract>> = {}

  /**
   * The registered custom driver creators
   */
  private customCreators: any[] = []

  private createDriver: Record<CacheDriver, (config?: any) => Repository> = {
    null: () => {
      return this.repository(new NullStore())
    },
    object: () => {
      return this.repository(new ObjectStore())
    },
    redis: (config: RedisCacheConfig) => {
      if (!this.app.container.hasBinding('Adonis/Addons/Redis')) {
        throw new Error('"@adonisjs/redis" is required to use the "redis" token provider');
      }
      const redis = this.app.container.use('Adonis/Addons/Redis')
      const connection = config.connection ?? 'local'
      return this.repository(new RedisStore(redis, this.getPrefix(config), connection))
    },
    database: (config: DatabaseCacheConfig) => {
      const connection = this.app.container.use('Adonis/Src/Database').connection(config['connection']) as QueryClientContract
      return this.repository(new DatabaseStore(connection, config['table'], this.getPrefix(config)))
    }
  }

  public constructor(app: ApplicationContract) {
    this.app = app;

    return new Proxy(this, {
      get: function (target, name) {
        if (target[name] !== undefined) {
          return target[name]
        }
        // Dynamically call the default driver instance
        const store = target.store()
        if (typeof store[name] === 'function') {
          return store[name].bind(store)
        }
      }
    })
  }

  /**
   * Get a cache store instance by name.
   */
  public store(customName?: CacheDriver) {
    const name = customName || this.getDefaultDriver()
    this.stores[name] = this.get(name)
    const store = this.stores[name]
    if (typeof store === 'undefined') {
      throw new Error(`Store not found: ${name}`)
    }
    return store
  }

  /**
   * Get a cache driver instance.
   */
  public driver(driver?: CacheDriver) {
    return this.store(driver)
  }

  /**
   * Attempt to get the store from the local cache.
   */
  private get(name: CacheDriver) {
    return this.stores[name] != null ? this.stores[name] : this.resolve(name)
  }

  /**
   * Resolve the given store.
   */
  private resolve(name: CacheDriver): Repository {
    const config = this.getConfig(name)

    if (!config) {
      throw new Error(`InvalidArgumentException: Cache store [${name}] is not defined.`)
    }

    const { driver } = config;

    if (this.customCreators[driver] != null) {
      return this.callCustomCreator(config)
    }
    if (this.createDriver[driver]) {
      return this.createDriver[driver](config)
    }
    throw new Error(`InvalidArgumentException: Driver [${driver}] is not supported.`)
  }

  /**
   * Call a custom driver creator.
   */
  private callCustomCreator(config: BaseCacheConfig) {
    return this.customCreators[config.driver](this.app, config)
  }


  /**
  * Create a new cache repository with the given implementation.
  */
  public repository(store: CacheStoreContract): Repository {
    const repository = new Repository(store)

    const Event = this.app.container.use('Adonis/Core/Event') as EmitterContract
    if (Event != null) {
      repository.setEventDispatcher(Event)
    }

    return repository
  }

  /**
   * Get the cache prefix.
   */
  private getPrefix(config: CacheConfig | BaseCacheConfig): string {
    return config.prefix ?? this.app.container.use('Adonis/Core/Config').get('cache.prefix')
  }

  /**
   * Get the cache connection configuration.
   */
  private getConfig<Name extends CacheDriver>(name: Name): CacheConfig["stores"][Name] {
    return this.app.container.use('Adonis/Core/Config').get(`adonisv5-cache.stores.${name}`)
  }

  /**
   * Get the default cache driver name.
   */
  public getDefaultDriver(): CacheDriver {
    return this.app.container.use('Adonis/Core/Config').get('adonisv5-cache.default')
  }


  /**
   * Register a custom driver creator Closure.
   */
  public extend(driver: CacheDriver, closure: Function): this {
    // this.customCreators[driver] = closure.bindTo(this, this)
    this.customCreators[driver] = closure.bind(this)
    return this
  }
}

