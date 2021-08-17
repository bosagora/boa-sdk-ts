/*******************************************************************************

    Contains definition for the fee of the transaction

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Utils } from "../../utils/Utils";

/**
 * Define the interface of the fee of the transaction
 */
export class TransactionFee {
    /**
     * The size of the transaction
     */
    tx_size: number;

    /**
     * The transaction fee for a medium speed
     */
    medium: string;

    /**
     * The transaction fee for a high speed
     */
    high: string;

    /**
     * The transaction fee for a low speed
     */
    low: string;

    /**
     * Constructor
     * @param tx_size The size of the transaction
     * @param medium The transaction fee for a medium speed
     * @param high The transaction fee for a high speed
     * @param low The transaction fee for a low speed
     */
    constructor(tx_size?: number, medium?: string, high?: string, low?: string) {
        if (tx_size !== undefined) this.tx_size = tx_size;
        else this.tx_size = 0;

        if (medium !== undefined) this.medium = medium;
        else this.medium = "0.01";

        if (high !== undefined) this.high = high;
        else this.high = "0.01";

        if (low !== undefined) this.low = low;
        else this.low = "0.01";
    }

    /**
     * This import from JSON
     * @param data The object of the JSON
     */
    public fromJSON(data: any) {
        Utils.validateJSON(this, data);

        this.tx_size = data.tx_size;
        this.medium = data.medium;
        this.high = data.high;
        this.low = data.low;
    }
}
