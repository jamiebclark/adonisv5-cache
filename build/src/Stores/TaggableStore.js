"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const BaseStore_1 = __importDefault(require("./BaseStore"));
const TagSet_1 = __importDefault(require("./TagSet"));
const TaggedCache_1 = __importDefault(require("./TaggedCache"));
class TaggableStore extends BaseStore_1.default {
    /**
     * Begin executing a new tags operation.
     */
    tags(...names) {
        return new TaggedCache_1.default(this, new TagSet_1.default(this, (0, Util_1.getTags)(names)));
    }
}
exports.default = TaggableStore;
