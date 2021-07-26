/*******************************************************************************

    Contains definition for the BOA Client of TypeScript.
    It is responsible for requesting and receiving responses from
    the BOA API server(Stoa).
    It also provides other functions.(Verification of signature and pre-image)

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { Request } from "./Request";
import { UnspentTxOutput } from "./response/UnspentTxOutput";
import { Validator } from "./response/Validator";
import { TransactionFee } from "./response/TrasactionFee";
import { Balance } from "./response/Balance";
import { ITxHistoryElement, ITxOverview, IPendingTxs, ISPVStatus } from "./response/Types";
import { Transaction } from "../data/Transaction";
import { handleNetworkError } from "./error/ErrorTypes";
import { TxPayloadFee } from "../utils/TxPayloadFee";
import { Utils } from "../utils/Utils";
import { AxiosResponse } from "axios";
import uri from "urijs";

import JSBI from "jsbi";

/**
 * Define the BOA Client of TypeScript.
 * It is responsible for requesting and receiving responses from
 * the BOA API server(Stoa).
 * It also provides other functions. (Verification of signature and pre-image)
 */
export class BOAClient {
    /**
     * The Stoa server URL
     */
    public readonly server_url: uri;

    /**
     * The Agora URL
     */
    public readonly agora_url: uri;

    /**
     * Constructor
     * @param server_url The Stoa server URL
     * @param agora_url  The Agora server URL
     */
    constructor(server_url: string, agora_url: string) {
        this.server_url = uri(server_url);
        this.agora_url = uri(agora_url);
    }

    /**
     * Request all valid validator at the block height.
     * If block height is not specified, it is the current height.
     * @param height The block height
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getAllValidators(height?: number): Promise<Array<Validator>> {
        return new Promise<Array<Validator>>((resolve, reject) => {
            let url = uri(this.server_url).directory("validators");

            if (height != undefined) url.addSearch("height", height);

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    let validators: Array<Validator> = new Array<Validator>();
                    if (response.status == 200) {
                        response.data.forEach((elem: any) => {
                            let validator = new Validator();
                            validator.fromJSON(elem);
                            validators.push(validator);
                        });
                        resolve(validators);
                    } else if (response.status == 204) {
                        resolve(validators);
                    } else {
                        // It is not yet defined in Stoa.
                        reject(handleNetworkError({ response: response }));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Requests a valid validator for the address at the block height.
     * If block height is not specified, it is the current height.
     * @param address The public key
     * @param height  The block height
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getValidator(address: string, height?: number): Promise<Array<Validator>> {
        return new Promise<Array<Validator>>((resolve, reject) => {
            let url = uri(this.server_url).directory("validator").filename(address);

            if (height != undefined) url.addSearch("height", height);

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    let validators: Array<Validator> = new Array<Validator>();
                    if (response.status == 200) {
                        response.data.forEach((elem: any) => {
                            let validator = new Validator();
                            validator.fromJSON(elem);
                            validators.push(validator);
                        });
                        resolve(validators);
                    } else if (response.status == 204) {
                        resolve(validators);
                    } else {
                        // It is not yet defined in Stoa.
                        reject(handleNetworkError({ response: response }));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Check the validity of a new pre-image
     * @param original_image        The original pre-image hash
     * @param original_image_height The original pre-image height
     * @param new_image             The new pre-image hash to check
     * @param new_image_height      The new pre-image height
     * @returns
     * {result: true, message: "The pre-image is valid."} if the pre-image is valid,
     * otherwise the result is false and the message is the reason for invalid
     * See_Also: https://github.com/bosagora/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L50-L69
     */
    public isValidPreimage(
        original_image: Hash,
        original_image_height: number,
        new_image: Hash,
        new_image_height: number
    ): IsValidPreimageResponse {
        if (!Number.isInteger(original_image_height) || original_image_height < 0)
            return {
                result: false,
                message: "The original pre-image height is not valid.",
            };

        if (!Number.isInteger(new_image_height) || new_image_height < 0)
            return {
                result: false,
                message: "The new pre-image height is not valid.",
            };

        if (new_image_height < original_image_height)
            return {
                result: false,
                message: "The height of new pre-image is smaller than that of original one.",
            };

        let temp_hash = new Hash(new_image.data);
        for (let idx = original_image_height; idx < new_image_height; idx++) temp_hash = hash(temp_hash.data);

        if (!original_image.data.equals(temp_hash.data))
            return {
                result: false,
                message: "The pre-image has a invalid hash value.",
            };

        return {
            result: true,
            message: "The pre-image is valid.",
        };
    }

