/*******************************************************************************

    Contains the Lock / Unlock definitions

    These are the types that will ultimately
    replace the `signature` in the `Input` and the `address` in the `Output`.

    The Lock type contains a tag, allowing 4 different types of lock scripts:

    Key
        lock is a 64-byte public key,
        unlock is expected to be a signature.

    KeyHash
        lock is a hash of a 64-byte public key,
        unlock is expected to be a pair of <signature, public-key>.
        This form may be used for better privacy.

    Script
        lock is a script that will be evaluated
        by the engine. The unlock script may either
        be empty or only contain stack push opcodes.

    Redeem
        lock is a <redeem-hash>, and unlock may
        only contain stack push opcodes, where the
        last push will be read as the redeem script.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashPart } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { Signature } from "../common/Signature";
import { JSONValidator } from "../utils/JSONValidator";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";

import { SmartBuffer } from "smart-buffer";

/**
 * The input lock types.
 */
export enum LockType {
    /// lock is a 64-byte public key, unlock is the signature
    Key = 0x00,

    /// lock is a 64-byte public key hash, unlock is a (sig, key) pair
    KeyHash = 0x01,

    /// lock is a script, unlock may be anything required by the lock script
    Script = 0x02,

    /// lock is a 64-byte hash of a script, unlock is the script containing
    /// only stack pushes which will push the redeem script last
    Redeem = 0x03,
}

/**
 * Contains a tag and either a Hash or set of opcodes
 */
export class Lock {
    /**
     * Specifies the type of lock script
     */
    public type: LockType;

    /**
     * May either be a Hash, or a sequence of opcodes
     */
    public bytes: Buffer;

    /**
     * Constructor
     * @param type  Specifies the type of lock script
     * @param data May either be a Hash, or a sequence of opcodes
     */
    constructor(type: LockType, data: Buffer | string) {
        this.type = type;
        if (typeof data === "string") this.bytes = Buffer.from(data, "base64");
        else this.bytes = Buffer.from(data);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Lock` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("Lock", value);
        return new Lock(value.type, value.bytes);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        buffer.writeUInt8(this.type);
        hashPart(this.bytes, buffer);
    }

    /**
     * Generates a LockType.Key lock script.
     * @param key the public key which can unlock this lock script
     * @returns The lock script
     */
    public static fromPublicKey(key: PublicKey): Lock {
        return new Lock(LockType.Key, key.data);
    }

    /**
     * The bytes consisting of null values for all bytes.
     * @returns The instance of Unlock
     */
    public static get Null(): Lock {
        return new Lock(LockType.Key, Buffer.alloc(0));
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            type: this.type,
            bytes: this.bytes.toString("base64"),
        };
    }

    /**
     * Returns the data size.
     */
    public getNumberOfBytes(): number {
        return (
            Utils.SIZE_OF_BYTE + // Lock.type
            this.bytes.length
        ); // Lock.bytes
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromNumber(this.type, buffer);
        VarInt.fromNumber(this.bytes.length, buffer);
        buffer.writeBuffer(this.bytes);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Lock {
        const type = VarInt.toNumber(buffer);
        const length = VarInt.toNumber(buffer);
        return new Lock(type, Utils.readBuffer(buffer, length));
    }
}

/**
 * Contains a data tuple or a set of push opcodes
 */
export class Unlock {
    /**
     * May be: <signature>, <signature, key>, <key, push opcodes>
     */
    public bytes: Buffer;

    /**
     * Constructor
     * @param data May be: <signature>, <signature, key>, <key, push opcodes>
     */
    constructor(data: Buffer | string) {
        if (typeof data === "string") this.bytes = Buffer.from(data, "base64");
        else this.bytes = Buffer.from(data);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Unlock` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("Unlock", value);
        return new Unlock(value.bytes);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        buffer.writeBuffer(this.bytes);
    }

    /**
     * Generates a LockType.Key unlock script.
     * @param sig The signature that will be embedded in the script
     * @returns The unlock script
     */
    public static fromSignature(sig: Signature): Unlock {
        return new Unlock(sig.data);
    }

    /**
     * The bytes consisting of null values for all bytes.
     * @returns The instance of Unlock
     */
    public static get Null(): Unlock {
        return new Unlock(Buffer.alloc(0));
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            bytes: this.bytes.toString("base64"),
        };
    }

    /**
     * Returns the data size.
     */
    public getNumberOfBytes(): number {
        return this.bytes.length; // Unlock.bytes
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromNumber(this.bytes.length, buffer);
        buffer.writeBuffer(this.bytes);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Unlock {
        const length = VarInt.toNumber(buffer);
        return new Unlock(Utils.readBuffer(buffer, length));
    }
}
