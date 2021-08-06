/*******************************************************************************

    Test data delivery of BOA Client using internal web server

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from "../lib";
import { BOASodium } from "boa-sodium-ts";

import * as assert from "assert";
import axios from "axios";
import bodyParser from "body-parser";
import express from "express";
import * as http from "http";
import URI from "urijs";

/**
 * sample JSON
 */
let sample_validators = [
    {
        address: "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0",
        enrolled_at: 0,
        stake: "0x210b66053c73e7bd7b27673706f0272617d09b8cda76605e91ab66ad1cc3bfc1f3f5fede91fd74bb2d2073de587c6ee495cfb0d981f03a83651b48ce0e576a1a",
        preimage: {
            height: "1",
            hash: "0",
        },
    },
    {
        address: "boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw",
        enrolled_at: 0,
        stake: "0x86f1a6dff3b1f2256d2417b71ecc5511293b224894da5fd75c192965aa1874824ca777ecac678c871e717ad38c295046f4f64130f31750aa967c30c35529944a",
        preimage: {
            height: "1",
            hash: "0",
        },
    },
    {
        address: "boa1xrz66g5ajvrw0jpy3pyfc05hh65v3xvc79vae36fnzxkz4w4hzswv90ypcp",
        enrolled_at: 0,
        stake: "0xf21f606e96d6130b02a807655fda22c8888111f2045c0d45eda9c26d3c97741ca32fc68960ae68220809843d92671083e32395a848203380e5dfd46e4b0261f0",
        preimage: {
            height: "1",
            hash: "0",
        },
    },
];

/**
 * Sample UTXOs
 */
