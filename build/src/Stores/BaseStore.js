"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Repository_1 = __importDefault(require("./Repository"));
class BaseStore {
    tags(_names) {
        console.warn('Tags are being ignored');
        return new Repository_1.default(this);
    }
    async get(_key) {
        throw new Error('Get method not implemented');
    }
    async many(_kes) {
        throw new Error('Many method not implemented');
    }
    async put(_key, _value, _minutes) {
        throw new Error('Put method not implemented');
    }
    async putMany(_object, _minutes) {
        throw new Error('putMany method not implemented');
    }
    async increment(_key, _value) {
        throw new Error('increment method not implemented');
    }
    async decrement(_key, _value) {
        throw new Error('decrement method not implemented');
    }
    async forever(_key, _value) {
        throw new Error('forever method not implemented');
    }
    async forget(_key) {
        throw new Error('forget method not implemented');
    }
    async flush() {
        throw new Error('flush method not implemented');
    }
}
exports.default = BaseStore;
