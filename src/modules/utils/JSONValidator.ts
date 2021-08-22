/*******************************************************************************

    The class that defines the Validator.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import Ajv from "ajv";

/**
 * @ignore
 */
const ajv = new Ajv();

/**
 * Class for validating JSON data
 */
export class JSONValidator {
    /**
     * @ignore
     */
    private static schemas: Map<string, object> = new Map([
        [
            "Block",
            {
                title: "Block",
                type: "object",
                properties: {
                    header: {
                        type: "object",
                    },
                    txs: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    merkle_tree: {
                        items: {
                            type: "string",
                        },
                        type: "array",
                    },
                },
                additionalProperties: false,
                required: ["header", "txs", "merkle_tree"],
            },
        ],
        [
            "BlockHeader",
            {
                title: "BlockHeader",
                type: "object",
                properties: {
                    prev_block: {
                        type: "string",
                    },
                    height: {
                        type: "string",
                    },
                    merkle_root: {
                        type: "string",
                    },
                    validators: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                    enrollments: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    random_seed: {
                        type: "string",
                    },
                    missing_validators: {
                        items: {
                            type: "number",
                        },
                        type: "array",
                    },
                    time_offset: {
                        type: "number",
                    },
                },
                additionalProperties: false,
                required: [
                    "prev_block",
                    "height",
                    "merkle_root",
                    "validators",
                    "signature",
                    "enrollments",
                    "random_seed",
                    "missing_validators",
                    "time_offset",
                ],
            },
        ],
        [
            "Enrollment",
            {
                title: "Enrollment",
                type: "object",
                properties: {
                    utxo_key: {
                        type: "string",
                    },
                    commitment: {
                        type: "string",
                    },
                    cycle_length: {
                        type: "number",
                    },
                    enroll_sig: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["utxo_key", "commitment", "cycle_length", "enroll_sig"],
            },
        ],
        [
            "PreImageInfo",
            {
                title: "PreImageInfo",
                type: "object",
                properties: {
                    utxo: {
                        type: "string",
                    },
                    hash: {
                        type: "string",
                    },
                    height: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["utxo", "hash", "height"],
            },
        ],
        [
            "Transaction",
            {
                title: "Transaction",
                type: "object",
                properties: {
                    inputs: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    outputs: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    payload: {
                        type: "string",
                    },
                    lock_height: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["inputs", "outputs", "payload", "lock_height"],
            },
        ],
        [
            "TxInput",
            {
                title: "TxInput",
                type: "object",
                properties: {
                    utxo: {
                        type: "string",
                    },
                    unlock: {
                        type: "object",
                    },
                    unlock_age: {
                        type: "integer",
                    },
                },
                additionalProperties: false,
                required: ["utxo", "unlock", "unlock_age"],
            },
        ],
        [
            "TxOutput",
            {
                title: "TxOutput",
                type: "object",
                properties: {
                    type: {
                        type: "number",
                    },
                    value: {
                        type: "string",
                    },
                    lock: {
                        type: "object",
                    },
                },
                additionalProperties: false,
                required: ["type", "value", "lock"],
            },
        ],
        [
            "Lock",
            {
                title: "Lock",
                type: "object",
                properties: {
                    type: {
                        type: "integer",
                    },
                    bytes: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["type", "bytes"],
            },
        ],
        [
            "Unlock",
            {
                title: "Lock",
                type: "object",
                properties: {
                    bytes: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["bytes"],
            },
        ],
        [
            "Balance",
            {
                title: "Balance",
                type: "object",
                properties: {
                    address: {
                        type: "string",
                    },
                    balance: {
                        type: "string",
                    },
                    spendable: {
                        type: "string",
                    },
                    frozen: {
                        type: "string",
                    },
                    locked: {
                        type: "string",
                    },
                },
                additionalProperties: true,
                required: ["address", "balance", "spendable", "frozen", "locked"],
            },
        ],
        [
            "TransactionFee",
            {
                title: "TransactionFee",
                type: "object",
                properties: {
                    tx_size: {
                        type: "number",
                    },
                    medium: {
                        type: "string",
                    },
                    high: {
                        type: "string",
                    },
                    low: {
                        type: "string",
                    },
                },
                additionalProperties: true,
                required: ["tx_size", "medium", "high", "low"],
            },
        ],
        [
            "UnspentTxOutput",
            {
                title: "UnspentTxOutput",
                type: "object",
                properties: {
                    utxo: {
                        type: "string",
                    },
                    type: {
                        type: "integer",
                    },
                    amount: {
                        type: "string",
                    },
                    height: {
                        type: "string",
                    },
                    time: {
                        type: "integer",
                    },
                    unlock_height: {
                        type: "string",
                    },
                    lock_type: {
                        type: "integer",
                    },
                    lock_bytes: {
                        type: "string",
                    },
                },
                additionalProperties: true,
                required: ["utxo", "type", "height", "time", "unlock_height", "amount", "lock_type", "lock_bytes"],
            },
        ],
    ]);

    /**
     * The map of validation functions created to reuse -
     * an once created validation function.
     */
    private static validators = new Map<string, Ajv.ValidateFunction>();

    /**
     * Create a validation function using the schema.
     * Return it if it has already been created.
     * @param name The JSON schema name
     * @returns The function of validation
     */
    private static buildValidator(name: string): Ajv.ValidateFunction {
        let validator = JSONValidator.validators.get(name);
        if (validator === undefined) {
            const schema = JSONValidator.schemas.get(name);
            if (schema !== undefined) {
                validator = ajv.compile(schema);
                JSONValidator.validators.set(name, validator);
            } else throw new Error(`Non-existent schema accessed: ${name}`);
        }
        return validator as Ajv.ValidateFunction;
    }

    /**
     * Check the validity of a JSON data.
     * @param validator The Function to validate JSON
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise `false`
     */
    private static isValid(validator: Ajv.ValidateFunction, candidate: any) {
        return validator(candidate) === true;
    }

    /**
     * Check the validity of a JSON data.
     * @param schema_name The JSON schema name
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise throw an `Error`
     */
    public static isValidOtherwiseThrow(schema_name: string, candidate: any) {
        const validator = this.buildValidator(schema_name);
        if (this.isValid(validator, candidate)) {
            return true;
        } else if (validator.errors !== undefined && validator.errors !== null && validator.errors.length > 0) {
            if (validator.errors.length === 1) {
                throw new Error(`Validation failed: ${schema_name} - ` + validator.errors[0].message);
            } else {
                const messages = [];
                for (const error of validator.errors) messages.push(error.message);
                throw new Error(`Validation failed: ${schema_name} - ` + messages.join("\n"));
            }
        } else {
            throw new Error(`Validation failed: ${schema_name}`);
        }
    }

    /**
     * Check the validity of a JSON data.
     * @param schema_name The JSON schema name
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise `false`
     */
    public static isValidOtherwiseNoThrow(schema_name: string, candidate: any) {
        const validator = this.buildValidator(schema_name);
        return this.isValid(validator, candidate);
    }
}
