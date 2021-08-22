/*******************************************************************************

    Test for UTXOManager

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

describe("Test for UTXOManager", () => {
    let manager: sdk.UTXOManager;
    let utxos: sdk.UnspentTxOutput[];

    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Prepare variables", () => {
        utxos = [
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
                ),
                sdk.OutputType.Freeze,
                sdk.JSBI.BigInt(1),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(0)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(2),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(1)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(3),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(2)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(4),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(3)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(5),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(4)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(6),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(5)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0x451a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(7),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(6)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0xff05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(8),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(7)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2"
                ),
                sdk.OutputType.Payment,
                sdk.JSBI.BigInt(9),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(8)
            ),
            new sdk.UnspentTxOutput(
                new sdk.Hash(
                    "0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b"
                ),
                sdk.OutputType.Coinbase,
                sdk.JSBI.BigInt(10),
                sdk.Amount.make(10),
                sdk.JSBI.BigInt(9)
            ),
        ];
        manager = new sdk.UTXOManager(utxos);
    });

    it("Tests not adding data with the same hash of UTXO", () => {
        const test_manager = new sdk.UTXOManager([]);

        test_manager.add([utxos[0]]);
        const sum1 = test_manager.getSum();

        test_manager.add([utxos[0]]);
        const sum2 = test_manager.getSum();

        assert.deepStrictEqual(sum1, [sdk.Amount.make(0), sdk.Amount.make(10), sdk.Amount.make(0)]);
        assert.deepStrictEqual(sum1, sum2);
    });

    it("Check the available amount.", () => {
        // (unlock_height - 1 <= 1)
        let sum = manager.getSum(sdk.JSBI.BigInt(1));
        assert.deepStrictEqual(sum, [sdk.Amount.make(10), sdk.Amount.make(10), sdk.Amount.make(80)]);

        sum = manager.getSum();
        assert.deepStrictEqual(sum, [sdk.Amount.make(90), sdk.Amount.make(10), sdk.Amount.make(0)]);
    });

    it("Obtain a UTXO to use - if there is enough money", () => {
        const res = manager.getUTXO(sdk.Amount.make(15), sdk.JSBI.BigInt(5));
        assert.deepStrictEqual(res, [utxos[1], utxos[2]]);
    });

    it("Obtain a UTXO to use - if there is not enough money", () => {
        const sum = manager.getSum(sdk.JSBI.BigInt(10));
        assert.deepStrictEqual(sum, [sdk.Amount.make(70), sdk.Amount.make(10), sdk.Amount.make(0)]);

        const res = manager.getUTXO(sdk.Amount.add(sum[0], sdk.Amount.make(1)), sdk.JSBI.BigInt(10));
        assert.deepStrictEqual(res, []);
    });
});