let sample_utxo_address = "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0";
let sample_utxo = [
    {
        utxo: "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
        type: 1,
        height: "0",
        time: 1577836800000,
        unlock_height: "1",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
        type: 0,
        height: "1",
        time: 1577837400000,
        unlock_height: "2",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
        type: 0,
        height: "2",
        time: 1577838000000,
        unlock_height: "3",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
        type: 0,
        height: "3",
        time: 1577838600000,
        unlock_height: "4",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
        type: 0,
        height: "4",
        time: 1577839200000,
        unlock_height: "5",
        unlock_time: 1577836800000,
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
        type: 0,
        height: "5",
        time: 1577839800000,
        unlock_height: "6",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0x451a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb",
        type: 0,
        height: "6",
        time: 1577840400000,
        unlock_height: "7",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0xff05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb",
        type: 0,
        height: "7",
        time: 1577841000000,
        unlock_height: "8",
        unlock_time: 1577836800000,
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
        type: 0,
        height: "8",
        time: 1577841600000,
        unlock_height: "9",
        amount: "200000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
    {
        utxo: "0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
        type: 0,
        height: "9",
        time: 1577842200000,
        unlock_height: "10",
        amount: "100000",
        lock_type: 0,
        lock_bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
    },
];

let sample_tx = {
    inputs: [
        {
            utxo: "0xc0abcbff07879bfdb1495b8fdb9a9e5d2b07a689c7b9b3c583459082259be35687c125a1ddd6bd28b4fe8533ff794d3dba466b5f91117bbf557c3f1b6ff50e5f",
            unlock: {
                bytes: "o78xIUchVl3X7B/KzFtDnt1K72bVeiAK4iy1ZK4+T5m0Fw3KCxf2YBdgLJ3jANQsH5eU7+YbABxCO1ayJaAGBw==",
            },
            unlock_age: 0,
        },
    ],
    outputs: [
        {
            type: 0,
            value: "4000000000000",
            lock: {
                type: 0,
                bytes: "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q=",
            },
        },
        {
            type: 0,
            value: "4000000000000",
            lock: {
                type: 0,
                bytes: "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q=",
            },
        },
        {
            type: 0,
            value: "4000000000000",
            lock: {
                type: 0,
                bytes: "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q=",
            },
        },
        {
            type: 0,
            value: "4000000000000",
            lock: {
                type: 0,
                bytes: "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q=",
            },
        },
        {
            type: 0,
            value: "4000000000000",
            lock: {
                type: 0,
                bytes: "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q=",
            },
        },
    ],
    payload: "",
    lock_height: "0",
};

let sample_txs_history = [
    {
        display_tx_type: "inbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "9",
        time: 1601553600,
        tx_hash:
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814",
        tx_type: "payment",
        amount: "610000000000000",
        unlock_height: "10",
        unlock_time: 1601554200,
    },
    {
        display_tx_type: "outbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "8",
        time: 1600953600,
        tx_hash:
            "0x63341a4502434e2c89d0f4e46cb9cbd27dfa8a6d244685bb5eb6635d634b2179b49108e949f176906a13b8685254b1098ebf1adf44033f5c9dd6b4362c14b020",
        tx_type: "payment",
        amount: "-610000000000000",
        unlock_height: "9",
        unlock_time: 1600954200,
    },
    {
        display_tx_type: "inbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "7",
        time: 1600353600,
        tx_hash:
            "0xcf3ca7b3d5c8f6bac821a7812318eb2ab89a6b9345c5e8dbf41d5e69067c3e38642cf8679187d9c0a5ae11477f0e9d632ed950fb25baf4bcfd9b397a4a611d01",
        tx_type: "payment",
        amount: "610000000000000",
        unlock_height: "8",
        unlock_time: 1600354200,
    },
    {
        display_tx_type: "outbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "6",
        time: 1599753600,
        tx_hash:
            "0xb14c45657f4fd6ff7dc0a64c08c29304704c4c0c54096a8d3cdcff9a33d31ccfe64b3fe5d26527e90d53519189497b1c602b84db659f90d58f9d8ec10088f572",
        tx_type: "payment",
        amount: "-610000000000000",
        unlock_height: "7",
        unlock_time: 1599754200,
    },
    {
        display_tx_type: "inbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "5",
        time: 1599153600,
        tx_hash:
            "0x22152566c7d705f419752bb7907984f8071ecce51368774b42980b150cd967a72ca38bc4d3b2c6d94989458f17fcf365820f656d9bbdf2091f13c24947509fe2",
        tx_type: "payment",
        amount: "610000000000000",
        unlock_height: "6",
        unlock_time: 1599154200,
    },
    {
        display_tx_type: "outbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "4",
        time: 1598553600,
        tx_hash:
            "0x85f160d6018473ee4e38dbcb784d7e7e69ae8db77d8ab6de27e373feeb6d0e6e35d1d4952063e7a0efec3a2a7aad8b72399fecc0655b1920cfb6fc9403e5c72a",
        tx_type: "payment",
        amount: "-610000000000000",
        unlock_height: "5",
        unlock_time: 1598554200,
    },
    {
        display_tx_type: "inbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "3",
        time: 1597953600,
        tx_hash:
            "0x148891ad8dfaa13276434bfbc9525111dea803de185afe4dd12e5564b23163399e9f37bfdba4e9041ea189377f184cc25533e3361479e2e0c8dc461abe86bbfa",
        tx_type: "payment",
        amount: "610000000000000",
        unlock_height: "4",
        unlock_time: 1597954200,
    },
    {
        display_tx_type: "outbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
        peer_count: 1,
        height: "2",
        time: 1597353600,
        tx_hash:
            "0x2ff28f6f890be85fe2d23ff0e42bd7e5c8626cb7749e00978dd7296b28583effdb038db5a1922b06eddb5c7b23bc67e9db8d3ce3ee9b701854ab05a8cc313caa",
        tx_type: "payment",
        amount: "-610000000000000",
        unlock_height: "3",
        unlock_time: 1597354200,
    },
    {
        display_tx_type: "inbound",
        address: "boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9",
        peer: "GDAZW22V4WVQ6Y6ILIKY3BNODEWBXXK5VY2B3HACFM6VWV4JEEAPDHCC",
        peer_count: 1,
        height: "1",
        time: 1596753600,
        tx_hash:
            "0x520d6766f3142d391d80ac1a47d63d7978476415030f9ff61eea2374dda1b85e7f699364d7f8db8993dd078de6f95f525c5e2d66cd20fea2ed34c340b44db9f3",
        tx_type: "payment",
        amount: "610000000000000",
        unlock_height: "2",
        unlock_time: 1596754200,
    },
];

let sample_tx_overview = {
    height: "9",
    time: 1601553600,
    tx_hash:
        "0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52",
    tx_type: "payment",
    unlock_height: "10",
    unlock_time: 1601554200,
    payload: "",
    senders: [
        {
            address: "boa1xrgq6607dulyra5r9dw0ha6883va0jghdzk67er49h3ysm7k222ruhh7400",
            amount: 610000000000000,
            utxo: "0xb0383981111438cf154c7725293009d53462c66d641f76506400f64f55f9cb2e253dafb37af9fafd8b0031e6b9789f96a3a4be06b3a15fa592828ec7f8c489cc",
        },
    ],
    receivers: [
        {
            address: "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0",
            amount: 610000000000000,
            utxo: "0xefed6c1701d1195524d469a3bbb058492a7922ff98e7284a01f14c0a32c31814f4ed0d6666aaf7071ae0f1eb615920173f13a63c8774aa5955a3af77c51e55e9",
        },
    ],
    fee: "0",
};

let sample_txs_pending = [
    {
        tx_hash:
            "0xcf8e55b51027342537ebbdfc503146033fcd8091054913e78d6a858125f892a24b0734afce7154fdde85688ab1700307b999b2e5a17a724990bb83d3785e89da",
        submission_time: 1613404086,
        address: "boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s",
        amount: "1663400000",
        fee: "0",
    },
    {
        tx_hash:
            "0xcf8e55b51027342537ebbdfc503146033fcd8091054913e78d6a858125f892a24b0734afce7154fdde85688ab1700307b999b2e5a17a724990bb83d3785e89da",
        submission_time: 1613404086,
        address: "boa1xrgr66gdm5je646x70l5ar6qkhun0hg3yy2eh7tf8xxlmlt9fgjd2q0uj8p",
        amount: "24398336600000",
        fee: "0",
    },
];

let sample_spv = {
    result: true,
    message: "Success",
};

/**
 * This allows data transfer and reception testing with the server.
 * When this is executed, the local web server is run,
 * the test codes are performed, and the web server is shut down.
 */
export class TestStoa {
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
        if (typeof port == "string") this.port = parseInt(port, 10);
        else this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {
        // http://localhost/validators
        this.app.get("/validators", (req: express.Request, res: express.Response) => {
            let height: number = Number(req.query.height);

            if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0)) {
                res.status(400).send("The Height value is not valid.");
                return;
            }

            let enrolled_height: number = 0;
            if (Number.isNaN(height)) height = enrolled_height;

            for (let elem of sample_validators) {
                elem.preimage.height = (height - enrolled_height).toString();
            }

            res.status(200).send(JSON.stringify(sample_validators));
        });

        // http://localhost/validator
        this.app.get("/validator/:address", (req: express.Request, res: express.Response) => {
            let height: number = Number(req.query.height);
            let address: string = String(req.params.address);

            if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0)) {
                res.status(400).send("The Height value is not valid.");
                return;
            }

            let enrolled_height: number = 0;
            if (Number.isNaN(height)) height = enrolled_height;

            for (let elem of sample_validators) {
                if (elem.address == address) {
                    elem.preimage.height = (height - enrolled_height).toString();
                    res.status(200).send(JSON.stringify([elem]));
                    return;
                }
            }

            res.status(204).send();
        });

        // http://localhost/client_info
        this.app.get("/client_info", (req: express.Request, res: express.Response) => {
            res.status(200).send({
                "X-Client-Name": req.header("X-Client-Name"),
                "X-Client-Version": req.header("X-Client-Version"),
            });
        });

        // http://localhost/utxo
        this.app.get("/utxo/:address", (req: express.Request, res: express.Response) => {
            let address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            if (sample_utxo_address == address.toString()) {
                res.status(200).send(JSON.stringify(sample_utxo));
                return;
            }

            res.status(400).send();
        });

        // http://localhost/block_height
        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send("10");
        });

        // http://localhost/transaction/fees
        this.app.get("/transaction/fees/:tx_size", (req: express.Request, res: express.Response) => {
            let size: string = req.params.tx_size.toString();

            if (!sdk.Utils.isPositiveInteger(size)) {
                res.status(400).send(`Invalid value for parameter 'tx_size': ${size}`);
                return;
            }

            let tx_size = sdk.JSBI.BigInt(size);
            let factor = sdk.JSBI.BigInt(200);
            let minimum = sdk.JSBI.BigInt(100_000); // 0.01BOA
            let medium = sdk.JSBI.multiply(tx_size, factor);
            if (sdk.JSBI.lessThan(medium, minimum)) medium = sdk.JSBI.BigInt(minimum);

            let width = sdk.JSBI.divide(medium, sdk.JSBI.BigInt(10));
            let high = sdk.JSBI.add(medium, width);
            let low = sdk.JSBI.subtract(medium, width);
            if (sdk.JSBI.lessThan(low, minimum)) low = sdk.JSBI.BigInt(minimum);

            let data = {
                tx_size: sdk.JSBI.toNumber(tx_size),
                high: high.toString(),
                medium: medium.toString(),
                low: low.toString(),
            };

            res.status(200).send(JSON.stringify(data));
        });

        this.app.get("/wallet/transactions/history/:address", (req: express.Request, res: express.Response) => {
            let address: string = String(req.params.address);
            if (sdk.PublicKey.validate(address) != "") {
                res.status(400).send(`Invalid value for parameter 'address': ${address}`);
                return;
            }
            res.status(200).send(JSON.stringify(sample_txs_history));
        });

        this.app.get("/wallet/transaction/overview/:hash", (req: express.Request, res: express.Response) => {
            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(String(req.params.hash));
                res.status(200).send(JSON.stringify(sample_tx_overview));
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${String(req.params.hash)}`);
            }
        });

        this.app.get("/wallet/transactions/pending/:address", (req: express.Request, res: express.Response) => {
            let address: string = String(req.params.address);
            if (sdk.PublicKey.validate(address) != "") {
                res.status(400).send(`Invalid value for parameter 'address': ${address}`);
                return;
            }
            res.status(200).send(JSON.stringify(sample_txs_pending));
        });

        // http://localhost/transaction/pending
        this.app.get("/transaction/pending/:hash", (req: express.Request, res: express.Response) => {
            let hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            let sample_tx_hash = new sdk.Hash(
                "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598" +
                    "c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd"
            );

            if (Buffer.compare(tx_hash.data, sample_tx_hash.data) != 0) {
                res.status(204).send(`No pending transactions. hash': (${hash})`);
            } else {
                res.status(200).send(JSON.stringify(sample_tx));
            }
        });

        // http://localhost/transaction
        this.app.get("/transaction/:hash", (req: express.Request, res: express.Response) => {
            let hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            let sample_tx_hash = new sdk.Hash(
                "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598" +
                    "c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd"
            );

            if (Buffer.compare(tx_hash.data, sample_tx_hash.data) != 0) {
                res.status(204).send(`No pending transactions. hash': (${hash})`);
            } else {
                res.status(200).send(JSON.stringify(sample_tx));
            }
        });

        this.app.get("/spv/:hash", (req: express.Request, res: express.Response) => {
            let hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            res.status(200).send(JSON.stringify(sample_spv));
        });

        this.app.post("/utxos", (req: express.Request, res: express.Response) => {
            let result = [
                {
                    utxo: "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673",
                    type: 0,
                    unlock_height: "2",
                    amount: "20000000000000",
                    height: "1",
                    time: 1609459200,
                    lock_type: 0,
                    lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
                },
                {
                    utxo: "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad",
                    type: 0,
                    unlock_height: "2",
                    amount: "20000000000000",
                    height: "1",
                    time: 1609459800,
                    lock_type: 0,
                    lock_bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=",
                },
            ];
            res.status(200).send(JSON.stringify(result));
        });

        this.app.get("/block_height_at/:time", (req: express.Request, res: express.Response) => {
            const time_stamp = Number(req.params.time);

            const zero = 1609459200;
            const height = Math.floor((time_stamp - zero) / (60 * 10));
            if (height < 0) res.status(204).send("No Content");
            else res.status(200).send(JSON.stringify(height.toString()));
        });

        // http://localhost/balance
        this.app.get("/wallet/balance/:address", (req: express.Request, res: express.Response) => {
            let address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            if (sample_utxo_address == address.toString()) {
                res.status(200).send(
                    JSON.stringify({
                        address: sample_utxo_address,
                        balance: "2000000",
                        spendable: "1800000",
                        frozen: "200000",
                        locked: "0",
                    })
                );
                return;
            }

            res.status(400).send();
        });

        // GET /wallet/utxo/:address
        this.app.get("/wallet/utxo/:address", (req: express.Request, res: express.Response) => {
            let address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

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
            let utxos: any[] = sample_utxo
                .filter((m) => {
                    if (balance_type == 0 && (m.type === 0 || m.type === 2)) return true;
                    else return balance_type == 1 && m.type === 1;
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
            if (this.server != null)
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
        if (typeof port == "string") this.port = parseInt(port, 10);
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
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else resolve();
        });
    }
}