    /**
     * Request the block height corresponding to to the block creation time
     * @param when Unix epoch time
     * @returns height If it already exists in the block,
     * it returns the height of the block,
     * if the block has not yet been created,
     * it returns the estimated height is returned.
     */
    public getHeightAt(when: Date): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let time = Math.ceil(when.getTime() / 1000);
            let url = uri(this.server_url).directory("block_height_at").filename(time.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    if (response.status == 200) resolve(Number(response.data));
                    else reject(new Error("The date before Genesis Block creation is invalid."));
                    reject(handleNetworkError({ response: response }));
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Saves the data to the blockchain
     * @param tx The instance of the Transaction
     * @returns Returns true if success, otherwise returns false
     */
    public sendTransaction(tx: Transaction): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let url = uri(this.agora_url).filename("transaction");

            Request.put(url.toString(), { tx: tx })
                .then((response: AxiosResponse) => {
                    if (response.status == 200) resolve(true);
                    else reject(handleNetworkError({ response: response }));
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request UTXOs of public key
     * @param address The address of UTXOs
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getUTXOs(address: PublicKey): Promise<Array<UnspentTxOutput>> {
        return new Promise<Array<UnspentTxOutput>>((resolve, reject) => {
            let url = uri(this.server_url).directory("utxo").filename(address.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    let utxos: Array<UnspentTxOutput> = new Array<UnspentTxOutput>();
                    response.data.forEach((elem: any) => {
                        let utxo = new UnspentTxOutput();
                        utxo.fromJSON(elem);
                        utxos.push(utxo);
                    });
                    resolve(utxos);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request UTXO's information about the UTXO hash array.
     * @param hashes The hash of UTXOs
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getUTXOInfo(hashes: Array<Hash>): Promise<Array<UnspentTxOutput>> {
        return new Promise<Array<UnspentTxOutput>>((resolve, reject) => {
            let url = uri(this.server_url).directory("utxos");

            let utxo_hashes = hashes.map((m) => m.toString());
            Request.post(url.toString(), { utxos: utxo_hashes })
                .then((response: AxiosResponse) => {
                    let utxos: Array<UnspentTxOutput> = new Array<UnspentTxOutput>();
                    response.data.forEach((elem: any) => {
                        let utxo = new UnspentTxOutput();
                        utxo.fromJSON(elem);
                        utxos.push(utxo);
                    });
                    resolve(utxos);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request an Stoa's current block height.
     */
    public getBlockHeight(): Promise<JSBI> {
        let url = uri(this.server_url).filename("/block_height");

        return Request.get(url.toString()).then((response: AxiosResponse) => {
            return JSBI.BigInt(response.data);
        });
    }

    /**
     * Returns the connection status to Stoa.
     */
    public getStoaStatus(): Promise<boolean> {
        let url = uri(this.server_url).filename("/block_height");

        return Request.get(url.toString())
            .then((response: AxiosResponse) => {
                return Utils.isInteger(response.data);
            })
            .catch((reason) => {
                return false;
            });
    }

    /**
     * Returns the connection status to Agora.
     */
    public getAgoraStatus(): Promise<boolean> {
        let url = uri(this.agora_url).filename("/block_height");

        return Request.get(url.toString())
            .then((response: AxiosResponse) => {
                return Utils.isInteger(response.data);
            })
            .catch((reason) => {
                return false;
            });
    }

    /**
     * Request an appropriate fee based on the size of the transaction to Stoa.
     * @param tx_size The size of the transaction
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getTransactionFee(tx_size: number): Promise<TransactionFee> {
        return new Promise<TransactionFee>((resolve, reject) => {
            let url = uri(this.server_url).directory("transaction/fees").filename(tx_size.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    if (response.status == 200) {
                        let fees = new TransactionFee();
                        fees.fromJSON(response.data);
                        resolve(fees);
                    } else {
                        // It is not yet defined in Stoa.
                        reject(handleNetworkError({ response: response }));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request a history of transactions.
     * @param address   An address that want to be inquired.
     * @param page_size Maximum record count that can be obtained from one query
     * @param page      The number on the page, this value begins with 1
     * @param type      The parameter `type` is the type of transaction to query. ("payment", "freeze")
     * @param begin     The start date of the range of dates to look up.
     * @param end       The end date of the range of dates to look up.
     * @param peer      This is used when users want to look up only specific
     * Peer is the withdrawal address in the inbound transaction and a deposit address
     * in the outbound transaction address of their counterparts.
     */
    public getWalletTransactionsHistory(
        address: PublicKey,
        page_size: number,
        page: number,
        type: Array<string>,
        begin?: number,
        end?: number,
        peer?: string
    ): Promise<Array<ITxHistoryElement>> {
        return new Promise<Array<ITxHistoryElement>>((resolve, reject) => {
            let url = uri(this.server_url)
                .directory("/wallet/transactions/history/")
                .filename(address.toString())
                .addSearch("pageSize", page_size.toString())
                .addSearch("page", page.toString())
                .addSearch("type", type.join(","));

            if (begin !== undefined) url.addSearch("beginDate", begin.toString());

            if (end !== undefined) url.addSearch("endDate", end.toString());

            if (peer !== undefined) url.addSearch("peer", peer);

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    resolve(response.data);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request a overview of a transaction.
     * @param tx_hash The hash of the transaction
     */
    public getWalletTransactionOverview(tx_hash: Hash): Promise<ITxOverview> {
        return new Promise<ITxOverview>((resolve, reject) => {
            let url = uri(this.server_url).directory("/wallet/transaction/overview").filename(tx_hash.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    if (response.status == 200) {
                        resolve(response.data);
                    } else {
                        // It is not yet defined in Stoa.
                        reject(handleNetworkError({ response: response }));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request pending transactions.
     * @param address The input address of the pending transaction
     */
    public getWalletTransactionsPending(address: PublicKey): Promise<Array<IPendingTxs>> {
        return new Promise<Array<IPendingTxs>>((resolve, reject) => {
            let url = uri(this.server_url).directory("/wallet/transactions/pending").filename(address.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    resolve(response.data);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request a pending transaction based on the hash of the transaction.
     * @param tx_hash The hash of the transaction
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getPendingTransaction(tx_hash: Hash): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            let url = uri(this.server_url).directory("transaction/pending").filename(tx_hash.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    if (response.status == 200) {
                        let tx = Transaction.reviver("", response.data);
                        resolve(tx);
                    } else {
                        // It is not yet defined in Stoa.
                        reject(handleNetworkError({ response: response }));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request a transaction based on the hash of the transaction.
     * @param tx_hash The hash of the transaction
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getTransaction(tx_hash: Hash): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            let url = uri(this.server_url).directory("transaction").filename(tx_hash.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    if (response.status == 200) {
                        let tx = Transaction.reviver("", response.data);
                        resolve(tx);
                    } else {
                        // It is not yet defined in Stoa.
                        reject(handleNetworkError({ response: response }));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Request a fee for a voting transaction
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getVotingFee(payload_size: number): Promise<JSBI> {
        return new Promise<JSBI>(async (resolve, reject) => {
            try {
                let payload_fee = TxPayloadFee.getFee(payload_size);
                let tx_size = Transaction.getEstimatedNumberOfBytes(1, 2, payload_size);
                let fees = await this.getTransactionFee(tx_size);
                let tx_fee = JSBI.BigInt(fees.high);
                resolve(JSBI.add(payload_fee, tx_fee));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Request a balance based on the address.
     * @param address The address
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getBalance(address: PublicKey): Promise<Balance> {
        return new Promise<Balance>((resolve, reject) => {
            let url = uri(this.server_url).directory("wallet/balance").filename(address.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    resolve(Balance.reviver("", response.data));
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Simple verify payment
     * Check if the transaction is stored in a block.
     * And check if Merkle's proof is valid.
     * @param tx_hash The hash of the transaction
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public verifyPayment(tx_hash: Hash): Promise<ISPVStatus> {
        return new Promise<ISPVStatus>((resolve, reject) => {
            let url = uri(this.server_url).directory("spv").filename(tx_hash.toString());

            Request.get(url.toString())
                .then((response: AxiosResponse) => {
                    resolve(response.data);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }
}

export interface IsValidPreimageResponse {
    result: boolean;
    message: string;
}
