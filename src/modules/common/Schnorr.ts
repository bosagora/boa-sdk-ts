/*******************************************************************************

    Low level utilities to perform Schnorr signatures on Curve25519.

    Through this module, lowercase letters represent scalars and uppercase
    letters represent points. Multiplication of a scalar by a point,
    which is adding a point to itself multiple times, is represented with '*',
    e.g. `a * G`. Uppercase letters are point representations of scalars,
    that is, the scalar multiplied by the generator, e.g. `r == r * G`.
    `x` is the private key, `X` is the public key, and `H()` is the Blake2b
    512 bits hash reduced to a scalar in the field.

    Following the Schnorr BIP (see links), signatures are of the form
    `(R,s)` and satisfy `s * G = R + H(X || R || m) * X`.
    `r` is referred to as the nonce and is a cryptographically randomly
    generated number that should neither be reused nor leaked.

    Signature_Aggregation:
    Since Schnorr signatures use a linear equation, they can be simply
    combined with addition, enabling `O(1)` signature verification
    time and `O(1)` and `O(1)` signature size.
    Additionally, since the `c` factor does not depend on EC operation,
    we can do batch verification, enabling us to speed up verification
    when verifying large amount of data (e.g. a block).

    See_Also:
        - https://en.wikipedia.org/wiki/Curve25519
        - https://en.wikipedia.org/wiki/Schnorr_signature
        - https://medium.com/blockstream/reducing-bitcoin-transaction-sizes-with-x-only-pubkeys-f86476af05d7

    Copyright:
        Copyright (c) 2019-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SodiumHelper } from "../utils/SodiumHelper";
import { Utils } from "../utils/Utils";
import { Point, Scalar } from "./ECC";
import { hashFull, hashPart } from "./Hash";
import { Signature } from "./Signature";

import { SmartBuffer } from "smart-buffer";

/**
 * Represent a signature (R, s)
 */
export class Sig {
    /**
     * Commitment
     */
    public R: Point;

    /**
     * Proof
     */
    public s: Scalar;

    /**
     * Construct a new instance of this class
     *
     * @param R The instance of Point
     * @param s The instance of Scalar
     */
    constructor(R: Point, s: Scalar) {
        this.R = R;
        this.s = s;
    }

    /**
     * Converts this to a Signature
     */
    public toSignature(): Signature {
        return new Signature(Buffer.concat([this.s.data, this.R.data]));
    }

