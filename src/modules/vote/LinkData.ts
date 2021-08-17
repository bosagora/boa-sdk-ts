/*******************************************************************************

    The class that defines data structures to pass from Votera to BOA wallet

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * Data structure transferred from Votera app to BOA Wallet app
 * when depositing the proposal fee
 */
export interface LinkDataWithProposalFee {
    /**
     * The public address of proposer - Use as the address in the wallet
     */
    proposer_address: string;

    /**
     * The public address to deposit
     */
    destination: string;

    /**
     * Proposal fee (amount to be transferred)
     */
    amount: string;

    /**
     * The id of proposal (encoded base64)
     */
    payload: string;
}

/**
 * Data structure that transfers voting costs from Votera app to BOA Wallet app
 * when sending them to validators.
 */
export interface LinkDataWithProposalData {
    /**
     * The public address of proposer- Use as the address in the wallet
     */
    proposer_address: string;

    /**
     * Array of all validators - used as the output of transactions in wallet
     */
    validators: string[];

    /**
     * Voting fee per validator - used as the amount of the output of transactions in the wallet
     */
    voting_fee: string;

    /**
     * The data of proposal (encoded base64)
     */
    payload: string;
}

/**
 * When voting, the data structure delivered from the Votera app to BOA Wallet app
 */
export interface LinkDataWithVoteData {
    /**
     * The data of voting (encoded base64)
     */
    payload: string;
}
