/*******************************************************************************

    Test for TxPayloadFee

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

describe("TxPayloadFee", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("When a negative number is entered for the size of the data.", () => {
        assert.throws(() => {
            sdk.TxPayloadFee.getFee(-1);
        }, new Error("Data size cannot be negative."));
    });

    it("When the size of the data is greater than the maximum value.", () => {
        assert.throws(() => {
            sdk.TxPayloadFee.getFee(sdk.TxPayloadFee.TxPayloadMaxSize + 1);
        }, new Error("Data size cannot be greater than maximum."));
    });

    it("Test for TxPayloadFee.getFee()", () => {
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(0), sdk.JSBI.BigInt(0));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(10), sdk.JSBI.BigInt(500000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(20), sdk.JSBI.BigInt(1100000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(30), sdk.JSBI.BigInt(1600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(40), sdk.JSBI.BigInt(2200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(50), sdk.JSBI.BigInt(2800000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(60), sdk.JSBI.BigInt(3500000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(70), sdk.JSBI.BigInt(4200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(80), sdk.JSBI.BigInt(4900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(90), sdk.JSBI.BigInt(5700000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(100), sdk.JSBI.BigInt(6500000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(110), sdk.JSBI.BigInt(7300000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(120), sdk.JSBI.BigInt(8200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(130), sdk.JSBI.BigInt(9200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(140), sdk.JSBI.BigInt(10100000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(150), sdk.JSBI.BigInt(11200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(160), sdk.JSBI.BigInt(12300000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(170), sdk.JSBI.BigInt(13400000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(180), sdk.JSBI.BigInt(14600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(190), sdk.JSBI.BigInt(15900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(200), sdk.JSBI.BigInt(17200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(210), sdk.JSBI.BigInt(18600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(220), sdk.JSBI.BigInt(20000000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(230), sdk.JSBI.BigInt(21600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(240), sdk.JSBI.BigInt(23200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(250), sdk.JSBI.BigInt(24900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(260), sdk.JSBI.BigInt(26700000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(270), sdk.JSBI.BigInt(28600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(280), sdk.JSBI.BigInt(30600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(290), sdk.JSBI.BigInt(32600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(300), sdk.JSBI.BigInt(34800000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(310), sdk.JSBI.BigInt(37100000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(320), sdk.JSBI.BigInt(39500000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(330), sdk.JSBI.BigInt(42100000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(340), sdk.JSBI.BigInt(44700000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(350), sdk.JSBI.BigInt(47500000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(360), sdk.JSBI.BigInt(50500000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(370), sdk.JSBI.BigInt(53600000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(380), sdk.JSBI.BigInt(56900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(390), sdk.JSBI.BigInt(60300000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(400), sdk.JSBI.BigInt(63900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(410), sdk.JSBI.BigInt(67700000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(420), sdk.JSBI.BigInt(71700000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(430), sdk.JSBI.BigInt(75800000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(440), sdk.JSBI.BigInt(80300000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(450), sdk.JSBI.BigInt(84900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(460), sdk.JSBI.BigInt(89700000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(470), sdk.JSBI.BigInt(94900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(480), sdk.JSBI.BigInt(100200000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(490), sdk.JSBI.BigInt(105900000));
        assert.deepStrictEqual(sdk.TxPayloadFee.getFee(500), sdk.JSBI.BigInt(111800000));
    });
});
