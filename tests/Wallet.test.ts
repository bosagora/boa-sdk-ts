/*******************************************************************************

    Test data delivery of BOA Client using internal web server

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";
// @ts-ignore
import { sample_tx_hash_wallet, sample_tx_wallet, TestAgora, TestStoa } from "./Utils";

import * as assert from "assert";

describe("Wallet", () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    const stoa_port: string = "7000";
    const agora_port: string = "6000";

    before("Wait for the package libsodium to finish loading", async () => {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    before("Start TestStoa", async () => {
        stoa_server = new TestStoa(stoa_port);
        await stoa_server.start();
    });

    before("Start TestAgora", async () => {
        agora_server = new TestAgora(agora_port);
        await agora_server.start();
    });

    after("Stop TestStoa", async () => {
        await stoa_server.stop();
    });

    after("Stop TestAgora", async () => {
        await agora_server.stop();
    });

    it("Test the Wallet - getBalance", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.getBalance();
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.address, "boa1xza007gllhzdawnr727hds36guc0frnjsqscgf4k08zqesapcg3uujh9g93");
        assert.deepStrictEqual(res.data.balance, sdk.JSBI.BigInt(20000000000));
        assert.deepStrictEqual(res.data.spendable, sdk.JSBI.BigInt(18000000000));
        assert.deepStrictEqual(res.data.frozen, sdk.JSBI.BigInt(2000000000));
        assert.deepStrictEqual(res.data.locked, sdk.JSBI.BigInt(0));
    });

    it("Test the Wallet - transfer", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        const expected = {
            code: 0,
            message: "Success",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "ihKCEMuCl9PXfhrsUQMEmmXMEIW0exrKvx5PLg7o8Qg3oN+NMCIbW4mDpQVY/yWmegg8RYuODrceVgxnUDMgCw==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1899900000",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                    {
                        type: 0,
                        value: "100000000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - transfer - Fail access to Agora", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6100",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.FailedAccessToAgora);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - transfer - Fail access to Stoa", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7100",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.FailedAccessToStoa);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - transfer - Not Enough Amount", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SDPVYLR53EAL2F4L3ACTBSZWVZU2WGAQFSABMMWC65M4GNXFQGMAQPAX")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.NotEnoughAmount);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - transfer - Fail not exists any receiver", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.NotExistReceiver);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - cancel", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const tx = sdk.Transaction.reviver("", sample_tx_wallet);

        const res = await wallet.cancel(tx, (address: sdk.PublicKey[]) => {
            return [keypair];
        });

        const expected = {
            code: 0,
            message: "Success",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "Sqxo1En3qMjcne9xnUy0uabpIckBnO3z6z13QCPj/AQlK8gQENdZQuSm9gMkil9/Z0bGGMvI77kHClXPSLPR0g==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999903800",
                        lock: {
                            type: 0,
                            bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
                        },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - cancel with a transaction hash", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.cancelWithHash(sample_tx_hash_wallet);

        const expected = {
            code: 0,
            message: "Success",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "Sqxo1En3qMjcne9xnUy0uabpIckBnO3z6z13QCPj/AQlK8gQENdZQuSm9gMkil9/Z0bGGMvI77kHClXPSLPR0g==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999903800",
                        lock: {
                            type: 0,
                            bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
                        },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - freeze", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.freeze({
            address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
            amount: sdk.BOA(10),
        });

        const expected = {
            code: 0,
            message: "Success.",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "jD3BOf50fKBnZAeUlZ1E7LQf6aKi1jc0KX0nXfwZLQjbE8E2CyU3U4Nb/GAcxT++gXs+P09AEoBwFxI77UdGNg==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1899900000",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                    {
                        type: 1,
                        value: "100000000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - unfreeze", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.unfreeze(
            [
                new sdk.Hash(
                    "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
                ),
            ],
            new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl")
        );

        const expected = {
            code: 0,
            message: "Success.",
            data: {
                inputs: [
                    {
                        utxo: "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
                        unlock: {
                            bytes: "p/LCgG16AyLpClizUHE/R8dTJRgqgP2PjitJyZFZ+gmgdoLbloRs/fyLux57PznMlf90KAumyKrZ+UCj0Gjbmw==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999900000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - getFrozenUTXOs", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });
        const balance_res = await wallet.getBalance();
        assert.ok(balance_res.data !== undefined);

        const res = await wallet.getFrozenUTXOs(balance_res.data.frozen);
        assert.deepStrictEqual(res.data.length, 1);
        assert.deepStrictEqual(
            res.data[0].utxo.toString(),
            "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
        );
        assert.deepStrictEqual(res.data[0].type, sdk.OutputType.Freeze);
    });
});
