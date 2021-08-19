/*******************************************************************************

     Test for Script

     Copyright:
         Copyright (c) 2020-2021 BOSAGORA Foundation
         All rights reserved.

     License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import * as assert from "assert";

describe("Test Script", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Script.createOpcodes", () => {
        const OneByte = (value: number): Buffer => {
            return Buffer.from([value]);
        };

        const raw_script = [sdk.OP.DUP, sdk.OP.HASH, Buffer.alloc(64), sdk.OP.VERIFY_EQUAL, sdk.OP.CHECK_SIG];
        const opcodes = sdk.Script.createOpcodes(raw_script);
        const expected = Buffer.concat([
            OneByte(sdk.OP.DUP),
            OneByte(sdk.OP.HASH),
            OneByte(64),
            Buffer.alloc(64), //  Hash data
            OneByte(sdk.OP.VERIFY_EQUAL),
            OneByte(sdk.OP.CHECK_SIG),
        ]);
        assert.deepStrictEqual(opcodes, expected);
    });

    it("Script.validateScript", () => {
        const StackMaxItemSize = 512;

        const OneByte = (value: number): Buffer => {
            return Buffer.from([value]);
        };

        const TwoByte = (value: number): Buffer => {
            return Buffer.from([value & 0x00ff, (value >> 8) & 0x00ff]);
        };

        // empty scripts are syntactically valid
        assert.strictEqual(sdk.Script.validateScript(sdk.ScriptType.Lock, Buffer.alloc(0), StackMaxItemSize)[0], "");

        // empty scripts are syntactically valid
        assert.strictEqual(sdk.Script.validateScript(sdk.ScriptType.Unlock, Buffer.alloc(0), StackMaxItemSize)[0], "");

        // only pushes are allowed for unlock
        assert.strictEqual(
            sdk.Script.validateScript(sdk.ScriptType.Unlock, OneByte(sdk.OP.FALSE), StackMaxItemSize)[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Unlock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_NUM_1),
                    OneByte(sdk.OP.PUSH_NUM_2),
                    OneByte(sdk.OP.PUSH_NUM_3),
                    OneByte(sdk.OP.PUSH_NUM_4),
                    OneByte(sdk.OP.PUSH_NUM_5),
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Unlock,
                Buffer.concat([OneByte(sdk.OP.PUSH_BYTES_1), OneByte(1)]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Unlock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_BYTES_1),
                    OneByte(1), //  data
                    OneByte(sdk.OP.HASH),
                ]),
                StackMaxItemSize
            )[0],
            "Unlock script may only contain stack pushes"
        );

        assert.strictEqual(
            sdk.Script.validateScript(sdk.ScriptType.Lock, Buffer.concat([OneByte(255)]), StackMaxItemSize)[0],
            "Script contains an unrecognized opcode"
        );

        // PUSH_BYTES_*
        assert.strictEqual(
            sdk.Script.validateScript(sdk.ScriptType.Lock, Buffer.concat([OneByte(1)]), StackMaxItemSize)[0],
            "PUSH_BYTES_* opcode exceeds total script size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(1),
                    OneByte(255), //  data
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(sdk.ScriptType.Lock, Buffer.concat([OneByte(2)]), StackMaxItemSize)[0],
            "PUSH_BYTES_* opcode exceeds total script size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(2),
                    OneByte(255), //  data
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_BYTES_* opcode exceeds total script size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(2),
                    OneByte(255), //  data
                    OneByte(255), //  data
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(75),
                    Buffer.alloc(74), //  data
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_BYTES_* opcode exceeds total script size"
        );

        // 75-byte data payload
        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(75),
                    Buffer.alloc(75), //  data
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        // PUSH_DATA_*
        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([OneByte(sdk.OP.PUSH_DATA_1)]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_1 opcode requires 1 byte(s) for the payload size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_1),
                    OneByte(0), //  length
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_1 opcode payload size is not within StackMaxItemSize limits"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_1),
                    OneByte(1), //  length
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_1 opcode payload size exceeds total script size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_1),
                    OneByte(1), //  length
                    OneByte(1), //  data
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([OneByte(sdk.OP.PUSH_DATA_2)]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_2 opcode requires 2 byte(s) for the payload size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    OneByte(0), // length
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_2 opcode requires 2 byte(s) for the payload size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(0), // length
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_2 opcode payload size is not within StackMaxItemSize limits"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(1), // length
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_2 opcode payload size exceeds total script size"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(1), //  length
                    OneByte(255), //  data
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(StackMaxItemSize), //  length
                    Buffer.alloc(StackMaxItemSize), //  data
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(StackMaxItemSize + 1), //  length
                    Buffer.alloc(StackMaxItemSize), //  data
                ]),
                StackMaxItemSize
            )[0],
            "PUSH_DATA_2 opcode payload size is not within StackMaxItemSize limits"
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(StackMaxItemSize), //  length
                    Buffer.alloc(StackMaxItemSize), //  data
                    OneByte(sdk.OP.HASH),
                ]),
                StackMaxItemSize
            )[0],
            ""
        );

        assert.strictEqual(
            sdk.Script.validateScript(
                sdk.ScriptType.Lock,
                Buffer.concat([
                    OneByte(sdk.OP.PUSH_DATA_2),
                    TwoByte(StackMaxItemSize), //  length
                    Buffer.alloc(StackMaxItemSize), //  data
                    OneByte(255),
                ]),
                StackMaxItemSize
            )[0],
            "Script contains an unrecognized opcode"
        );
    });

    it("Create Lock and Unlock Script and validate scripts", () => {
        const createLockP2PKH = (value: sdk.Hash): Buffer => {
            return sdk.Script.createOpcodes([
                sdk.OP.DUP,
                sdk.OP.HASH,
                value.data,
                sdk.OP.VERIFY_EQUAL,
                sdk.OP.CHECK_SIG,
            ]);
        };

        const createUnlockP2PKH = (s: sdk.Signature, pub_key: sdk.Point): Buffer => {
            return sdk.Script.createOpcodes([s.data, pub_key.data]);
        };

        const kp: sdk.Pair = sdk.Pair.random();
        const sig = sdk.Schnorr.signPair<string>(kp, "Hello world");

        // sanity checks
        const key_hash = sdk.hashFull(kp.V);
        const lock_opcodes = createLockP2PKH(key_hash);
        assert.strictEqual(sdk.Script.validateScript(sdk.ScriptType.Lock, lock_opcodes, 512)[0], "");
        const unlock_opcodes = createUnlockP2PKH(sig, kp.V);
        assert.strictEqual(sdk.Script.validateScript(sdk.ScriptType.Unlock, unlock_opcodes, 512)[0], "");
    });
});
