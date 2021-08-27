/*******************************************************************************

    Test that create hash.

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

describe("Hash", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    // Buffer has the same content. However, when printed with hex strings,
    // the order of output is different.
    // This was treated to be the same as D language.
    it("Test of reading and writing hex string", () => {
        // Read from hex string
        const h = new sdk.Hash(
            "0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73"
        );

        // Check
        assert.strictEqual(
            h.toString(),
            "0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of hash('abc')", () => {
        // Hash
        const h = sdk.hash(Buffer.from("abc"));

        // Check
        assert.strictEqual(
            h.toString(),
            "0x239900d4ed8623b95a92f1dba88ad31895cc3345ded552c22d79ab2a39c5877dd1a2ffdb6fbb124bb7c45a68142f214ce9f6129fb697276a0d4d1c983fa580ba"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of multi hash", () => {
        // Source 1 : "foo"
        const foo = sdk.hash(Buffer.from("foo"));

        // Source 2 : "bar"
        const bar = sdk.hash(Buffer.from("bar"));

        // Hash Multi
        const h = sdk.hashMulti(foo, bar);

        // Check
        assert.strictEqual(
            h.toString(),
            "0xe0343d063b14c52630563ec81b0f91a84ddb05f2cf05a2e4330ddc79bd3a06e57c2e756f276c112342ff1d6f1e74d05bdb9bf880abd74a2e512654e12d171a74"
        );

        // Source 3 : "boa"
        const boa = sdk.hash(Buffer.from("boa"));

        const h2 = sdk.hash(Buffer.concat([foo.data, bar.data, boa.data]));
        const h3 = sdk.hashMulti(foo, bar, boa);

        // Check
        assert.strictEqual(h3.toString(), h2.toString());
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of utxo key, using makeUTXOKey", () => {
        const tx_hash = new sdk.Hash(
            "0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73"
        );
        const hash = sdk.makeUTXOKey(tx_hash, sdk.JSBI.BigInt(1));
        assert.strictEqual(
            hash.toString(),
            "0x7c95c29b184e47fbd32e58e5abd42c6e22e8bd5a7e934ab049d21df545e09c2e33bb2b89df2e59ee01eb2519b1508284b577f66a76d42546b65a6813e592bb84"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of BlockHeader", () => {
        const pubkey = new sdk.PublicKey("boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg");

        const tx = new sdk.Transaction([], [new sdk.TxOutput(sdk.OutputType.Payment, "100", pubkey)], Buffer.alloc(0));

        const header: sdk.BlockHeader = new sdk.BlockHeader(
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            new sdk.Height("0"),
            sdk.hashFull(tx),
            sdk.BitMask.fromString("0"),
            new sdk.Signature(Buffer.alloc(sdk.Signature.Width)),
            [],
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            [],
            0
        );
        assert.strictEqual(
            sdk.hashFull(header).toString(),
            "0x3bda4067eef71774dd27557fb838ae5dfcd2198530e60b9c95ebf41f18bc4144040a5bd70cb83e63aefdf45222ec6f6006dfdf6387faf0df07d0da009d543e64"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of BlockHeader with missing validators", () => {
        const pubkey = new sdk.PublicKey("boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg");

        const tx = new sdk.Transaction([], [new sdk.TxOutput(sdk.OutputType.Payment, "100", pubkey)], Buffer.alloc(0));

        const header: sdk.BlockHeader = new sdk.BlockHeader(
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            new sdk.Height("0"),
            sdk.hashFull(tx),
            sdk.BitMask.fromString(""),
            new sdk.Signature(Buffer.alloc(sdk.Signature.Width)),
            [],
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            [1, 2, 3, 256, 257, 258, 70000, 80000, 90000],
            0
        );
        assert.strictEqual(
            sdk.hashFull(header).toString(),
            "0xeee57d6bc2833e87910e795a55adc544d883add68576d5144cc74f528eff6a80fe6759c1071a39f30fb0bf201e5312f6d1f3de29a4c69fa480ab4e6092957399"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of Scalar", () => {
        const scalar = new sdk.Scalar("0x0e00a8df701806cb4deac9bb09cc85b097ee713e055b9d2bf1daf668b3f63778");
        assert.deepStrictEqual(
            sdk.hashFull(scalar).toString(),
            "0x4f895cc641b2bfe4541f53b83445add00a7a81ad340312c51cbf15c53ddebcc7ea7dcd11a97e085d28552026952e7c7c8d4276d5901d33605a3ea21027a673d4"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of Point", () => {
        const point = new sdk.Point("0xdb445140a72012a177535f43e6bbb8523ff21de465a7c35b42be1a447e5e2908");
        assert.deepStrictEqual(
            sdk.hashFull(point).toString(),
            "0xa0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b3132a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe47"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of PublicKey", () => {
        const publicKey = new sdk.PublicKey("boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg");
        assert.deepStrictEqual(
            sdk.hashFull(publicKey).toString(),
            "0x774d28bb3dc06a1418a4165109f4e8e4e05b4b283c798dd10aa70050a9b095408b3d1c6c1017b69912e94a4a58c5cb522e78b9741e1380bb5d2d705116f886ef"
        );
    });
});
