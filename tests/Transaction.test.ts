/*******************************************************************************

    Test of Transaction

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import * as assert from "assert";

describe("Transaction", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Test of estimated size", () => {
        assert.strictEqual(sdk.TxInput.getEstimatedNumberOfBytes(), 132);
        assert.strictEqual(sdk.TxOutput.getEstimatedNumberOfBytes(), 45);
        assert.strictEqual(sdk.Transaction.getEstimatedNumberOfBytes(0, 0, 0), 8);
    });
});
