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

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { OutputType } from "../data/TxOutput";
import { BOAClient } from "../net/BOAClient";
import { BalanceType } from "../net/response/Types";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
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
    private readonly items: InternalUTXO[];

    /**
     * Constructor
     * @param data The array containing UnspentTxOutput objects
     */
    constructor(data: UnspentTxOutput[]) {
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
    public add(data: UnspentTxOutput[]) {
        const old_length = this.items.length;
        this.items.push(
            ...data
                .filter((n) => this.items.find((m) => m.utxo.data.compare(n.utxo.data) === 0) === undefined)
                .map((n) => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount, n.height))
        );

        if (this.items.length > old_length)
            this.items.sort((a, b) => {
                const cmp = (x: JSBI, y: JSBI) => (JSBI.greaterThan(x, y) ? 1 : JSBI.lessThan(x, y) ? -1 : 0);
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
    public getSum(height?: JSBI): [Amount, Amount, Amount] {
        if (height !== undefined && JSBI.lessThan(height, JSBI.BigInt(0)))
            throw new Error(`The height must be greater than or equal to zero, not ${height.toString()}`);

        return this.items
            .filter((n) => !n.used)
            .reduce<[Amount, Amount, Amount]>(
                (sum, n) => {
                    if (
                        height !== undefined &&
                        JSBI.greaterThan(JSBI.subtract(n.unlock_height, JSBI.BigInt(1)), height)
                    )
                        sum[2] = Amount.add(sum[2], n.amount);
                    else {
                        switch (n.type) {
                            case OutputType.Payment:
                                sum[0] = Amount.add(sum[0], n.amount);
                                break;
                            case OutputType.Freeze:
                                sum[1] = Amount.add(sum[1], n.amount);
                                break;
                            case OutputType.Coinbase:
                                sum[0] = Amount.add(sum[0], n.amount);
                                break;
                        }
                    }
                    return sum;
                },
                [Amount.make(0), Amount.make(0), Amount.make(0)]
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
    public getUTXO(
        amount: Amount | JSBI,
        height: JSBI,
        estimated_input_fee: Amount | JSBI = Amount.make(0)
    ): UnspentTxOutput[] {
        let target_amount = amount instanceof Amount ? amount : Amount.make(amount);
        const req_fee = estimated_input_fee instanceof Amount ? estimated_input_fee : Amount.make(estimated_input_fee);
        if (Amount.lessThanOrEqual(target_amount, Amount.ZERO_BOA))
            throw new Error(`Positive amount expected, not ${target_amount.toString()}`);

        if (JSBI.lessThan(height, JSBI.BigInt(0)))
            throw new Error(`The height must be greater than or equal to zero, not ${height.toString()}`);

        if (Amount.greaterThan(target_amount, this.getSum(height)[0])) return [];

        target_amount = Amount.add(target_amount, req_fee);
        let sum = Amount.make(0);
        return this.items
            .filter(
                (n) =>
                    !n.used &&
                    (n.type === OutputType.Payment || n.type === OutputType.Coinbase) &&
                    JSBI.lessThanOrEqual(JSBI.subtract(n.unlock_height, JSBI.BigInt(1)), height)
            )
            .filter((n) => {
                if (Amount.greaterThanOrEqual(sum, target_amount)) return false;
                sum = Amount.add(sum, n.amount);
                n.used = true;

                target_amount = Amount.add(target_amount, req_fee);
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
    private readonly items: InternalUTXO[];

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
     * The type of balance (0: Spendable,, 1: Frozen, 2: Locked)
     * @private
     */
    private balance_type: BalanceType;

    /**
     * Constructor
     * @param address The instance of the PublicKey
     * @param client  The instance of the BOAClient
     * @param balance_type The balance type
     */
    constructor(address: PublicKey, client: BOAClient, balance_type: BalanceType = BalanceType.spendable) {
        this.address = address;
        this.items = [];
        this.client = client;
        this.balance_type = balance_type;
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
    public add(data: UnspentTxOutput[]) {
        const old_length = this.items.length;
        this.items.push(
            ...data
                .filter((n) => this.items.find((m) => m.utxo.data.compare(n.utxo.data) === 0) === undefined)
                .map((n) => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount, n.height))
        );

        if (this.items.length > old_length)
            this.items.sort((a, b) => {
                const cmp = (x: JSBI, y: JSBI) => (JSBI.greaterThan(x, y) ? 1 : JSBI.lessThan(x, y) ? -1 : 0);
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
    public async getUTXO(
        amount: Amount | JSBI,
        estimated_input_fee: Amount | JSBI = Amount.make(0)
    ): Promise<UnspentTxOutput[]> {
        const req_amount = amount instanceof Amount ? amount : Amount.make(amount);
        const req_fee = estimated_input_fee instanceof Amount ? estimated_input_fee : Amount.make(estimated_input_fee);
        if (Amount.lessThanOrEqual(req_amount, Amount.ZERO_BOA))
            throw new Error(`Positive amount expected, not ${req_amount.toString()}`);

        let target_amount: Amount;
        const result: UnspentTxOutput[] = [];

        target_amount = Amount.make(req_amount);
        while (true) {
            target_amount = Amount.add(target_amount, req_fee);
            let sum = Amount.make(0);
            const utxo = this.items
                .filter((n) => !n.used)
                .filter((n) => {
                    if (Amount.greaterThanOrEqual(sum, target_amount)) return false;
                    sum = Amount.add(sum, n.amount);
                    n.used = true;

                    target_amount = Amount.add(target_amount, req_fee);
                    return true;
                })
                .map((n) => new UnspentTxOutput(n.utxo, n.type, n.unlock_height, n.amount, n.height));
            result.push(...utxo);
            const res_sum = result.reduce<Amount>((prev, value) => Amount.add(prev, value.amount), Amount.make(0));
            const estimated_amount = Amount.add(req_amount, Amount.multiply(req_fee, result.length));
            if (Amount.greaterThanOrEqual(res_sum, estimated_amount)) break;

            target_amount = Amount.subtract(estimated_amount, res_sum);
            const additional = await this.client.getWalletUTXOs(
                this.address,
                target_amount,
                this.balance_type,
                this.getLastUTXO()
            );
            // Not Enough Amount
            if (additional.length === 0) {
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
    public used: boolean;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO
     * @param type          The type of the transaction
     * @param unlock_height The height of the block that can be used
     * @param amount        The monetary value of UTXO
     * @param height        The block height
     */
    constructor(utxo: Hash, type: OutputType, unlock_height: JSBI, amount: Amount, height: JSBI) {
        super(utxo, type, unlock_height, amount, height);

        if (JSBI.lessThanOrEqual(this.unlock_height, JSBI.BigInt(0)))
            throw new Error(`Positive unlock_height expected, not ${unlock_height.toString()}`);

        if (Amount.lessThanOrEqual(this.amount, Amount.ZERO_BOA))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        this.used = false;
    }
}
