/*******************************************************************************

    Includes classes and functions associated with hash.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SodiumHelper } from "../utils/SodiumHelper";
import { Endian, Utils } from "../utils/Utils";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The Class for creating hash
 */
export class Hash {
    /**
     * Buffer containing calculated hash values
     */
    public readonly data: Buffer;

    /**
     * The number of byte of the Hash
     */
    public static Width: number = 64;

    /**
     * Construct a new instance of this class
     *
     * @param data   The string or binary representation of the hash
     * @param endian The byte order
     * @throws Will throw an error if the data is not the same size as 64.
     */
    constructor(data: Buffer | string, endian: Endian = Endian.Big) {
        if (typeof data === "string") this.data = Utils.readFromString(data, Buffer.alloc(Hash.Width));
        else {
            this.data = Buffer.alloc(Hash.Width);
            this.fromBinary(data, endian);
        }
        if (this.data.length !== Hash.Width) throw new Error("The size of the data is abnormal.");
    }

    /**
     * Reads from the hex string
     * @param hex The hex string
     * @returns The instance of Hash
     */
    public fromString(hex: string): Hash {
        Utils.readFromString(hex, this.data);
        return this;
    }

    /**
     * Writes to the hex string
     * @returns The hex string
     */
    public toString(): string {
        return Utils.writeToString(this.data);
    }

    /**
     * Set binary data
     * @param bin    The binary data of the hash
     * @param endian The byte order
     * @returns The instance of Hash
     * @throws Will throw an error if the argument `bin` is not the same size as 64.
     */
    public fromBinary(bin: Buffer, endian: Endian = Endian.Big): Hash {
        if (bin.length !== Hash.Width) throw new Error("The size of the data is abnormal.");

        bin.copy(this.data);
        if (endian === Endian.Little) this.data.reverse();

        return this;
    }

    /**
     * Get binary data
     * @param endian The byte order
     * @returns The binary data of the hash
     */
    public toBinary(endian: Endian = Endian.Big): Buffer {
        if (endian === Endian.Little) return Buffer.from(this.data).reverse();
        else return this.data;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        buffer.writeBuffer(this.data);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        buffer.writeBuffer(this.data);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Hash {
        return new Hash(Utils.readBuffer(buffer, Hash.Width));
    }
}

/**
 * Creates a hash and stores it in buffer.
 * @param source Original for creating hash
 * @returns Instance of Hash
 */
export function hash(source: Buffer): Hash {
    return new Hash(Buffer.from(SodiumHelper.sodium.crypto_generichash(Hash.Width, source)));
}

/**
 * Creates a hash of the two buffer combined.
 * @param args The array of any for creating hash
 * @returns The instance of Hash
 * See_Also https://github.com/bosagora/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/Hash.d#L239-L255
 */
export function hashMulti(...args: any[]): Hash {
    const buffer = new SmartBuffer();
    for (const m of args) hashPart(m, buffer, false);
    return new Hash(Buffer.from(SodiumHelper.sodium.crypto_generichash(Hash.Width, buffer.toBuffer())));
}

/**
 * Makes a UTXOKey
 * @param h     The instance of transaction's Hash
 * @param index The index of the output
 * @returns The instance of Hash
 * See_Also https://github.com/bosagora/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/data/UTXOSetValue.d#L50-L53
 */
export function makeUTXOKey(h: Hash, index: JSBI): Hash {
    const buf = Buffer.allocUnsafe(8);
    Utils.writeJSBigIntLE(buf, index);
    return hashMulti(h, buf);
}

/**
 * Serializes all internal objects that the instance contains in a buffer.
 * Calculates the hash of the buffer.
 * @param record The object to serialize for the hash for creation.
 * The object has a method named `computeHash`.
 * @returns The instance of the hash
 */
export function hashFull(record: any): Hash {
    if (record === null || record === undefined) return new Hash(Buffer.alloc(Hash.Width));

    const buffer = new SmartBuffer();
    hashPart(record, buffer);
    return hash(buffer.readBuffer());
}

/**
 * Serializes all internal objects that the instance contains in the buffer.
 * @param record The object to serialize for the hash for creation
 * @param buffer The storage of serialized data for creating the hash
 * @param write_length Choose whether to record the size of the array or not.
 */
export function hashPart(record: any, buffer: SmartBuffer, write_length: boolean = true) {
    if (record === null || record === undefined) return;

    // If the record has a method called `computeHash`,
    if (typeof record.computeHash === "function") {
        record.computeHash(buffer);
        return;
    }

    if (typeof record === "string") {
        const buf = Buffer.from(record);
        if (write_length) hashVarInt(JSBI.BigInt(buf.length), buffer);
        buffer.writeBuffer(buf);
        return;
    }

    if (typeof record === "number") {
        buffer.writeUInt32LE(record);
        return;
    }

    if (record instanceof JSBI) {
        const buf = Buffer.allocUnsafe(8);
        Utils.writeJSBigIntLE(buf, record);
        buffer.writeBuffer(buf);
        return;
    }

    if (record instanceof Buffer) {
        if (write_length) hashVarInt(JSBI.BigInt(record.length), buffer);
        buffer.writeBuffer(record);
        return;
    }

    if (Array.isArray(record)) {
        if (write_length) hashVarInt(JSBI.BigInt(record.length), buffer);
        for (const elem of record) {
            hashPart(elem, buffer);
        }
    } else {
        for (const key in record) {
            if (record.hasOwnProperty(key)) {
                hashPart(record[key], buffer);
            }
        }
    }
}

/**
 * Serializes array length information into buffers.
 * @param value The length of the Array
 * @param buffer The storage of serialized data for creating the hash
 */
export function hashVarInt(value: JSBI, buffer: SmartBuffer) {
    if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xfc))) {
        buffer.writeUInt8(JSBI.toNumber(value));
    } else if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xffff))) {
        buffer.writeUInt8(0xfd);
        buffer.writeUInt16LE(JSBI.toNumber(value));
    } else if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xffffffff))) {
        buffer.writeUInt8(0xfe);
        buffer.writeUInt32LE(JSBI.toNumber(value));
    } else {
        buffer.writeUInt8(0xff);
        const buf = Buffer.allocUnsafe(8);
        Utils.writeJSBigIntLE(buf, value);
        buffer.writeBuffer(buf);
    }
}
