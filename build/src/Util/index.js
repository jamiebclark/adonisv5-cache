"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTags = exports.getMinutesOrZero = exports.getMinutes = exports.randomIntBetween = exports.valueOf = exports.deserialize = exports.serialize = void 0;
function serialize(data) {
    return JSON.stringify(data);
}
exports.serialize = serialize;
function deserialize(data) {
    return JSON.parse(data);
}
exports.deserialize = deserialize;
async function valueOf(value) {
    if (typeof value === 'function') {
        value = value();
    }
    return value;
}
exports.valueOf = valueOf;
/**
 * Returns integer number between two numbers (inclusive)
 *
 */
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.randomIntBetween = randomIntBetween;
function getMinutes(duration) {
    if (duration === undefined) {
        return null;
    }
    if (duration instanceof Date) {
        duration = ((duration.getTime() - Date.now()) / 1000) / 60;
    }
    return (duration * 60) > 0 ? duration : null;
}
exports.getMinutes = getMinutes;
function getMinutesOrZero(duration) {
    return getMinutes(duration) ?? 0;
}
exports.getMinutesOrZero = getMinutesOrZero;
function getTags(tagsInputs) {
    if (typeof tagsInputs === 'string') {
        return [tagsInputs];
    }
    const inputs = tagsInputs;
    return inputs.reduce((acc, tagInput) => acc.concat(getTags(tagInput)), []);
}
exports.getTags = getTags;
