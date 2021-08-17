/*******************************************************************************

    Contains definition for the pre-image

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../../common/Hash";
import { Utils } from "../../utils/Utils";

/**
 * Define the pre-image
 */
export class PreImage {
    /**
     * The value of the pre-image at the height from Genesis
     */
    hash: Hash;

    /**
     * The Height of the block that this pre-image is for
     */
    height: string;

    /**
     * Constructor
     * @param h The value of the pre-image at the height from Genesis
     * @param d The Height of the block that this pre-image is for
     */
    constructor(h?: Hash, d?: string) {
        if (h !== undefined) this.hash = new Hash(h.data);
        else this.hash = new Hash(Buffer.alloc(Hash.Width));

        if (d !== undefined) this.height = d;
        else this.height = "0";
    }

    /**
     * This import from JSON
     * @param data The object of the JSON
     */
    public fromJSON(data: JSONPreImage) {
        Utils.validateJSON(this, data);

        this.height = data.height;
        this.hash.fromString(data.hash);
    }
}

/**
 * @ignore
 * Define the pre-image in JSON
 */
export interface JSONPreImage {
    hash: string;
    height: string;
}