    /**
     * Converts a Signature to Sig
     */
    public static fromSignature(s: Signature): Sig {
        return new Sig(new Point(s.data.slice(Scalar.Width)), new Scalar(s.data.slice(0, Scalar.Width)));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.R.computeHash(buffer);
        this.s.computeHash(buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(): string {
        return this.toSignature().toJSON();
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        buffer.writeBuffer(this.R.data);
        buffer.writeBuffer(this.s.data);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Sig {
        const R = new Point(Utils.readBuffer(buffer, SodiumHelper.sodium.crypto_core_ed25519_BYTES));
        const s = new Scalar(Utils.readBuffer(buffer, SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES));
        return new Sig(R, s);
    }
}

/**
 * Represent the message to hash (part of `c`)
 */
export class Message<T> {
    /**
     * The public key
     */
    public X: Point;

    /**
     * The cryptographically randomly generated number
     */
    public R: Point;

    /**
     * The data to be hash
     */
    public message: T;

    /**
     * Construct a new instance of this class
     *
     * @param X The public key
     * @param R The cryptographically randomly generated number
     * @param message The data to be hash
     */
    constructor(X: Point, R: Point, message: T) {
        this.X = X;
        this.R = R;
        this.message = message;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.X.computeHash(buffer);
        this.R.computeHash(buffer);
        hashPart(this.message, buffer);
    }
}

/**
 * Contains a scalar and its projection on the elliptic curve (`v` and `v.G`)
 */
export class Pair {
    /**
     * A PRN-Generated number
     */
    public v: Scalar;

    /**
     * v.G
     */
    public V: Point;

    /**
     * Constructor
     * @param v The instance of Scalar
     * @param V The instance of Point (v.G)
     */
    constructor(v: Scalar, V: Point) {
        this.v = v;
        this.V = V;
    }

    /**
     * Construct a Pair from a Scalar
     * @param v The instance of Scalar
     * @returns The instance of Pair
     */
    public static fromScalar(v: Scalar): Pair {
        return new Pair(v, v.toPoint());
    }

    /**
     * Generate a random value `v` and a point on the curve `V` where `V = v.G`
     */
    public static random(): Pair {
        return Pair.fromScalar(Scalar.random());
    }
}

/**
 * Contains Schnorr signatures and verification methods.
 */
export class Schnorr {
    /**
     * Single-signer trivial API
     * @template T The type of the parameter data
     * @param kp The pair with the secret key and public key
     * @param data Data to sign (the hash will be signed), string, number, bigint, object with method computeHash
     * @returns Returns the signature data. The total size is 64 bytes.
     * The first 32 bytes are `R` and the next 32 bytes are `s`.
     *
     * Signatures are of the form `(R,s)` and satisfy `S = R + Hash(X || R || data) * X`.
     *
     * `S` can be obtained from the following functions:
     *
     * `S = s.toPoint()`
     *
     * `R` can be obtained from the following functions:
     *
     * `R = r.toPoint()`
     *
     * `R` is referred to as the nonce and is a cryptographically randomly
     * generated number that should neither be reused nor leaked.
     */
    public static signPair<T>(kp: Pair, data: T): Signature {
        const R = Pair.random();
        return Schnorr.sign<T>(kp.v, kp.V, R.v, R.V, data);
    }

    /**
     * Single-signer private key API
     * @template T The type of the parameter data
     * @param privateKey The scalar corresponding to the secret key
     * @param data Data to sign (the hash will be signed), string, number, bigint, object with method computeHash
     * @returns Return the signature data. The total size is 64 bytes.
     * The first 32 bytes are `R` and the next 32 bytes are `s`.
     *
     * Signatures are of the form `(R,s)` and satisfy `S = R + Hash(X || R || data) * X`.
     *
     * `S` can be obtained from the following functions:
     *
     * `S = s.toPoint()`
     *
     * `R` can be obtained from the following functions:
     *
     * `R = r.toPoint()`
     *
     * `R` is referred to as the nonce and is a cryptographically randomly
     * generated number that should neither be reused nor leaked.
     */
    public static signScalar<T>(privateKey: Scalar, data: T): Signature {
        const R = Pair.random();
        return Schnorr.sign(privateKey, privateKey.toPoint(), R.v, R.V, data);
    }

    /**
     * Sign with a given `r` (warning: `r` should never be reused with `x`)
     * @template T The type of the parameter data
     * @param kp The pair with the secret key and public key
     * @param r This is referred to as the nonce and is a cryptographically randomly
     * generated number that should neither be reused nor leaked.
     * @param data Data to sign (the hash will be signed), string, number, bigint, object with method computeHash
     * @returns Returns the signature data. The total size is 64 bytes.
     * The first 32 bytes are `R` and the next 32 bytes are `s`.
     *
     * Signatures are of the form `(R,s)` and satisfy `S = R + Hash(X || R || data) * X`.
     *
     * `S` can be obtained from the following functions:
     *
     * `S = s.toPoint()`
     *
     * `R` can be obtained from the following functions:
     *
     * `R = r.toPoint()`
     *
     * `R` is referred to as the nonce and is a cryptographically randomly
     * generated number that should neither be reused nor leaked.
     */
    public static signPairs<T>(kp: Pair, r: Pair, data: T): Signature {
        return Schnorr.sign<T>(kp.v, kp.V, r.v, r.V, data);
    }

    /**
     * Complex API, allow multisig
     * @template T The type of the parameter data
     * @param x The scalar corresponding to the secret key
     * @param X The point corresponding to the parameter x
     * @param r This is referred to as the nonce and is a cryptographically randomly
     * @param R The point corresponding to the parameter r
     * generated number that should neither be reused nor leaked.
     * @param data Data to sign (the hash will be signed), string, number, bigint, object with method computeHash
     * @returns Returns the signature data. The total size is 64 bytes.
     * The first 32 bytes are `R` and the next 32 bytes are `s`.
     *
     * Signatures are of the form `(R,s)` and satisfy `S = R + Hash(X || R || data) * X`.
     *
     * `S` can be obtained from the following functions:
     *
     * `S = s.toPoint()`
     *
     * `R` can be obtained from the following functions:
     *
     * `R = r.toPoint()`
     *
     * `R` is referred to as the nonce and is a cryptographically randomly
     * generated number that should neither be reused nor leaked.
     */
    public static sign<T>(x: Scalar, X: Point, r: Scalar, R: Point, data: T): Signature {
        // Compute the challenge and reduce the hash to a scalar
        const c = Scalar.fromHash(hashFull(new Message<T>(X, R, data)));

        // Compute `s` part of the proof
        const s: Scalar = Scalar.add(r, Scalar.mul(c, x));
        return new Sig(R, s).toSignature();
    }

    /**
     * Verify that a signature matches the provided data
     * @template T The type of the parameter data
     * @param X The point corresponding to the public key
     * @param sig Signature to verify
     * @param data Data to sign (the hash will be signed), string, number, bigint, object with method computeHash
     * @returns Whether or not the signature is valid for (X, s, data).
     * The signature data consists of 64 bytes.
     * The first 32 bytes are `R` and the next 32 bytes are `s`.
     *
     * Signatures are of the form `(R,s)` and satisfy `S = R + Hash(X || R || data) * X`.
     *
     * `S` can be obtained from the following functions:
     *
     * `S = s.toPoint()`
     *
     * `R` is referred to as the nonce and is a cryptographically randomly
     * generated number that should neither be reused nor leaked.
     */
    public static verify<T>(X: Point, sig: Signature, data: T): boolean {
        const s: Sig = Sig.fromSignature(sig);

        // First check if Scalar from signature is valid
        if (!s.s.isValid()) return false;

        /// Compute `s.G`
        const S = s.s.toPoint();

        // Now check that provided Point X is valid
        if (!X.isValid()) return false;

        // Also check the Point R from the Signature
        if (!s.R.isValid()) return false;

        // Compute the challenge and reduce the hash to a scalar
        const c: Scalar = Scalar.fromHash(hashFull(new Message<T>(X, s.R, data)));

        // Compute `R + c*X`
        const RcX: Point = Point.add(s.R, Point.scalarMul(c, X));
        return Point.compare(S, RcX) === 0;
    }
}
