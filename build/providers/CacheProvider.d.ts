/// <reference types="@adonisjs/application/build/adonis-typings" />
/// <reference types="@adonisjs/http-server/build/adonis-typings" />
/// <reference types="@adonisjs/core" />
/// <reference types="@adonisjs/events/build/adonis-typings" />
/// <reference types="@adonisjs/hash/build/adonis-typings" />
/// <reference types="@adonisjs/encryption/build/adonis-typings" />
/// <reference types="@adonisjs/validator" />
/// <reference types="@adonisjs/drive/build/adonis-typings" />
/// <reference types="@adonisjs/lucid" />
/// <reference types="@adonisjs/redis" />
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
export default class CacheProvider {
    protected app: ApplicationContract;
    constructor(app: ApplicationContract);
    register(): void;
}
