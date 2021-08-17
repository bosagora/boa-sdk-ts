/*******************************************************************************

    Contains the script definition and syntactical opcode validation.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { isOpcode, OP } from "./Opcodes";

import { SmartBuffer } from "smart-buffer";

/**
 * The type of script
 */
export enum ScriptType {
    /**
     * may contain any opcodes
     */
    Lock,

    /**
     * redeem is treated as a lock script (all opcodes allowed)
     */
    Redeem = Lock,

    /**
     * may only contain stack push opcodes
     */
    Unlock,
}

/**
 * Contains a syntactically validated set of script opcodes
 */
export class Script {
    /**
     * opcodes and any associated data for each push opcode
     */
    private readonly _opcodes: Buffer;

    /**
     * Constructor
     * @param data
     */
    private constructor(data: Buffer) {
        this._opcodes = Buffer.from(data);
    }

    public get opcodes(): Buffer {
        return this._opcodes;
    }

    /**
     * Write an array of OP codes and buffers in one buffer to match the rules.
     * @param raw Array of OP codes and Buffers
     * @returns opcodes and any associated data for each push opcode
     */
    public static createOpcodes(raw: (OP | Buffer)[]): Buffer {
        const opcodes = new SmartBuffer();
        let last_op: number = 0;
        for (const elem of raw) {
            if (typeof elem === "number") {
                last_op = elem as number;
                opcodes.writeUInt8(last_op);
            } else if (elem instanceof Buffer) {
                const bytes = elem as Buffer;
                if (last_op === OP.PUSH_DATA_2) {
                    opcodes.writeUInt16LE(bytes.length);
                    opcodes.writeBuffer(bytes);
                } else if (last_op === OP.PUSH_DATA_1) {
                    opcodes.writeUInt8(bytes.length);
                    opcodes.writeBuffer(bytes);
                } else if (last_op >= OP.PUSH_BYTES_1 && last_op <= OP.PUSH_BYTES_75) {
                    if (last_op !== bytes.length)
                        throw new Error(`The data size is different ${last_op}:${bytes.length}`);
                    opcodes.writeBuffer(bytes);
                } else {
                    if (bytes.length <= 75) {
                        opcodes.writeUInt8(bytes.length);
                        opcodes.writeBuffer(bytes);
                    } else if (bytes.length <= 255) {
                        opcodes.writeUInt8(OP.PUSH_DATA_1);
                        opcodes.writeUInt8(bytes.length);
                        opcodes.writeBuffer(bytes);
                    } else if (bytes.length <= 65535) {
                        opcodes.writeUInt8(OP.PUSH_DATA_2);
                        opcodes.writeUInt16LE(bytes.length);
                        opcodes.writeBuffer(bytes);
                    } else {
                        throw new Error(`The data size is too large ${bytes.length}`);
                    }
                }
                last_op = 0;
            }
        }
        return opcodes.toBuffer();
    }

    /**
     * Returns an instance filled with zero all bytes.
     * @returns The instance of Script
     */
    public static get Null(): Script {
        return new Script(Buffer.alloc(0));
    }

    /**
     * Validates the set of given opcodes syntactically, but not semantically.
     * Each opcode is checked if it's one of the known opcodes, and any push
     * opcodes have payloads checked for size constraints.
     *
     * The semantics of the script are not checked here. This responsibility
     * lies within the script execution engine.
     *
     * Lock scripts may contain any of the supported opcodes,
     * whereas unlocks scripts may only consist of stack push opcodes.
     * This is for security reasons. If any opcodes were allowed, the unlock script
     * could potentially cause premature successfull script evaluation without
     * satisfying the constraints of the lock script.
     *
     * Redeem scripts are treated the same as lock scripts.
     *
     * @param type the type of the script (lock / unlock / redeem)
     * @param opcodes the set of opcodes to validate
     * @param StackMaxItemSize maximum allowed payload size for a
     * stack push operation
     * @returns Tuple data of [string, Script]
     * ['', Script] if the set of opcodes are syntactically valid,
     * otherwise [message, Script.Null], message is the string explaining the reason why they're invalid
     */
    public static validateScript(type: ScriptType, opcodes: Buffer, StackMaxItemSize: number): [string, Script] {
        if (opcodes.length === 0) return ["", new Script(opcodes)];

        const bytes = SmartBuffer.fromBuffer(opcodes);

        while (bytes.remaining() > 0) {
            const opcode: OP = bytes.readUInt8();
            if (!isOpcode(opcode)) return ["Script contains an unrecognized opcode", Script.Null];

            if (opcode === OP.PUSH_DATA_1) {
                const reason = Script.isInvalidPushReason(opcode, bytes, StackMaxItemSize);
                if (reason !== "") return [reason, Script.Null];
            } else if (opcode === OP.PUSH_DATA_2) {
                const reason = Script.isInvalidPushReason(opcode, bytes, StackMaxItemSize);
                if (reason !== "") return [reason, Script.Null];
            } else if (opcode >= OP.PUSH_BYTES_1 && opcode <= OP.PUSH_BYTES_75) {
                const payload_size = opcode; // encoded in the opcode
                if (bytes.readOffset + payload_size > bytes.length)
                    return ["PUSH_BYTES_* opcode exceeds total script size", Script.Null];
                bytes.readOffset += payload_size;
                // tslint:disable-next-line:no-empty
            } else if (opcode >= OP.PUSH_NUM_1 && opcode <= OP.PUSH_NUM_5) {
            }

            if (bytes.remaining() === 0) {
                if (type === ScriptType.Unlock) {
                    if (opcode > OP.TRUE) return ["Unlock script may only contain stack pushes", Script.Null];
                }
            }
        }

        return ["", new Script(opcodes)];
    }

    private static isInvalidPushReason(op: OP, bytes: SmartBuffer, StackMaxItemSize: number): string {
        if (op !== OP.PUSH_DATA_1 && op !== OP.PUSH_DATA_2)
            return `${OP[op]} This cannot be used in isInvalidPushReason`;

        const size = op === OP.PUSH_DATA_1 ? 1 : 2;
        if (bytes.remaining() < size) return `${OP[op]} opcode requires ${size} byte(s) for the payload size`;

        const length = op === OP.PUSH_DATA_1 ? bytes.readUInt8() : bytes.readUInt16LE();
        if (length === 0 || length > StackMaxItemSize)
            return `${OP[op]} opcode payload size is not within StackMaxItemSize limits`;

        if (bytes.readOffset + length > bytes.length) return `${OP[op]} opcode payload size exceeds total script size`;

        bytes.readOffset += length;
        return "";
    }
}
