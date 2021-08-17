/*******************************************************************************

    Includes various useful functions

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import JSBI from "jsbi";
import process from "process";
import { SmartBuffer } from "smart-buffer";

/**
 * The byte order
 */
export enum Endian {
    Little,
    Big,
}

export class Utils {
    public static readonly SIZE_OF_BYTE: number = 1;
    public static readonly SIZE_OF_INT: number = 4;
    public static readonly SIZE_OF_LONG: number = 8;
    public static readonly SIZE_OF_PUBLIC_KEY: number = 32;
    public static readonly SIZE_OF_SECRET_KEY: number = 32;

    public static readonly FEE_FACTOR: number = 200;

    /**
     * Check whether the string is a integer.
     * @param value
     */
    public static isInteger(value: string): boolean {
        return /^[+\-]?([0-9]+)$/.test(value);
    }

    /**
     * Check whether the string is a positive integer.
     * @param value
     */
    public static isPositiveInteger(value: string): boolean {
        return /^(\+)?([0-9]+)$/.test(value);
    }

    /**
     * Check whether the string is a negative integer.
     * @param value
     */
    public static isNegativeInteger(value: string): boolean {
        return /^\-([0-9]+)$/.test(value);
    }

    /**
     *  Gets the path to where the execution command was entered for this process.
     */
    public static getInitCWD(): string {
        // Get the working directory the user was in when the process was started,
        // as opposed to the `cwd` exposed by node which is the program's path.
        // Try to use `INIT_CWD` which is provided by npm, and fall back to
        // `PWD` otherwise.
        // See also: https://github.com/npm/cli/issues/2033
        if (process.env.INIT_CWD !== undefined) return process.env.INIT_CWD;
        if (process.env.PWD !== undefined) return process.env.PWD;
        return process.cwd();
    }

    /**
     * Read from the hex string
     * @param hex The hex string
     * @param target The buffer to output
     * @param endian The byte order
     * @returns The output buffer
     */
    public static readFromString(hex: string, target?: Buffer, endian: Endian = Endian.Little): Buffer {
        const start = hex.substr(0, 2) === "0x" ? 2 : 0;
        const length = (hex.length - start) >> 1;
        if (target === undefined) target = Buffer.alloc(length);

        if (endian === Endian.Little) {
            for (let pos = 0, idx = start; idx < length * 2 + start; idx += 2, pos++)
                target[length - pos - 1] = parseInt(hex.substr(idx, 2), 16);
        } else {
            for (let pos = 0, idx = start; idx < length * 2 + start; idx += 2, pos++)
                target[pos] = parseInt(hex.substr(idx, 2), 16);
        }
        return target;
    }

    /**
     * Write to the hex string
     * @param source The buffer to input
     * @param endian The byte order
     * @returns The hex string
     */
    public static writeToString(source: Buffer, endian: Endian = Endian.Little): string {
        if (source.length === 0) return "";

        if (endian === Endian.Little) {
            const hex: string[] = [];
            for (let idx = source.length - 1; idx >= 0; idx--) {
                hex.push((source[idx] >>> 4).toString(16));
                hex.push((source[idx] & 0xf).toString(16));
            }
            return "0x" + hex.join("");
        } else return "0x" + source.toString("hex");
    }

