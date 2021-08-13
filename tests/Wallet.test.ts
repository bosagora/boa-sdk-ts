/*******************************************************************************

    Test data delivery of BOA Client using internal web server

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
// tslint:disable-next-line:no-implicit-dependencies
import bodyParser from "body-parser";
// tslint:disable-next-line:no-implicit-dependencies
import express from "express";
import * as http from "http";

/**
 * Sample UTXOs
 */
const sample_utxo_address = "boa1xza007gllhzdawnr727hds36guc0frnjsqscgf4k08zqesapcg3uujh9g93";
const sample_utxo = [
    {
        utxo: "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
        type: 1,
        height: "0",
        time: 1577836800000,
        unlock_height: "1",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
        type: 0,
        height: "1",
        time: 1577837400000,
        unlock_height: "2",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
        type: 0,
        height: "2",
        time: 1577838000000,
        unlock_height: "3",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
        type: 0,
        height: "3",
        time: 1577838600000,
        unlock_height: "4",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
        type: 0,
        height: "4",
        time: 1577839200000,
        unlock_height: "5",
        unlock_time: 1577836800000,
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
        type: 0,
        height: "5",
        time: 1577839800000,
        unlock_height: "6",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x451a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb",
        type: 0,
        height: "6",
        time: 1577840400000,
        unlock_height: "7",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0xff05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb",
        type: 0,
        height: "7",
        time: 1577841000000,
        unlock_height: "8",
        unlock_time: 1577836800000,
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
        type: 0,
        height: "8",
        time: 1577841600000,
        unlock_height: "9",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
        type: 0,
        height: "9",
        time: 1577842200000,
        unlock_height: "10",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
];
const sample_tx = {
    inputs: [
        {
            utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
            unlock: {
                bytes: "ihKCEMuCl9PXfhrsUQMEmmXMEIW0exrKvx5PLg7o8Qg3oN+NMCIbW4mDpQVY/yWmegg8RYuODrceVgxnUDMgCw==",
            },
            unlock_age: 0,
        },
    ],
    outputs: [
        {
            type: 0,
            value: "1899900000",
            lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
        },
        {
            type: 0,
            value: "100000000",
            lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
        },
    ],
    payload: "",
    lock_height: "0",
};
const sample_tx_hash = new sdk.Hash(
    "0x90959b83ee81cf2757eff613a0bcc35be9a9b6d3394e3c0255af4d68a43a6aeea1bfff1c5a84de5d54e1dd46436c18f6301bbfedae4168f632294c8f1d111ee3"
);

/**
 * This allows data transfer and reception testing with the server.
 * When this is executed, the local web server is run,
 * the test codes are performed, and the web server is shut down.
 */
class TestStoa {
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor(port: number | string) {
        if (typeof port === "string") this.port = parseInt(port, 10);
        else this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));
        // parse application/json
        this.app.use(bodyParser.json({ limit: "1mb" }));

        // http://localhost/block_height
        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send("10");
        });

        // http://localhost/balance
        this.app.get("/wallet/balance/:address", (req: express.Request, res: express.Response) => {
            const address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            res.status(200).send(
                JSON.stringify({
                    address: address.toString(),
                    balance: "20000000000",
                    spendable: "18000000000",
                    frozen: "2000000000",
                    locked: "0",
                })
            );
        });

        this.app.post("/utxos", (req: express.Request, res: express.Response) => {
            if (req.body.utxos === undefined) {
                res.status(400).send({
                    statusMessage: "Missing 'utxos' object in body",
                });
                return;
            }

            let utxos_hash: sdk.Hash[];
            try {
                utxos_hash = req.body.utxos.map((m: string) => new sdk.Hash(m));
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'utxos': ${req.body.utxos.toString()}`);
                return;
            }

            const utxo_array: any[] = [];
            utxos_hash.forEach((m) => {
                const found = sample_utxo.find((n) => n.utxo === m.toString());
                if (found !== undefined) {
                    utxo_array.push(found);
                }
            });

            res.status(200).send(JSON.stringify(utxo_array));
        });

        // http://localhost/utxo
        this.app.get("/wallet/utxo/:address", (req: express.Request, res: express.Response) => {
            const address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            let amount: sdk.JSBI;
            if (req.query.amount === undefined) {
                res.status(400).send(`Parameters 'amount' is not entered.`);
                return;
            } else if (!sdk.Utils.isPositiveInteger(req.query.amount.toString())) {
                res.status(400).send(`Invalid value for parameter 'amount': ${req.query.amount.toString()}`);
                return;
            }
            amount = sdk.JSBI.BigInt(req.query.amount.toString());

            // Balance Type (0: Spendable; 1: Frozen; 2: Locked)
            let balance_type: number;
            if (req.query.type !== undefined) {
                balance_type = Number(req.query.type.toString());
            } else {
                balance_type = 0;
            }

            // Last UTXO in previous request
            let last_utxo: sdk.Hash | undefined;
            if (req.query.last !== undefined) {
                try {
                    last_utxo = new sdk.Hash(String(req.query.last));
                } catch (error) {
                    res.status(400).send(`Invalid value for parameter 'last': ${req.query.last.toString()}`);
                    return;
                }
            } else {
                last_utxo = undefined;
            }

            if (sample_utxo_address !== address.toString()) {
                res.status(200).send(JSON.stringify([]));
                return;
            }

            let include = false;
            let sum = sdk.JSBI.BigInt(0);
            const utxos: any[] = sample_utxo
                .filter((m) => {
                    if (balance_type === 0 && (m.type === 0 || m.type === 2)) return true;
                    else return balance_type === 1 && m.type === 1;
                })
                .filter((m) => {
                    if (last_utxo === undefined) return true;
                    if (include) return true;
                    include = last_utxo.toString() === m.utxo;
                })
                .filter((n) => {
                    if (sdk.JSBI.greaterThanOrEqual(sum, amount)) return false;
                    sum = sdk.JSBI.add(sum, sdk.JSBI.BigInt(n.amount));
                    return true;
                });

            res.status(200).send(JSON.stringify(utxos));
        });

        // http://localhost/transaction/fees
        this.app.get("/transaction/fees/:tx_size", (req: express.Request, res: express.Response) => {
            const size: string = req.params.tx_size.toString();

            if (!sdk.Utils.isPositiveInteger(size)) {
                res.status(400).send(`Invalid value for parameter 'tx_size': ${size}`);
                return;
            }

            const tx_size = sdk.JSBI.BigInt(size);
            const factor = sdk.JSBI.BigInt(200);
            const minimum = sdk.JSBI.BigInt(100_000); // 0.01BOA
            let medium = sdk.JSBI.multiply(tx_size, factor);
            if (sdk.JSBI.lessThan(medium, minimum)) medium = sdk.JSBI.BigInt(minimum);

            const width = sdk.JSBI.divide(medium, sdk.JSBI.BigInt(10));
            const high = sdk.JSBI.add(medium, width);
            let low = sdk.JSBI.subtract(medium, width);
            if (sdk.JSBI.lessThan(low, minimum)) low = sdk.JSBI.BigInt(minimum);

            const data = {
                tx_size: sdk.JSBI.toNumber(tx_size),
                high: high.toString(),
                medium: medium.toString(),
                low: low.toString(),
            };

            res.status(200).send(JSON.stringify(data));
        });

        // http://localhost/transaction/pending
        this.app.get("/transaction/pending/:hash", (req: express.Request, res: express.Response) => {
            const hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            if (Buffer.compare(tx_hash.data, sample_tx_hash.data) !== 0) {
                res.status(204).send(`No pending transactions. hash': (${hash})`);
            } else {
                res.status(200).send(JSON.stringify(sample_tx));
            }
        });

        this.app.set("port", this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on("error", reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server !== null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else resolve();
        });
    }
}

