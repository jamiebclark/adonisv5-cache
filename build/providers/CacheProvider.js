"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CacheManager_1 = __importDefault(require("../src/CacheManager"));
class CacheProvider {
    constructor(app) {
        this.app = app;
        // Extend me
    }
    register() {
        this.app.container.singleton('AdonisV5Cache', () => {
            return new CacheManager_1.default(this.app);
        });
    }
}
exports.default = CacheProvider;
