/*******************************************************************************

    Elliptic-curve primitives

    Those primitives are used for Schnorr signatures.

    See_Also: https://en.wikipedia.org/wiki/EdDSA#Ed25519

    Copyright:
        Copyright (c) 2019-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SodiumHelper } from "../utils/SodiumHelper";
import { Endian, Utils } from "../utils/Utils";
import { Hash } from "./Hash";

import { SmartBuffer } from "smart-buffer";

/**
 * A field element in the finite field of order 2^255-19
 * Scalar are used as private key and source of noise for signatures.
 */
export class Scalar {
    /**
     * Buffer containing raw data
     */
    public readonly data: Buffer;

    /**
     * Construct a new instance of this class
     *
     * @param data   The string or binary representation of the scalar
     * @param endian The byte order
     * @throws Will throw an error if the data is not the same size as 'crypto_core_ed25519_SCALARBYTES'.
     */
    constructor(data: Buffer | string, endian: Endian = Endian.Big) {
        if (typeof data === "string") this.data = Utils.readFromString(data);
        else {
            this.data = Buffer.alloc(SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES);
            this.fromBinary(data, endian);
        }
        if (this.data.length !== SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES)
            throw new Error("The size of the data is abnormal.");
    }

    /**
     * Gets the length of data
     */
    public static get Width(): number {
        return SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES;
    }

    /**
     * Reads from the hex string
     * @param hex The hex string
     * @returns The instance of Scalar
     */
    public fromString(hex: string): Scalar {
        Utils.readFromString(hex, this.data);
        return this;
    }

    /**
     * Writes to the hex string
     * @param obfuscation If this value is true, print out '**SCALAR**' without printing
     * the actual value. Default is true.
     * @returns The hex string
     */
    public toString(obfuscation: boolean = true): string {
        if (obfuscation) return "**SCALAR**";
        else return Utils.writeToString(this.data);
    }

    /**
     * Set binary data
     * @param bin    The binary data of the scalar
     * @param endian The byte order
     * @returns The instance of Scalar
     * @throws Will throw an error if the argument `bin` is not the same size as `crypto_core_ed25519_SCALARBYTES`.
     */
    public fromBinary(bin: Buffer, endian: Endian = Endian.Big): Scalar {
        if (bin.length !== SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES)
            throw new Error("The size of the input data is abnormal.");

        this.data.set(bin);
        if (endian === Endian.Little) this.data.reverse();

        return this;
    }

    /**
     * Get binary data
     * @param endian The byte order
     * @returns The binary data of the scalar
     */
    public toBinary(endian: Endian = Endian.Big): Buffer {
        if (endian === Endian.Little) return Buffer.from(this.data).reverse();
        else return this.data;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        buffer.writeBuffer(this.data);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): string {
        return this.toString();
    }

    /**
     * Reduce the hash to a scalar
     * @param hash The instance of the Hash
     * @returns The instance of Scalar
     */
    public static fromHash(hash: Hash): Scalar {
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_reduce(hash.data)));
    }

    /**
     * Invert Scalar.
     * @returns The instance of Scalar
     * @throws Will throw the error if an error occurs during calculation.
     */
    public invert(): Scalar {
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_invert(this.data)));
    }

    /**
     * Generate a random scalar
     * @returns The instance of Scalar
     */
    public static random(): Scalar {
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_random()));
    }

    public static ED25519_L = Buffer.from(
        "1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed",
        "hex"
    ).reverse();
    public static ZERO = Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex");

    /**
     * Scalar should be greater than zero and less than L:2^252 + 27742317777372353535851937790883648493
     */
    public isValid(): boolean {
        return Utils.compareBuffer(this.data, Scalar.ZERO) > 0 && Utils.compareBuffer(this.data, Scalar.ED25519_L) < 0;
    }

    /**
     * Compare the two Scalars
     * If a is greater than b, it returns a positive number,
     * if a is less than b, it returns a negative number,
     * and if a and b are equal, it returns zero.
     */
    public static compare(a: Scalar, b: Scalar): number {
        return Utils.compareBuffer(a.data, b.data);
    }

    /**
     * Return the point corresponding to this scalar multiplied by the generator
     * @throws Will throw an error if an error occurs during calculation.
     */
    public toPoint(): Point {
        const ret = new Point(Buffer.from(SodiumHelper.sodium.crypto_scalarmult_ed25519_base_noclamp(this.data)));
        if (!ret.isValid) throw new Error("libsodium generated invalid Point from valid Scalar!");
        return ret;
    }

    /**
     * Returns x + y (mod L)
     * This uses libsodium.
     * @param x The instance of the Scalar
     * @param y The instance of the Scalar
     */
    public static add(x: Scalar, y: Scalar): Scalar {
        if (x.isNull()) return new Scalar(y.data);
        if (y.isNull()) return new Scalar(x.data);
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_add(x.data, y.data)));
    }

    /**
     * Returns x - y (mod L)
     * This uses libsodium.
     * @param x The instance of the Scalar
     * @param y The instance of the Scalar
     */
    public static sub(x: Scalar, y: Scalar): Scalar {
        if (x.isNull()) return new Scalar(y.data);
        if (y.isNull()) return new Scalar(x.data);
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_sub(x.data, y.data)));
    }

    /**
     * Returns x * y (mod L)
     * This uses libsodium.
     * @param x The instance of the Scalar
     * @param y The instance of the Scalar
     */
    public static mul(x: Scalar, y: Scalar): Scalar {
        if (x.isNull()) return new Scalar(y.data);
        if (y.isNull()) return new Scalar(x.data);
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_mul(x.data, y.data)));
    }

    /**
     * Returns the neg that satisfies the following formula: s + neg = 0 (mod L).
     * This uses libsodium.
     */
    public negate(): Scalar {
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_negate(this.data)));
    }

    /**
     * Returns the comp that satisfies the following formula: s + comp = 1 (mod L).
     * This uses libsodium.
     */
    public complement(): Scalar {
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_scalar_complement(this.data)));
    }

    /**
     * This checks whether all values are initial values (0).
     */
    public isNull(): boolean {
        return Utils.compareBuffer(this.data, Scalar.ZERO) === 0;
    }

    /**
     * Returns an instance filled with zero all bytes.
     * @returns The instance of Scalar
     */
    public static get Null(): Scalar {
        return new Scalar(Scalar.ZERO);
    }
}

