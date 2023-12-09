import CacheManager from '../src/CacheManager';

import { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {
    // Extend me
  }

  public register() {
    this.app.container.singleton('AdonisV5Cache', () => {
      return new CacheManager(this.app)
    })
  }
}
