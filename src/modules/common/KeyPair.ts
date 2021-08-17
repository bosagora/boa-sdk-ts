/*******************************************************************************

    Contains definition for the class KeyPair, PublicKey, SecretKey and Seed

    See_Also: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { checksum, validate } from "../utils/CRC16";
import { SodiumHelper } from "../utils/SodiumHelper";
import { Utils } from "../utils/Utils";
import { Point, Scalar } from "./ECC";
import { Pair, Schnorr } from "./Schnorr";
import { Signature } from "./Signature";

import { base32Decode, base32Encode } from "@ctrl/ts-base32";
import { bech32m } from "bech32";
import { SmartBuffer } from "smart-buffer";

/**
 * The class to hold a secret key + public key + seed
 */
export class KeyPair {
    /**
     * The public key
     */
    public address: PublicKey;

    /**
     * The secret key
     */
    public secret: SecretKey;

    /**
     * Constructor
     * @param address The instance of PublicKey
     * @param secret  The instance of SecretKey
     */
    constructor(address: PublicKey, secret: SecretKey) {
        this.address = address;
        this.secret = secret;
    }

    /**
     * Create a KeyPair from a SecretKey
     * @param secret The instance of SecretKey
     * @returns The instance of KeyPair
     * See_Also: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d#L64-L67
     */
    public static fromSeed(secret: SecretKey): KeyPair {
        if (!secret.scalar.isValid()) throw new Error("SecretKey should always be valid Scalar!");
        return new KeyPair(new PublicKey(secret.scalar.toPoint()), new SecretKey(secret.scalar));
    }

    /**
     * Generate a new, random, keypair
     * @returns The instance of KeyPair
     * See_Also: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d#L98-L102
     */
    public static random(): KeyPair {
        const scalar = Scalar.random();
        if (!scalar.isValid()) throw new Error("SecretKey should always be valid Scalar!");
        return new KeyPair(new PublicKey(scalar.toPoint()), new SecretKey(scalar));
    }

    /**
     * Checks whether a valid scalar can be created with a given random bytes
     * @param r The random bytes
     * @return Returns true if a valid scalar can be created with a given random bytes,
     * otherwise false.
     */
    public static isValidRandomBytes(r: Buffer): boolean {
        if (r.length !== SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES) return false;

        const t = Buffer.from(r);
        t[SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES - 1] &= 0x1f;

        return Utils.compareBuffer(t, Scalar.ZERO) > 0 && Utils.compareBuffer(t, Scalar.ED25519_L) < 0;
    }

    /**
     * Signs a message with this keypair's private key
     * @param msg The message to sign.
     * @returns The signature of `msg` using `this`
     * See_Also: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d#L91-L95
     */
    public sign<T>(msg: T): Signature {
        return Schnorr.signPair<T>(new Pair(this.secret.scalar, this.address.point), msg);
    }
}

/**
 * Define the public key / address
 */
export class PublicKey {
    private static HumanReadablePart = "boa";

    /**
     * The instance of the Point
     */
    public readonly point: Point;

    /**
     * Buffer containing raw point data
     */
    public get data(): Buffer {
        return this.point.data;
    }

    /**
     * Constructor
     * @param data The string or instance of Point or binary representation of the public key
     * @throws Will throw the error if the public key validation fails.
     */
    constructor(data: Buffer | Point | string) {
        if (typeof data === "string") {
            if (data.length < PublicKey.HumanReadablePart.length || data.slice(0, 3) !== PublicKey.HumanReadablePart)
                throw new Error("Differ in the human-readable part");

            const decoded = bech32m.decode(data);
            if (decoded.prefix !== PublicKey.HumanReadablePart) throw new Error("This is not the address of BOA");

            const dec_data: number[] = [];
            if (!Utils.convertBits(dec_data, decoded.words, 5, 8, false))
                throw new Error("Bech32 conversion of base failed");

            if (dec_data.length !== 1 + SodiumHelper.sodium.crypto_core_ed25519_BYTES)
                throw new Error("Decoded data size is not normal");

            if (dec_data[0] !== VersionByte.AccountID) throw new Error("This is not a valid address type");

            const key_data = Buffer.from(dec_data.slice(1));
            if (!SodiumHelper.sodium.crypto_core_ed25519_is_valid_point(key_data))
                throw new Error("This is not a valid Point");

            this.point = new Point(key_data);
        } else if (data instanceof Point) {
            this.point = new Point(data.data);
        } else {
            if (data.length !== SodiumHelper.sodium.crypto_core_ed25519_BYTES)
                throw new Error("The size of the input data is abnormal.");
            this.point = new Point(data);
        }

        if (!this.point.isValid()) throw new Error("This is not a valid Point!");
    }

