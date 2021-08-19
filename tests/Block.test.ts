/*******************************************************************************

    This tests the serialization and deserialization of sample Blocks

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import * as assert from "assert";
import fs from "fs";

const samples: any[] = (() => {
    const data: string = fs.readFileSync("tests/data/Blocks.sample3.json", "utf-8");
    return JSON.parse(data);
})();

describe("Test of Block", () => {
    before("Wait for the package libsodium to finish loading", async () => {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    it("Test sample blocks", () => {
        let blocks: sdk.Block[] = [];
        blocks = samples.map((m) => sdk.Block.reviver("", m));

        assert.strictEqual(blocks.length, 3);

        // Test for JSON serialization
        for (let idx = 0; idx < blocks.length; idx++)
            assert.deepStrictEqual(JSON.stringify(blocks[idx]), JSON.stringify(samples[idx]));

        // Test for block header hash
        for (let idx = 0; idx < blocks.length - 1; idx++)
            assert.deepStrictEqual(sdk.hashFull(blocks[idx].header), blocks[idx + 1].header.prev_block);
    });
});

describe("Test of PreImageInfo", () => {
    const sample_data = {
        utxo: "0x2f8b231aa4fd35c6a5c68a97fed32120da48cf6d40ccffc93d8dc41a3016eb56434b2c44144a38efe459f98ddc2660b168f1c92a48fe65711173385fb4a269e1",
        hash: "0x790ab7c8f8ddbf012561e70c944c1835fd1a873ca55c973c828164906f8b35b924df7bddcafade688ad92cfb4414b2cf69a02d115dc214bbd00d82167f645e7e",
        height: "6",
    };

    it("Test sample pre_image", () => {
        const pre_image = sdk.PreImageInfo.reviver("", sample_data);

        // Test for JSON serialization
        assert.deepStrictEqual(JSON.stringify(pre_image), JSON.stringify(sample_data));
    });
});
