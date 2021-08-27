/*******************************************************************************

    The class that defines the Height.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SmartBuffer } from "smart-buffer";
import { VarInt } from "../utils/VarInt";
import { hashPart } from "./Hash";

import JSBI from "jsbi";

/**
 * The class that defines the Height.
 */
export class Height {
    /**
     * the block height
     */
    public value: JSBI;

    /**
     * Construct
     * @param value The block height
     */
    constructor(value: JSBI | string) {
        this.value = JSBI.BigInt(value);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        hashPart(this.value, buffer);
    }

    /**
     * Writes to the string
     * @param value The height of the block
     */
    public fromString(value: string) {
        this.value = JSBI.BigInt(value);
    }

    /**
     * Writes to the string
     */
    public toString() {
        return this.value.toString();
    }

    /**
     * Converts this object to its JSON representation
     *
     * Use `string` as primitive types, as JS is only precise up to
     * `2 ** 53 - 1` but we can get numbers up to `2 ** 64 - 1`.
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromJSBI(this.value, buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Height {
        return new Height(VarInt.toJSBI(buffer));
    }

    /**
     * Creates and returns a copy of this object.
     */
    public clone(): Height {
        return new Height(this.value);
    }
}
