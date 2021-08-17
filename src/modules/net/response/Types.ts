/*******************************************************************************

    Contains the type of data provided by the Stoa API

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * The interface of the transactions history element
 */
export interface ITxHistoryElement {
    /**
     * The transaction type of wallet ('inbound', 'outbound', 'freeze', 'payload')
     */
    display_tx_type: string;

    /**
     * Address, Public key
     */
    address: string;

    /**
     * The address that sent (or received) the funds
     */
    peer: string;

    /**
     * The number of the peer
     */
    peer_count: number;

    /**
     * Block height
     */
    height: string;

    /**
     * Transaction time
     */
    time: number;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * Transaction type
     */
    tx_type: string;

    /**
     * Amount
     */
    amount: string;

    /**
     * Block height at which the output of the transaction becomes available
     */
    unlock_height: string;

    /**
     * Time at which the output of the transaction becomes available
     */
    unlock_time: number;
}

/**
 * The interface of the transaction overview
 */
export interface ITxOverview {
    /**
     * Block height
     */
    height: string;

    /**
     * Transaction time
     */
    time: number;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * Transaction type
     */
    tx_type: string;

    /**
     * Block height at which the output of the transaction becomes available
     */
    unlock_height: string;

    /**
     * Time at which the output of the transaction becomes available
     */
    unlock_time: number;

    /**
     * The transaction data payload
     */
    payload: string;

    /**
     * The address and amount of the output associated with the transaction input
     */
    senders: ITxOverviewElement[];

    /**
     * The address and amount of transaction output
     */
    receivers: ITxOverviewElement[];

    /**
     * Transaction fee
     */
    fee: string;
}

/**
 * The interface of the transaction overview element
 */
export interface ITxOverviewElement {
    /**
     * Address, Public key
     */
    address: string;

    /**
     * Amount
     */
    amount: string;

    /**
     * The hash of UTXO
     */
    utxo: string;
}

/**
 * The interface of the pending transactions
 */
export interface IPendingTxs {
    tx_hash: string;
    submission_time: number;
    address: string;
    amount: string;
    fee: string;
}

/**
 * The interface of the SPV status
 */
export interface ISPVStatus {
    /**
     * True or false
     */
    result: boolean;

    /**
     * The message
     */
    message: string;
}