/**
 * This is an Agora node for testing.
 * The test code allows the Agora node to be started and shut down.
 */
class TestAgora {
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor(port: number | string) {
        if (typeof port === "string") this.port = parseInt(port, 10);
        else this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // parse application/json
        this.app.use(bodyParser.json());

        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send("10");
        });

        this.app.get("/node_info", (req: express.Request, res: express.Response) => {
            res.status(200).send("{}");
        });

        this.app.put("/transaction", (req: express.Request, res: express.Response) => {
            if (req.body.tx === undefined) {
                res.status(400).send("Missing 'tx' object in body");
                return;
            }
            res.status(200).send();
        });

        this.app.set("port", this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on("error", reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server !== null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else resolve();
        });
    }
}

describe("Wallet", () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    const stoa_port: string = "7000";
    const agora_port: string = "6000";

    before("Wait for the package libsodium to finish loading", async () => {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    before("Start TestStoa", async () => {
        stoa_server = new TestStoa(stoa_port);
        await stoa_server.start();
    });

    before("Start TestAgora", async () => {
        agora_server = new TestAgora(agora_port);
        await agora_server.start();
    });

    after("Stop TestStoa", async () => {
        await stoa_server.stop();
    });

    after("Stop TestAgora", async () => {
        await agora_server.stop();
    });

    it("Test the Wallet - getBalance", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.getBalance();
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.balance !== undefined);

        assert.deepStrictEqual(res.balance.address, "boa1xza007gllhzdawnr727hds36guc0frnjsqscgf4k08zqesapcg3uujh9g93");
        assert.deepStrictEqual(res.balance.balance, sdk.JSBI.BigInt(20000000000));
        assert.deepStrictEqual(res.balance.spendable, sdk.JSBI.BigInt(18000000000));
        assert.deepStrictEqual(res.balance.frozen, sdk.JSBI.BigInt(2000000000));
        assert.deepStrictEqual(res.balance.locked, sdk.JSBI.BigInt(0));
    });

    it("Test the Wallet - transfer", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.JSBI.BigInt(100000000),
            },
        ]);

        const expected = {
            code: 0,
            message: "Success",
            tx: {
                inputs: [
                    {
                        utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "ihKCEMuCl9PXfhrsUQMEmmXMEIW0exrKvx5PLg7o8Qg3oN+NMCIbW4mDpQVY/yWmegg8RYuODrceVgxnUDMgCw==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1899900000",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                    {
                        type: 0,
                        value: "100000000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.tx !== undefined);
        assert.deepStrictEqual(res.tx.inputs[0].utxo.toString(), expected.tx.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.tx.outputs), JSON.stringify(expected.tx.outputs));
    });

    it("Test the Wallet - transfer - Fail access to Agora", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6100",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.JSBI.BigInt(100000000),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.FailedAccessToAgora);
        assert.ok(res.tx === undefined);
    });

    it("Test the Wallet - transfer - Fail access to Stoa", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7100",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.JSBI.BigInt(100000000),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.FailedAccessToStoa);
        assert.ok(res.tx === undefined);
    });

    it("Test the Wallet - transfer - Not Enough Amount", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SDPVYLR53EAL2F4L3ACTBSZWVZU2WGAQFSABMMWC65M4GNXFQGMAQPAX")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.JSBI.BigInt(100000000),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.NotEnoughAmount);
        assert.ok(res.tx === undefined);
    });

    it("Test the Wallet - cancel", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const tx = sdk.Transaction.reviver("", sample_tx);

        const res = await wallet.cancel(tx, (address: sdk.PublicKey[]) => {
            return [keypair];
        });

        const expected = {
            code: 0,
            message: "Success",
            tx: {
                inputs: [
                    {
                        utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "Sqxo1En3qMjcne9xnUy0uabpIckBnO3z6z13QCPj/AQlK8gQENdZQuSm9gMkil9/Z0bGGMvI77kHClXPSLPR0g==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999903800",
                        lock: {
                            type: 0,
                            bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
                        },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.tx !== undefined);

        assert.deepStrictEqual(res.tx.inputs[0].utxo.toString(), expected.tx.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.tx.outputs), JSON.stringify(expected.tx.outputs));
    });

    it("Test the Wallet - cancel with a transaction hash", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.cancelWithHash(sample_tx_hash);

        const expected = {
            code: 0,
            message: "Success",
            tx: {
                inputs: [
                    {
                        utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "Sqxo1En3qMjcne9xnUy0uabpIckBnO3z6z13QCPj/AQlK8gQENdZQuSm9gMkil9/Z0bGGMvI77kHClXPSLPR0g==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999903800",
                        lock: {
                            type: 0,
                            bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
                        },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.tx !== undefined);

        assert.deepStrictEqual(res.tx.inputs[0].utxo.toString(), expected.tx.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.tx.outputs), JSON.stringify(expected.tx.outputs));
    });

    it("Test the Wallet - freeze", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.freeze({
            address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
            amount: sdk.JSBI.BigInt(100000000),
        });

        const expected = {
            code: 0,
            message: "Success",
            tx: {
                inputs: [
                    {
                        utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "ihKCEMuCl9PXfhrsUQMEmmXMEIW0exrKvx5PLg7o8Qg3oN+NMCIbW4mDpQVY/yWmegg8RYuODrceVgxnUDMgCw==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1899900000",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                    {
                        type: 1,
                        value: "100000000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.tx !== undefined);
        assert.deepStrictEqual(res.tx.inputs[0].utxo.toString(), expected.tx.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.tx.outputs), JSON.stringify(expected.tx.outputs));
    });

    it("Test the Wallet - unfreeze", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletFeeOption.Medium,
        });

        const res = await wallet.unfreeze(
            [
                new sdk.Hash(
                    "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
                ),
            ],
            new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl")
        );

        const expected = {
            code: 0,
            message: "Success.",
            tx: {
                inputs: [
                    {
                        utxo: "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
                        unlock: {
                            bytes: "p/LCgG16AyLpClizUHE/R8dTJRgqgP2PjitJyZFZ+gmgdoLbloRs/fyLux57PznMlf90KAumyKrZ+UCj0Gjbmw==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999900000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.tx !== undefined);
        assert.deepStrictEqual(res.tx.inputs[0].utxo.toString(), expected.tx.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.tx.outputs), JSON.stringify(expected.tx.outputs));
    });
});
