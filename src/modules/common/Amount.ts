/*******************************************************************************

    The class that defines the Amount.
    BOA is an integer with seven decimal points.
    It is stored in BigInteger without decimal point.
    Therefore, 1BOA is stored as 10,000,000.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { VarInt } from "../utils/VarInt";
import { hashPart } from "./Hash";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines the Amount.
 * BOA is an integer with seven decimal points.
 * It is stored in BigInteger without decimal point.
 * Therefore, 1BOA is stored as 10,000,000.
 */
export class Amount {
    /**
     * 0 on BigInt
     */
    public static readonly ZERO_JSBI: JSBI = JSBI.BigInt(0);

    /**
     * Value when 1BOA is stored
     */
    public static readonly UNIT_PER_COIN: number = 10_000_000;

    /**
     * BigInt value when 1BOA is stored
     */
    public static readonly UNIT_PER_COIN_JSBI: JSBI = JSBI.BigInt(10_000_000);

    /**
     * Decimal Digits in a BOA
     */
    public static readonly LENGTH_DECIMAL: number = 7;

    /**
     * Amount value of 0 BOA
     */
    public static readonly ZERO_BOA: Amount = new Amount(Amount.ZERO_JSBI);

    /**
     * Minimum amount required for freezing
     */
    public static readonly MIN_FREEZE_BOA: Amount = new Amount(
        JSBI.multiply(JSBI.BigInt(Amount.UNIT_PER_COIN), JSBI.BigInt(40_000))
    );

    /**
     * Internal data storage
     * @private
     */
    private readonly _value: JSBI;

    /**
     * Constructor
     * @param value The monetary amount. The unit is 10^-7 BOA, 1BOA is 10,000,000
     */
    constructor(value: JSBI | number) {
        const jsbi_value = value instanceof JSBI ? value : JSBI.BigInt(value);
        if (!Amount.isValid(jsbi_value)) throw new Error("Invalid input value to Amount");
        this._value = jsbi_value;
    }

    /**
     * The monetary amount stored inside.
     */
    public get value() {
        return this._value;
    }

    /**
     * Create new Amount instance
     * @param value The monetary amount this new instance represents.
     */
    public static make(value: Amount | JSBI | number | string): Amount {
        if (value instanceof Amount) return new Amount(value.value);
        return new Amount(JSBI.BigInt(value));
    }

    /**
     * If value is greater than or equal to zero, return true, otherwise false.
     * @param value The monetary amount to be verified.
     */
    public static isValid(value: JSBI): boolean {
        return JSBI.greaterThanOrEqual(value, Amount.ZERO_JSBI);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        hashPart(this.value, buffer);
    }

