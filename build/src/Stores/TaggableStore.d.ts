import BaseStore from './BaseStore';
export default abstract class TaggableStore extends BaseStore {
    /**
     * Begin executing a new tags operation.
     */
    tags(namesInput: string[]): any;
}