describe("BOA Client", () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    let stoa_port: string = "5000";
    let agora_port: string = "2826";

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

    it("Test requests and responses to data using `LocalNetworkTest`", async () => {
        // Now we use axios, but in the future we will implement sdk, and test it.
        const client = axios.create();
        let stoa_uri = URI("http://localhost")
            .port(stoa_port)
            .directory("validator")
            .filename("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
            .setSearch("height", "10");

        let response = await client.get(stoa_uri.toString());
        assert.strictEqual(response.data.length, 1);
        assert.strictEqual(response.data[0].address, "boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw");
        assert.strictEqual(response.data[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client - `getAllValidators`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getAllValidators(10);
        assert.strictEqual(validators.length, 3);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client - `getAllValidator`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getValidator(
            "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0",
            10
        );
        assert.strictEqual(validators.length, 1);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client - `getUtxo`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        let utxos = await boa_client.getUTXOs(public_key);
        assert.strictEqual(utxos.length, sample_utxo.length);
        assert.deepStrictEqual(utxos[0].utxo, new sdk.Hash(sample_utxo[0].utxo));
        assert.strictEqual(utxos[0].type, sample_utxo[0].type);
        assert.deepStrictEqual(utxos[0].unlock_height, sdk.JSBI.BigInt(sample_utxo[0].unlock_height));
        assert.deepStrictEqual(utxos[0].amount, sdk.JSBI.BigInt(sample_utxo[0].amount));
    });

    it("Test a function of the BOA Client - `getBlockHeight`", async () => {
        // Set URL
        let uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(uri.toString(), agora_uri.toString());

        // Query
        let height = await boa_client.getBlockHeight();
        assert.deepStrictEqual(height, sdk.JSBI.BigInt(10));
    });

    it("Test a function of the BOA Client using async, await - `getAllValidators`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getAllValidators(10);
        assert.strictEqual(validators.length, 3);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client using async, await - `getAllValidator`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getValidator(
            "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0",
            10
        );
        assert.strictEqual(validators.length, 1);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("When none of the data exists as a result of the inquiry.", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getValidator(
            "boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg",
            10
        );
        assert.strictEqual(validators.length, 0);
    });

    it("When an error occurs with the wrong input parameter (height is -10).", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        await assert.rejects(
            boa_client.getValidator("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0", -10),
            {
                status: 400,
                message: "Bad Request",
                statusMessage: "The Height value is not valid.",
            }
        );
    });

    it("Can not connect to the server by entering the wrong URL", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port("6000");
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        await assert.rejects(
            boa_client.getValidator("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0", 10),
            {
                message: "connect ECONNREFUSED 127.0.0.1:6000",
            }
        );
    });

    /**
     * See_Also: https://github.com/bosagora/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L79-L106
     */
    it("test for validity of pre-image", (doneIt: () => void) => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let pre_images: sdk.Hash[] = [];

        pre_images.push(sdk.hash(Buffer.from(sdk.SodiumHelper.sodium.randombytes_buf(sdk.Hash.Width))));
        for (let idx = 0; idx < 20; idx++) {
            pre_images.push(sdk.hash(pre_images[idx].data));
        }
        pre_images = pre_images.reverse();

        let original_image = pre_images[0];
        let original_image_height = 1;

        // valid pre-image
        let new_image = pre_images[10];
        let new_image_height = 11;
        let res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(res.result);

        // invalid pre-image with wrong height number
        new_image = pre_images[10];
        new_image_height = 0;
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The height of new pre-image is smaller than that of original one.");

        // invalid pre-image with wrong hash value
        new_image = pre_images[10];
        new_image_height = 10;
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The pre-image has a invalid hash value.");

        // invalid (original_image_height is NaN and new_image_height is NaN)
        new_image = pre_images[10];
        new_image_height = 11;
        res = boa_client.isValidPreimage(original_image, NaN, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The original pre-image height is not valid.");

        // invalid (original_image_height is NaN and new_image_height is NaN)
        new_image = pre_images[10];
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, NaN);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The new pre-image height is not valid.");

        doneIt();
    });

    it("test for getHeightAt", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let date = new Date(Date.UTC(2021, 3, 29, 0, 0, 0));
        let height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 16992);

        date = new Date(Date.UTC(2020, 11, 29, 0, 0, 0));
        await assert.rejects(
            boa_client.getHeightAt(date),
            new Error("The date before Genesis Block creation is invalid.")
        );

        date = new Date(Date.UTC(2021, 0, 1, 0, 0, 0));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 0);

        date = new Date(Date.UTC(2021, 0, 1, 0, 9, 59));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 0);

        date = new Date(Date.UTC(2021, 0, 1, 0, 10, 0));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 1);
    });

    it("Test client name and version", async () => {
        const version = require("../package.json").version;

        let stoa_uri = URI("http://localhost").port(stoa_port).directory("client_info");

        let response = await sdk.Request.get(stoa_uri.toString());
        assert.strictEqual(response.data["X-Client-Name"], "boa-sdk-ts");
        assert.strictEqual(response.data["X-Client-Version"], version);
    });

    it("Test creating a vote data", () => {
        let utxos = [
            {
                utxo: new sdk.Hash(
                    "0x4028965b7408566a66e4cf8c603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef4966d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b0170"
                ),
                amount: sdk.JSBI.BigInt(100000),
            },
            {
                utxo: new sdk.Hash(
                    "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497"
                ),
                amount: sdk.JSBI.BigInt(200000),
            },
            {
                utxo: new sdk.Hash(
                    "0xb82cb96710af2e9804c59d1f1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b3219a"
                ),
                amount: sdk.JSBI.BigInt(300000),
            },
        ];

        let keys: Array<sdk.KeyPair> = [
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")),
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SCUCEYS4ZHJ2L6ME4Y37Q77KC3CQE42GLGAV6YDWP5NJVDC53HTQ4IIM")),
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SDZQW3XBFXRXW2L7GVLS7DARGRKPQR5QIB5CDMGQ4KB24T46JURAAOLT")),
        ];

        let builder = new sdk.TxBuilder(
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"))
        );

        let vote_data = Buffer.from("YXRhZCBldG92", "base64");
        let fee = sdk.TxPayloadFee.getFee(vote_data.length);

        let vote_tx = builder
            .addInput(utxos[0].utxo, utxos[0].amount, keys[0].secret)
            .addInput(utxos[1].utxo, utxos[1].amount, keys[1].secret)
            .addInput(utxos[2].utxo, utxos[2].amount, keys[2].secret)
            .assignPayload(vote_data)
            .addOutput(new sdk.PublicKey(sdk.TxPayloadFee.CommonsBudgetAddress), fee)
            .sign(sdk.OutputType.Payment);

        let expected_object = {
            inputs: [
                {
                    utxo: "0x4028965b7408566a66e4cf8c603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef4966d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b0170",
                    unlock: {
                        bytes: "BhQE+Ogjj97DeDbClaeDEqWS/fyLUtLTtTwS46KxbQJ5ZFnM5W6iKLJ5FKzHTn509u2BrdxTJiezItnm4kiigw==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497",
                    unlock: {
                        bytes: "JJwTBos7ViqFQbDFIfqgX36mfFnxwUAhUomj/ylw6Qk+mjYQZzxyg/fNjNThj+qcL/0mWg1o3veXgs9oiIUNlg==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xb82cb96710af2e9804c59d1f1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b3219a",
                    unlock: {
                        bytes: "6dCFceum5yeO4jrufIlYPXDmsQJ7WVnjZrIfjS9Dkw9ZXGcAY6o3fCFKO1I6i0FCNhr/UYgULRj1oPFuYY1v9w==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "100000",
                    lock: {
                        type: 0,
                        bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
                    },
                },
                {
                    type: 0,
                    value: "500000",
                    lock: {
                        type: 0,
                        bytes: "xOYx2v6aWx69nACIFINcMrCytXJmcWy99/N+ZlGEIWM=",
                    },
                },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        vote_tx.inputs.forEach((value, idx) => {
            expected_object.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(vote_tx), JSON.stringify(expected_object));

        // Verify the signature
        for (let idx = 0; idx < vote_tx.inputs.length; idx++)
            assert.ok(
                keys[idx].address.verify<sdk.Transaction>(new sdk.Signature(vote_tx.inputs[idx].unlock.bytes), vote_tx)
            );
    });

    it("Test saving a vote data", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let utxo = {
            utxo: new sdk.Hash(
                "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497"
            ),
            amount: sdk.JSBI.BigInt(100000000),
        };
        let vote_data = Buffer.from("YXRhZCBldG92", "base64");
        let fee = sdk.TxPayloadFee.getFee(vote_data.length);

        let builder = new sdk.TxBuilder(
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"))
        );
        let tx = builder
            .addInput(utxo.utxo, utxo.amount)
            .addOutput(new sdk.PublicKey(sdk.TxPayloadFee.CommonsBudgetAddress), fee)
            .assignPayload(vote_data)
            .sign(sdk.OutputType.Payment);

        let res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it("Test saving a vote data with `UTXOManager`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.TxPayloadFee.getFee(vote_data.length);
        let tx_fee = sdk.JSBI.BigInt(0);

        let builder = new sdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new sdk.UTXOManager(utxos);
        // Get UTXO for the amount to need.
        utxo_manager
            .getUTXO(sdk.JSBI.add(sdk.JSBI.add(payload_fee, tx_fee), sdk.JSBI.BigInt(1)), block_height)
            .forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        let expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "Vh6I8RKAw+8lM0NulP9PotF9DS/+o6cKAPfVNVaZ6QHKg3gM7IOVo3JG5fxw8b1YledAEKqBD/jhQzFVg0LI5w==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                    unlock: {
                        bytes: "PlOoZA14zITTLDEc7rXmAN7mujRMRYl0y6B0bz3cew+sh0mAT5q0RJBmfRFdyWBjKUaDD1364pHdIaF79Pyhqg==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "wu4d7hTwbWTl8i6DHLxLN6ApLZwznOo/1eCowQlI9wzdTHaicUucykDomWv6E8aa31bgawJbGs5kkqKK3zMloA==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                { type: 0, value: "100000", lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" } },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };
        let tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));

        let res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it("Test saving a vote data with `UTXOManager` - There is no output", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.JSBI.BigInt(200000);
        let tx_fee = sdk.JSBI.BigInt(0);

        let builder = new sdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new sdk.UTXOManager(utxos);
        // Get UTXO for the amount to need.
        // There can't be any output. An error occurs because the constraint of
        // the transaction is not satisfied that it must have at least one output.
        utxo_manager
            .getUTXO(sdk.JSBI.add(payload_fee, tx_fee), block_height)
            .forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        assert.throws(() => {
            let tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        });
    });

    it("Test saving a vote data - There is at least one output", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.JSBI.BigInt(200000);
        let tx_fee = sdk.JSBI.BigInt(0);

        let builder = new sdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new sdk.UTXOManager(utxos);
        // Get UTXO for the amount to need.
        // The amount of the UTXO found is one greater than the fee, allowing at least one change output.
        utxo_manager
            .getUTXO(sdk.JSBI.add(sdk.JSBI.add(payload_fee, tx_fee), sdk.JSBI.BigInt(1)), block_height)
            .forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        let tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);

        let expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "EEAMWbm0H0MkmB+FwbP1IvUmvPV1GR5THFECDg5C2APUfF9/SDEstKEmZWS2zJfh4PFXAzmpsiNrSOyuM2y6gw==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "7pgvYc4SRBFAvPfD6Y9Ee+juGEvl9aXt7+UlkO2iWQfpYLL9HNZCH5PwslrCv3MvLpZH6H+kUYTozwSl2hg4lg==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                { type: 0, value: "200000", lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" } },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };
        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));

        let res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it("Test calculating fees of the transaction", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let fees = await boa_client.getTransactionFee(0);
        assert.strictEqual(fees.medium, "100000");
        assert.strictEqual(fees.low, "100000");
        assert.strictEqual(fees.high, "110000");

        fees = await boa_client.getTransactionFee(500);
        assert.strictEqual(fees.medium, "100000");
        assert.strictEqual(fees.low, "100000");
        assert.strictEqual(fees.high, "110000");

        fees = await boa_client.getTransactionFee(1_000);
        assert.strictEqual(fees.medium, "200000");
        assert.strictEqual(fees.low, "180000");
        assert.strictEqual(fees.high, "220000");

        fees = await boa_client.getTransactionFee(100_000);
        assert.strictEqual(fees.medium, "20000000");
        assert.strictEqual(fees.low, "18000000");
        assert.strictEqual(fees.high, "22000000");
    });

    it("Test applying accurate transaction fee", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.TxPayloadFee.getFee(vote_data.length);

        let builder = new sdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new sdk.UTXOManager(utxos);

        let output_address = "boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg";
        let output_count = 2;
        let estimated_tx_fee = sdk.JSBI.BigInt(
            sdk.Utils.FEE_FACTOR * sdk.Transaction.getEstimatedNumberOfBytes(0, output_count, vote_data.length)
        );

        let send_boa = sdk.JSBI.BigInt(200000);
        let total_fee = sdk.JSBI.add(payload_fee, estimated_tx_fee);
        let total_send_amount = sdk.JSBI.add(total_fee, send_boa);

        let in_utxos = utxo_manager.getUTXO(
            total_send_amount,
            block_height,
            sdk.JSBI.BigInt(sdk.Utils.FEE_FACTOR * sdk.TxInput.getEstimatedNumberOfBytes())
        );
        in_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
        estimated_tx_fee = sdk.JSBI.BigInt(
            sdk.Utils.FEE_FACTOR *
                sdk.Transaction.getEstimatedNumberOfBytes(in_utxos.length, output_count, vote_data.length)
        );

        // Build a transaction
        let tx = builder
            .addOutput(new sdk.PublicKey(output_address), send_boa)
            .assignPayload(vote_data)
            .sign(sdk.OutputType.Payment, estimated_tx_fee, payload_fee);

        // Get the size of the transaction
        let tx_size = tx.getNumberOfBytes();

        // Fees based on the transaction size is obtained from Stoa.
        let fees = await boa_client.getTransactionFee(tx_size);

        // Select medium
        let tx_fee = sdk.JSBI.BigInt(fees.medium);

        let sum_amount_utxo = in_utxos.reduce<sdk.JSBI>((sum, n) => sdk.JSBI.add(sum, n.amount), sdk.JSBI.BigInt(0));
        total_fee = sdk.JSBI.add(payload_fee, tx_fee);
        total_send_amount = sdk.JSBI.add(total_fee, send_boa);

        // If the value of LockType in UTXO is not a 'LockType.Key', the size may vary. The code below is for that.
        if (sdk.JSBI.lessThan(sum_amount_utxo, total_send_amount)) {
            //  Add additional UTXO for the required amount.
            in_utxos.push(
                ...utxo_manager.getUTXO(
                    sdk.JSBI.subtract(total_send_amount, sum_amount_utxo),
                    block_height,
                    sdk.JSBI.BigInt(sdk.Utils.FEE_FACTOR * sdk.TxInput.getEstimatedNumberOfBytes())
                )
            );
            in_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
            estimated_tx_fee = sdk.JSBI.BigInt(
                sdk.Utils.FEE_FACTOR *
                    sdk.Transaction.getEstimatedNumberOfBytes(in_utxos.length, output_count, vote_data.length)
            );

            // Build a transaction
            tx = builder
                .addOutput(new sdk.PublicKey(output_address), send_boa)
                .assignPayload(vote_data)
                .sign(sdk.OutputType.Payment, estimated_tx_fee, payload_fee);

            // Get the size of the transaction
            tx_size = tx.getNumberOfBytes();

            // Fees based on the transaction size is obtained from Stoa.
            fees = await boa_client.getTransactionFee(tx_size);

            // Select medium
            tx_fee = sdk.JSBI.BigInt(fees.medium);
        }

        in_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
        tx = builder
            .addOutput(new sdk.PublicKey(output_address), send_boa)
            .assignPayload(vote_data)
            .sign(sdk.OutputType.Payment, tx_fee, payload_fee);

        let expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "2Nk4xrLs6bFv3wZsWOwfnR7x3XjpNKt6hJFZ8BL8lAUANZmn82CcvuMRp5NPhn8GbiMr829GXq8xGT5BMGLHVQ==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                    unlock: {
                        bytes: "xJfoZhmyJsJUOQOjy56eVCU2XwBMGXVCRN22oUuQ7QO2+DrpPCSSZ6Lqdiciaof67f4NYO72kMyfpJOPWV14ug==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
                    unlock: {
                        bytes: "j5tkee+U5JmM0xG75ReWy35X1UB8VHIG0ecraq7iVAgKi6QeO/x73wwUPQuSqk+0fLK7UhQqbIz985a7zIsJXw==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
                    unlock: {
                        bytes: "a9URqfrFPncsPEgcUkSOFHLvU/2StjBOkGhvXQuKFwX2j9QelzGiIkdx0snJ7HcT3XZDh1PrUKEZ/4jDzEOyuA==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "0iAH/LNVmuqGQDnLm3of43VjILzX9eqw5KqFutVVkgQ3nR8KGVyW6zeqlMTfow1TUOHoOo3zY5K+Afs83V01mA==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                { type: 0, value: "146600", lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" } },
                { type: 0, value: "200000", lock: { type: 0, bytes: "x60Co13nUDL3h+pKXCsG460FHRgDZWnJFfTYnch/tLg=" } },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };
        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });
        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));
    });

    it("Test a function of the BOA Client - `getWalletTransactionsHistory`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new sdk.PublicKey("boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9");
        let data = await boa_client.getWalletTransactionsHistory(public_key, 10, 1, ["payment", "freeze"]);
        assert.deepStrictEqual(data, sample_txs_history);
    });

    it("Test a function of the BOA Client - `getWalletTransactionOverview`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let tx_hash = new sdk.Hash(
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814"
        );
        let data = await boa_client.getWalletTransactionOverview(tx_hash);
        assert.deepStrictEqual(data, sample_tx_overview);
    });

    it("Test a function of the BOA Client - `getWalletTransactionsPending`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new sdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s");
        let data = await boa_client.getWalletTransactionsPending(public_key);
        assert.deepStrictEqual(data, sample_txs_pending);
    });

    it("Test a function of the BOA Client - `getPendingTransaction`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let tx_hash = new sdk.Hash(
            "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd"
        );
        let tx = await boa_client.getPendingTransaction(tx_hash);
        assert.deepStrictEqual(tx, sdk.Transaction.reviver("", sample_tx));
    });

    it("Test a function of the BOA Client - `getTransaction`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let tx_hash = new sdk.Hash(
            "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd"
        );
        let tx = await boa_client.getTransaction(tx_hash);
        assert.deepStrictEqual(tx, sdk.Transaction.reviver("", sample_tx));
    });

    it("Get a voting fee", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Get Voting Fee
        let fee = await boa_client.getVotingFee(273);

        assert.deepStrictEqual(fee, sdk.JSBI.BigInt(29310660));
    });

    it("Verify the payment", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let tx_hash = new sdk.Hash(
            "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd"
        );
        let status = await boa_client.verifyPayment(tx_hash);

        let expected = {
            result: true,
            message: "Success",
        };
        assert.deepStrictEqual(status, expected);
    });

    it("Test a function of the BOA Client - `getUTXOInfo`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let utxo_hash = [
            new sdk.Hash(
                "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad"
            ),
            new sdk.Hash(
                "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673"
            ),
            new sdk.Hash(
                "0x7fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673"
            ),
        ];
        let utxos = await boa_client.getUTXOInfo(utxo_hash);
        assert.strictEqual(
            JSON.stringify(utxos),
            '[{"utxo":"0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673","type":0,"unlock_height":[2],"amount":[-1662697472,4656],"height":[1],"time":1609459200,"lock_type":0,"lock_bytes":"uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84="},{"utxo":"0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad","type":0,"unlock_height":[2],"amount":[-1662697472,4656],"height":[1],"time":1609459800,"lock_type":0,"lock_bytes":"8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8="}]'
        );
    });

    it("Test a function of the BOA Client - `getBalance`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        let balance = await boa_client.getBalance(public_key);
        assert.deepStrictEqual(balance.address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.deepStrictEqual(balance.balance, sdk.JSBI.BigInt(2000000));
        assert.deepStrictEqual(balance.spendable, sdk.JSBI.BigInt(1800000));
        assert.deepStrictEqual(balance.frozen, sdk.JSBI.BigInt(200000));
        assert.deepStrictEqual(balance.locked, sdk.JSBI.BigInt(0));
    });

    it("Test a function of the BOA Client - `getWalletUTXO`", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");

        // Request First UTXO
        let first_utxos = await boa_client.getWalletUTXOs(public_key, sdk.JSBI.BigInt(300000), 0);
        assert.deepStrictEqual(first_utxos.length, 2);
        assert.deepStrictEqual(first_utxos[0].utxo.toString(), sample_utxo[1].utxo);
        assert.deepStrictEqual(first_utxos[1].utxo.toString(), sample_utxo[2].utxo);

        // Request Second UTXO
        let second_utxos = await boa_client.getWalletUTXOs(public_key, sdk.JSBI.BigInt(300000), 0, first_utxos[1].utxo);
        assert.deepStrictEqual(second_utxos.length, 2);
        assert.deepStrictEqual(second_utxos[0].utxo.toString(), sample_utxo[3].utxo);
        assert.deepStrictEqual(second_utxos[1].utxo.toString(), sample_utxo[4].utxo);

        // Request Frozen UTXO
        let third_utxos = await boa_client.getWalletUTXOs(public_key, sdk.JSBI.BigInt(300000), 1);
        assert.deepStrictEqual(third_utxos.length, 1);
        assert.deepStrictEqual(third_utxos[0].utxo.toString(), sample_utxo[0].utxo);
    });

    it("Test the UTXOProvider", async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");

        let utxoProvider = new sdk.UTXOProvider(public_key, boa_client);
        // Request First UTXO
        let first_utxos = await utxoProvider.getUTXO(sdk.JSBI.BigInt(300000), sdk.JSBI.BigInt(100000));
        assert.deepStrictEqual(first_utxos.length, 3);
        assert.deepStrictEqual(first_utxos[0].utxo.toString(), sample_utxo[1].utxo);
        assert.deepStrictEqual(first_utxos[1].utxo.toString(), sample_utxo[2].utxo);
        assert.deepStrictEqual(first_utxos[2].utxo.toString(), sample_utxo[3].utxo);

        // Request Second UTXO
        let second_utxos = await utxoProvider.getUTXO(sdk.JSBI.BigInt(300000), sdk.JSBI.BigInt(100000));
        assert.deepStrictEqual(second_utxos.length, 3);
        assert.deepStrictEqual(second_utxos[0].utxo.toString(), sample_utxo[4].utxo);
        assert.deepStrictEqual(second_utxos[1].utxo.toString(), sample_utxo[5].utxo);
        assert.deepStrictEqual(second_utxos[2].utxo.toString(), sample_utxo[6].utxo);
    });
});
