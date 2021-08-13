/*******************************************************************************

    Includes fake agora, stoa and sample data needed for testing.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import bodyParser from "body-parser";
// tslint:disable-next-line:no-implicit-dependencies
import express from "express";
import * as http from "http";
import * as sdk from "../lib";

/**
 * Sample UTXOs
 */
export const sample_utxo_address_wallet = "boa1xza007gllhzdawnr727hds36guc0frnjsqscgf4k08zqesapcg3uujh9g93";
export const sample_utxo_address_client = "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0";
export const sample_utxo_wallet = [
    {
        utxo: "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
        type: 1,
        height: "0",
        time: 1577836800000,
        unlock_height: "1",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
        type: 0,
        height: "1",
        time: 1577837400000,
        unlock_height: "2",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x0ca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
        type: 0,
        height: "2",
        time: 1577838000000,
        unlock_height: "3",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x8e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
        type: 0,
        height: "3",
        time: 1577838600000,
        unlock_height: "4",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0xe44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
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
        utxo: "0xd3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
        type: 0,
        height: "5",
        time: 1577839800000,
        unlock_height: "6",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x551a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb",
        type: 0,
        height: "6",
        time: 1577840400000,
        unlock_height: "7",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x0f05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb",
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
        utxo: "0xdfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
        type: 0,
        height: "8",
        time: 1577841600000,
        unlock_height: "9",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
    {
        utxo: "0x47e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
        type: 0,
        height: "9",
        time: 1577842200000,
        unlock_height: "10",
        amount: "2000000000",
        lock_type: 0,
        lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
    },
];
export const sample_utxo_client = [
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
export const sample_tx_wallet = {
    inputs: [
        {
            utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
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
export const sample_tx_client = {
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
export const sample_tx_hash_wallet = new sdk.Hash(
    "0x90959b83ee81cf2757eff613a0bcc35be9a9b6d3394e3c0255af4d68a43a6aeea1bfff1c5a84de5d54e1dd46436c18f6301bbfedae4168f632294c8f1d111ee3"
);
export const sample_tx_hash_client = new sdk.Hash(
    "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd"
);

export const sample_validators_client = [
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

export const sample_txs_history_client = [
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

export const sample_tx_overview_client = {
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

export const sample_txs_pending_client = [
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

export const sample_spv_client = {
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

        // GET /validators
        this.app.get("/validators", (req: express.Request, res: express.Response) => {
            let height: number = Number(req.query.height);

            if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0)) {
                res.status(400).send("The Height value is not valid.");
                return;
            }

            const enrolled_height: number = 0;
            if (Number.isNaN(height)) height = enrolled_height;

            for (const elem of sample_validators_client) {
                elem.preimage.height = (height - enrolled_height).toString();
            }

            res.status(200).send(JSON.stringify(sample_validators_client));
        });

        // GET /validator/:address
        this.app.get("/validator/:address", (req: express.Request, res: express.Response) => {
            let height: number = Number(req.query.height);
            const address: string = String(req.params.address);

            if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0)) {
                res.status(400).send("The Height value is not valid.");
                return;
            }

            const enrolled_height: number = 0;
            if (Number.isNaN(height)) height = enrolled_height;

            for (const elem of sample_validators_client) {
                if (elem.address === address) {
                    elem.preimage.height = (height - enrolled_height).toString();
                    res.status(200).send(JSON.stringify([elem]));
                    return;
                }
            }

            res.status(204).send();
        });

        // GET /client_info
        this.app.get("/client_info", (req: express.Request, res: express.Response) => {
            res.status(200).send({
                "X-Client-Name": req.header("X-Client-Name"),
                "X-Client-Version": req.header("X-Client-Version"),
            });
        });

        // GET /block_height
        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send("10");
        });

        // GET /utxo/:address
        this.app.get("/utxo/:address", (req: express.Request, res: express.Response) => {
            const address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            if (sample_utxo_address_wallet === address.toString()) {
                res.status(200).send(JSON.stringify(sample_utxo_wallet));
                return;
            }

            if (sample_utxo_address_client === address.toString()) {
                res.status(200).send(JSON.stringify(sample_utxo_client));
                return;
            }

            res.status(400).send();
        });

        // GET /transaction/fees/:tx_size
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

        // GET /utxos
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
                const found = sample_utxo_wallet.find((n) => n.utxo === m.toString());
                if (found !== undefined) {
                    utxo_array.push(found);
                }
            });

            utxos_hash.forEach((m) => {
                const found = sample_utxo_client.find((n) => n.utxo === m.toString());
                if (found !== undefined) {
                    utxo_array.push(found);
                }
            });

            res.status(200).send(JSON.stringify(utxo_array));
        });

        // GET /transaction/pending/:hash
        this.app.get("/transaction/pending/:hash", (req: express.Request, res: express.Response) => {
            const hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            if (Buffer.compare(tx_hash.data, sample_tx_hash_wallet.data) === 0) {
                res.status(200).send(JSON.stringify(sample_tx_wallet));
            } else if (Buffer.compare(tx_hash.data, sample_tx_hash_client.data) === 0) {
                res.status(200).send(JSON.stringify(sample_tx_client));
            } else {
                res.status(204).send(`No transactions. hash': (${hash})`);
            }
        });

        // GET /transaction/:hash
        this.app.get("/transaction/:hash", (req: express.Request, res: express.Response) => {
            const hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            if (Buffer.compare(tx_hash.data, sample_tx_hash_wallet.data) === 0) {
                res.status(200).send(JSON.stringify(sample_tx_wallet));
            } else if (Buffer.compare(tx_hash.data, sample_tx_hash_client.data) === 0) {
                res.status(200).send(JSON.stringify(sample_tx_client));
            } else {
                res.status(204).send(`No transactions. hash': (${hash})`);
            }
        });

        // GET /spv/:hash
        this.app.get("/spv/:hash", (req: express.Request, res: express.Response) => {
            const hash: string = String(req.params.hash);

            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(hash);
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                return;
            }

            res.status(200).send(JSON.stringify(sample_spv_client));
        });

        // GET /block_height_at/:time
        this.app.get("/block_height_at/:time", (req: express.Request, res: express.Response) => {
            const time_stamp = Number(req.params.time);

            const zero = 1609459200;
            const height = Math.floor((time_stamp - zero) / (60 * 10));
            if (height < 0) res.status(204).send("No Content");
            else res.status(200).send(JSON.stringify(height.toString()));
        });

        // GET /wallet/balance/:address
        this.app.get("/wallet/balance/:address", (req: express.Request, res: express.Response) => {
            const address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            if (sample_utxo_address_wallet === address.toString()) {
                res.status(200).send(
                    JSON.stringify({
                        address: address.toString(),
                        balance: "20000000000",
                        spendable: "18000000000",
                        frozen: "2000000000",
                        locked: "0",
                    })
                );
                return;
            } else if (sample_utxo_address_client === address.toString()) {
                res.status(200).send(
                    JSON.stringify({
                        address: address.toString(),
                        balance: "2000000",
                        spendable: "1800000",
                        frozen: "200000",
                        locked: "0",
                    })
                );
                return;
            } else {
                res.status(200).send(
                    JSON.stringify({
                        address: address.toString(),
                        balance: "0",
                        spendable: "0",
                        frozen: "0",
                        locked: "0",
                    })
                );
                return;
            }
        });

        // GET /wallet/utxo/:address
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

            let sample_utxo = [];
            if (sample_utxo_address_wallet === address.toString()) {
                sample_utxo = sample_utxo_wallet;
            } else if (sample_utxo_address_client === address.toString()) {
                sample_utxo = sample_utxo_client;
            } else {
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

        // GET /wallet/transactions/history/:address
        this.app.get("/wallet/transactions/history/:address", (req: express.Request, res: express.Response) => {
            const address: string = String(req.params.address);
            if (sdk.PublicKey.validate(address) !== "") {
                res.status(400).send(`Invalid value for parameter 'address': ${address}`);
                return;
            }
            res.status(200).send(JSON.stringify(sample_txs_history_client));
        });

        // GET /wallet/transaction/overview/:hash
        this.app.get("/wallet/transaction/overview/:hash", (req: express.Request, res: express.Response) => {
            let tx_hash: sdk.Hash;
            try {
                tx_hash = new sdk.Hash(String(req.params.hash));
                res.status(200).send(JSON.stringify(sample_tx_overview_client));
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'hash': ${String(req.params.hash)}`);
            }
        });

        // GET /wallet/transactions/pending/:address
        this.app.get("/wallet/transactions/pending/:address", (req: express.Request, res: express.Response) => {
            const address: string = String(req.params.address);
            if (sdk.PublicKey.validate(address) !== "") {
                res.status(400).send(`Invalid value for parameter 'address': ${address}`);
                return;
            }
            res.status(200).send(JSON.stringify(sample_txs_pending_client));
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
export class TestAgora {
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
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else resolve();
        });
    }
}
