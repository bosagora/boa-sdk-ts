/*******************************************************************************

    Test for TxBuilder

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

describe("TxBuilder", () => {
    let utxo_data1: any;
    let utxo_data2: any;
    let owner: sdk.KeyPair;

    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Prepare variables", () => {
        utxo_data1 = {
            utxo: new sdk.Hash(
                "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32"
            ),
            amount: sdk.JSBI.BigInt(1000000000),
        };
        utxo_data2 = {
            utxo: new sdk.Hash(
                "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef"
            ),
            amount: sdk.JSBI.BigInt(1000000000),
        };
        owner = sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"));
    });

    it("When trying to send the wrong amount", () => {
        const destination = new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        const builder = new sdk.TxBuilder(owner);
        const amount = sdk.JSBI.BigInt(0);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Positive amount expected, not ${amount.toString()}`));
    });

    it("When trying to send an amount greater than the amount of UTXO.", () => {
        const destination = new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        const builder = new sdk.TxBuilder(owner);
        const amount = utxo_data1.amount + BigInt(1);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Insufficient amount. ${amount.toString()}:${utxo_data1.amount.toString()}`));
    });

    it("Test to create a transaction without data payload", () => {
        const destination = new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        const builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .addOutput(destination, sdk.JSBI.BigInt(20000000))
                .sign(sdk.OutputType.Payment);
        } catch (error) {
            assert.fail(error);
        }

        const expected = {
            inputs: [
                {
                    utxo: "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    unlock: {
                        bytes: "Q/xkI//GMoaGCA98vNLjTwul7MpQAb86EiFlRwBMugKmHn8XyYkHE/XIS+A0lsefsoSv+Y5RGu2+LYI3oP+bNQ==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    unlock: {
                        bytes: "YDT5tr6Ifu8slttlTQ1ORuchgkw1tGjn1PqqT/4/3gPK2Bovxm4gIWhmEnkDv+0JaMSf+cl5jZiwaNK2Wv4SvA==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "1980000000",
                    lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" },
                },
                {
                    type: 0,
                    value: "20000000",
                    lock: { type: 0, bytes: "2uGT7+ya0+sVo6ohySeAdjX7lf+hSRNV7iLceOZXMN8=" },
                },
            ],
            payload: "",
            lock_height: "0",
        };
        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(expected));
    });

    it("Test to create a transaction with data payload", () => {
        const builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        const payload = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.JSBI.BigInt(500000);
        const tx_fee = sdk.JSBI.BigInt(0);

        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .assignPayload(payload)
                .sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        } catch (error) {
            assert.fail(error);
        }

        const expected = {
            inputs: [
                {
                    utxo: "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    unlock: {
                        bytes: "pIiLEwhXC59GIZL6Xw9IP2g5wu3HES+Md1Wm45F5nA64oVpt5L/1Yf+0Myd2uNQWyzUUacn8+1RIslXwlcSh/w==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    unlock: {
                        bytes: "+JGa7Yhyat4L/91kfriWiTtfxvgzQ1mbHIzcL5JVGQgG7yiORpb5+HCC6IYf9sqGOhjyjOKrfgZMssDnYGAmuA==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "1999500000",
                    lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" },
                },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };
        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(expected));
    });

    it("Test to create a transaction with data payload - no output", () => {
        const builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        const payload = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.JSBI.BigInt(1000000000);
        const tx_fee = sdk.JSBI.BigInt(0);

        assert.throws(() => {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .assignPayload(payload)
                .sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        }, new Error("No output for transaction."));
    });

    it("Test to create a transaction with data payload - exist output", () => {
        const builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        const payload = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.JSBI.BigInt(1000000000);
        const tx_fee = sdk.JSBI.BigInt(0);

        assert.doesNotThrow(() => {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .assignPayload(payload)
                .sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        }, new Error("No output for transaction."));
    });
});
