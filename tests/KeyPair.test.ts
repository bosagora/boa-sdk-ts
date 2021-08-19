/*******************************************************************************

    Test for KeyPair, PublicKey, SecretKey and Seed

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import { base32Decode, base32Encode } from "@ctrl/ts-base32";
import * as assert from "assert";
import { bech32, bech32m } from "bech32";

describe("Public Key", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Test Bech32", () => {
        const addresses_bech32 = [
            // CoinNet Genesis Address
            // GDGENYO6TWO6EZG2OXEBVDCNKLHCV2UFLLZY6TJMWTGR23UMJHVHLHKJ
            {
                address: "boa1xrxydcw7nkw7yex6whyp4rzd2t8z4659ttec7nfvknx36m5vf8482zsr6r4",
                bytes: [
                    204, 70, 225, 222, 157, 157, 226, 100, 218, 117, 200, 26, 140, 77, 82, 206, 42, 234, 133, 90, 243,
                    143, 77, 44, 180, 205, 29, 110, 140, 73, 234, 117,
                ],
            },
            // CoinNet CommonsBudget Address
            // GCOMBBXA6ON7PT7APS4IWS4N53FCBQTLWBPIU4JR2DSOBCA72WEB4XU4
            {
                address: "boa1xzwvpphq7wdl0nlq0jugkjudam9zpsntkp0g5uf36rjwpzql6kypuc3gffp",
                bytes: [
                    156, 192, 134, 224, 243, 155, 247, 207, 224, 124, 184, 139, 75, 141, 238, 202, 32, 194, 107, 176,
                    94, 138, 113, 49, 208, 228, 224, 136, 31, 213, 136, 30,
                ],
            },
            // TestNet Genesis Address
            // GDGENES4KXH7RQJELTONR7HSVISVSQ5POSVBEWLR6EEIIL72H24IEDT4
            {
                address: "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugypjzxpf",
                bytes: [
                    204, 70, 146, 92, 85, 207, 248, 193, 36, 92, 220, 216, 252, 242, 170, 37, 89, 67, 175, 116, 170, 18,
                    89, 113, 241, 8, 132, 47, 250, 62, 184, 130,
                ],
            },
            // TestNet CommonsBudget Address
            // GDCOMMO272NFWHV5TQAIQFEDLQZLBMVVOJTHC3F567ZX4ZSRQQQWGLI3
            {
                address: "boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskx7thkmj",
                bytes: [
                    196, 230, 49, 218, 254, 154, 91, 30, 189, 156, 0, 136, 20, 131, 92, 50, 176, 178, 181, 114, 102,
                    113, 108, 189, 247, 243, 126, 102, 81, 132, 33, 99,
                ],
            },
            // Null Address
            {
                address: "boa1xqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqgezvze",
                bytes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
            // GDNODE2JBW65U6WVIOESR3OTJUFOHPHTEIL4GQINDB3MVB645KXAHG73
            {
                address: "boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqxtmjcu3",
                bytes: [
                    218, 225, 147, 73, 13, 189, 218, 122, 213, 67, 137, 40, 237, 211, 77, 10, 227, 188, 243, 34, 23,
                    195, 65, 13, 24, 118, 202, 135, 220, 234, 174, 3,
                ],
            },
            // GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW
            {
                address: "boa1xrra39xpg5q9zwhsq6u7pw508z2let6dj8r5lr4q0d0nff240fvd2tct454",
                bytes: [
                    199, 216, 148, 193, 69, 0, 81, 58, 240, 6, 185, 224, 186, 143, 56, 149, 252, 175, 77, 145, 199, 79,
                    142, 160, 123, 95, 52, 165, 85, 122, 88, 213,
                ],
            },
            // GBFDLGQQDDE2CAYVELVPXUXR572ZT5EOTMGJQBPTIHSLPEOEZYQQCEWN
            {
                address: "boa1xp9rtxssrry6zqc4yt40h5h3al6enaywnvxfsp0ng8jt0ywyecssz9deump",
                bytes: [
                    74, 53, 154, 16, 24, 201, 161, 3, 21, 34, 234, 251, 210, 241, 239, 245, 153, 244, 142, 155, 12, 152,
                    5, 243, 65, 228, 183, 145, 196, 206, 33, 1,
                ],
            },
            // GBYK4I37MZKLL4A2QS7VJCTDIIJK7UXWQWKXKTQ5WZGT2FPCGIVIQCY5
            {
                address: "boa1xpc2ugmlve2ttuq6sjl4fznrggf2l5hksk2h2nsakexn690zxg4gs9f3rtg",
                bytes: [
                    112, 174, 35, 127, 102, 84, 181, 240, 26, 132, 191, 84, 138, 99, 66, 18, 175, 210, 246, 133, 149,
                    117, 78, 29, 182, 77, 61, 21, 226, 50, 42, 136,
                ],
            },
            // GCKLKUWUDJNWPSTU7MEN55KFBKJMQIB7H5NQDJ7MGGQVNYIVHB5ZM5XP
            {
                address: "boa1xz2t25k5rfdk0jn5lvydaa29p2fvsgpl8adsrflvxxs4dcg48paevj87akp",
                bytes: [
                    148, 181, 82, 212, 26, 91, 103, 202, 116, 251, 8, 222, 245, 69, 10, 146, 200, 32, 63, 63, 91, 1,
                    167, 236, 49, 161, 86, 225, 21, 56, 123, 150,
                ],
            },
        ];

        addresses_bech32.forEach((m) => {
            const data: number[] = [];
            const conv_data: number[] = [];
            const revert_data: number[] = [];

            data.push(48);
            data.push(...m.bytes);
            sdk.Utils.convertBits(conv_data, data, 8, 5, true);
            sdk.Utils.convertBits(revert_data, conv_data, 5, 8, false);
            assert.deepStrictEqual(revert_data, data);

            const addr_str = bech32.encode("boa", conv_data);
            assert.deepStrictEqual(addr_str, m.address);

            const dec = bech32.decode(m.address);
            const dec_data: number[] = [];
            assert.deepStrictEqual(dec.words, conv_data);
            sdk.Utils.convertBits(dec_data, dec.words, 5, 8, false);
            assert.deepStrictEqual(dec_data, data);
        });
    });

    it("Extract the public key from a string then convert it back into a string and compare it.", () => {
        const address = "boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0";
        const public_key = new sdk.PublicKey(address);
        assert.strictEqual(public_key.toString(), address);
    });

    it("Test of PublicKey.validate()", () => {
        assert.strictEqual(
            sdk.PublicKey.validate("bob1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0"),
            "Differ in the human-readable part"
        );
        assert.strictEqual(
            sdk.PublicKey.validate("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssu34lg0"),
            "Invalid checksum for boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssu34lg0"
        );
        assert.strictEqual(
            sdk.PublicKey.validate("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0"),
            ""
        );

        const pk = new sdk.PublicKey("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0");
        const data: number[] = [];
        const conv_data: number[] = [];
        data.push(48);
        pk.data.forEach((m) => data.push(m));
        const invalid_data = data.slice(0, -1);
        sdk.Utils.convertBits(conv_data, invalid_data, 8, 5, true);
        const invalid_addr_str = bech32m.encode("boa", conv_data);
        assert.strictEqual(sdk.PublicKey.validate(invalid_addr_str), "Decoded data size is not normal");
    });
});

describe("Secret Key", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Extract the seed from a string then convert it back into a string and compare it.", () => {
        const secret_str = "SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI";
        const secret_key = new sdk.SecretKey(secret_str);
        assert.strictEqual(secret_key.toString(false), secret_str);
    });

    it("Test of Seed.validate()", () => {
        assert.strictEqual(
            sdk.SecretKey.validate("SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZ"),
            "Decoded data size is not normal"
        );
        assert.strictEqual(
            sdk.SecretKey.validate("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"),
            "This is not a valid seed type"
        );
        assert.strictEqual(sdk.SecretKey.validate("SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI"), "");

        const decoded = Buffer.from(base32Decode("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ"));
        const body = decoded.slice(0, -2);
        const checksum = decoded.slice(-2);
        const invalid_decoded = Buffer.concat([body, checksum.map((n) => ~n)]);
        const invalid_seed = base32Encode(invalid_decoded);
        assert.strictEqual(sdk.SecretKey.validate(invalid_seed), "Checksum result do not match");
    });
});

describe("KeyPair", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    // See: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d#L391-L404
    it("Test of KeyPair.fromSeed, sign, verify", () => {
        const address = `boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqx78z5en`;
        const seed = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;

        const kp = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));
        assert.strictEqual(kp.address.toString(), address);

        const signature = kp.secret.sign<Buffer>(Buffer.from("Hello World"));
        assert.ok(kp.address.verify<Buffer>(signature, Buffer.from("Hello World")));
    });

    it("Test of KeyPair.random, sign, verify, reproduce", () => {
        const random_kp = sdk.KeyPair.random();

        const random_kp_signature = random_kp.secret.sign<Buffer>(Buffer.from("Hello World"));
        assert.ok(random_kp.address.verify<Buffer>(random_kp_signature, Buffer.from("Hello World")));

        // Test whether randomly generated key-pair are reproducible.
        const reproduced_kp = sdk.KeyPair.fromSeed(random_kp.secret);

        const reproduced_kp_signature = reproduced_kp.secret.sign<Buffer>(Buffer.from("Hello World"));
        assert.ok(reproduced_kp.address.verify<Buffer>(reproduced_kp_signature, Buffer.from("Hello World")));

        assert.deepStrictEqual(random_kp.secret, reproduced_kp.secret);
        assert.deepStrictEqual(random_kp.address, reproduced_kp.address);
    });

    it("Test of KeyPair.isValidRandomBytes()", () => {
        let random_bytes = Buffer.from(
            "1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed",
            "hex"
        ).reverse();
        assert.ok(!sdk.KeyPair.isValidRandomBytes(random_bytes));

        random_bytes = Buffer.from("1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ec", "hex").reverse();
        assert.ok(sdk.KeyPair.isValidRandomBytes(random_bytes));
    });
});
