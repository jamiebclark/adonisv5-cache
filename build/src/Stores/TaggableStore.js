"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseStore_1 = __importDefault(require("./BaseStore"));
const TagSet_1 = __importDefault(require("./TagSet"));
const TaggedCache_1 = __importDefault(require("./TaggedCache"));
class TaggableStore extends BaseStore_1.default {
    /**
     * Begin executing a new tags operation.
     */
    tags(namesInput) {
        const names = Array.isArray(namesInput) ? namesInput : Array.from(arguments);
        return new TaggedCache_1.default(this, new TagSet_1.default(this, names));
    }
}
exports.default = TaggableStore;
