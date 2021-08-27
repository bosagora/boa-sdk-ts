/*******************************************************************************

    Test of Transaction

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

describe("Transaction", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of transaction data", () => {
        const payment_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(payment_tx).toString(),
            "0xbf16b1bb63c50170ce0e2624e13bda540c268c74a677d2d8a0571eb79cd8a3b28c408793d43e3bbee0ffd39913903c77fbd1b0cbe36b6a0b503514bbbe84b492"
        );

        assert.ok(payment_tx.isPayment());
        assert.ok(!payment_tx.isFreeze());
        assert.ok(!payment_tx.isCoinbase());

        const freeze_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Freeze, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );

        assert.strictEqual(
            sdk.hashFull(freeze_tx).toString(),
            "0x415e67be1be0ae5d93c39198682e7202047e884542fbb1f88360895ad98195067f59f21a1bf8a57f364aaaed7ba8ce9196927a81262db5df0912ac0bf068307e"
        );

        assert.ok(!freeze_tx.isPayment());
        assert.ok(freeze_tx.isFreeze());
        assert.ok(!freeze_tx.isCoinbase());

        const payload_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.from([1, 2, 3])
        );
        assert.strictEqual(
            sdk.hashFull(payload_tx).toString(),
            "0x44590847e54f0e67c3365540115204df7730ddde5fdef306c5fd66af6a7d6f311f65de5058ce3f297f8e665a6c2b6d75a39207075a45b364a5dfba74fecf7547"
        );
    });

    it("Test for hash value of transaction with multi inputs", () => {
        const tx1 = new sdk.Transaction(
            [
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037"
                    )
                ),
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"
                    )
                ),
            ],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx1).toString(),
            "0x8ae9a3478433a8602e6f75aabbc2c7bcb3d17afb0ef7e5b5645cbadb68021d1" +
                "947d2a57020d45b79c8834e92eb04976b972ef542a589790fa593e33dc341f07b"
        );

        const tx2 = new sdk.Transaction(
            [
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"
                    )
                ),
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037"
                    )
                ),
            ],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx2).toString(),
            "0x8ae9a3478433a8602e6f75aabbc2c7bcb3d17afb0ef7e5b5645cbadb68021d1947d2a57020d45b79c8834e92eb04976b972ef542a589790fa593e33dc341f07b"
        );
    });

    it("Test for hash value of transaction with multi outputs", () => {
        const tx1 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx1).toString(),
            "0x559613a7a8d5e15275312256ba3205333e038a23f07c4c2bd0ef193c16cac114bd72f02183731c51132e9ee9471a1ae9495a84f86837d8917792fee9db713877"
        );

        const tx2 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx2).toString(),
            "0x559613a7a8d5e15275312256ba3205333e038a23f07c4c2bd0ef193c16cac114bd72f02183731c51132e9ee9471a1ae9495a84f86837d8917792fee9db713877"
        );
    });

    it("Test for hash value of transaction with multi outputs same address", () => {
        const tx1 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "200",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "100",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx1).toString(),
            "0xf7930aeb05490a1a3cf42bb87f1ef22685dde78bb3554c4f46da2c69f47d584cac620a3f4d482d605c7917918c18bf30b4b3a542efcaa16a22b5582022c6b2b7"
        );

        const tx2 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "100",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "200",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx2).toString(),
            "0xf7930aeb05490a1a3cf42bb87f1ef22685dde78bb3554c4f46da2c69f47d584cac620a3f4d482d605c7917918c18bf30b4b3a542efcaa16a22b5582022c6b2b7"
        );
    });

    it("Test of estimated size", () => {
        assert.strictEqual(sdk.TxInput.getEstimatedNumberOfBytes(), 132);
        assert.strictEqual(sdk.TxOutput.getEstimatedNumberOfBytes(), 45);
        assert.strictEqual(sdk.Transaction.getEstimatedNumberOfBytes(0, 0, 0), 8);
    });

    it("Test for Transaction.getNumberOfBytes", () => {
        const tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );

        const nZero = 0;
        const nBytes =
            sdk.Hash.Width + //  TxInput.utxo
            nZero + //  TxInput.unlock.bytes
            sdk.Utils.SIZE_OF_INT + //  TxInput.unlock_age
            sdk.Utils.SIZE_OF_INT + //  TxOutput.type
            sdk.Utils.SIZE_OF_LONG + //  TxOutput.value
            sdk.Utils.SIZE_OF_BYTE + //  TxOutput.lock.type
            nZero + //  TxOutput.lock.bytes
            nZero + //  Transaction.payload
            sdk.Utils.SIZE_OF_LONG; //  Transaction.lock_height
        assert.strictEqual(tx.getNumberOfBytes(), nBytes);
    });
});
