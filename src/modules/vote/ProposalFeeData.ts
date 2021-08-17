/*******************************************************************************

    The class that defines data stored in the transaction's payload
    when the proposal's fee is deposited

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { PublicKey } from "../common/KeyPair";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";
import { LinkDataWithProposalFee } from "./LinkData";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines data stored in the transaction's payload
 * when the proposal's fee is deposited
 */
export class ProposalFeeData {
    public static HEADER = "PROP-FEE";

    /**
     * The name of App
     */
    public app_name: string;

    /**
     * The id of the proposal
     */
    public proposal_id: string;

    /**
     * Constructor
     * @param app_name    The name of App
     * @param proposal_id The id of the proposal
     */
    constructor(app_name: string, proposal_id: string) {
        this.app_name = app_name;
        this.proposal_id = proposal_id;
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        let temp = Buffer.from(ProposalFeeData.HEADER);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.app_name);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.proposal_id);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);
    }

    /**
     * Deserialize as binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): ProposalFeeData {
        let length = VarInt.toNumber(buffer);
        const header = Utils.readBuffer(buffer, length);
        if (header.toString() !== ProposalFeeData.HEADER) throw new Error("This is not the expected data type.");

        length = VarInt.toNumber(buffer);
        let temp = Utils.readBuffer(buffer, length);
        const app_name = temp.toString();

        length = VarInt.toNumber(buffer);
        temp = Utils.readBuffer(buffer, length);
        const proposal_id = temp.toString();
        return new ProposalFeeData(app_name, proposal_id);
    }

    /**
     * Returns the data to be linked to the BOA wallet.
     * @param proposer_address The public address of proposer
     * @param destination The public address to deposit
     * @param amount Proposal fee
     */
    public getLinkData(proposer_address: PublicKey, destination: PublicKey, amount: JSBI): LinkDataWithProposalFee {
        const buffer = new SmartBuffer();
        this.serialize(buffer);
        return {
            proposer_address: proposer_address.toString(),
            destination: destination.toString(),
            amount: amount.toString(),
            payload: buffer.toBuffer().toString("base64"),
        };
    }
}
