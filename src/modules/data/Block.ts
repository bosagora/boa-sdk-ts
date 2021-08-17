/*******************************************************************************

    The class that defines the block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../common/Hash";
import { JSONValidator } from "../utils/JSONValidator";
import { iota } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";
import { BlockHeader } from "./BlockHeader";
import { Transaction } from "./Transaction";

import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines the block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class Block {
    /**
     * The header of the block
     */
    public header: BlockHeader;

    /**
     * The array of the transaction
     */
    public txs: Transaction[];

    /**
     * The merkle tree
     */
    public merkle_tree: Hash[];

    /**
     * Constructor
     * @param header      The header of the block
     * @param txs         The array of the transaction
     * @param merkle_tree The merkle tree
     */
    constructor(header: BlockHeader, txs: Transaction[], merkle_tree: Hash[]) {
        this.header = header;
        this.txs = txs;
        this.merkle_tree = merkle_tree;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Block` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("Block", value);

        const transactions: Transaction[] = [];
        for (const elem of value.txs) transactions.push(Transaction.reviver("", elem));

        const merkle_tree: Hash[] = [];
        for (const elem of value.merkle_tree) merkle_tree.push(new Hash(elem));

        return new Block(BlockHeader.reviver("", value.header), transactions, merkle_tree);
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        this.header.serialize(buffer);

        VarInt.fromNumber(this.txs.length, buffer);
        for (const tx of this.txs) tx.serialize(buffer);

        VarInt.fromNumber(this.merkle_tree.length, buffer);
        for (const h of this.merkle_tree) h.serialize(buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Block {
        const header = BlockHeader.deserialize(buffer);

        let length = VarInt.toNumber(buffer);
        const txs = iota(length).map(() => Transaction.deserialize(buffer));

        length = VarInt.toNumber(buffer);
        const merkle_tree = iota(length).map(() => Hash.deserialize(buffer));

        return new Block(header, txs, merkle_tree);
    }
}