/**
 * Represent a point on Curve25519
 * A point is an element of the cyclic subgroup formed from the elliptic curve:
 * x^2 + y^2 = 1 - (121665 / 1216666) * x^2 * y^2
 * And the base point `B` where By=4/5 and Bx > 0.
 */
export class Point {
    /**
     * Buffer containing raw data
     */
    public readonly data: Buffer;

    /**
     * Construct a new instance of this class
     *
     * @param data   The string or binary representation of the point
     * @param endian The byte order
     * @throws Will throw an error if the data is not the same size as `crypto_core_ed25519_BYTES`.
     */
    constructor(data: Buffer | string, endian: Endian = Endian.Big) {
        if (typeof data === "string") this.data = Utils.readFromString(data);
        else {
            this.data = Buffer.alloc(SodiumHelper.sodium.crypto_core_ed25519_BYTES);
            this.fromBinary(data, endian);
        }
        if (this.data.length !== SodiumHelper.sodium.crypto_core_ed25519_BYTES)
            throw new Error("The size of the data is abnormal.");
    }

    /**
     * Gets the length of data
     */
    public static get Width(): number {
        return SodiumHelper.sodium.crypto_core_ed25519_BYTES;
    }

    /**
     * Reads from the hex string
     * @param hex The hex string
     * @returns The instance of Point
     */
    public fromString(hex: string): Point {
        Utils.readFromString(hex, this.data);
        return this;
    }

    /**
     * Writes to the hex string
     * @returns The hex string
     */
    public toString(): string {
        return Utils.writeToString(this.data);
    }

    /**
     * Set binary data
     * @param bin    The binary data of the point
     * @param endian The byte order
     * @returns The instance of Point
     * @throws Will throw an error if the argument `bin` is not the same size as `crypto_core_ed25519_BYTES`
     */
    public fromBinary(bin: Buffer, endian: Endian = Endian.Big): Point {
        if (bin.length !== SodiumHelper.sodium.crypto_core_ed25519_BYTES)
            throw new Error("The size of the input data is abnormal.");

        this.data.set(bin);
        if (endian === Endian.Little) this.data.reverse();

        return this;
    }

    /**
     * Get binary data
     * @param endian The byte order
     * @returns The binary data of the point
     */
    public toBinary(endian: Endian = Endian.Big): Buffer {
        if (endian === Endian.Little) return Buffer.from(this.data).reverse();
        else return this.data;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        buffer.writeBuffer(this.data);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): string {
        return this.toString();
    }

    /**
     * Validation that it is a valid point using libsodium
     */
    public isValid(): boolean {
        return SodiumHelper.sodium.crypto_core_ed25519_is_valid_point(this.data);
    }

    /**
     * Generate a random point
     * @returns The instance of Point
     */
    public static random(): Point {
        return new Point(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_random()));
    }

    /**
     * Adds the element represented by p to the element q using libsodium
     * @param p The instance of the Point
     * @param q The instance of the Point
     * @throws Will throw the error if an error occurs during calculation.
     */
    public static add(p: Point, q: Point): Point {
        if (p.isNull()) return new Point(q.data);
        if (q.isNull()) return new Point(p.data);
        return new Point(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_add(p.data, q.data)));
    }

    /**
     * Subtracts the element represented by p to the element q using libsodium
     * @param p The instance of the Point
     * @param q The instance of the Point
     * @throws Will throw the error if an error occurs during calculation.
     */
    public static sub(p: Point, q: Point): Point {
        if (p.isNull()) return new Point(q.data);
        if (q.isNull()) return new Point(p.data);
        return new Point(Buffer.from(SodiumHelper.sodium.crypto_core_ed25519_sub(p.data, q.data)));
    }

    /**
     * Multiplies an element represented by p by a scalar n using libsodium
     * @param s The instance of the Scalar
     * @param n The instance of the Point
     * @throws Will throw the error if an error occurs during calculation.
     */
    public static scalarMul(s: Scalar, n: Point): Point {
        return new Point(Buffer.from(SodiumHelper.sodium.crypto_scalarmult_ed25519_noclamp(s.data, n.data)));
    }

    /**
     * Compare the two Points
     * If a is greater than b, it returns a positive number,
     * if a is less than b, it returns a negative number,
     * and if a and b are equal, it returns zero.
     */
    public static compare(a: Point, b: Point): number {
        return Utils.compareBuffer(a.data, b.data);
    }

    /**
     * This checks whether all values are initial values (0).
     */
    public isNull(): boolean {
        return Buffer.compare(this.data, Buffer.alloc(SodiumHelper.sodium.crypto_core_ed25519_BYTES)) === 0;
    }

    /**
     * Returns an instance filled with zero all bytes.
     * @returns The instance of Point
     */
    public static get Null(): Point {
        return new Point(Buffer.alloc(SodiumHelper.sodium.crypto_core_ed25519_BYTES));
    }
}
