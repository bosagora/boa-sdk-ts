/*******************************************************************************

    The class that defines the preImageInfo.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../common/Hash";
import { Height } from "../common/Height";
import { JSONValidator } from "../utils/JSONValidator";

/**
 * The class that defines the preImageInfo.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class PreImageInfo {
    /**
     * UTXO used to enroll
     */
    public utxo: Hash;

    /**
     * Value of the pre-image
     */
    public hash: Hash;

    /**
     * The Height of the block that this pre-image is for
     */
    public height: Height;

    /**
     * Construct a new instance of this object
     *
     * @param utxo       The UTXO used to enroll
     * @param hash       The value of the pre-image
     * @param height     The Height of the block that this pre-image is for
     */
    constructor(utxo: Hash, hash: Hash, height: Height) {
        this.utxo = utxo;
        this.hash = hash;
        this.height = height;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `PreImageInfo` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("PreImageInfo", value);

        return new PreImageInfo(new Hash(value.utxo), new Hash(value.hash), new Height(value.height));
    }
}
