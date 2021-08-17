/*******************************************************************************

    It is a class that provides balance check, transfer functions for one key pair.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../common/Hash";
import { KeyPair, PublicKey } from "../common/KeyPair";
import { Transaction } from "../data/Transaction";
import { TxInput } from "../data/TxInput";
import { OutputType } from "../data/TxOutput";
import { BOAClient } from "../net/BOAClient";
import { Balance } from "../net/response/Balance";
import { TransactionFee } from "../net/response/TrasactionFee";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { LockType } from "../script/Lock";
import { TxBuilder } from "../utils/TxBuilder";
import { TxCanceller, TxCancelResultCode } from "../utils/TxCanceller";
import { TxPayloadFee } from "../utils/TxPayloadFee";
import { Utils } from "../utils/Utils";
import { UTXOManager, UTXOProvider } from "../utils/UTXOManager";

import JSBI from "jsbi";

/**
 * A constant that defines the option of a fee.
 */
export enum WalletFeeOption {
    High,
    Medium,
    Low,
}

/**
 * When using the wallet function, it is a constant that defines the processing results.
 */
export enum WalletResultCode {
    Success,
    FailedAccessToAgora,
    FailedAccessToStoa,
    FailedRequestHeight,
    FailedRequestBalance,
    FailedRequestPendingTransaction,
    FailedRequestUTXO,
    FailedRequestTxFee,
    InvalidTransaction,
    CoinbaseCanNotCancel,
    UnsupportedUnfreezing,
    NotFoundUTXO,
    UnsupportedLockType,
    NotFoundKey,
    NotEnoughAmount,
    NotEnoughFee,
    FailedSendTx,
    UnknownError,
}

/**
 * The interface of receiver
 */
export interface IWalletReceiver {
    address: PublicKey;
    amount: JSBI;
}

/**
 * This is the return value that is delivered after processing the wallet function.
 */
export interface IWalletResult {
    code: WalletResultCode;
    message: string;
    error?: any;
    tx?: Transaction;
    balance?: Balance;
    original_tx?: Transaction;
}

/**
 * An interface that defines the options used in a wallet.
 */
export interface IWalletOption {
    agoraEndpoint: string;
    stoaEndpoint: string;
    fee: WalletFeeOption;
}

/**
 * It is a class that provides balance check, transfer functions for one key pair.
 */
export class Wallet {
    /**
     * The default option of wallet
     */
    public static defaultOption: IWalletOption = {
        agoraEndpoint: "http://127.0.0.1:2826",
        stoaEndpoint: "http://127.0.0.1:3836",
        fee: WalletFeeOption.Medium,
    };

    /**
     * A key pair used to perform the functions provided by this class.
     * @private
     */
    private readonly owner: KeyPair;

    /**
     * It is a client to access Agora and Stoa.
     * @private
     */
    private client: BOAClient;

    /**
     * The instance of UTXOManager
     * @private
     */
    private utxoProvider: UTXOProvider;

    /**
     * The instance of TxBuilder
     * @private
     */
    private txBuilder: TxBuilder;

    /**
     * The option of wallet
     * @private
     */
    private option: IWalletOption;

    private checked_time: Date;

    private static CHECK_PERIOD = 5000;

    /**
     * Constructor
     * @param owner     The key pair
     * @param option    The option of wallet
     */
    constructor(owner: KeyPair, option: IWalletOption = Wallet.defaultOption) {
        this.owner = owner;
        this.option = option;
        this.client = new BOAClient(this.option.stoaEndpoint, this.option.agoraEndpoint);
        this.txBuilder = new TxBuilder(this.owner);
        this.utxoProvider = new UTXOProvider(this.owner.address, this.client);
        this.checked_time = new Date(0);
    }

