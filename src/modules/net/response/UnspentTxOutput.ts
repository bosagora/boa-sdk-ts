/*******************************************************************************

    Contains definition for the unspent transaction output

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../../common/Amount";
import { Hash } from "../../common/Hash";
import { OutputType } from "../../data/TxOutput";
import { JSONValidator } from "../../utils/JSONValidator";

import JSBI from "jsbi";

/**
 * Define the unspentTxOutput
 */
export class UnspentTxOutput {
    /**
     * The hash of the UTXO key
     */
    utxo: Hash;

    /**
     * The type of the transaction
     */
    type: OutputType;

    /**
     * The height of the block to be unlock
     */
    unlock_height: JSBI;

    /**
     * The amount value of this utxo, in 1/10^7
     */
    amount: Amount;

    /**
     * Block height on created
     */
    height: JSBI;

    /**
     * Block time on created
     */
    time: number;

    /**
     * The lock type
     */
    lock_type: number;

    /**
     * The lock bytes
     */
    lock_bytes: string;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO key
     * @param type          The type of the transaction output
     * @param unlock_height The height of the block to be unlock
     * @param amount        The amount value of this utxo, in 1/10^7
     * @param height        The height of the block on created
     * @param time          The time of the block on created
     * @param lock_type     The lock type
     * @param lock_bytes    The lock bytes
     */
    constructor(
        utxo: Hash,
        type: OutputType,
        unlock_height: JSBI,
        amount: Amount,
        height: JSBI,
        time?: number,
        lock_type?: number,
        lock_bytes?: string
    ) {
        this.utxo = utxo;
        this.type = type;
        this.unlock_height = unlock_height;
        this.amount = amount;
        this.height = height;
        this.time = time ? time : 0;
        this.lock_type = lock_type ? lock_type : 0;
        this.lock_bytes = lock_bytes ? lock_bytes : "";
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `UnspentTxOutput` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("UnspentTxOutput", value);
        return new UnspentTxOutput(
            new Hash(value.utxo),
            value.type,
            JSBI.BigInt(value.unlock_height),
            Amount.make(value.amount),
            JSBI.BigInt(value.height),
            value.time,
            value.lock_type,
            value.lock_bytes
        );
    }
}
