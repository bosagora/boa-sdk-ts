/*******************************************************************************

    The class that defines the header of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { BitMask } from "./BitMask";
import { Enrollment } from "./Enrollment";
import { JSONValidator } from "../utils/JSONValidator";
import { Hash, hashPart } from "../common/Hash";
import { Height } from "../common/Height";
import { Signature } from "../common/Signature";
import { Utils, iota } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines the header of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class BlockHeader {
    /**
     * The hash of the previous block in the chain of blocks
     */
    public prev_block: Hash;

    /**
     * The block height (genesis is #0)
     */
    public height: Height;

    /**
     * The hash of the merkle root of the transactions
     */
    public merkle_root: Hash;

    /**
     * The bit-field containing the validators' key indices which signed the block
     */
    public validators: BitMask;

    /**
     * The Schnorr multisig of all validators which signed this block
     */
    public signature: Signature;

    /**
     * The enrolled validators
     */
    public enrollments: Enrollment[];

    /**
     * Hash of random seed of the preimages for this this height
     */
    public random_seed: Hash;

    /**
     * List of indices to the validator UTXO set which have not revealed the preimage
     */
    public missing_validators: Array<number>;

    /**
     * Block seconds offset from Genesis Timestamp in `ConsensusParams`
     */
    public time_offset: number;

    /**
     * Constructor
     * @param prev_block  The Hash of the previous block in the chain of blocks
     * @param height      The block height
     * @param merkle_root The hash of the merkle root of the transactions
     * @param validators  The bit-field containing the validators' key indices which signed the block
     * @param signature   The Schnorr multisig of all validators which signed this block
     * @param enrollments The enrolled validators
     * @param random_seed Hash of random seed of the preimages for this this height
     * @param missing_validators List of indices to the validator UTXO set which have not revealed the preimage
     * @param time_offset Block seconds offset from Genesis Timestamp in `ConsensusParams`
     */
    constructor(
        prev_block: Hash,
        height: Height,
        merkle_root: Hash,
        validators: BitMask,
        signature: Signature,
        enrollments: Enrollment[],
        random_seed: Hash,
        missing_validators: Array<number>,
        time_offset: number
    ) {
        this.prev_block = prev_block;
        this.height = height;
        this.merkle_root = merkle_root;
        this.validators = validators;
        this.signature = signature;
        this.enrollments = enrollments;
        this.random_seed = random_seed;
        this.missing_validators = missing_validators;
        this.time_offset = time_offset;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `BlockHeader` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("BlockHeader", value);

        return new BlockHeader(
            new Hash(value.prev_block),
            new Height(value.height),
            new Hash(value.merkle_root),
            BitMask.fromString(value.validators),
            new Signature(value.signature),
            value.enrollments.map((elem: any) => Enrollment.reviver("", elem)),
            new Hash(value.random_seed),
            value.missing_validators.map((elem: number) => elem),
            value.time_offset
        );
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.prev_block.computeHash(buffer);
        this.height.computeHash(buffer);
        this.merkle_root.computeHash(buffer);
        for (let elem of this.enrollments) elem.computeHash(buffer);
        this.random_seed.computeHash(buffer);
        for (let elem of this.missing_validators) buffer.writeUInt32LE(elem);
        hashPart(JSBI.BigInt(this.time_offset), buffer);
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        this.prev_block.serialize(buffer);
        this.merkle_root.serialize(buffer);
        this.random_seed.serialize(buffer);
        this.signature.serialize(buffer);
        this.validators.serialize(buffer);
        this.height.serialize(buffer);

        VarInt.fromNumber(this.enrollments.length, buffer);
        for (let elem of this.enrollments) elem.serialize(buffer);

        VarInt.fromNumber(this.missing_validators.length, buffer);
        for (let elem of this.missing_validators) VarInt.fromNumber(elem, buffer);

        VarInt.fromNumber(this.time_offset, buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): BlockHeader {
        let prev_block = Hash.deserialize(buffer);
        let merkle_root = Hash.deserialize(buffer);
        let random_seed = Hash.deserialize(buffer);
        let signature = Signature.deserialize(buffer);
        let validators = BitMask.deserialize(buffer);
        let height = Height.deserialize(buffer);

        let length = VarInt.toNumber(buffer);
        let enrollments = iota(length).map(() => Enrollment.deserialize(buffer));

        length = VarInt.toNumber(buffer);
        let missing_validators = iota(length).map(() => VarInt.toNumber(buffer));

        let time_offset = VarInt.toNumber(buffer);

        return new BlockHeader(
            prev_block,
            height,
            merkle_root,
            validators,
            signature,
            enrollments,
            random_seed,
            missing_validators,
            time_offset
        );
    }
}
