/*******************************************************************************

    The class that defines the transaction's outputs of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { PublicKey } from "../common/KeyPair";
import { Lock } from "../script/Lock";
import { JSONValidator } from "../utils/JSONValidator";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The transaction output type constant
 */
export enum OutputType {
    Payment = 0,
    Freeze = 1,
    Coinbase = 2,
}

/**
 * The class that defines the transaction's outputs of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class TxOutput {
    /**
     * The type of the transaction output
     */
    public type: OutputType;

    /**
     * The lock condition for this Output
     */
    public lock: Lock;

    /**
     * The monetary value of this output, in 1/10^7
     */
    public value: Amount;

    /**
     * Constructor
     * @param type    The type of the transaction output
     * @param value   The monetary value
     * @param lock    The public key or instance of Lock
     */
    constructor(type: number, value: Amount | JSBI | string, lock: Lock | PublicKey) {
        this.type = type;

        if (lock instanceof PublicKey) this.lock = Lock.fromPublicKey(lock);
        else this.lock = lock;

        this.value = Amount.make(value);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `TxOutputs` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("TxOutput", value);
        return new TxOutput(Number(value.type), Amount.reviver("", value.value), Lock.reviver("", value.lock));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        buffer.writeUInt32LE(this.type);
        this.lock.computeHash(buffer);
        this.value.computeHash(buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            type: this.type,
            value: this.value,
            lock: this.lock,
        };
    }

    /**
     * Returns the data size.
     */
    public getNumberOfBytes(): number {
        return (
            Utils.SIZE_OF_INT + //  TxOutput.type
            Utils.SIZE_OF_LONG + //  TxOutput.value
            this.lock.getNumberOfBytes()
        ); //  TxOutput.lock
    }

    /**
     * Returns the estimated data size.
     */
    public static getEstimatedNumberOfBytes(): number {
        return Utils.SIZE_OF_INT + Utils.SIZE_OF_LONG + Utils.SIZE_OF_BYTE + Utils.SIZE_OF_PUBLIC_KEY;
    }

    /**
     * The compare function of TxOutput
     */
    public static compare(a: TxOutput, b: TxOutput): number {
        if (a.type !== b.type) return a.type < b.type ? -1 : 1;

        if (a.lock.type !== b.lock.type) return a.lock.type < b.lock.type ? -1 : 1;

        const comp = Buffer.compare(a.lock.bytes, b.lock.bytes);
        if (comp !== 0) return comp;

        return Amount.greaterThan(a.value, b.value) ? 1 : Amount.lessThan(a.value, b.value) ? -1 : 0;
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromNumber(this.type, buffer);
        this.lock.serialize(buffer);
        VarInt.fromJSBI(this.value.value, buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): TxOutput {
        const type = VarInt.toNumber(buffer);
        const lock = Lock.deserialize(buffer);
        const value = VarInt.toJSBI(buffer);
        return new TxOutput(type, value, lock);
    }
}
