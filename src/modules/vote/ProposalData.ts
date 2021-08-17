/*******************************************************************************

    The class that defines proposal data stored in transaction payloads

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";
import { LinkDataWithProposalData } from "./LinkData";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The type of the proposal
 */
export enum ProposalType {
    System = 0,
    Fund = 1,
}

/**
 * The class that define proposal data
 */
export class ProposalData {
    public static HEADER = "PROPOSAL";

    /**
     * The name of App
     */
    public app_name: string;

    /**
     * The type of the proposal, 0: System, 1: Funding
     */
    public proposal_type: ProposalType;

    /**
     * The ID of the proposal
     */
    public proposal_id: string;

    /**
     * The title of the proposal
     */
    public proposal_title: string;

    /**
     * The block height of voting start
     */
    public vote_start_height: JSBI;

    /**
     * The block height of voting end
     */
    public vote_end_height: JSBI;

    /**
     * The hash of the documentation
     */
    public doc_hash: Hash;

    /**
     * The amount of the funding
     */
    public fund_amount: JSBI;

    /**
     * The proposal  fee
     */
    public proposal_fee: JSBI;

    /**
     * The total amount of voting costs provided to the validator
     */
    public vote_fee: JSBI;

    /**
     * Hash of transactions that paid the funding fee
     */
    public tx_hash_proposal_fee: Hash;

    /**
     * Proposer's own public address
     */
    public proposer_address: PublicKey;

    /**
     * Public address to deposit the proposal fee
     */
    public proposal_fee_address: PublicKey;

    /**
     * Constructor
     * @param app_name              The name of App
     * @param proposal_type         The type of the proposal, 0: System, 1: Funding
     * @param proposal_id           The ID of the proposal
     * @param proposal_title        The title of the proposal
     * @param vote_start_height     The block height of voting start
     * @param vote_end_height       The block height of voting end
     * @param doc_hash              The hash of the documentation
     * @param fund_amount           The amount of the funding
     * @param proposal_fee          The proposal fee
     * @param vote_fee              The total amount of voting costs provided to the validator.
     * @param tx_hash_proposal_fee  Hash of transactions that paid the funding fee
     * @param proposer_address      Proposer's own public address
     * @param proposal_fee_address  Public address to deposit the proposal fee
     */
    constructor(
        app_name: string,
        proposal_type: ProposalType,
        proposal_id: string,
        proposal_title: string,
        vote_start_height: JSBI,
        vote_end_height: JSBI,
        doc_hash: Hash,
        fund_amount: JSBI,
        proposal_fee: JSBI,
        vote_fee: JSBI,
        tx_hash_proposal_fee: Hash,
        proposer_address: PublicKey,
        proposal_fee_address: PublicKey
    ) {
        this.app_name = app_name;
        this.proposal_type = proposal_type;
        this.proposal_id = proposal_id;
        this.proposal_title = proposal_title;
        this.vote_start_height = vote_start_height;
        this.vote_end_height = vote_end_height;
        this.doc_hash = doc_hash;
        this.fund_amount = fund_amount;
        this.proposal_fee = proposal_fee;
        this.vote_fee = vote_fee;
        this.tx_hash_proposal_fee = tx_hash_proposal_fee;
        this.proposer_address = proposer_address;
        this.proposal_fee_address = proposal_fee_address;
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        let temp = Buffer.from(ProposalData.HEADER);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.app_name);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        VarInt.fromNumber(this.proposal_type, buffer);

        temp = Buffer.from(this.proposal_id);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.proposal_title);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        VarInt.fromJSBI(this.vote_start_height, buffer);
        VarInt.fromJSBI(this.vote_end_height, buffer);

        buffer.writeBuffer(this.doc_hash.data);

        VarInt.fromJSBI(this.fund_amount, buffer);
        VarInt.fromJSBI(this.proposal_fee, buffer);
        VarInt.fromJSBI(this.vote_fee, buffer);

        buffer.writeBuffer(this.tx_hash_proposal_fee.data);

        buffer.writeBuffer(this.proposer_address.data);
        buffer.writeBuffer(this.proposal_fee_address.data);
    }

    /**
     * Deserialize as binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): ProposalData {
        let length = VarInt.toNumber(buffer);
        const header = Utils.readBuffer(buffer, length);
        if (header.toString() !== ProposalData.HEADER) throw new Error("This is not the expected data type.");

        length = VarInt.toNumber(buffer);
        let temp = Utils.readBuffer(buffer, length);
        const app_name = temp.toString();

        const proposal_type = VarInt.toNumber(buffer);

        length = VarInt.toNumber(buffer);
        temp = Utils.readBuffer(buffer, length);
        const proposal_id = temp.toString();

        length = VarInt.toNumber(buffer);
        temp = Utils.readBuffer(buffer, length);
        const proposal_title = temp.toString();

        const vote_start_height = VarInt.toJSBI(buffer);
        const vote_end_height = VarInt.toJSBI(buffer);

        const doc_hash = new Hash(Utils.readBuffer(buffer, Hash.Width));
        const fund_amount = VarInt.toJSBI(buffer);
        const proposal_fee = VarInt.toJSBI(buffer);
        const vote_fee = VarInt.toJSBI(buffer);
        const tx_hash_proposal_fee = new Hash(Utils.readBuffer(buffer, Hash.Width));
        const proposer_address = new PublicKey(Utils.readBuffer(buffer, Utils.SIZE_OF_PUBLIC_KEY));
        const proposal_fee_address = new PublicKey(Utils.readBuffer(buffer, Utils.SIZE_OF_PUBLIC_KEY));

        return new ProposalData(
            app_name,
            proposal_type,
            proposal_id,
            proposal_title,
            vote_start_height,
            vote_end_height,
            doc_hash,
            fund_amount,
            proposal_fee,
            vote_fee,
            tx_hash_proposal_fee,
            proposer_address,
            proposal_fee_address
        );
    }

    /**
     * Returns the data to be linked to the BOA wallet.
     * @param proposer_address The public address of proposer
     * @param validators Array of all validators
     * @param voting_fee Voting fee per validator
     */
    public getLinkData(
        proposer_address: PublicKey,
        validators: PublicKey[],
        voting_fee: JSBI
    ): LinkDataWithProposalData {
        const buffer = new SmartBuffer();
        this.serialize(buffer);
        return {
            proposer_address: proposer_address.toString(),
            validators: validators.map((k) => k.toString()),
            voting_fee: voting_fee.toString(),
            payload: buffer.toBuffer().toString("base64"),
        };
    }
}
