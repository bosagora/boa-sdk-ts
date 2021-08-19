/*******************************************************************************

    Test for utility functions

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

describe("Test of isInteger, isPositiveInteger, isNegativeInteger", () => {
    it("isInteger", () => {
        assert.ok(!sdk.Utils.isInteger("a12345678901234567890"));
        assert.ok(sdk.Utils.isInteger("12345678901234567890"));
        assert.ok(sdk.Utils.isInteger("+12345678901234567890"));
        assert.ok(sdk.Utils.isInteger("-12345678901234567890"));
    });

    it("isPositiveInteger", () => {
        assert.ok(!sdk.Utils.isPositiveInteger("a12345678901234567890"));
        assert.ok(sdk.Utils.isPositiveInteger("12345678901234567890"));
        assert.ok(sdk.Utils.isPositiveInteger("+12345678901234567890"));
        assert.ok(!sdk.Utils.isPositiveInteger("-12345678901234567890"));
    });

    it("isNegativeInteger", () => {
        assert.ok(!sdk.Utils.isNegativeInteger("a12345678901234567890"));
        assert.ok(!sdk.Utils.isNegativeInteger("12345678901234567890"));
        assert.ok(!sdk.Utils.isNegativeInteger("+12345678901234567890"));
        assert.ok(sdk.Utils.isNegativeInteger("-12345678901234567890"));
    });
});

describe("Test for JSON serialization", () => {
    it("Test that `JSON.stringify` correctly picks up `Height.toJSON`", () => {
        const height = new sdk.Height("45");
        const json = JSON.stringify(height);
        assert.strictEqual(json, `"45"`);
    });

    it("Test that `Height.toJSON` works within an object", () => {
        const height = new sdk.Height("45");
        const json = JSON.stringify({ value: height });
        assert.strictEqual(json, `{"value":"45"}`);
    });
});

describe("Test of Utils", () => {
    before("Wait for the package libsodium to finish loading", async () => {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    it("Test of Utils.compareBuffer", () => {
        const a = Buffer.from([6, 3, 2, 1]);
        const b = Buffer.from([5, 4, 2, 1]);
        const c = Buffer.from(b);

        assert.strictEqual(sdk.Utils.writeToString(a), "0x01020306");
        assert.strictEqual(sdk.Utils.writeToString(b), "0x01020405");
        assert.strictEqual(sdk.Utils.writeToString(c), "0x01020405");

        assert.ok(Buffer.compare(a, b) > 0);
        assert.ok(sdk.Utils.compareBuffer(a, b) < 0);
        assert.ok(sdk.Utils.compareBuffer(b, a) > 0);
        assert.ok(sdk.Utils.compareBuffer(b, c) === 0);
        assert.ok(sdk.Utils.compareBuffer(c, b) === 0);

        const x = Buffer.from([5, 4, 3, 4, 1]);
        const y = Buffer.from([6, 5, 4, 3, 4, 1]);
        assert.ok(sdk.Utils.compareBuffer(x, y) < 0);
        assert.ok(sdk.Utils.compareBuffer(y, x) > 0);
    });

    it("Test of sizeof keys", () => {
        assert.strictEqual(sdk.Utils.SIZE_OF_PUBLIC_KEY, sdk.SodiumHelper.sodium.crypto_core_ed25519_BYTES);
        assert.strictEqual(sdk.Utils.SIZE_OF_SECRET_KEY, sdk.SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES);
    });

    it("Test of BitMask JSON serialization", () => {
        const validator = sdk.BitMask.fromString("01010101010101010");
        assert.strictEqual(JSON.stringify(validator), `"01010101010101010"`);
    });

    it("Test of writeJSBigIntLE, readJSBigIntLE", () => {
        const buffer = Buffer.allocUnsafe(8);
        const original = sdk.JSBI.BigInt("9007199254740992");
        sdk.Utils.writeJSBigIntLE(buffer, original);
        const value = sdk.Utils.readJSBigIntLE(buffer);
        assert.deepStrictEqual(value, original);
    });

    it("Test of readBuffer", () => {
        const source = SmartBuffer.fromBuffer(Buffer.from("1234567890"));
        let result = sdk.Utils.readBuffer(source, 10);
        assert.deepStrictEqual(source.toBuffer(), result);

        source.readOffset = 0;
        assert.throws(() => {
            result = sdk.Utils.readBuffer(source, 12);
        }, new Error("Requested 12 bytes but only 10 bytes available"));
    });

    it("Test of VarInt serialization", () => {
        const buffer = new SmartBuffer();
        sdk.VarInt.fromNumber(0, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0]));

        buffer.clear();
        sdk.VarInt.fromNumber(252, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfc]));

        buffer.clear();
        sdk.VarInt.fromNumber(253, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfd, 0xfd, 0x00]));

        buffer.clear();
        sdk.VarInt.fromNumber(255, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfd, 0xff, 0x00]));

        buffer.clear();
        sdk.VarInt.fromNumber(0xffff, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfd, 0xff, 0xff]));

        buffer.clear();
        sdk.VarInt.fromNumber(0x10000, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfe, 0x00, 0x00, 0x01, 0x00]));

        buffer.clear();
        sdk.VarInt.fromNumber(0xffffffff, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(0), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(252), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfc]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(253), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfd, 0xfd, 0x00]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(255), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfd, 0xff, 0x00]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(0xffff), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfd, 0xff, 0xff]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(0x10000), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfe, 0x00, 0x00, 0x01, 0x00]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(0xffffffff), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff]));

        buffer.clear();
        sdk.VarInt.fromJSBI(sdk.JSBI.BigInt(0x100000000), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]));

        buffer.clear();
        const unsigned_log_max = sdk.JSBI.add(
            sdk.JSBI.leftShift(sdk.JSBI.BigInt(0xffffffff), sdk.JSBI.BigInt(32)),
            sdk.JSBI.BigInt(0xffffffff)
        );
        sdk.VarInt.fromJSBI(unsigned_log_max, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
    });

    it("Test of VarInt deserialization", () => {
        const buffer = new SmartBuffer();
        buffer.writeBuffer(Buffer.from([]));
        assert.throws(() => {
            sdk.VarInt.toNumber(buffer);
        }, new Error("Requested 1 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd]));
        assert.throws(() => {
            sdk.VarInt.toNumber(buffer);
        }, new Error("Requested 2 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfe]));
        assert.throws(() => {
            sdk.VarInt.toNumber(buffer);
        }, new Error("Requested 4 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([]));
        assert.throws(() => {
            sdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 1 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd]));
        assert.throws(() => {
            sdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 2 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfe]));
        assert.throws(() => {
            sdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 4 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xff]));
        assert.throws(() => {
            sdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 8 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 0);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfc]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 252);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd, 0xfd, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 253);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd, 0xff, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 255);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd, 0xff, 0xff]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 0xffff);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfe, 0x00, 0x00, 0x01, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 0x10000);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff]));
        assert.deepStrictEqual(sdk.VarInt.toNumber(buffer), 0xffffffff);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(0));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfc]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(252));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd, 0xfd, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(253));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd, 0xff, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(255));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfd, 0xff, 0xff]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(0xffff));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfe, 0x00, 0x00, 0x01, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(0x10000));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(0xffffffff));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), sdk.JSBI.BigInt(0x100000000));

        buffer.clear();
        const unsigned_log_max = sdk.JSBI.add(
            sdk.JSBI.leftShift(sdk.JSBI.BigInt(0xffffffff), sdk.JSBI.BigInt(32)),
            sdk.JSBI.BigInt(0xffffffff)
        );
        buffer.writeBuffer(Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
        assert.deepStrictEqual(sdk.VarInt.toJSBI(buffer), unsigned_log_max);
    });

    it("Test of iota", () => {
        let array: number[] = [];
        sdk.iota(5).forEach((value: number) => array.push(value));
        assert.deepStrictEqual(array, [0, 1, 2, 3, 4]);

        array.length = 0;
        sdk.iota(2, 5).forEach((value: number) => array.push(value));
        assert.deepStrictEqual(array, [2, 3, 4]);

        array.length = 0;
        sdk.iota(5, 2, -1).forEach((value: number) => array.push(value));
        assert.deepStrictEqual(array, [5, 4, 3]);

        array.length = 0;
        sdk.iota(1, 5, 2).forEach((value: number) => array.push(value));
        assert.deepStrictEqual(array, [1, 3]);

        array.length = 0;
        sdk.iota(5, 1, -2).forEach((value: number) => array.push(value));
        assert.deepStrictEqual(array, [5, 3]);

        array.length = 0;
        sdk.iota(10).forEach((value: number) => array.push(value));
        assert.deepStrictEqual(array, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        array = sdk.iota(5).filter((value: number) => value % 2 === 1);
        assert.deepStrictEqual(array, [1, 3]);

        array = sdk.iota(5).map((value: number) => value * 2);
        assert.deepStrictEqual(array, [0, 2, 4, 6, 8]);

        const sum = sdk.iota(5).reduce<number>((prev: number, value: number) => {
            return prev + value;
        }, 0);
        assert.deepStrictEqual(sum, 10);

        const str = sdk.iota(5).reduce<string>((prev: string, value: number) => {
            return prev + value.toString();
        }, "");
        assert.deepStrictEqual(str, "01234");
    });
});
