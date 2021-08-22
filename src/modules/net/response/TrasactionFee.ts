/*******************************************************************************

    Contains definition for the fee of the transaction

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { JSONValidator } from "../../utils/JSONValidator";

/**
 * Define the interface of the fee of the transaction
 */
export class TransactionFee {
    /**
     * The size of the transaction
     */
    tx_size: number;

    /**
     * The transaction fee for a medium speed
     */
    medium: string;

    /**
     * The transaction fee for a high speed
     */
    high: string;

    /**
     * The transaction fee for a low speed
     */
    low: string;

    /**
     * Constructor
     * @param tx_size The size of the transaction
     * @param medium The transaction fee for a medium speed
     * @param high The transaction fee for a high speed
     * @param low The transaction fee for a low speed
     */
    constructor(tx_size: number, medium: string, high: string, low: string) {
        this.tx_size = tx_size;
        this.medium = medium;
        this.high = high;
        this.low = low;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `TransactionFee` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("TransactionFee", value);
        return new TransactionFee(value.tx_size, value.medium, value.high, value.low);
    }
}
