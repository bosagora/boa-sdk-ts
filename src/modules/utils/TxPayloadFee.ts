/*******************************************************************************

    Contains a class to calculate the fees used to store the data

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";

import JSBI from "jsbi";

/**
 * A class for calculating the fee of transaction data payload
 */
export class TxPayloadFee {
    /**
     * The address of commons budget
     */
    public static CommonsBudgetAddress: string = "boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s";

    /**
     * The maximum size of data payload
     */
    public static TxPayloadMaxSize: number = 1024;

    /**
     * The factor to calculate for the fee of data payload
     */
    public static TxPayloadFeeFactor: number = 200;

    /**
     * Calculates the fee of data payloads
     * @data_size The size of the data
     */
    public static getFee(data_size: number): JSBI {
        if (data_size < 0) throw new Error("Data size cannot be negative.");

        if (data_size > TxPayloadFee.TxPayloadMaxSize) throw new Error("Data size cannot be greater than maximum.");

        const decimal = 100;
        return JSBI.BigInt(
            (Math.round((Math.exp(data_size / TxPayloadFee.TxPayloadFeeFactor) - 1.0) * decimal) * 10000000) / decimal
        );
    }

    /**
     * Calculates the fee of data payloads
     * @data_size The size of the data
     */
    public static getFeeAmount(data_size: number): Amount {
        return Amount.make(TxPayloadFee.getFee(data_size));
    }
}