    /**
     * Returns the value specified in option among TransactionFee fees
     * @param fees      Fees received from Stoa
     * @private
     */
    private getFee(fees: TransactionFee): JSBI {
        switch (this.option.fee) {
            case WalletFeeOption.High:
                return JSBI.BigInt(fees.high);
            case WalletFeeOption.Low:
                return JSBI.BigInt(fees.low);
            default:
                return JSBI.BigInt(fees.medium);
        }
    }

    /**
     * Perform access tests on servers
     * @private
     */
    private async checkServer(): Promise<IWalletResult> {
        let now = new Date();
        let duration = now.valueOf() - this.checked_time.valueOf();
        this.checked_time = now;

        // If it has been more than 5 seconds since the previous server health check, re-check.
        if (duration > Wallet.CHECK_PERIOD) {
            // Agora Access Test
            try {
                if (!(await this.client.getAgoraStatus()))
                    return { code: WalletResultCode.FailedAccessToAgora, message: "Failed access to Agora." };
            } catch (e) {
                return { code: WalletResultCode.FailedAccessToAgora, message: e.message };
            }

            // Stoa Access Test
            try {
                if (!(await this.client.getStoaStatus()))
                    return { code: WalletResultCode.FailedAccessToStoa, message: "Failed access to Stoa." };
            } catch (e) {
                return { code: WalletResultCode.FailedAccessToStoa, message: e.message };
            }
        }

        return {
            code: WalletResultCode.Success,
            message: "Success.",
        };
    }

