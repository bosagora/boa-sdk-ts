/*******************************************************************************

    Contains definition for the unspent transaction output

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../../common/Hash";
import { OutputType } from "../../data/TxOutput";
import { Utils } from "../../utils/Utils";

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
    amount: JSBI;

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
        utxo?: Hash,
        type?: OutputType,
        unlock_height?: JSBI,
        amount?: JSBI,
        height?: JSBI,
        time?: number,
        lock_type?: number,
        lock_bytes?: string
    ) {
        if (utxo !== undefined) this.utxo = new Hash(utxo.data);
        else this.utxo = new Hash(Buffer.alloc(Hash.Width));

        if (type !== undefined) this.type = type;
        else this.type = OutputType.Payment;

        if (unlock_height !== undefined) this.unlock_height = JSBI.BigInt(unlock_height);
        else this.unlock_height = JSBI.BigInt(0);

        if (amount !== undefined) this.amount = JSBI.BigInt(amount);
        else this.amount = JSBI.BigInt(0);

        if (height !== undefined) this.height = JSBI.BigInt(height);
        else this.height = JSBI.BigInt(0);

        if (time !== undefined) this.time = time;
        else this.time = 0;

        if (lock_type !== undefined) this.lock_type = lock_type;
        else this.lock_type = 0;

        if (lock_bytes !== undefined) this.lock_bytes = lock_bytes;
        else this.lock_bytes = "";
    }

    /**
     * This import from JSON
     * @param data The object of the JSON
     */
    public fromJSON(data: JSONUnspentTxOutput) {
        Utils.validateJSON(this, data);

        this.utxo.fromString(data.utxo);
        this.type = data.type;
        this.unlock_height = JSBI.BigInt(data.unlock_height);
        this.amount = JSBI.BigInt(data.amount);
        this.height = JSBI.BigInt(data.height);
        this.time = data.time;
        this.lock_type = data.lock_type;
        this.lock_bytes = data.lock_bytes;
    }
}

/**
 * @ignore
 * Define the unspentTxOutput in JSON
 */
export interface JSONUnspentTxOutput {
    utxo: string;
    type: number;
    unlock_height: string;
    amount: string;
    height: string;
    time: number;
    lock_type: number;
    lock_bytes: string;
}
