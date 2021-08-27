/*******************************************************************************

    Contains the signature definitions

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Signature } from "../common/Signature";
import { Utils } from "../utils/Utils";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * Used to select the behavior of the signature creation & validation algorithm
 */
export enum SigHash {
    /**
     * default, signs the entire transaction
     */
    All = 1 << 0,

    /**
     * blanks out the associated Input, for use with Eltoo floating txs
     */
    NoInput = 1 << 1,

    /**
     * Signs only a single output
     */
    Single = 1 << 2,

    /**
     * Signs only a single input
     * Modifier that can only be used with other SigHash types
     */
    AnyoneCanPay = 1 << 3,

    /**
     * Combined types
     */
    Single_AnyoneCanPay = Single | AnyoneCanPay,

    /**
     * Combined types
     */
    Single_NoInput_AnyoneCanPay = Single | NoInput | AnyoneCanPay,
}

/**
 * Validates that the given `SigHash` is one of the known flags or one of
 * the accepted combination of flags.
 * @param sig_hash the `SigHash` to validate
 * @returns true if this is one of the known flags or accepted combination of flags
 */
function isValidSigHash(sig_hash: SigHash): boolean {
    switch (sig_hash) {
        case SigHash.All:
        case SigHash.NoInput:
        case SigHash.Single:
        case SigHash.Single_AnyoneCanPay:
        case SigHash.Single_NoInput_AnyoneCanPay:
            break;

        case SigHash.AnyoneCanPay:
        default:
            return false;
    }

    return true;
}

/**
 * Contains the Signature and its associated SigHash
 */
export class SigPair {
    /**
     * The signature (which also signs the sig_hash below)
     */
    public signature: Signature;

    /**
     * Selects behavior of the signature creation & validation algorithm
     */
    public sig_hash: SigHash;

    /**
     * Situational output index
     */
    public output_idx: number;

    /**
     * Constructor
     * @param signature     The signature (which also signs the sig_hash below)
     * @param sig_hash      Selects behavior of the signature creation & validation algorithm
     * @param output_idx    Situational output index
     */
    constructor(signature: Signature, sig_hash: SigHash = SigHash.All, output_idx: number = 0) {
        this.signature = signature;
        this.sig_hash = sig_hash;
        if (!isValidSigHash(this.sig_hash)) throw new Error("SigHash is not valid.");
        this.output_idx = output_idx;
    }

    /**
     * Encode SigPair to Buffer
     * @returns bytes contains the <Signature, SigHash> tuple
     */
    public encode(): Buffer {
        const bytes = new SmartBuffer();
        bytes.writeBuffer(this.signature.data);
        bytes.writeUInt8(this.sig_hash);
        if ((this.sig_hash & SigHash.Single) !== 0) {
            const bigint_bytes = Buffer.alloc(8);
            Utils.writeJSBigIntLE(bigint_bytes, JSBI.BigInt(this.output_idx));
            bytes.writeBuffer(bigint_bytes);
        }
        return bytes.toBuffer();
    }

    /**
     * Decode SigPair from Buffer
     * @param bytes contains the <Signature, SigHash> tuple
     * @returns the signature tuple if the Signature was encoded
     * correctly and the SigHash is one of the known flags or
     * accepted combination of flags.
     */
    public static decode(bytes: Buffer): SigPair {
        if (bytes.length < Signature.Width + Utils.SIZE_OF_BYTE)
            throw new Error("Encoded signature tuple is of the wrong size");
        const signature = new Signature(bytes.slice(0, Signature.Width));
        bytes = bytes.slice(Signature.Width);
        const sig_hash = bytes[0] as SigHash;
        bytes = bytes.slice(Utils.SIZE_OF_BYTE);
        if (!isValidSigHash(sig_hash)) throw new Error("Unknown SigHash");
        let output_idx: JSBI = JSBI.BigInt(0);
        if ((sig_hash & SigHash.Single) !== 0) {
            if (bytes.length < Utils.SIZE_OF_LONG) throw new Error("Encoded signature does not have output idx");
            output_idx = Utils.readJSBigIntLE(bytes);
        }
        return new SigPair(signature, sig_hash, JSBI.toNumber(output_idx));
    }
}
