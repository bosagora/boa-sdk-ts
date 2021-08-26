/*******************************************************************************

    The class that defines the transaction of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashPart } from "../common/Hash";
import { Height } from "../common/Height";
import { JSONValidator } from "../utils/JSONValidator";
import { iota, Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";
import { TxInput } from "./TxInput";
import { OutputType, TxOutput } from "./TxOutput";

import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines the transaction of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class Transaction {
    /**
     * The array of references to the unspent output of the previous transaction
     */
    public inputs: TxInput[];

    /**
     * The array of newly created outputs
     */
    public outputs: TxOutput[];

    /**
     * The data payload to store
     */
    public payload: Buffer;

    /**
     * This transaction may only be included in a block with `height >= lock_height`.
     * Note that another tx with a lower lock time could double-spend this tx.
     *
     */
    public lock_height: Height;

    /**
     * Constructor
     * @param inputs  The array of references to the unspent output of the previous transaction
     * @param outputs The array of newly created outputs
     * @param payload The data payload to store
     * @param lock_height The lock height
     */
    constructor(
        inputs: TxInput[],
        outputs: TxOutput[],
        payload: Buffer | string,
        lock_height: Height = new Height("0")
    ) {
        this.inputs = inputs;
        this.outputs = outputs;
        if (typeof payload === "string") this.payload = Buffer.from(payload, "base64");
        else this.payload = Buffer.from(payload);
        this.lock_height = lock_height;
        this.sort();
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Transaction` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("Transaction", value);

        return new Transaction(
            value.inputs.map((elem: any) => TxInput.reviver("", elem)),
            value.outputs.map((elem: any) => TxOutput.reviver("", elem)),
            value.payload,
            new Height(value.lock_height)
        );
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.sort();
        hashPart(this.inputs, buffer);
        hashPart(this.outputs, buffer);
        hashPart(this.payload, buffer);
        hashPart(this.lock_height, buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(): any {
        return {
            inputs: this.inputs,
            outputs: this.outputs,
            payload: this.payload.toString("base64"),
            lock_height: this.lock_height,
        };
    }

    /**
     * Returns the transaction size.
     */
    public getNumberOfBytes(): number {
        let bytes_length =
            this.payload.length + //  Transaction.payload
            Utils.SIZE_OF_LONG; //  Transaction.lock_height

        for (const elem of this.inputs) bytes_length += elem.getNumberOfBytes();
        for (const elem of this.outputs) bytes_length += elem.getNumberOfBytes();

        return bytes_length;
    }

    /**
     * Returns the estimated transaction size.
     * @param num_input The number of the inputs
     * @param num_output The number of the outputs
     * @param num_bytes_payload The bytes of the payload
     */
    public static getEstimatedNumberOfBytes(num_input: number, num_output: number, num_bytes_payload: number): number {
        return (
            Utils.SIZE_OF_LONG +
            num_bytes_payload +
            num_input * TxInput.getEstimatedNumberOfBytes() +
            num_output * TxOutput.getEstimatedNumberOfBytes()
        );
    }

    /**
     * Sort the transaction inputs and outputs
     */
    public sort() {
        this.inputs.sort(TxInput.compare);
        this.outputs.sort(TxOutput.compare);
    }

    /**
     * A `Freeze` transaction is one that has one or more `Freeze` outputs
     * If there is more than one output then it is allowed to have a single
     * `Payment` output for a refund of any amount
     */
    public isFreeze(): boolean {
        return this.outputs.find((m) => m.type === OutputType.Freeze) !== undefined;
    }

    /**
     * A `Coinbase` transaction is one that has one or more `Coinbase` outputs
     * However if all outputs are not `Coinbase` then it will fail validation
     */
    public isCoinbase(): boolean {
        return this.outputs.find((m) => m.type === OutputType.Coinbase) !== undefined;
    }

    /**
     * A `Payment` transaction have all outputs of type "Payment".
     */
    public isPayment(): boolean {
        return this.outputs.find((m) => m.type !== OutputType.Payment) === undefined;
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromNumber(this.inputs.length, buffer);
        for (const elem of this.inputs) elem.serialize(buffer);

        VarInt.fromNumber(this.outputs.length, buffer);
        for (const elem of this.outputs) elem.serialize(buffer);

        VarInt.fromNumber(this.payload.length, buffer);
        buffer.writeBuffer(this.payload);

        this.lock_height.serialize(buffer);
    }

    /**
     * Deserialize as binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Transaction {
        let length = VarInt.toNumber(buffer);
        const inputs = iota(length).map(() => TxInput.deserialize(buffer));

        length = VarInt.toNumber(buffer);
        const outputs = iota(length).map(() => TxOutput.deserialize(buffer));

        length = VarInt.toNumber(buffer);
        const payload = Utils.readBuffer(buffer, length);

        const lock_height = Height.deserialize(buffer);

        return new Transaction(inputs, outputs, payload, lock_height);
    }
}
