/*******************************************************************************

    Contains the supported opcodes for the basic execution engine (non-webASM)

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

export enum OP {
    /**
     * Used to encode a small data push to the stack (up to 75 bytes),
     * may be used with `case PUSH_BYTES_1: .. case PUSH_BYTES_64:` syntax.
     */
    PUSH_BYTES_1 = 0x01,

    /**
     * Ditto
     */
    PUSH_BYTES_75 = 0x4b, // 75 decimal

    /**
     * The next 1 byte contains the number of bytes to push onto the stack.
     * This opcode may not be used to encode data pushes of `<= 75` bytes.
     * PUSH_BYTES_* must be used for this purpose instead.
     */
    PUSH_DATA_1 = 0x4c,

    /**
     * The next 2 bytes (ushort in LE format) contains the number of bytes to
     * push onto the stack.
     * This opcode may not be used to encode data pushes of `<= 255` bytes.
     * `PUSH_DATA_1` must be used for this purpose instead.
     */
    PUSH_DATA_2 = 0x4d,

    /**
     * This opcode may be reserved for a future PUSH_DATA_4.
     */
    // OP_RESERVED_1 = 0x4E,

    /**
     * Pushes `1` to `5` to the stack. To be used with counts for some opcodes
     * such as `CHECK_SEQ_SIG`.
     */
    PUSH_NUM_1 = 0x4f,
    PUSH_NUM_2 = 0x50,
    PUSH_NUM_3 = 0x51,
    PUSH_NUM_4 = 0x52,
    PUSH_NUM_5 = 0x53,

    /**
     * Pushes True onto the stack. Used by conditional opcodes.
     * Additionally if after lock + unlock script execution the only
     * value on the stack is TRUE, the script will be considered valid.
     * Any other value (FALSE or otherwise) on the top of the stack
     * after execution will cause the script to fail.
     */
    TRUE = 0x54,

    /**
     * Pushes False onto the stack. Used by conditional opcodes.
     */
    FALSE = 0x00,

    /**
     * Conditionals
     */
    IF = 0x55,
    NOT_IF = 0x56,
    ELSE = 0x57,
    END_IF = 0x58,

    /**
     * Pop the top item on the stack, hash it, and push the hash to the stack.
     * Note that the item being hashed is a byte array.
     */
    HASH = 0x59,

    /**
     * Duplicate the item on the stack. Equivalent to `value = pop()` and
     * `push(value); push(value);`
     */
    DUP = 0x5a,

    /**
     * Pops two items from the stack. Checks that the items are equal to each
     * other, and pushes either `TRUE` or `FALSE` to the stack.
     */
    CHECK_EQUAL = 0x5b,

    /**
     * Ditto, but instead of pushing to the stack it will cause the script
     * execution to fail if the two items are not equal to each other.
     */
    VERIFY_EQUAL = 0x5c,

    /**
     * Verify the height lock of a spending Transaction. Expects an 8-byte
     * unsigned integer as the height on the stack, and verifies that the
     * Transaction's `lock_height` is greater than or equal to this value.
     */
    VERIFY_LOCK_HEIGHT = 0x5d,

    /**
     * Verify the time lock of the associated spending Input. Expects a
     * 4-byte unsigned integer as the unlock age on the stack, and verifies
     * that the Input's `unlock_age` is greater than or equal to this value.
     */
    VERIFY_UNLOCK_AGE = 0x5e,

    /**
     * Pops two items from the stack. The two items must be a Point (Schnorr),
     * and a Signature. If the items cannot be deserialized as a Point and
     * Signature, the script validation fails.
     * The signature is then validated using Schnorr, if the signature is
     * valid then `TRUE` is pushed to the stack.
     */
    CHECK_SIG = 0x5f,

    /**
     * Ditto, but instead of pushing the result to the stack it will cause the
     * script execution to fail if the signature is invalid
     */
    VERIFY_SIG = 0x60,

    /**
     * Supports non-interactive threshold multi-signatures. A combination
     * of `N / M` is supported where `N <= M` and where the number of keys
     * and signatures does not exceed 5.
     * Pops an item from the stock which is the count of public keys that
     * should be read from the stack. It pops those public keys, and then
     * pops another item which is the number of required signatures.
     * Then it pops that many signatures from the stack. Then it walks through
     * all the public keys and validates the signatures in sequence. If a
     * key did not validate, it's removed from the internal list. If we've
     * ran out of keys and the number of valid signatures is less than
     * the required amount it means signature validation has failed.
     * It pushes the result of validation to the tack.
     * The keys and signatures must be placed in the same order on the stack.
     * Supports up to 5 public keys total as the signature validation is not
     * as efficient as alternative implementations such as MuSig.
     */
    CHECK_MULTI_SIG = 0x61,

    /**
     * Ditto, but instead of pushing the result to the stack it will cause the
     * script execution to fail if the signature is invalid
     */
    VERIFY_MULTI_SIG = 0x62,

    /**
     * Expects a new sequence ID on the stack and an expected sequence ID
     * on the stack. Verifies `sequence_id >= expected_id`, and adds
     * `sequence_id` to the signature hash. The matching Input is blanked
     * to implement floating transactions, as defined in Eltoo.
     */
    CHECK_SEQ_SIG = 0x63,

    /**
     * Ditto
     */
    VERIFY_SEQ_SIG = 0x64,
}

/**
 * Check if the opcode is normal
 * @param value opcode opcode to check
 * @returns true if the opcode is normal
 */
export function isOpcode(value: number): boolean {
    for (const member in OP) if (OP.hasOwnProperty(member)) if (Number(member) === value) return true;

    return value >= 1 && value <= 75;
}

/**
 * Check if the opcode is a conditional
 * @param opcode opcode to check
 * @returns true if the opcode is one of the conditional opcodes
 */
export function isConditional(opcode: OP): boolean {
    switch (opcode) {
        case OP.IF:
        case OP.NOT_IF:
        case OP.ELSE:
        case OP.END_IF:
            return true;
        default:
            return false;
    }
}

/**
 * Check if the opcode contains a payload
 * @param opcode opcode to check
 * @returns true if the opcode contains a payload
 */
export function isPayload(opcode: OP): boolean {
    return opcode >= OP.PUSH_BYTES_1 && opcode <= OP.PUSH_DATA_2;
}