    /**
     * Check the balance
     */
    public async getBalance(): Promise<IWalletResult> {
        const check_res: IWalletResult = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let balance: Balance;
        try {
            balance = await this.client.getBalance(this.owner.address);
        } catch (e) {
            return { code: WalletResultCode.FailedRequestBalance, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: "Success",
            balance: balance,
        };
    }

    /**
     * Transfer the BOA corresponding to the amount to the receiver.
     * The payload is the data to be stored in the block. A separate cost is incurred.
     * @param receiver  The array of recipient information
     * @param payload   The data to be stored, not used if not entered.
     */
    public async transfer(receiver: IWalletReceiver[], payload?: Buffer): Promise<IWalletResult> {
        const check_res: IWalletResult = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        const payloadLength = payload === undefined ? 0 : payload.length;
        const payloadFee = TxPayloadFee.getFee(payloadLength);
        const sendBOA = receiver.reduce<JSBI>((sum, value) => JSBI.add(sum, value.amount), JSBI.BigInt(0));
        const outputCount = receiver.length + 1;
        let estimatedTxFee = JSBI.BigInt(
            Utils.FEE_FACTOR * Transaction.getEstimatedNumberOfBytes(0, outputCount, payloadLength)
        );
        let totalFee = JSBI.add(payloadFee, estimatedTxFee);
        let totalSpendAmount = JSBI.add(totalFee, sendBOA);

        // Extract the UTXO to be spent.
        let utxosToSpend: UnspentTxOutput[];
        try {
            utxosToSpend = await this.utxoProvider.getUTXO(
                totalSpendAmount,
                JSBI.BigInt(Utils.FEE_FACTOR * TxInput.getEstimatedNumberOfBytes())
            );
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: e.message };
        }

        if (utxosToSpend.length === 0) {
            return { code: WalletResultCode.NotEnoughAmount, message: "Not enough amount." };
        }

        utxosToSpend.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));
        estimatedTxFee = JSBI.BigInt(
            Utils.FEE_FACTOR * Transaction.getEstimatedNumberOfBytes(utxosToSpend.length, outputCount, payloadLength)
        );

        // Assign Payload
        if (payload !== undefined) this.txBuilder.assignPayload(payload);

        // Build a transaction
        receiver.forEach((m) => this.txBuilder.addOutput(m.address, m.amount));
        let tx = this.txBuilder.sign(OutputType.Payment, estimatedTxFee, payloadFee);

        // Get the size of the transaction
        let txSize = tx.getNumberOfBytes();
        let fees: TransactionFee;

        // Fees based on the transaction size is obtained from Stoa.
        try {
            fees = await this.client.getTransactionFee(txSize);
        } catch (e) {
            return { code: WalletResultCode.FailedRequestTxFee, message: e.message };
        }

        // Set the fee according to the option of the entered fee.
        let txFee = this.getFee(fees);
        let sumAmountUtxo = utxosToSpend.reduce<JSBI>((sum, n) => JSBI.add(sum, n.amount), JSBI.BigInt(0));
        totalFee = JSBI.add(payloadFee, txFee);
        totalSpendAmount = JSBI.add(totalFee, sendBOA);

        // If the sum of the already extracted UTXO is less than the transfer amount including the fee, a new UTXO is added
        while (JSBI.lessThan(sumAmountUtxo, totalSpendAmount)) {
            // Add additional UTXO for the required amount.
            let moreUtxosToSpend: UnspentTxOutput[];
            try {
                moreUtxosToSpend = await this.utxoProvider.getUTXO(
                    JSBI.subtract(totalSpendAmount, sumAmountUtxo),
                    JSBI.BigInt(Utils.FEE_FACTOR * TxInput.getEstimatedNumberOfBytes())
                );
            } catch (e) {
                return { code: WalletResultCode.FailedRequestUTXO, message: e.message };
            }

            if (moreUtxosToSpend.length === 0) {
                return { code: WalletResultCode.NotEnoughAmount, message: "Not enough amount." };
            }

            // region Get the fee of new transaction

            // Add new UTXOs
            utxosToSpend.push(...moreUtxosToSpend);
            utxosToSpend.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));

            // Assign Payload
            if (payload !== undefined) this.txBuilder.assignPayload(payload);

            // Build a transaction
            receiver.forEach((m) => this.txBuilder.addOutput(m.address, m.amount));
            tx = this.txBuilder.sign(OutputType.Payment, txFee, payloadFee);

            // Get the size of the transaction
            txSize = tx.getNumberOfBytes();

            // Fees based on the transaction size is obtained from Stoa.
            try {
                fees = await this.client.getTransactionFee(txSize);
            } catch (e) {
                return { code: WalletResultCode.FailedRequestTxFee, message: e.message };
            }

            // Select medium
            txFee = this.getFee(fees);

            // endregion

            sumAmountUtxo = utxosToSpend.reduce<JSBI>((sum, n) => JSBI.add(sum, n.amount), JSBI.BigInt(0));
            totalSpendAmount = JSBI.add(JSBI.add(payloadFee, txFee), sendBOA);
        }

        utxosToSpend.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));

        // Assign Payload
        if (payload !== undefined) this.txBuilder.assignPayload(payload);

        // Build a transaction
        receiver.forEach((m) => this.txBuilder.addOutput(m.address, m.amount));
        tx = this.txBuilder.sign(OutputType.Payment, txFee, payloadFee);

        try {
            await this.client.sendTransaction(tx);
        } catch (e) {
            return {
                code: WalletResultCode.FailedSendTx,
                message: e.message,
            };
        }

        return {
            code: WalletResultCode.Success,
            message: "Success.",
            tx,
        };
    }

    /**
     * Among the transactions sent to Agora, it is a function to cancel
     * a transaction that is not yet included in the block.
     * This does not remove the previous transaction itself.
     * This creates a new transaction that transfers all UTXOs used
     * in the transaction to be canceled to the same address,
     * and sends it to Agora.
     * However, while it is being sent and processed, a previous transaction
     * that wants to be canceled may be included in the block first.
     * @param tx Previously sent the transaction to be canceled
     * @param key_finder A function that finds KeyPairs that can consume UTXOs and returns them to an array.
     */
    public async cancel(tx: Transaction, key_finder?: (addresses: PublicKey[]) => KeyPair[]): Promise<IWalletResult> {
        if (tx.isCoinbase()) {
            return {
                code: WalletResultCode.CoinbaseCanNotCancel,
                message: "Transactions of type Coinbase cannot be canceled.",
                original_tx: tx,
            };
        }

        const check_res: IWalletResult = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let utxos: UnspentTxOutput[];
        // Requests the information of the UTXO used in the transaction.
        try {
            utxos = await this.client.getUTXOInfo(tx.inputs.map((m) => m.utxo));
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: e.message, original_tx: tx };
        }

        let key_pairs: KeyPair[];
        if (key_finder !== undefined) {
            key_pairs = key_finder(
                utxos
                    .filter((m) => m.lock_type === LockType.Key)
                    .map((u) => new PublicKey(Buffer.from(u.lock_bytes, "base64")))
            );
        } else {
            key_pairs = [this.owner];
        }

        // Create a cancellation transaction.
        const canceller = new TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();

        // Check for errors that occurred during the cancellation transaction creation process.
        switch (res.code) {
            case TxCancelResultCode.UnsupportedUnfreezing:
                return {
                    code: WalletResultCode.UnsupportedUnfreezing,
                    message: "Unfreeze transactions cannot be canceled.",
                    original_tx: tx,
                    tx: res.tx,
                };
            case TxCancelResultCode.InvalidTransaction:
                return {
                    code: WalletResultCode.InvalidTransaction,
                    message: "This transaction is invalid and cannot be canceled.",
                    original_tx: tx,
                    tx: res.tx,
                };
            case TxCancelResultCode.NotFoundUTXO:
                return {
                    code: WalletResultCode.NotFoundUTXO,
                    message: "UTXO information not found.",
                    original_tx: tx,
                    tx: res.tx,
                };
            case TxCancelResultCode.UnsupportedLockType:
                return {
                    code: WalletResultCode.UnsupportedLockType,
                    message: "This LockType not supported by cancel feature.",
                    original_tx: tx,
                    tx: res.tx,
                };
            case TxCancelResultCode.NotFoundKey:
                return {
                    code: WalletResultCode.NotFoundKey,
                    message: "Secret key not found.",
                    original_tx: tx,
                    tx: res.tx,
                };
            case TxCancelResultCode.NotEnoughFee:
                return {
                    code: WalletResultCode.NotEnoughFee,
                    message: "Not enough fees are needed to cancel.",
                    original_tx: tx,
                    tx: res.tx,
                };
        }

        // If there are no errors, send
        if (res.code === TxCancelResultCode.Success && res.tx !== undefined) {
            try {
                await this.client.sendTransaction(res.tx);
            } catch (e) {
                return {
                    code: WalletResultCode.FailedSendTx,
                    message: e.message,
                    original_tx: tx,
                };
            }
            return {
                code: WalletResultCode.Success,
                message: "Success.",
                original_tx: tx,
                tx: res.tx,
            };
        } else {
            return {
                code: WalletResultCode.UnknownError,
                message: "Unknown error occurred.",
                original_tx: tx,
            };
        }
    }

    /**
     * Among the transactions sent to Agora, it is a function to cancel
     * a transaction that is not yet included in the block.
     * This does not remove the previous transaction itself.
     * This creates a new transaction that transfers all UTXOs used
     * in the transaction to be canceled to the same address,
     * and sends it to Agora.
     * However, while it is being sent and processed, a previous transaction
     * that wants to be canceled may be included in the block first.
     * @param tx_hash Previously sent the transaction hash to be canceled
     * @param key_finder A function that finds KeyPairs that can consume UTXOs and returns them to an array.
     */
    public async cancelWithHash(
        tx_hash: Hash,
        key_finder?: (addresses: PublicKey[]) => KeyPair[]
    ): Promise<IWalletResult> {
        const check_res: IWalletResult = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let tx: Transaction;
        try {
            tx = await this.client.getPendingTransaction(tx_hash);
        } catch (e) {
            return { code: WalletResultCode.FailedRequestPendingTransaction, message: e.message };
        }
        return this.cancel(tx, key_finder);
    }
}
