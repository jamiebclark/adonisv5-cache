/// <reference path="../../adonis-typings/cache.d.ts" />
import { TagsInput } from '@ioc:AdonisV5Cache';
import BaseStore from './BaseStore';
export default abstract class TaggableStore extends BaseStore {
    /**
     * Begin executing a new tags operation.
     */
    tags(...names: TagsInput[]): any;
}
