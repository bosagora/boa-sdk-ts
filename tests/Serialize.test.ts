/*******************************************************************************

    Test that serialize.

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
import { SmartBuffer } from "smart-buffer";

describe("Serialize and Deserialize", () => {
    let block: sdk.Block;
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Prepare test for serialize and deserialize", () => {
        // This is the genesis block of Agora
        const sample = {
            header: {
                prev_block:
                    "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                merkle_root:
                    "0x255b9a117f5abbbb7f1a38c5184b84d8fd4109c8f7f0e41472e0ac82adaae9ae41615e8eca8be9dcb7cc775aa9869ad617101a4f045e13a8232d73fbc2cf9a9e",
                random_seed:
                    "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                signature:
                    "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                validators: "0100",
                height: "0",
                enrollments: [
                    {
                        utxo_key:
                            "0x00df246a2c315a3ea2403abc15fb8393c861654985054847440a1c07ad56af0c792e7722c82b73207469f962129bd5142062d66ff6b71e79637b786d9050d43b",
                        commitment:
                            "0x45a81942081ea00788a26187464fa79f6cefc3c09417167c64f638010ab40728d671c1725c6b30770e67a91688ab936a2bc1a402cf4cd2ffffa48f6c199f6332",
                        cycle_length: 20,
                        enroll_sig:
                            "0xe3f959407fe99cb23f352be4477bbef8f619a11283319192418ac869eeb2040608899a842eabbd09a2eddd31de78f36eadd80cca5cdb4529b7737bfe51afc449",
                    },
                    {
                        utxo_key:
                            "0x398b5d2d4cdaefb7d28b56137b06170fac0b61e94b06670c9cb171880836e7e0d656bc37b174e907e966f7caaeac6d44327affcc8166c4e1e7c2c7a0d705ac20",
                        commitment:
                            "0x672401404e947aaae126a9e8c150facf0fea6d7b607725f4ada6de369fdd54d8079c2555ed52f80e160f9c78b5f650372d01daa765924a5e50a0db530a58e510",
                        cycle_length: 20,
                        enroll_sig:
                            "0x07ffcebf03b8e7c2f14209f0999bfbd80f2704d69d1383434c9c0ff7f52ad22c05702179697d380c7f976cbeab3bf9aa9ab995e75d4b329ab282df94856b52af",
                    },
                    {
                        utxo_key:
                            "0x8583f3e4df1428a74c06e8266626e43675f160bdab7a8fa2f08f5931440147f7858955802b349626a486e18bd95f58ba15f0fa88dfbf3a5dcec878cd64838893",
                        commitment:
                            "0x072582e862efa9daf7a53a100989a07ad0ee0f0d5bfadf74909d6a6b3cf3c7a7e5d2e218f51df416d052b486e0d65608cbe70e51f0372fd211d68f353d299c0c",
                        cycle_length: 20,
                        enroll_sig:
                            "0x375eefbe1990a6e37b2f9a11b1ba68e3c8f8d0976f51a5de55e4d58a6798cd4f0d01b743c2f4d896914df0477790eafe6eab24d58f33bed756827e3028cc0205",
                    },
                    {
                        utxo_key:
                            "0x91913c4daff74612e122c38b2aceb1c7dea38a01f4a8120f8d79730696af1329153f3d91f14d2fae64f5692edf401a8a3e4b1e8c961ae1e31815ab4b606f51c8",
                        commitment:
                            "0x27892eed27841003e3a5a6ad1e6de90fcb2bc0627ca138bdc0b12b1bbb413e3ca06331de912a90a5787a602511fbf5663903b8fee57f6b1f1978f93439e237bb",
                        cycle_length: 20,
                        enroll_sig:
                            "0xe9a3c6c63d9810e61561fb7e4379849d57d7d47942d6ca4ecf993ad7aafe76f5075d4e67b3f13b00e5f2776642c84416e028308a3afe1b0101cf0bc97c73a5d8",
                    },
                    {
                        utxo_key:
                            "0xa5a485b67fd6e478366c256ff543f70b131810919a7010b413e9cbec1d4ab02aeb8088a8cc5c51ca8dc64d6486a38b72b9e55e5bf62b6eb34955219c57db6bda",
                        commitment:
                            "0x0d74a7d76f9157f307e9f9b2792931479ba62bfed768e1e21675ebd20f8db701444bb319e037913a378f913e65611710ac8ad26251807ae2e288ffa1d6d30a8e",
                        cycle_length: 20,
                        enroll_sig:
                            "0x018389f5876ebac77ad4c2269415bf8a5b14e2374e9d30a933f70a10abbca2a40fe1fbaf1af6d0cbd4fa632841c86233345c05596d1835e38e8b40d2d318ef2c",
                    },
                    {
                        utxo_key:
                            "0xada56d41308399ae70eba69c1192e3b486439676942f22895dc7ceaca599d1fbabc5a8f6202a5a4ebae3eb5fa85a6f12cb51d48cb5c54233d33e0c2c0b5afb97",
                        commitment:
                            "0xe2f3bf5daf2d2522289cc93901e7a9d4fd5df8e85efa93960fa8eb46a85a45781f3121bb895fa5203108f3d690d21085f9c1cfccbd98de9b8e7e95ae070bcf5d",
                        cycle_length: 20,
                        enroll_sig:
                            "0xa72ed0e4b392632c51a923a79b319d9db6c5269319bb94ecff4588c18d0a9a1c0d8643332da454d7a9e7c1272ebf1d93ba2f1ff3b121921d00d81062e14480b9",
                    },
                ],
                missing_validators: [],
                time_offset: 0,
            },
            txs: [
                {
                    inputs: [],
                    outputs: [
                        {
                            type: 1,
                            value: "20000000000000",
                            lock: {
                                type: 0,
                                bytes: "md+rscNMxR56h8elO/gUP2jLjLexx9ALiKlFkUP6QJw=",
                            },
                        },
                        {
                            type: 1,
                            value: "20000000000000",
                            lock: {
                                type: 0,
                                bytes: "md/Htzi9l1+CNrZHMyQfipVV1SjaQLkcHeVhnEq2VbI=",
                            },
                        },
                        {
                            type: 1,
                            value: "20000000000000",
                            lock: {
                                type: 0,
                                bytes: "md/WbB8VmRdvGFYPX6vlrdZnYyMwuqTw2QkbELhdOPg=",
                            },
                        },
                        {
                            type: 1,
                            value: "20000000000000",
                            lock: {
                                type: 0,
                                bytes: "2d/QYt76oor16BDI7Zjo7u69xxoXckflZ2UUkckpy1I=",
                            },
                        },
                        {
                            type: 1,
                            value: "20000000000000",
                            lock: {
                                type: 0,
                                bytes: "2d/q7TwE3NlkFoqZgk4Ccyvyo2DC7/b3KO/eiEFkKI0=",
                            },
                        },
                        {
                            type: 1,
                            value: "20000000000000",
                            lock: {
                                type: 0,
                                bytes: "2d/5DryFWxR9By2JsVOo/1SZfq7UQuek1+mwNTVE1zE=",
                            },
                        },
                    ],
                    payload: "",
                    lock_height: "0",
                },
                {
                    inputs: [],
                    outputs: [
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                        {
                            type: 0,
                            value: "610000000000000",
                            lock: {
                                type: 0,
                                bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                            },
                        },
                    ],
                    payload: "",
                    lock_height: "0",
                },
            ],
            merkle_tree: [
                "0x669b0c098d740f6926341d1167cd7f03e221aebb47453258c4e5736e41d6b0c0b04d4f850a98a7dfbb5974aed61097603836a1968a882791246fc9e66ada36f6",
                "0xd4b2011f46b7de32e6a3f51eae35c97440b7adf427df7725d19575b8a9a8256552939656f8b5d4087b9bcbbe9219504e31f91a85fb1709683cbefc3962639ecd",
                "0x255b9a117f5abbbb7f1a38c5184b84d8fd4109c8f7f0e41472e0ac82adaae9ae41615e8eca8be9dcb7cc775aa9869ad617101a4f045e13a8232d73fbc2cf9a9e",
            ],
        };
        block = sdk.Block.reviver("", sample);
    });

    it("Test that serialize and deserialize transaction", () => {
        const buffer = new SmartBuffer();
        block.txs[0].serialize(buffer);
        buffer.readOffset = 0;
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "000601002099dfabb1c34cc51e7a87c7a53bf8143f68cb8cb7b1c7d00b88a9459143fa409cff0040e59c3012000001002099dfc7b738bd975f8236b64733241f8a9555d528da40b91c1de5619c4ab655b2ff0040e59c3012000001002099dfd66c1f1599176f18560f5fabe5add667632330baa4f0d9091b10b85d38f8ff0040e59c30120000010020d9dfd062defaa28af5e810c8ed98e8eeeebdc71a177247e567651491c929cb52ff0040e59c30120000010020d9dfeaed3c04dcd964168a99824e02732bf2a360c2eff6f728efde884164288dff0040e59c30120000010020d9dff90ebc855b147d072d89b153a8ff54997eaed442e7a4d7e9b0353544d731ff0040e59c301200000000"
        );

        buffer.readOffset = 0;
        const tx = sdk.Transaction.deserialize(buffer);
        assert.deepStrictEqual(block.txs[0], tx, "When serialize, then deserialize, it does not match the original.");
    });

    it("Test that serialize and deserialize enrollment", () => {
        const buffer = new SmartBuffer();
        block.header.enrollments[0].serialize(buffer);
        buffer.readOffset = 0;
        assert.strictEqual(
            buffer.toBuffer().toString("hex"),
            "3bd450906d787b63791eb7f66fd6622014d59b1262f9697420732bc822772e790caf56ad071c0a4447480585496561c89383fb15bc3a40a23e5a312c6a24df0032639f196c8fa4ffffd24ccf02a4c12b6a93ab8816a9670e77306b5c72c171d62807b40a0138f6647c161794c0c3ef6c9fa74f468761a28807a01e084219a845140604b2ee69c88a419291318312a119f6f8be7b47e42b353fb29ce97f4059f9e349c4af51fe7b73b72945db5cca0cd8ad6ef378de31ddeda209bdab2e849a8908"
        );

        buffer.readOffset = 0;
        const enrollment = sdk.Enrollment.deserialize(buffer);
        assert.deepStrictEqual(
            block.header.enrollments[0],
            enrollment,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize bit-mask", () => {
        const buffer = new SmartBuffer();
        block.header.validators.serialize(buffer);
        buffer.readOffset = 0;
        assert.strictEqual(buffer.toBuffer().toString("hex"), "040140");

        buffer.readOffset = 0;
        const bit_mask = sdk.BitMask.deserialize(buffer);
        assert.deepStrictEqual(
            block.header.validators,
            bit_mask,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize block header", () => {
        const buffer = new SmartBuffer();
        block.header.serialize(buffer);
        buffer.readOffset = 0;
        assert.strictEqual(
            buffer.toBuffer().toString("hex"),
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009e9acfc2fb732d23a8135e044f1a1017d69a86a95a77ccb7dce98bca8e5e6141aee9aaad82ace07214e4f0f7c80941fdd8844b18c5381a7fbbbb5a7f119a5b25000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004014000063bd450906d787b63791eb7f66fd6622014d59b1262f9697420732bc822772e790caf56ad071c0a4447480585496561c89383fb15bc3a40a23e5a312c6a24df0032639f196c8fa4ffffd24ccf02a4c12b6a93ab8816a9670e77306b5c72c171d62807b40a0138f6647c161794c0c3ef6c9fa74f468761a28807a01e084219a845140604b2ee69c88a419291318312a119f6f8be7b47e42b353fb29ce97f4059f9e349c4af51fe7b73b72945db5cca0cd8ad6ef378de31ddeda209bdab2e849a890820ac05d7a0c7c2e7e1c46681ccff7a32446dacaecaf766e907e974b137bc56d6e0e736088871b19c0c67064be9610bac0f17067b13568bd2b7efda4c2d5d8b3910e5580a53dba0505e4a9265a7da012d3750f6b5789c0f160ef852ed55259c07d854dd9f36dea6adf42577607b6dea0fcffa50c1e8a926e1aa7a944e40012467142cd22af5f70f9c4c4383139dd604270fd8fb9b99f00942f1c2e7b803bfceff07af526b8594df82b29a324b5de795b99aaaf93babbe6c977f0c387d697921700593888364cd78c8ce5d3abfdf88faf015ba585fd98be186a42696342b80558985f747014431598ff0a28f7aabbd60f17536e4266626e8064ca72814dfe4f383850c9c293d358fd611d22f37f0510ee7cb0856d6e086b452d016f41df518e2d2e5a7c7f33c6b6a9d9074dffa5b0d0feed07aa08909103aa5f7daa9ef62e8822507144fcd98678ad5e455dea5516f97d0f8c8e368bab1119a2f7be3a69019beef5e370502cc28307e8256d7be338fd524ab6efeea907747f04d9196d8f4c243b7010dc8516f604bab1518e3e11a968c1e4b3e8a1a40df2e69f564ae2f4df1913d3f152913af960673798d0f12a8f4018aa3dec7b1ce2a8bc322e11246f7af4d3c9191bb37e23934f978191f6b7fe5feb8033966f5fb1125607a78a5902a91de3163a03c3e41bb1b2bb1c0bd38a17c62c02bcb0fe96d1eada6a5e303108427ed2e892714f576feaad73a99cf4ecad64279d4d7579d8479437efb6115e610983dc6c6a3e9d8a5737cc90bcf01011bfe3a8a3028e01644c8426677f2e5003bf1b3674e5d07da6bdb579c215549b36e2bf65b5ee5b9728ba386644dc68dca515ccca88880eb2ab04a1deccbe913b410709a911018130bf743f56f256c3678e4d67fb685a4a58e0ad3d6a1ff88e2e27a805162d28aac101761653e918f373a9137e019b34b4401b78d0fd2eb7516e2e168d7fe2ba69b47312979b2f9e907f357916fd7a7740d14a4a2bcab100af733a9309d4e37e2145b8abf159426c2d47ac7ba6e87f58983012cef18d3d2408b8ee335186d59055c343362c8412863fad4cbd0f61aaffbe10f97fb5a0b2c0c3ed33342c5b58cd451cb126f5aa85febe3ba4e5a2a20f6a8c5abfbd199a5accec75d89222f9476964386b4e392119ca6eb70ae998330416da5ad5dcf0b07ae957e8e9bde98bdcccfc1f98510d290d6f3083120a55f89bb21311f78455aa846eba80f9693fa5ee8f85dfdd4a9e70139c99c2822252daf5dbff3e2141c9a0a8dc18845ffec94bb199326c5b69d9d319ba723a9512c6392b3e4d02ea7b98044e16210d8001d9221b1f31f2fba931dbf2e27c1e7a9d754a42d3343860d0000"
        );
        buffer.readOffset = 0;
        const header = sdk.BlockHeader.deserialize(buffer);
        assert.deepStrictEqual(
            block.header,
            header,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize block", () => {
        const buffer = new SmartBuffer();
        block.serialize(buffer);
        buffer.readOffset = 0;
        assert.strictEqual(
            buffer.toBuffer().toString("hex"),
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009e9acfc2fb732d23a8135e044f1a1017d69a86a95a77ccb7dce98bca8e5e6141aee9aaad82ace07214e4f0f7c80941fdd8844b18c5381a7fbbbb5a7f119a5b25000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004014000063bd450906d787b63791eb7f66fd6622014d59b1262f9697420732bc822772e790caf56ad071c0a4447480585496561c89383fb15bc3a40a23e5a312c6a24df0032639f196c8fa4ffffd24ccf02a4c12b6a93ab8816a9670e77306b5c72c171d62807b40a0138f6647c161794c0c3ef6c9fa74f468761a28807a01e084219a845140604b2ee69c88a419291318312a119f6f8be7b47e42b353fb29ce97f4059f9e349c4af51fe7b73b72945db5cca0cd8ad6ef378de31ddeda209bdab2e849a890820ac05d7a0c7c2e7e1c46681ccff7a32446dacaecaf766e907e974b137bc56d6e0e736088871b19c0c67064be9610bac0f17067b13568bd2b7efda4c2d5d8b3910e5580a53dba0505e4a9265a7da012d3750f6b5789c0f160ef852ed55259c07d854dd9f36dea6adf42577607b6dea0fcffa50c1e8a926e1aa7a944e40012467142cd22af5f70f9c4c4383139dd604270fd8fb9b99f00942f1c2e7b803bfceff07af526b8594df82b29a324b5de795b99aaaf93babbe6c977f0c387d697921700593888364cd78c8ce5d3abfdf88faf015ba585fd98be186a42696342b80558985f747014431598ff0a28f7aabbd60f17536e4266626e8064ca72814dfe4f383850c9c293d358fd611d22f37f0510ee7cb0856d6e086b452d016f41df518e2d2e5a7c7f33c6b6a9d9074dffa5b0d0feed07aa08909103aa5f7daa9ef62e8822507144fcd98678ad5e455dea5516f97d0f8c8e368bab1119a2f7be3a69019beef5e370502cc28307e8256d7be338fd524ab6efeea907747f04d9196d8f4c243b7010dc8516f604bab1518e3e11a968c1e4b3e8a1a40df2e69f564ae2f4df1913d3f152913af960673798d0f12a8f4018aa3dec7b1ce2a8bc322e11246f7af4d3c9191bb37e23934f978191f6b7fe5feb8033966f5fb1125607a78a5902a91de3163a03c3e41bb1b2bb1c0bd38a17c62c02bcb0fe96d1eada6a5e303108427ed2e892714f576feaad73a99cf4ecad64279d4d7579d8479437efb6115e610983dc6c6a3e9d8a5737cc90bcf01011bfe3a8a3028e01644c8426677f2e5003bf1b3674e5d07da6bdb579c215549b36e2bf65b5ee5b9728ba386644dc68dca515ccca88880eb2ab04a1deccbe913b410709a911018130bf743f56f256c3678e4d67fb685a4a58e0ad3d6a1ff88e2e27a805162d28aac101761653e918f373a9137e019b34b4401b78d0fd2eb7516e2e168d7fe2ba69b47312979b2f9e907f357916fd7a7740d14a4a2bcab100af733a9309d4e37e2145b8abf159426c2d47ac7ba6e87f58983012cef18d3d2408b8ee335186d59055c343362c8412863fad4cbd0f61aaffbe10f97fb5a0b2c0c3ed33342c5b58cd451cb126f5aa85febe3ba4e5a2a20f6a8c5abfbd199a5accec75d89222f9476964386b4e392119ca6eb70ae998330416da5ad5dcf0b07ae957e8e9bde98bdcccfc1f98510d290d6f3083120a55f89bb21311f78455aa846eba80f9693fa5ee8f85dfdd4a9e70139c99c2822252daf5dbff3e2141c9a0a8dc18845ffec94bb199326c5b69d9d319ba723a9512c6392b3e4d02ea7b98044e16210d8001d9221b1f31f2fba931dbf2e27c1e7a9d754a42d3343860d000002000601002099dfabb1c34cc51e7a87c7a53bf8143f68cb8cb7b1c7d00b88a9459143fa409cff0040e59c3012000001002099dfc7b738bd975f8236b64733241f8a9555d528da40b91c1de5619c4ab655b2ff0040e59c3012000001002099dfd66c1f1599176f18560f5fabe5add667632330baa4f0d9091b10b85d38f8ff0040e59c30120000010020d9dfd062defaa28af5e810c8ed98e8eeeebdc71a177247e567651491c929cb52ff0040e59c30120000010020d9dfeaed3c04dcd964168a99824e02732bf2a360c2eff6f728efde884164288dff0040e59c30120000010020d9dff90ebc855b147d072d89b153a8ff54997eaed442e7a4d7e9b0353544d731ff0040e59c30120000000000080000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a02000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff002050b1ca2a0200000003f636da6ae6c96f249127888a96a13638609710d6ae7459bbdfa7980a854f4db0c0b0d6416e73e5c458324547bbae21e2037fcd67111d3426690f748d090c9b66cd9e636239fcbe3c680917fb851af9314e501992becb9b7b08d4b5f8569693526525a8a9b87595d12577df27f4adb74074c935ae1ef5a3e632deb7461f01b2d49e9acfc2fb732d23a8135e044f1a1017d69a86a95a77ccb7dce98bca8e5e6141aee9aaad82ace07214e4f0f7c80941fdd8844b18c5381a7fbbbb5a7f119a5b25"
        );

        buffer.readOffset = 0;
        const deserialized_block = sdk.Block.deserialize(buffer);
        assert.deepStrictEqual(
            block,
            deserialized_block,
            "When serialize, then deserialize, it does not match the original."
        );
    });
});