    /**
     * Writes little endian 64-bits Big integer value to an allocated buffer
     * See https://github.com/nodejs/node/blob/88fb5a5c7933022de750745e51e5dc0996a1e2c4/lib/internal/buffer.js#L573-L592
     * @param buffer The allocated buffer
     * @param value  The big integer value
     */
    public static writeJSBigIntLE(buffer: Buffer, value: JSBI) {
        // See https://github.com/nodejs/node/blob/
        // 88fb5a5c7933022de750745e51e5dc0996a1e2c4/lib/internal/buffer.js#L573-L592
        let lo = JSBI.toNumber(JSBI.bitwiseAnd(value, JSBI.BigInt(0xffffffff)));
        buffer[0] = lo;
        lo = lo >> 8;
        buffer[1] = lo;
        lo = lo >> 8;
        buffer[2] = lo;
        lo = lo >> 8;
        buffer[3] = lo;

        let hi = JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(value, JSBI.BigInt(32)), JSBI.BigInt(0xffffffff)));
        buffer[4] = hi;
        hi = hi >> 8;
        buffer[5] = hi;
        hi = hi >> 8;
        buffer[6] = hi;
        hi = hi >> 8;
        buffer[7] = hi;
    }

    /**
     * Reads little endian 64-bits Big integer value to an allocated buffer
     * An exception occurs when the size of the remaining data is less than the required.
     * See https://github.com/nodejs/node/blob/88fb5a5c7933022de750745e51e5dc0996a1e2c4/lib/internal/buffer.js#L86-L105
     * @param buffer The allocated buffer
     * @returns The instance of JSBI
     */
    public static readJSBigIntLE(buffer: Buffer): JSBI {
        if (buffer.length < 8) throw new Error(`Requested 8 bytes but only ${buffer.length} bytes available`);

        let offset = 0;
        const lo = buffer[offset] + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + buffer[++offset] * 2 ** 24;

        const hi =
            buffer[++offset] + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + buffer[++offset] * 2 ** 24;

        return JSBI.add(JSBI.BigInt(lo), JSBI.leftShift(JSBI.BigInt(hi), JSBI.BigInt(32)));
    }

    /**
     * Reads from `source` to return to the buffer by the requested bytes.
     * An exception occurs when the size of the remaining data is less than the requested.
     * @param source The instance of the SmartBuffer
     * @param length The requested bytes
     */
    public static readBuffer(source: SmartBuffer, length: number): Buffer {
        const remaining = source.remaining();
        if (remaining < length) throw new Error(`Requested ${length} bytes but only ${remaining} bytes available`);

        return source.readBuffer(length);
    }

    /**
     * This checks that the JSON data has all the properties of the class.
     * @param obj  The instance of a class
     * @param json The object of the JSON
     */
    public static validateJSON(obj: object, json: any) {
        Object.getOwnPropertyNames(obj).forEach((property) => {
            if (!json.hasOwnProperty(property)) {
                throw new Error("Parse error: " + obj.constructor.name + "." + property);
            }
        });
    }

    /**
     * Compare the two Buffers, This compares the two buffers from the back to the front.
     * If a is greater than b, it returns a positive number,
     * if a is less than b, it returns a negative number,
     * and if a and b are equal, it returns zero.
     */
    public static compareBuffer(a: Buffer, b: Buffer): number {
        const min_length = Math.min(a.length, b.length);
        for (let idx = 0; idx < min_length; idx++) {
            const a_value = a[a.length - 1 - idx];
            const b_value = b[b.length - 1 - idx];
            if (a_value !== b_value) return a_value - b_value;
        }

        return a.length - b.length;
    }

    /**
     * Convert from one power-of-2 number base to another
     * @param out_values  The values that has converted
     * @param in_values   The values to be converted
     * @param from        A power-of-2 number base of `in_values`
     * @param to          A power-of-2 number base of `out_values`
     * @param pad         Check if the pads are added
     * @returns true if the conversion succeeds
     */
    public static convertBits(
        out_values: number[],
        in_values: number[],
        from: number,
        to: number,
        pad: boolean
    ): boolean {
        let acc: number = 0;
        let bits: number = 0;
        const max_v: number = (1 << to) - 1;
        const max_acc: number = (1 << (from + to - 1)) - 1;

        for (const value of in_values) {
            acc = ((acc << from) | value) & max_acc;
            bits += from;
            while (bits >= to) {
                bits -= to;
                out_values.push((acc >> bits) & max_v & 0xff);
            }
        }
        if (pad) {
            if (bits !== 0) out_values.push((acc << (to - bits)) & max_v & 0xff);
        } else if (bits >= from || (acc << (to - bits)) & max_v) {
            return false;
        }
        return true;
    }
}

/**
 * A ArrayRange that goes through the numbers first, first + step, first + 2 * step, ..., up to and excluding end.
 */
export class ArrayRange {
    /**
     * The first value
     */
    private readonly first: number;

