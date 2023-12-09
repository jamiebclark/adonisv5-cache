/// <reference path="../../adonis-typings/cache.d.ts" />
import { MinutesInput } from "@ioc:AdonisV5Cache";
export declare function serialize(data: object): string;
export declare function deserialize(data: string): any;
export declare function valueOf(value: any): Promise<any>;
/**
 * Returns integer number between two numbers (inclusive)
 *
 */
export declare function randomIntBetween(min: number, max: number): number;
export declare function getMinutes(duration: MinutesInput): number | null;
export declare function getMinutesOrZero(duration: MinutesInput): number;
