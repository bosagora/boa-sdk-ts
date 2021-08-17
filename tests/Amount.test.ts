/*******************************************************************************

    This tests the Amount

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import assert from "assert";

describe("Test of Amount", () => {
    before("Wait for the package libsodium to finish loading", async () => {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    it("Test of BOA()", () => {
        assert.deepStrictEqual(sdk.BOA("1").value, sdk.JSBI.BigInt("10000000"));
        assert.deepStrictEqual(sdk.BOA("100000000.1234567").value, sdk.JSBI.BigInt("1000000001234567"));
        assert.deepStrictEqual(sdk.BOA("100000000").value, sdk.JSBI.BigInt("1000000000000000"));
        assert.deepStrictEqual(sdk.BOA("100,000,000.1234567").value, sdk.JSBI.BigInt("1000000001234567"));
        assert.deepStrictEqual(sdk.BOA("100,000,000").value, sdk.JSBI.BigInt("1000000000000000"));
        assert.deepStrictEqual(sdk.BOA("100_000_000.1234567").value, sdk.JSBI.BigInt("1000000001234567"));
        assert.deepStrictEqual(sdk.BOA("100_000_000").value, sdk.JSBI.BigInt("1000000000000000"));
    });

    it("Test of from JSON", () => {
        assert.deepStrictEqual(sdk.Amount.reviver("", "1000000001234567").value, sdk.JSBI.BigInt("1000000001234567"));
        assert.deepStrictEqual(sdk.Amount.reviver("", "1000000000000000").value, sdk.JSBI.BigInt("1000000000000000"));
    });

    it("Test of to JSON", () => {
        assert.deepStrictEqual(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")).toJSON(), "1000000001234567");
        assert.deepStrictEqual(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")).toJSON(), "1000000000000000");
    });
});
