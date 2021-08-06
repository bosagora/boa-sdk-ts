/*******************************************************************************

    Contains class for managing UTXO

    This class manages what is used and not used in payment for UTXO
    This calculates the sum of the UTXO amounts.
    This also provides UTXO for the required amount.
    This allows for the addition of a later UTXO.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { OutputType } from "../data/TxOutput";
import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { BOAClient } from "../net/BOAClient";
import { Utils } from "./Utils";

import JSBI from "jsbi";

/**
 * Class for managing UTXO
 * Manage what is used and not used in payment for UTXO
 */
export class UTXOManager {
    /**
     * Internal UTXO Array
     */
    private readonly items: Array<InternalUTXO>;

    /**
     * Constructor
     * @param data The array containing UnspentTxOutput objects
     */
    constructor(data: Array<UnspentTxOutput>) {
        this.items = [];
        this.add(data);
    }

    /**
     * Add UTXOs. If it already exists, ignore it.
     * After add, Two fields are used for sorting.
     * One is unlock_height and the other is amount.
     * The array is sorted in ascending order of unlock_height,
     * and in ascending order of amount when the same unlock_height is.
     * This allows a UTXO that is created first to be used first.
     * It also allows small amounts to be used first.
     * @param data The array of `UnspentTxOutput`
     */
    public add(data: Array<UnspentTxOutput>) {
        let old_length = this.items.length;
        this.items.push(
            ...data
                .filter((n) => this.items.find((m) => m.utxo.data.compare(n.utxo.data) === 0) === undefined)
                .map((n) => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount, n.height))
        );

        if (this.items.length > old_length)
            this.items.sort((a, b) => {
                let cmp = (a: JSBI, b: JSBI) => (JSBI.greaterThan(a, b) ? 1 : JSBI.lessThan(a, b) ? -1 : 0);
                if (JSBI.notEqual(a.height, b.height)) return cmp(a.height, b.height);
                return Utils.compareBuffer(a.utxo.data, b.utxo.data);
            });
    }

    /**
     * Returns the sum of the amount.
     * @param height The height of the current block,
     * if this value is not specified, the total is calculated.
     * @returns Returns the sum of the amount.
     * The first is the sum of UTXO, whose type of transaction is Payment or Coinbase,
     * and the second is the sum of Freeze,
     * and the third is the amount that was released from the freeze
     * but locked to `unlock_height`.
     */
    public getSum(height?: JSBI): [JSBI, JSBI, JSBI] {
        if (height !== undefined && JSBI.lessThan(height, JSBI.BigInt(0)))
            throw new Error(`The height must be greater than or equal to zero, not ${height.toString()}`);

        return this.items
            .filter((n) => !n.used)
            .reduce<[JSBI, JSBI, JSBI]>(
                (sum, n) => {
                    if (
                        height !== undefined &&
                        JSBI.greaterThan(JSBI.subtract(n.unlock_height, JSBI.BigInt(1)), height)
                    )
                        sum[2] = JSBI.add(sum[2], n.amount);
                    else {
                        switch (n.type) {
                            case OutputType.Payment:
                                sum[0] = JSBI.add(sum[0], n.amount);
                                break;
                            case OutputType.Freeze:
                                sum[1] = JSBI.add(sum[1], n.amount);
                                break;
                            case OutputType.Coinbase:
                                sum[0] = JSBI.add(sum[0], n.amount);
                                break;
                        }
                    }
                    return sum;
                },
                [JSBI.BigInt(0), JSBI.BigInt(0), JSBI.BigInt(0)]
            );
    }

    /**
     * Returns an array of UTXOs to be used for input of transactions
     * based on the amount entered.
     * @param amount The required amount
     * @param height The height of latest block
     * @param estimated_input_fee The estimated fee of the size of one TxInput
     * @returns Returns the available array of UTXO. If the available amount
     * is less than the requested amount, the empty array is returned.
     */
    public getUTXO(amount: JSBI, height: JSBI, estimated_input_fee: JSBI = JSBI.BigInt(0)): Array<UnspentTxOutput> {
        let target_amount = JSBI.BigInt(amount);
        if (JSBI.lessThanOrEqual(target_amount, JSBI.BigInt(0)))
            throw new Error(`Positive amount expected, not ${target_amount.toString()}`);

        if (JSBI.lessThan(height, JSBI.BigInt(0)))
            throw new Error(`The height must be greater than or equal to zero, not ${height.toString()}`);

        if (JSBI.greaterThan(target_amount, this.getSum(height)[0])) return [];

        target_amount = JSBI.add(target_amount, estimated_input_fee);
        let sum = JSBI.BigInt(0);
        return this.items
            .filter(
                (n) =>
                    !n.used &&
                    (n.type === OutputType.Payment || n.type === OutputType.Coinbase) &&
                    JSBI.lessThanOrEqual(JSBI.subtract(n.unlock_height, JSBI.BigInt(1)), height)
            )
            .filter((n) => {
                if (JSBI.greaterThanOrEqual(sum, target_amount)) return false;
                sum = JSBI.add(sum, n.amount);
                n.used = true;

                target_amount = JSBI.add(target_amount, estimated_input_fee);
                return true;
            })
            .map((n) => new UnspentTxOutput(n.utxo, n.type, n.unlock_height, n.amount, n.height));
    }

    /**
     * Initializes the internal UTXO array.
     */
    public clear() {
        this.items.length = 0;
    }
}

