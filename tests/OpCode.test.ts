/*******************************************************************************

    Test for Opcode

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

describe("Test OPCode", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("enum Opcode", () => {
        assert.ok(sdk.isOpcode(0x00) && 0x00 === sdk.OP.FALSE);
        assert.ok(sdk.isOpcode(0x59) && 0x59 === sdk.OP.HASH);
        assert.ok(!sdk.isOpcode(255));
        assert.ok(sdk.isOpcode(1) && 1 === sdk.OP.PUSH_BYTES_1);
        assert.ok(sdk.isOpcode(32) && 32 === 32);
        assert.ok(sdk.isOpcode(75) && 75 === sdk.OP.PUSH_BYTES_75);

        assert.ok(sdk.isConditional(sdk.OP.IF));
        assert.ok(sdk.isConditional(sdk.OP.NOT_IF));
        assert.ok(sdk.isConditional(sdk.OP.ELSE));
        assert.ok(sdk.isConditional(sdk.OP.END_IF));
        assert.ok(!sdk.isConditional(sdk.OP.TRUE));
        assert.ok(!sdk.isConditional(sdk.OP.HASH));

        assert.ok(sdk.isPayload(sdk.OP.PUSH_BYTES_1));
        assert.ok(sdk.isPayload(sdk.OP.PUSH_DATA_1));
        assert.ok(sdk.isPayload(sdk.OP.PUSH_DATA_2));
        assert.ok(!sdk.isPayload(sdk.OP.IF));
        assert.ok(!sdk.isPayload(sdk.OP.NOT_IF));
        assert.ok(!sdk.isPayload(sdk.OP.TRUE));
    });
});
