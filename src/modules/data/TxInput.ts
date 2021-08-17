/*******************************************************************************

    The class that defines the transaction's inputs of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hashPart, makeUTXOKey } from "../common/Hash";
import { Signature } from "../common/Signature";
import { Unlock } from "../script/Lock";
import { JSONValidator } from "../utils/JSONValidator";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines the transaction's inputs of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class TxInput {
    /**
     * The hash of the UTXO to be spent
     */
    public utxo: Hash;

    /**
     * The unlock script, which will be ran together with the matching Input's
     * lock script in the execution engine
     */
    public unlock: Unlock;

    /**
     * The UTXO this `Input` references must be at least `unlock_age` older
     * than the block height at which the spending transaction wants to be
     * included in the block. Use for implementing relative time locks.
     */
    public unlock_age: number;

    /**
     * Constructor
     * @param hash  The hash of the UTXO or the hash of the transaction
     * @param unlock The instance of Unlock
     * @param unlock_age The UTXO this `Input` references must be at least
     * `unlock_age` older than the block height at which the spending
     * transaction wants to be  included in the block.
     * Use for implementing relative time locks.
     */
    constructor(hash: Hash, unlock: Unlock = Unlock.Null, unlock_age: number = 0) {
        this.utxo = hash;
        this.unlock = unlock;
        this.unlock_age = unlock_age;
    }

    public static fromTxHash(hash: Hash, index: JSBI, unlock: Unlock = Unlock.Null, unlock_age: number = 0) {
        return new TxInput(makeUTXOKey(hash, index), unlock, unlock_age);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `TxInputs` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("TxInput", value);
        return new TxInput(new Hash(value.utxo), Unlock.reviver("", value.unlock), value.unlock_age);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.utxo.computeHash(buffer);
        hashPart(this.unlock_age, buffer);
    }

    /**
     * Returns the data size.
     */
    public getNumberOfBytes(): number {
        return (
            Hash.Width + // TxInput.utxo
            this.unlock.getNumberOfBytes() + // TxInput.unlock
            Utils.SIZE_OF_INT
        ); // TxInput.unlock_age
    }

    /**
     * Returns the estimated data size.
     */
    public static getEstimatedNumberOfBytes(): number {
        return Hash.Width + Utils.SIZE_OF_INT + Signature.Width;
    }

    /**
     * The compare function of TxInput
     */
    public static compare(a: TxInput, b: TxInput): number {
        return Utils.compareBuffer(a.utxo.data, b.utxo.data);
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        this.utxo.serialize(buffer);
        this.unlock.serialize(buffer);
        VarInt.fromNumber(this.unlock_age, buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): TxInput {
        const utxo = Hash.deserialize(buffer);
        const unlock = Unlock.deserialize(buffer);
        const unlock_age = VarInt.toNumber(buffer);
        return new TxInput(utxo, unlock, unlock_age);
    }
}
