/*******************************************************************************

    The class that defines the BitMask

    Copyright:
        Copyright (c) 2020 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SmartBuffer } from "smart-buffer";
import { iota, Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";

/**
 * The class that defines the BitMask
 */
export class BitMask {
    /**
     * Array of bytes to store bits
     */
    private readonly _bytes: Buffer;

    /**
     * Count of bits
     */
    private readonly _length: number;

    /**
     * Constructor
     * @param length  The length of array
     * @param bytes The array of bit field
     */
    constructor(length: number, bytes?: Buffer) {
        this._length = length;
        const size = 1 + Math.floor((length - 1) / 8);
        if (bytes === undefined) {
            this._bytes = Buffer.alloc(size);
            return;
        }
        if (size !== bytes.length) throw new Error("The entered length and bytes sizes do not match.");
        this._bytes = Buffer.from(bytes);
    }

    /**
     * Sets the value in the sequence of the bit
     * @param index the sequence of the bit
     * @param value the value to set
     */
    public set(index: number, value: boolean) {
        if (index < 0 || index >= this.length) throw new Error("Attempt to set index beyond length of bitmask");
        const byte_index = Math.floor(index / 8);
        if (value) this.bytes[byte_index] |= this.mask(index);
        else this.bytes[byte_index] &= ~this.mask(index);
    }

    /**
     * Gets the value placed in the sequence of bits.
     * @param index the sequence of the bit
     * @returns The value of bit
     */
    public get(index: number): boolean {
        if (index < 0 || index >= this.length) throw new Error("Attempt to get index beyond length of bitmask");
        const byte_index = Math.floor(index / 8);
        return !!(this.bytes[byte_index] & this.mask(index));
    }

    /**
     * Clone this object
     */
    public clone(): BitMask {
        return new BitMask(this.length, this.bytes.slice());
    }

    /**
     * Gets a bit mask which only includes a given index within a byte
     * @param index The index of bit
     * @returns The index of bit
     */
    private mask(index: number): number {
        return 1 << (8 - 1 - (index % 8));
    }

    /**
     * Return the indices of bits set
     */
    public setIndices(): number[] {
        return iota(this.length).filter((m) => this.get(m));
    }

    /**
     *  Return the indices of bits not set
     */
    public notSetIndices(): number[] {
        return iota(this.length).filter((m) => !this.get(m));
    }

    /**
     *  Return the length of set bits
     */
    public setCount(): number {
        return this.setIndices().length;
    }

    /**
     * Writes to the string
     * @returns The string
     */
    public toString(): string {
        return iota(this.length)
            .map((m) => (this.get(m) ? "1" : "0"))
            .join("");
    }

    /**
     * Reads from the string
     * @param value The string
     * @returns The instance of BitMask
     */
    public static fromString(value: string): BitMask {
        const bitmask = new BitMask(value.length);
        iota(value.length).forEach((idx) => {
            bitmask.set(idx, value[idx] === "1");
        });
        return bitmask;
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromNumber(this.length, buffer);
        VarInt.fromNumber(this.bytes.length, buffer);
        buffer.writeBuffer(this.bytes);
    }

    /**
     * Deserialize as binary data.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): BitMask {
        const length = VarInt.toNumber(buffer);
        const bytes = Utils.readBuffer(buffer, VarInt.toNumber(buffer));

        return new BitMask(length, bytes);
    }

    /**
     * Returns length
     */
    public get length(): number {
        return this._length;
    }

    /**
     * Returns bytes
     */
    public get bytes(): Buffer {
        return this._bytes;
    }
}
