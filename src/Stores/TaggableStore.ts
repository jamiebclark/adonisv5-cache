import BaseStore from './BaseStore'
import TagSet from './TagSet'
import TaggedCache from './TaggedCache'

export default abstract class TaggableStore extends BaseStore {
  /**
   * Begin executing a new tags operation.
   */
  public tags(namesInput: string[]) {
    const names = Array.isArray(namesInput) ? namesInput : Array.from(arguments)
    return new TaggedCache(this, new TagSet(this, names))
  }

}

