/*******************************************************************************

    Contains definition for the balance for one address

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { JSONValidator } from "../../utils/JSONValidator";
import JSBI from "jsbi";

/**
 * Class that defines the balance for one address
 */
export class Balance {
    public address: string;
    public balance: JSBI;
    public spendable: JSBI;
    public frozen: JSBI;
    public locked: JSBI;

    /**
     *
     * @param address
     * @param balance
     * @param spendable
     * @param frozen
     * @param locked
     */
    constructor(address: string, balance: JSBI, spendable: JSBI, frozen: JSBI, locked: JSBI) {
        this.address = address;
        this.balance = balance;
        this.spendable = spendable;
        this.frozen = frozen;
        this.locked = locked;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `TxInputs` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("Balance", value);
        return new Balance(
            value.address,
            JSBI.BigInt(value.balance),
            JSBI.BigInt(value.spendable),
            JSBI.BigInt(value.frozen),
            JSBI.BigInt(value.locked)
        );
    }
}