    /**
     * The last value
     */
    private readonly last: number;

    /**
     * The value to add to the current value at each iteration.
     */
    private readonly step: number;

    /**
     * Constructor
     * @param n The starting value.
     * @param p The value that serves as the stopping criterion.
     * This value is not included in the range.
     * @param q The value to add to the current value at each iteration.
     */
    constructor(n: number, p?: number, q?: number) {
        let begin = 0;
        let end = 0;
        let step = 1;
        if (p === undefined && q === undefined) {
            begin = 0;
            end = n;
            step = 1;
        } else if (p !== undefined && q === undefined) {
            begin = n;
            end = p;
            step = 1;
        } else if (p !== undefined && q !== undefined) {
            begin = n;
            end = p;
            step = q;
        }

        if (begin === end || step === 0) {
            this.first = begin;
            this.last = begin;
            this.step = 0;
            return;
        }

        if (begin < end && step > 0) {
            this.first = begin;
            this.last = end - 1;
            this.last -= (this.last - this.first) % step;
            this.step = step;
        } else if (begin > end && step < 0) {
            this.first = begin;
            this.last = end + 1;
            this.last += (this.first - this.last) % (0 - step);
            this.step = step;
        } else {
            this.first = begin;
            this.last = begin;
            this.step = 0;
        }
    }

    /**
     * Performs the specified action for each element in an array.
     * @param callback A function that accepts up to three arguments.
     * forEach calls the callback function one time for each element in the array.
     */
    public forEach(callback: (value: number, index: number) => void) {
        const length = this.length;
        for (let idx = 0, value = this.first; idx < length; idx++, value += this.step) callback(value, idx);
    }

    /**
     * Calls a defined callback function on each element of an array,
     * and returns an array that contains the results.
     * @param callback A function that accepts up to three arguments.
     * The map method calls the callback function one time for each element in the array.
     */
    public map<U>(callback: (value: number, index: number) => U): U[] {
        const array: U[] = [];
        const length = this.length;
        for (let idx = 0, value = this.first; idx < length; idx++, value += this.step) array.push(callback(value, idx));
        return array;
    }

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param callback A function that accepts up to three arguments.
     * The filter method calls the callback function one time for each element in the array.
     */
    public filter(callback: (value: number, index: number) => unknown): number[] {
        const array: number[] = [];
        const length = this.length;
        for (let idx = 0, value = this.first; idx < length; idx++, value += this.step)
            if (callback(value, idx)) array.push(value);
        return array;
    }

    /**
     * Calls the specified callback function for all the elements in an array.
     * The return value of the callback function is the accumulated result,
     * and is provided as an argument in the next call to the callback function.
     * @param callback A function that accepts up to four arguments.
     * The reduce method calls the callback function one time for each element in the array.
     * @param initialValue If initialValue is specified,
     * it is used as the initial value to start the accumulation.
     * The first call to the callback function provides this value as an argument instead of an array value.
     * @returns The accumulated value
     */
    public reduce<T>(
        callback: (previousValue: T, currentValue: number, currentIndex: number) => T,
        initialValue: T
    ): T {
        let accumulator = initialValue;
        const length = this.length;
        for (let idx = 0, value = this.first; idx < length; idx++, value += this.step)
            accumulator = callback(accumulator, value, idx);
        return accumulator;
    }

    /**
     * Returns length
     */
    public get length(): number {
        if (this.step > 0) return 1 + (this.last - this.first) / this.step;
        if (this.step < 0) return 1 + (this.first - this.last) / (0 - this.step);
        return 0;
    }
}

/**
 * Returns an ArrayRange of integers from 0 to n-1
 * @param begin The starting value.
 * @param end The value that serves as the stopping criterion.
 * This value is not included in the range.
 * @param step The value to add to the current value at each iteration.
 * @returns A ArrayRange that goes through the numbers begin, begin + step, begin + 2 * step, ..., up to and excluding end.
 */
export function iota(begin: number, end?: number, step?: number): ArrayRange {
    return new ArrayRange(begin, end, step);
}
