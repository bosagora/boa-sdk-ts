/*******************************************************************************

    This tests the BitMask

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
import { SmartBuffer } from "smart-buffer";

describe("Test of BitMask", () => {
    before("Wait for the package libsodium to finish loading", async () => {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    it("Simple test of  BitMask", () => {
        const bitmask = new sdk.BitMask(10);
        assert.strictEqual(bitmask.toString(), "0000000000");
        bitmask.set(1, true);
        assert.strictEqual(bitmask.toString(), "0100000000");
        assert.strictEqual(bitmask.get(1), true);
    });

    it("More set than unset", () => {
        const bitmask = sdk.BitMask.fromString("01011");
        [1, 3, 4].forEach((n) => assert.ok(bitmask.get(n)));
        [0, 2].forEach((n) => assert.ok(!bitmask.get(n)));
    });

    it("Test with more than 8 bits", () => {
        const bitmask = sdk.BitMask.fromString("111011111");
        assert.strictEqual(bitmask.length, 9);
        const bitmask_copy = bitmask.clone();
        assert.strictEqual(bitmask_copy.get(3), false);
        [0, 1, 2, 4, 5].forEach((n) => assert.ok(bitmask_copy.get(n)));
    });

    it("Test serialization", () => {
        const bitmask = new sdk.BitMask(12);
        bitmask.set(1, true);

        const buffer = new SmartBuffer();
        bitmask.serialize(buffer);
        const bitmask2 = sdk.BitMask.deserialize(buffer);
        assert.strictEqual(bitmask.length, bitmask2.length);
        assert.strictEqual(bitmask.setCount(), bitmask2.setCount());
        assert.deepStrictEqual(bitmask, bitmask2);
    });
});
