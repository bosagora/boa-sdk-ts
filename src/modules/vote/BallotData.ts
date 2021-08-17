/*******************************************************************************

    The class that defines voting data stored in transaction payloads

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashPart } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { Signature } from "../common/Signature";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";
import { LinkDataWithVoteData } from "./LinkData";

import { SmartBuffer } from "smart-buffer";

/**
 * Data to prove that the verifier is capable of exercising
 * its authority over the vote.
 * This is delivered from the admin screen of Agora.
 */
export class VoterCard {
    /**
     * Validator that this voter card represents
     */
    public validator_address: PublicKey;

    /**
     * Public key of the temporary private
     */
    public address: PublicKey;

    /**
     * timestamp unix epoch time
     */
    public expires: string;

    /**
     * The signature, made using `validator_address`' private key
     */
    public signature: Signature;

    /**
     * Constructor
     * @param validator_address Validator that this voter card represents
     * @param address           Public key of the temporary private
     * @param expires           timestamp unix epoch time
     * @param signature         The signature, made using `validator_address`' private key
     */
    constructor(validator_address: PublicKey, address: PublicKey, expires: string, signature?: Signature) {
        this.validator_address = validator_address;
        this.address = address;
        this.expires = expires;
        if (signature !== undefined) this.signature = signature;
        else this.signature = new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Verify that a signature with the validator address
     * @returns If OK, return true, otherwise return false.
     */
    public verify(): boolean {
        return this.validator_address.verify<VoterCard>(this.signature, this);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.validator_address.computeHash(buffer);
        this.address.computeHash(buffer);
        hashPart(this.expires, buffer);
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        buffer.writeBuffer(this.validator_address.data);
        buffer.writeBuffer(this.address.data);
        const temp = Buffer.from(this.expires);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);
        buffer.writeBuffer(this.signature.data);
    }

    /**
     * Deserialize as binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): VoterCard {
        const validator_address = new PublicKey(Utils.readBuffer(buffer, Utils.SIZE_OF_PUBLIC_KEY));
        const address = new PublicKey(Utils.readBuffer(buffer, Utils.SIZE_OF_PUBLIC_KEY));
        const length = VarInt.toNumber(buffer);
        const temp = Utils.readBuffer(buffer, length);
        const expires = temp.toString();
        const signature = new Signature(Utils.readBuffer(buffer, Signature.Width));

        return new VoterCard(validator_address, address, expires, signature);
    }
}

/**
 * voting data stored in transaction payloads
 */
export class BallotData {
    public static HEADER = "BALLOT  ";

    /**
     * The name of App
     */
    public app_name: string;

    /**
     * The id of the proposal
     */
    public proposal_id: string;

    /**
     * Encrypted voting information
     */
    public ballot: Buffer;

    /**
     * The `Voter card`
     */
    public card: VoterCard;

    /**
     * A sequence number, starting from 0, if replacement is allowed
     */
    public sequence: number;

    /**
     * The whole object signed using the temporary private key
     */
    public signature: Signature;

    public static YES: number = 0;
    public static NO: number = 1;
    public static BLANK: number = 2;
    public static REJECT: number = 9;

    /**
     * Constructor
     * @param app_name      The name of App
     * @param proposal_id   The id of the proposal
     * @param ballot        Encrypted voting information
     * @param card          The `Voter card`
     * @param sequence      A sequence number, starting from 0, if replacement is allowed
     * @param signature     The signature, made using temporary private key
     */
    constructor(
        app_name: string,
        proposal_id: string,
        ballot: Buffer,
        card: VoterCard,
        sequence: number,
        signature?: Signature
    ) {
        this.app_name = app_name;
        this.proposal_id = proposal_id;
        this.ballot = ballot;
        this.card = card;
        this.sequence = sequence;
        if (signature !== undefined) this.signature = signature;
        else this.signature = new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        hashPart(Buffer.from(this.app_name), buffer);
        hashPart(Buffer.from(this.proposal_id), buffer);
        buffer.writeBuffer(this.ballot);
        this.card.computeHash(buffer);
        buffer.writeUInt32LE(this.sequence);
    }

    /**
     * Verify that a signature with the temporary address
     * @returns If OK, return true, otherwise return false.
     */
    public verify(): boolean {
        return this.card.address.verify<BallotData>(this.signature, this);
    }

    /**
     * Serialize to binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        let temp = Buffer.from(BallotData.HEADER);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.app_name);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.proposal_id);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        VarInt.fromNumber(this.ballot.length, buffer);
        buffer.writeBuffer(this.ballot);
        this.card.serialize(buffer);
        VarInt.fromNumber(this.sequence, buffer);
        buffer.writeBuffer(this.signature.data);
    }

    /**
     * Deserialize from binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): BallotData {
        let length = VarInt.toNumber(buffer);
        const header = Utils.readBuffer(buffer, length);
        if (header.toString() !== BallotData.HEADER) throw new Error("This is not the expected data type.");

        length = VarInt.toNumber(buffer);
        let temp = Utils.readBuffer(buffer, length);
        const app_name = temp.toString();

        length = VarInt.toNumber(buffer);
        temp = Utils.readBuffer(buffer, length);
        const proposal_id = temp.toString();

        length = VarInt.toNumber(buffer);
        const ballot = Utils.readBuffer(buffer, length);
        const card = VoterCard.deserialize(buffer);
        const sequence = VarInt.toNumber(buffer);
        const signature = new Signature(Utils.readBuffer(buffer, Signature.Width));
        return new BallotData(app_name, proposal_id, ballot, card, sequence, signature);
    }

    /**
     * Returns the data to be linked to the BOA wallet.
     */
    public getLinkData(): LinkDataWithVoteData {
        const buffer = new SmartBuffer();
        this.serialize(buffer);
        return {
            payload: buffer.toBuffer().toString("base64"),
        };
    }
}
