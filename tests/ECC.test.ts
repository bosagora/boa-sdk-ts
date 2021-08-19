/*******************************************************************************

    Test for ECC

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

describe("Test of ECC", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Test Scalar fromString / toString functions", () => {
        const s = "0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ec";
        const scalar = new sdk.Scalar(s);
        assert.strictEqual(scalar.toString(false), s);
    });

    it("Test of Scalar.isValid() - valid", () => {
        assert.ok(new sdk.Scalar("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ec").isValid());
        assert.ok(new sdk.Scalar("0x0eadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef").isValid());
        assert.ok(new sdk.Scalar("0x0000000000000000000000000000000000000000000000000000000000000001").isValid());
    });

    it("Test of Scalar.isValid() - invalid", () => {
        assert.ok(!new sdk.Scalar("0x0000000000000000000000000000000000000000000000000000000000000000").isValid());
        assert.ok(!new sdk.Scalar("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed").isValid());
        assert.ok(!new sdk.Scalar("0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef").isValid());
        assert.ok(!new sdk.Scalar("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").isValid());
    });

    it("Test of Scalar.fromHash", () => {
        const message = "BOSAGORA for the win";
        const c = sdk.Scalar.fromHash(sdk.hashFull(message)); // challenge
        assert.strictEqual(c.toString(false), "0x07c51164f99d03f143cfafdfb8638826b87f86c73b82180c33cfb11dbaba1df3");
    });

    it("Test of Scalar function", () => {
        const s1: sdk.Scalar = sdk.Scalar.random();
        const s2: sdk.Scalar = sdk.Scalar.random();
        const s3: sdk.Scalar = sdk.Scalar.add(s1, s2);

        assert.deepStrictEqual(sdk.Scalar.sub(s3, s1), s2);
        assert.deepStrictEqual(sdk.Scalar.sub(s3, s2), s1);
        assert.ok(sdk.Scalar.sub(s3, s3).isNull());
        assert.deepStrictEqual(s3.negate(), sdk.Scalar.sub(s1.negate(), s2));
        assert.deepStrictEqual(s3.negate(), sdk.Scalar.sub(s2.negate(), s1));

        const Zero: sdk.Scalar = sdk.Scalar.add(s3, s3.negate());
        assert.ok(Zero.isNull());

        const One: sdk.Scalar = sdk.Scalar.add(s3, s3.complement());
        assert.deepStrictEqual(sdk.Scalar.mul(One, One), One);

        assert.deepStrictEqual(sdk.Scalar.add(Zero, One), One);
        assert.deepStrictEqual(sdk.Scalar.add(One, Zero), One);

        const G: sdk.Point = One.toPoint();
        assert.deepStrictEqual(sdk.Point.add(G, G), sdk.Scalar.add(One, One).toPoint());

        const p1: sdk.Point = s1.toPoint();
        const p2: sdk.Point = s2.toPoint();
        const p3: sdk.Point = s3.toPoint();

        assert.deepStrictEqual(s1.toPoint(), p1);
        assert.deepStrictEqual(sdk.Point.sub(p3, p1), p2);
        assert.deepStrictEqual(sdk.Point.sub(p3, p2), p1);

        assert.deepStrictEqual(
            sdk.Point.add(sdk.Point.scalarMul(s1, p2), sdk.Point.scalarMul(s2, p2)),
            sdk.Point.scalarMul(s3, p2)
        );

        const pZero: sdk.Point = sdk.Point.Null;
        assert.deepStrictEqual(sdk.Point.add(pZero, G), G);
        assert.deepStrictEqual(sdk.Point.add(G, pZero), G);
    });

    it("Test of Point.isValid() - valid", () => {
        const valid = new sdk.Point("0xab4f6f6e85b8d0d38f5d5798a4bdc4dd444c8909c8a5389d3bb209a18610511b");
        assert.ok(valid.isValid());

        const invalid = new sdk.Point("0xab4f6f6e85b8d0d38f5d5798a4bdc4dd444c8909c8a5389d3bb209a18610511c");
        assert.ok(!invalid.isValid());

        const invalid2: sdk.Point = sdk.Point.Null;
        assert.ok(!invalid2.isValid());
    });
});
