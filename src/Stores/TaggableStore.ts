import { TagsInput } from '@ioc:AdonisV5Cache'
import { getTags } from '../Util'
import BaseStore from './BaseStore'
import TagSet from './TagSet'
import TaggedCache from './TaggedCache'

export default abstract class TaggableStore extends BaseStore {
  /**
   * Begin executing a new tags operation.
   */
  public tags(...names: TagsInput[]) {
    return new TaggedCache(this, new TagSet(this, getTags(names)))
  }

}