/**
 * Class for managing UTXO
 * Manage what is used and not used in payment for UTXO
 */
export class UTXOProvider {
    /**
     * Internal UTXO Array
     */
    private readonly items: Array<InternalUTXO>;

    /**
     * UTXO Owner's Public Key
     * @private
     */
    private address: PublicKey;

    /**
     * It is a client to access Agora and Stoa.
     * @private
     */
    private client: BOAClient;

    /**
     * Constructor
     * @param address The instance of the PublicKey
     * @param client  The instance of the BOAClient
     */
    constructor(address: PublicKey, client: BOAClient) {
        this.address = address;
        this.items = [];
        this.client = client;
    }

    /**
     * Add UTXOs. If it already exists, ignore it.
     * After add, Two fields are used for sorting.
     * One is unlock_height and the other is amount.
     * The array is sorted in ascending order of unlock_height,
     * and in ascending order of amount when the same unlock_height is.
     * This allows a UTXO that is created first to be used first.
     * It also allows small amounts to be used first.
     * @param data The array of `UnspentTxOutput`
     */
    public add(data: Array<UnspentTxOutput>) {
        let old_length = this.items.length;
        this.items.push(
            ...data
                .filter((n) => this.items.find((m) => m.utxo.data.compare(n.utxo.data) === 0) === undefined)
                .map((n) => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount, n.height))
        );

        if (this.items.length > old_length)
            this.items.sort((a, b) => {
                let cmp = (a: JSBI, b: JSBI) => (JSBI.greaterThan(a, b) ? 1 : JSBI.lessThan(a, b) ? -1 : 0);
                if (JSBI.notEqual(a.height, b.height)) return cmp(a.height, b.height);
                return Utils.compareBuffer(a.utxo.data, b.utxo.data);
            });
    }

    /**
     * Returns an array of UTXOs to be used for input of transactions
     * based on the amount entered.
     * @param amount The required amount
     * @param estimated_input_fee The estimated fee of the size of one TxInput
     * @returns Returns the available array of UTXO. If the available amount
     * is less than the requested amount, the empty array is returned.
     */
    public async getUTXO(amount: JSBI, estimated_input_fee: JSBI = JSBI.BigInt(0)): Promise<Array<UnspentTxOutput>> {
        if (JSBI.lessThanOrEqual(amount, JSBI.BigInt(0)))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        let target_amount: JSBI;
        let result: UnspentTxOutput[] = [];

        target_amount = JSBI.BigInt(amount);
        while (true) {
            target_amount = JSBI.add(target_amount, estimated_input_fee);
            let sum = JSBI.BigInt(0);
            let utxo = this.items
                .filter((n) => !n.used)
                .filter((n) => {
                    if (JSBI.greaterThanOrEqual(sum, target_amount)) return false;
                    sum = JSBI.add(sum, n.amount);
                    n.used = true;

                    target_amount = JSBI.add(target_amount, estimated_input_fee);
                    return true;
                })
                .map((n) => new UnspentTxOutput(n.utxo, n.type, n.unlock_height, n.amount, n.height));
            result.push(...utxo);
            let res_sum = result.reduce<JSBI>((sum, value) => JSBI.add(sum, value.amount), JSBI.BigInt(0));
            let estimated_amount = JSBI.add(amount, JSBI.multiply(estimated_input_fee, JSBI.BigInt(result.length)));
            if (JSBI.greaterThanOrEqual(res_sum, estimated_amount)) break;

            target_amount = JSBI.subtract(estimated_amount, res_sum);
            let additional = await this.client.getWalletUTXOs(this.address, target_amount, 0, this.getLastUTXO());
            // Not Enough Amount
            if (additional.length == 0) {
                this.items.forEach((m) => {
                    if (result.find((n) => m.utxo.data.compare(n.utxo.data) !== undefined)) {
                        m.used = false;
                    }
                });
                result.length = 0;
                break;
            }
            this.add(additional);
        }
        return result;
    }

    private getLastUTXO(): Hash | undefined {
        return this.items.length === 0 ? undefined : this.items[this.items.length - 1].utxo;
    }
}

/**
 * Define the internal UTXO
 */
class InternalUTXO extends UnspentTxOutput {
    /**
     * Status variable indicating whether it is used or not
     */
    public used: Boolean;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO
     * @param type          The type of the transaction
     * @param unlock_height The height of the block that can be used
     * @param amount        The monetary value of UTXO
     * @param height        The block height
     */
    constructor(utxo: Hash, type: OutputType, unlock_height: JSBI, amount: JSBI, height: JSBI) {
        super(utxo, type, unlock_height, amount, height);

        if (JSBI.lessThanOrEqual(this.unlock_height, JSBI.BigInt(0)))
            throw new Error(`Positive unlock_height expected, not ${unlock_height.toString()}`);

        if (JSBI.lessThanOrEqual(this.amount, JSBI.BigInt(0)))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        this.used = false;
    }
}
