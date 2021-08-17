/*******************************************************************************

    The class that defines encryption key

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hashPart } from "../common/Hash";
import { Height } from "../common/Height";
import { PublicKey } from "../common/KeyPair";
import { Signature } from "../common/Signature";

import { SmartBuffer } from "smart-buffer";

export class EncryptionKey {
    /**
     * The app name
     */
    public app_name: string;

    /**
     * The block height
     */
    public height: Height;

    /**
     * Encryption key
     */
    public value: Hash;

    /**
     * Validator that owns this encryption key
     */
    public validator: PublicKey;

    /**
     * Signature with the validator private key
     */
    public signature: Signature;

    /**
     * Constructor
     * @param app_name  The app name
     * @param height    The block height
     * @param value     Encryption key
     * @param validator Validator that owns this encryption key
     * @param signature Signature with the validator private key
     */
    constructor(app_name: string, height: Height, value: Hash, validator: PublicKey, signature?: Signature) {
        this.app_name = app_name;
        this.height = height;
        this.value = value;
        this.validator = validator;
        if (signature !== undefined) this.signature = signature;
        else this.signature = new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        hashPart(Buffer.from(this.app_name), buffer);
        this.height.computeHash(buffer);
        this.value.computeHash(buffer);
        this.validator.computeHash(buffer);
    }

    /**
     * Verify that a signature with the validator address
     * @returns If OK, return true, otherwise return false.
     */
    public verify(): boolean {
        return this.validator.verify<EncryptionKey>(this.signature, this);
    }
}