    /**
     * Writes to the string
     */
    public toString() {
        return this.value.toString();
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Amount` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): Amount {
        if (key !== "") return value;

        return new Amount(JSBI.BigInt(value));
    }

    /**
     * Converts this object to its JSON representation
     *
     * Use `string` as primitive types, as JS is only precise up to
     * `2 ** 53 - 1` but we can get numbers up to `2 ** 64 - 1`.
     */
    public toJSON(): string {
        return this.value.toString();
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromJSBI(this.value, buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Amount {
        return new Amount(VarInt.toJSBI(buffer));
    }

    /**
     * Multiplication
     * @param x The Amount
     * @param y The Number
     * @returns the multiplication of x and y
     */
    public static multiply(x: Amount, y: number): Amount {
        return new Amount(JSBI.multiply(x.value, JSBI.BigInt(y)));
    }

    /**
     * Division
     * @param x The Amount
     * @param y The Number
     * @returns x divided by y
     */
    public static divide(x: Amount, y: number): Amount {
        return new Amount(JSBI.divide(x.value, JSBI.BigInt(y)));
    }

    /**
     * Remainder
     * @param x The Amount
     * @param y The Number
     * @returns Remaining when x is divided by y
     */
    public static remainder(x: Amount, y: number): Amount {
        return new Amount(JSBI.remainder(x.value, JSBI.BigInt(y)));
    }

    /**
     * Addition
     * @param x The first Amount
     * @param y The second Amount
     * @returns x plus y
     */
    public static add(x: Amount, y: Amount): Amount {
        return new Amount(JSBI.add(x.value, y.value));
    }

    /**
     * Subtraction
     * @param x The first Amount
     * @param y The second Amount
     * @returns x minus y
     */
    public static subtract(x: Amount, y: Amount): Amount {
        return new Amount(JSBI.subtract(x.value, y.value));
    }

    /**
     * Compare whether x is less than y.
     * @param x The first Amount
     * @param y The second Amount
     * @returns true if x is less than y, false otherwise
     */
    public static lessThan(x: Amount, y: Amount): boolean {
        return JSBI.lessThan(x.value, y.value);
    }

    /**
     * Compare whether x is less than or equal y.
     * @param x The first Amount
     * @param y The second Amount
     * @returns true if x is less than or equal y, false otherwise
     */
    public static lessThanOrEqual(x: Amount, y: Amount): boolean {
        return JSBI.lessThanOrEqual(x.value, y.value);
    }

    /**
     * Compare whether x is greater than y.
     * @param x The first Amount
     * @param y The second Amount
     * @returns true if x is greater than y, false otherwise
     */
    public static greaterThan(x: Amount, y: Amount): boolean {
        return JSBI.greaterThan(x.value, y.value);
    }

    /**
     * Compare whether x is greater than or equal y.
     * @param x The first Amount
     * @param y The second Amount
     * @returns true if x is greater than or equal y, false otherwise
     */
    public static greaterThanOrEqual(x: Amount, y: Amount): boolean {
        return JSBI.greaterThanOrEqual(x.value, y.value);
    }

    /**
     * Compare whether x and y are equal.
     * @param x The first Amount
     * @param y The second Amount
     * @returns true if x and y are equal, false otherwise
     */
    public static equal(x: Amount, y: Amount): boolean {
        return JSBI.equal(x.value, y.value);
    }

    /**
     * Compare whether x and y are not equal.
     * @param x The first Amount
     * @param y The second Amount
     * @returns true if x and y are not equal, false otherwise
     */
    public static notEqual(x: Amount, y: Amount): boolean {
        return JSBI.notEqual(x.value, y.value);
    }

    /**
     * @returns The integral part of the amount (value / 1 BOA)
     */
    public integral(): number {
        return JSBI.toNumber(JSBI.divide(this.value, Amount.UNIT_PER_COIN_JSBI));
    }

    /**
     * @returns The decimal part of the amount (value % 1 BOA)
     */
    public decimal(): number {
        return JSBI.toNumber(JSBI.remainder(this.value, Amount.UNIT_PER_COIN_JSBI));
    }
}

/**
 * Convert the amount of BOA units with seven decimal points into `Amount` with internal data.
 * @param value The monetary amount to be converted
 */
export function BOA(value: string | number): Amount {
    const amount = value.toString();
    if (amount === "") return new Amount(Amount.ZERO_JSBI);
    const numbers = amount.replace(/[,_]/gi, "").split(".");
    if (numbers.length === 1) return new Amount(JSBI.multiply(JSBI.BigInt(numbers[0]), Amount.UNIT_PER_COIN_JSBI));
    let tx_decimal = numbers[1];
    if (tx_decimal.length > Amount.LENGTH_DECIMAL) tx_decimal = tx_decimal.slice(0, Amount.LENGTH_DECIMAL);
    else if (tx_decimal.length < Amount.LENGTH_DECIMAL) tx_decimal = tx_decimal.padEnd(Amount.LENGTH_DECIMAL, "0");
    const integral = JSBI.multiply(JSBI.BigInt(numbers[0]), Amount.UNIT_PER_COIN_JSBI);
    return new Amount(JSBI.add(integral, JSBI.BigInt(tx_decimal)));
}
