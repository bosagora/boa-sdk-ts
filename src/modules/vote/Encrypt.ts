/*******************************************************************************

    The class that defines voting data stored in transaction payloads

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashMulti } from "../common/Hash";
import { SodiumHelper } from "../utils/SodiumHelper";

/**
 * Classes that encrypt and decrypt a ballot
 */
export class Encrypt {
    /**
     * The additional data for encryption and decryption
     */
    private static additional_data = Buffer.from("Ballot choice");

    /**
     * Creates a secure key
     * @param first_key     The key obtained from the Agora admin page
     * @param proposal_id   The ID of proposal
     */
    public static createKey(first_key: Buffer, proposal_id: string): Buffer {
        const key_proposal = hashMulti(first_key, Buffer.from(proposal_id));
        const key_size = SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES;

        return Buffer.from(SodiumHelper.sodium.crypto_generichash(key_size, key_proposal.data));
    }

    /**
     * Encrypts a message using a secret key and public nonce
     * @param message       The message to encrypt
     * @param key           The secret key
     */
    public static encrypt(message: Buffer, key: Buffer): Buffer {
        const public_nonce_size = SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
        const public_nonce = Buffer.from(SodiumHelper.sodium.randombytes_buf(public_nonce_size));

        const cipher = Buffer.from(
            SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
                message,
                Encrypt.additional_data,
                null,
                public_nonce,
                key
            )
        );

        return Buffer.concat([public_nonce, cipher]);
    }

    /**
     * Decrypts a cipher message using a secret key and public nonce
     * @param cipher_message    The encrypted message
     * @param key               The secret key
     */
    static decrypt(cipher_message: Buffer, key: Buffer): Buffer {
        const public_nonce_size = SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
        const public_nonce = cipher_message.slice(0, public_nonce_size);
        const cipher = cipher_message.slice(public_nonce_size);

        return Buffer.from(
            SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
                null,
                cipher,
                Encrypt.additional_data,
                public_nonce,
                key
            )
        );
    }
}
