/*******************************************************************************

    Includes class to build a transaction

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { Height } from "../common/Height";
import { KeyPair, PublicKey, SecretKey } from "../common/KeyPair";
import { Transaction } from "../data/Transaction";
import { TxInput } from "../data/TxInput";
import { OutputType, TxOutput } from "../data/TxOutput";
import { Lock, Unlock } from "../script/Lock";

import JSBI from "jsbi";

/**
 * Class for building a transaction
 */
export class TxBuilder {
    /**
     * Array of UTXO to be spent
     */
    private inputs: RawInput[];

    /**
     * Array of TxOutput
     */
    private outputs: TxOutput[];

    /**
     * The sum of UTXO in `inputs`
     */
    private amount: Amount;

    /**
     * The data payload in transaction to be created
     */
    private payload: Buffer | undefined;

    /**
     * The default owner key pair
     */
    private readonly owner_keypair: KeyPair;

    /**
     * Constructor
     * @param owner_keypair The owner key pair
     */
    constructor(owner_keypair: KeyPair) {
        this.payload = undefined;
        this.owner_keypair = owner_keypair;
        this.inputs = [];
        this.outputs = [];
        this.amount = Amount.make(0);
    }

    /**
     * Adds information to create and sign transaction inputs
     * @param utxo   The hash of the UTXO to be spent
     * @param amount The value of UTXO to be spent
     * @param secret The key pair to spend UTXO.
     */
    public addInput(utxo: Hash, amount: Amount | JSBI, secret?: SecretKey): TxBuilder {
        const utxo_amount = amount instanceof Amount ? amount : Amount.make(amount);
        if (Amount.lessThanOrEqual(utxo_amount, Amount.ZERO_BOA))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        if (secret === undefined) this.inputs.push(new RawInput(utxo, this.owner_keypair.secret));
        else this.inputs.push(new RawInput(utxo, secret));

        this.amount = Amount.add(this.amount, utxo_amount);

        return this;
    }

    /**
     * Adds information to create transaction output
     * @param lock The public key or instance of Lock
     * @param amount  The amount to be sent. If this is not set,
     * all remaining amounts of registered utxo will be set.
     */
    public addOutput(lock: Lock | PublicKey, amount?: Amount | JSBI): TxBuilder {
        if (amount === undefined) amount = this.amount;
        const output_amount = amount instanceof Amount ? amount : Amount.make(amount);

        if (Amount.lessThanOrEqual(output_amount, Amount.ZERO_BOA))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        if (Amount.greaterThan(output_amount, this.amount))
            throw new Error(`Insufficient amount. ${amount.toString()}:${this.amount.toString()}`);

        this.outputs.push(new TxOutput(OutputType.Payment, output_amount, lock));
        this.outputs.sort(TxOutput.compare);

        this.amount = Amount.subtract(this.amount, output_amount);

        return this;
    }

    /**
     * Sets the data payload.
     * @param payload
     */
    public assignPayload(payload: Buffer): TxBuilder {
        this.payload = payload;

        return this;
    }

    /**
     * Create and sign a transaction and return the created transactions.
     * @param type The type of Transaction
     * @param lock_height The transaction-level height lock
     * @param tx_fee The transaction fee
     * @param payload_fee The payload fee
     * @param unlock_age The unlock age for each input in the transaction
     * @param unlocker optional callback to generate the unlock script.
     * If one is not provided then a LockType.Key unlock script
     * is automatically generated.
     */
    public sign(
        type: OutputType = OutputType.Payment,
        tx_fee: Amount | JSBI = Amount.make(0),
        payload_fee: Amount | JSBI = Amount.make(0),
        lock_height: Height = new Height("0"),
        unlock_age: number = 0,
        unlocker?: (tx: Transaction, s: RawInput, idx: number) => Unlock
    ): Transaction {
        if (this.inputs.length === 0) throw new Error("No input for transaction.");

        if (type === OutputType.Freeze && this.payload !== undefined && this.payload.length > 0)
            throw new Error("Freeze transaction cannot have data payload.");

        for (const elem of this.outputs) elem.type = type;

        const amount_tx_fee = tx_fee instanceof Amount ? tx_fee : Amount.make(tx_fee);
        const amount_payload_fee = payload_fee instanceof Amount ? payload_fee : Amount.make(payload_fee);
        const total_fee = Amount.add(amount_tx_fee, amount_payload_fee);
        if (Amount.greaterThan(this.amount, total_fee))
            this.addOutput(this.owner_keypair.address, Amount.subtract(this.amount, total_fee));
        else if (Amount.lessThan(this.amount, total_fee)) throw new Error("There is not enough fee.");

        if (this.outputs.length === 0) throw new Error("No output for transaction.");

        const tx = new Transaction(
            this.inputs.map((n) => new TxInput(n.utxo, Unlock.Null, unlock_age)),
            this.outputs,
            this.payload !== undefined ? this.payload : Buffer.alloc(0),
            lock_height
        );

        tx.sort();

        const _unlocker = unlocker !== undefined ? unlocker : this.keyUnlocker;
        tx.inputs.forEach((value, idx) => {
            const raw = this.inputs.find((m) => Buffer.compare(m.utxo.data, value.utxo.data) === 0);
            if (raw !== undefined) value.unlock = _unlocker(tx, raw, idx);
        });

        this.payload = undefined;
        this.inputs = [];
        this.outputs = [];
        this.amount = Amount.make(0);

        return tx;
    }

    /**
     * Uses a random nonce when signing (non-determenistic signature),
     * and defaults to LockType.Key
     * @param tx The instance of the Transaction to sign
     * @param raw_input The instance of the SecretKey to sign
     * @param idx
     * @private
     */
    private keyUnlocker(tx: Transaction, raw_input: RawInput, idx: number): Unlock {
        return Unlock.fromSignature(raw_input.key.sign<Transaction>(tx));
    }
}

/**
 * The class with UTXO and a secret key to be spent it
 */
export class RawInput {
    /**
     * The hash of the UTXO to be spent
     */
    public readonly utxo: Hash;

    /**
     * The secret key to sign when using UTXO
     */
    public readonly key: SecretKey;

    /**
     * Constructor
     * @param utxo The hash of the UTXO to be spent
     * @param key  The secret key to sign when using UTXO
     */
    constructor(utxo: Hash, key: SecretKey) {
        this.utxo = utxo;
        this.key = key;
    }
}