    /**
     * Verify the public key with a string for normal.
     * @param address Representing the public key as a string
     * @returns If the address passes the validation, it returns an empty string or a message.
     */
    public static validate(address: string): string {
        if (address.length < PublicKey.HumanReadablePart.length || address.slice(0, 3) !== PublicKey.HumanReadablePart)
            return "Differ in the human-readable part";

        let decoded;
        try {
            decoded = bech32m.decode(address);
        } catch (err) {
            if (err instanceof Error) {
                return err.message;
            } else {
                return "Unknown error";
            }
        }

        if (decoded.prefix !== PublicKey.HumanReadablePart) return "This is not the address of BOA";

        const dec_data: number[] = [];
        if (!Utils.convertBits(dec_data, decoded.words, 5, 8, false))
            throw new Error("Bech32 conversion of base failed");

        if (dec_data.length !== 1 + SodiumHelper.sodium.crypto_core_ed25519_BYTES)
            return "Decoded data size is not normal";

        if (dec_data[0] !== VersionByte.AccountID) return "This is not a valid address type";

        const key_data = Buffer.from(dec_data.slice(1));
        if (!SodiumHelper.sodium.crypto_core_ed25519_is_valid_point(key_data)) return "This is not a valid Point";

        return "";
    }

    /**
     * Uses Bech32
     */
    public toString(): string {
        const unencoded: number[] = [];
        const conv_data: number[] = [];
        unencoded.push(VersionByte.AccountID);
        this.data.forEach((m) => unencoded.push(m));
        if (!Utils.convertBits(conv_data, unencoded, 8, 5, true)) throw new Error("Bech32 conversion of base failed");
        return bech32m.encode(PublicKey.HumanReadablePart, conv_data);
    }

    /**
     * Verify that a signature matches a given message
     * @param signature The signature of `msg` matching `this` public key.
     * @param msg       The signed message. Should not include the signature.
     * @returns `true` if the signature is valid
     * See_Also: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d#L242-L246
     */
    public verify<T>(signature: Signature, msg: T): boolean {
        return Schnorr.verify<T>(this.point, signature, msg);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.point.computeHash(buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): string {
        return this.toString();
    }
}

/**
 * Define the secret key
 */
export class SecretKey {
    /**
     * The instance of the Scalar
     */
    public readonly scalar: Scalar;

    /**
     * Buffer containing raw scalar data
     */
    public get data(): Buffer {
        return this.scalar.data;
    }

    /**
     * Constructor
     * @param data The instance of Scalar or binary data of the secret key
     * @throws Will throw the error if the secret key validation fails.
     */
    constructor(data: Buffer | Scalar | string) {
        if (typeof data === "string") {
            const decoded = Buffer.from(base32Decode(data));
            if (decoded.length !== 1 + SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES + 2)
                throw new Error("Decoded data size is not normal");

            if (decoded[0] !== VersionByte.Seed) throw new Error("This is not a valid seed type");

            const body = decoded.slice(0, -2);
            const cs = decoded.slice(-2);

            if (!validate(body, cs)) throw new Error("Checksum result do not match");

            this.scalar = new Scalar(body.slice(1));
        } else if (data instanceof Scalar) {
            this.scalar = new Scalar(data.data);
        } else {
            this.scalar = new Scalar(data);
        }

        if (!this.scalar.isValid()) throw new Error("SecretKey should always be valid Scalar!");
    }

    /**
     * Verify the seed with a string for normal.
     * @param seed Representing the seed as a string
     * @returns If the seed passes the validation, it returns an empty string or a message.
     */
    public static validate(seed: string): string {
        const decoded = Buffer.from(base32Decode(seed));

        if (decoded.length !== 1 + SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES + 2)
            return "Decoded data size is not normal";

        if (decoded[0] !== VersionByte.Seed) return "This is not a valid seed type";

        const body = decoded.slice(0, -2);
        const check_sum = decoded.slice(-2);
        if (!validate(body, check_sum)) return "Checksum result do not match";

        return "";
    }

    /**
     * Signs a message with this private key
     * @param msg The message to sign.
     * @returns The signature of `msg` using `this`
     */
    public sign<T>(msg: T): Signature {
        return Schnorr.signPair<T>(Pair.fromScalar(this.scalar), msg);
    }

    /**
     * Returns a secret key seed as a string
     * @param obfuscation If this value is true, print out '**SCALAR**' without printing
     * the actual value. Default is true.
     * @returns The secret key seed
     */
    public toString(obfuscation: boolean = true): string {
        if (obfuscation) return "**SCALAR**";

        const body = Buffer.concat([Buffer.from([VersionByte.Seed]), this.data]);
        const cs = checksum(body);
        const decoded = Buffer.concat([body, cs]);
        return base32Encode(decoded);
    }
}

/**
 * @ignore
 * Discriminant for Stellar binary-encoded user-facing data
 */
enum VersionByte {
    /**
     * Used for encoded stellar addresses
     * Base32-encodes to 'G...'
     */
    AccountID = 6 << 3,

    /**
     * Used for encoded stellar seed
     * Base32-encodes to 'S...'
     */
    Seed = 18 << 3,

    /**
     * Used for encoded stellar hashTx signer keys.
     * Base32-encodes to 'T...'
     */
    HashTx = 19 << 3,

    /**
     * Used for encoded stellar hashX signer keys.
     * Base32-encodes to 'X...'
     */
    HashX = 23 << 3,
}
