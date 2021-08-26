/*******************************************************************************

    Contains definition for the signature

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SmartBuffer } from "smart-buffer";
import { Endian, Utils } from "../utils/Utils";

/**
 * Define the signature
 */
export class Signature {
    /**
     * Buffer containing signature values
     */
    public readonly data: Buffer;

    /**
     * The number of byte of the signature
     */
    public static Width: number = 64;

    /**
     * Construct a new instance of this class
     *
     * @param data   The string or binary representation of the Signature
     * @param endian The byte order
     * @throws Will throw an error if the data is not the same size as 64.
     */
    constructor(data: Buffer | string, endian: Endian = Endian.Big) {
        if (typeof data === "string") this.data = Utils.readFromString(data, Buffer.alloc(Signature.Width));
        else {
            this.data = Buffer.alloc(Signature.Width);
            this.fromBinary(data, endian);
        }
        if (this.data.length !== Signature.Width) throw new Error("The size of the data is abnormal.");
    }

    /**
     * Reads from the hex string
     * @param hex The hex string
     * @returns The instance of Signature
     */
    public fromString(hex: string): Signature {
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
     * @param bin    The binary data of the signature
     * @param endian The byte order
     * @returns The instance of Signature
     * @throws Will throw an error if the argument `bin` is not the same size as 64.
     */
    public fromBinary(bin: Buffer, endian: Endian = Endian.Big): Signature {
        if (bin.length !== Signature.Width) throw new Error("The size of the data is abnormal.");

        bin.copy(this.data);
        if (endian === Endian.Little) this.data.reverse();

        return this;
    }

    /**
     * Get binary data
     * @param endian The byte order
     * @returns The binary data of the signature
     */
    public toBinary(endian: Endian = Endian.Big): Buffer {
        if (endian === Endian.Little) return Buffer.from(this.data).reverse();
        else return this.data;
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
    public static deserialize(buffer: SmartBuffer): Signature {
        return new Signature(Utils.readBuffer(buffer, Signature.Width));
    }
}
