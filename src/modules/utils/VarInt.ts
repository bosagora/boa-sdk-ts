/*******************************************************************************

    Includes a class that defines the ability to read and write a number
    when serializing and deserializing them in binary.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Utils } from "./Utils";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

const number_type: number[] = [0xfc, 0xfd, 0xfe, 0xff];

/**
 * A class that defines the ability to read and write a number
 * when serializing and deserializing them in binary.
 */
export class VarInt {
    /**
     * Serialize the number
     * @param value The number to serialize
     * @param buffer The byte buffer
     */
    public static fromNumber(value: number, buffer: SmartBuffer) {
        if (value <= number_type[0]) {
            buffer.writeUInt8(value);
        } else if (value <= 0xffff) {
            buffer.writeUInt8(number_type[1]);
            buffer.writeUInt16LE(value);
        } else if (value <= 0xffffffff) {
            buffer.writeUInt8(number_type[2]);
            buffer.writeUInt32LE(value);
        } else throw new Error("The number is too large to be processed.");
    }

    /**
     * Serialize the JSBI
     * @param value The JSBI instance to serialize
     * @param buffer The byte buffer
     */
    public static fromJSBI(value: JSBI, buffer: SmartBuffer) {
        if (JSBI.lessThanOrEqual(value, JSBI.BigInt(number_type[0]))) {
            buffer.writeUInt8(JSBI.toNumber(value));
        } else if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xffff))) {
            buffer.writeUInt8(number_type[1]);
            buffer.writeUInt16LE(JSBI.toNumber(value));
        } else if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xffffffff))) {
            buffer.writeUInt8(number_type[2]);
            buffer.writeUInt32LE(JSBI.toNumber(value));
        } else {
            buffer.writeUInt8(number_type[3]);
            const buf = Buffer.allocUnsafe(8);
            Utils.writeJSBigIntLE(buf, value);
            buffer.writeBuffer(buf);
        }
    }

    /**
     * Deserialize the number to Number
     * @param buffer The byte buffer
     * @returns The deserialized number
     */
    public static toNumber(buffer: SmartBuffer): number {
        let remaining = buffer.remaining();
        if (remaining < 1) throw new Error(`Requested 1 bytes but only ${remaining} bytes available`);

        const value = buffer.readUInt8();

        if (value <= number_type[0]) {
            return value;
        } else if (value === number_type[1]) {
            remaining = buffer.remaining();
            if (remaining < 2) throw new Error(`Requested 2 bytes but only ${remaining} bytes available`);

            return buffer.readUInt16LE();
        } else if (value === number_type[2]) {
            remaining = buffer.remaining();
            if (remaining < 4) throw new Error(`Requested 4 bytes but only ${remaining} bytes available`);

            return buffer.readUInt32LE();
        } else throw new Error("The number is too large to be processed.");
    }

    /**
     * Deserialize the number to JSBI
     * @param buffer The byte buffer
     * @returns The deserialized JSBI instance
     */
    public static toJSBI(buffer: SmartBuffer): JSBI {
        let remaining = buffer.remaining();
        if (remaining < 1) throw new Error(`Requested 1 bytes but only ${remaining} bytes available`);

        const value = buffer.readUInt8();

        if (value <= number_type[0]) {
            return JSBI.BigInt(value);
        } else if (value === number_type[1]) {
            remaining = buffer.remaining();
            if (remaining < 2) throw new Error(`Requested 2 bytes but only ${remaining} bytes available`);

            return JSBI.BigInt(buffer.readUInt16LE());
        } else if (value === number_type[2]) {
            remaining = buffer.remaining();
            if (remaining < 4) throw new Error(`Requested 4 bytes but only ${remaining} bytes available`);

            return JSBI.BigInt(buffer.readUInt32LE());
        } else {
            remaining = buffer.remaining();
            if (remaining < 8) throw new Error(`Requested 8 bytes but only ${remaining} bytes available`);

            return Utils.readJSBigIntLE(buffer.readBuffer(8));
        }
    }
}
