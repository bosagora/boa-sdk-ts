/*******************************************************************************

    Test of Proposal Data

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
import { SmartBuffer } from "smart-buffer";

describe("Vote Data", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Test of ProposalFeeData", () => {
        const original_data = new sdk.ProposalFeeData("Votera", "ID1234567890");
        const bytes = new SmartBuffer();
        original_data.serialize(bytes);

        const deserialized_data = sdk.ProposalFeeData.deserialize(bytes);
        assert.strictEqual(original_data.proposal_id, deserialized_data.proposal_id);
    });

    it("Test of ProposalData", () => {
        const original_data = new sdk.ProposalData(
            "Votera",
            sdk.ProposalType.Fund,
            "ID1234567890",
            "Title",
            sdk.JSBI.BigInt(1000),
            sdk.JSBI.BigInt(3026),
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            sdk.JSBI.BigInt(10000000000000),
            sdk.JSBI.BigInt(100000000000),
            sdk.JSBI.BigInt(27000000),
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            new sdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e"),
            new sdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s")
        );
        const bytes = new SmartBuffer();
        original_data.serialize(bytes);

        const deserialized_data = sdk.ProposalData.deserialize(bytes);
        assert.deepStrictEqual(original_data, deserialized_data);
    });

    it("Test of VoteCard", () => {
        const voter_card = new sdk.VoterCard(
            new sdk.PublicKey("boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqx78z5en"),
            new sdk.PublicKey("boa1xzp770sxuswddged6rskm8y5cvk0g9an9mkfkqjeake0mmg2pfypxw2ch2x"),
            "2021-07-14T00:21:50Z"
        );
        assert.deepStrictEqual(
            sdk.hashFull(voter_card).toString(),
            "0x4c06291fc7384fd760c562a35f637c87f6333153416ef6da4e0b547dcabedc411350b5281286780b95d9dcb6496ea90622283508ea3e7b06a13ea2d909c09e91"
        );
    });

    it("Test of Vote", () => {
        // The seed key of the validator
        const seed = `SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4`;

        // The KeyPair of the validator
        const validator_key = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));

        // The temporary KeyPair
        const temporary_key = sdk.KeyPair.random();

        const voter_card = new sdk.VoterCard(validator_key.address, temporary_key.address, "2021-04-15T00:00:00Z");
        voter_card.signature = validator_key.secret.sign<sdk.VoterCard>(voter_card);

        assert.ok(voter_card.verify());

        const bytes = new SmartBuffer();
        voter_card.serialize(bytes);
        const deserialized_voter_card = sdk.VoterCard.deserialize(bytes);
        assert.deepStrictEqual(voter_card, deserialized_voter_card);

        //  This is sample
        const ballot = Buffer.from("Yes  ");
        const ballot_data = new sdk.BallotData("Votera", "ID1234567890", ballot, voter_card, 100);
        ballot_data.signature = temporary_key.secret.sign<sdk.BallotData>(ballot_data);

        assert.ok(ballot_data.verify());

        const ballot_bytes = new SmartBuffer();
        ballot_data.serialize(ballot_bytes);
        const deserialized_ballot_data = sdk.BallotData.deserialize(ballot_bytes);
        assert.deepStrictEqual(ballot_data, deserialized_ballot_data);
    });

    it("Test of encryption key", () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const encryption_key = new sdk.EncryptionKey(
            "Votera",
            new sdk.Height("100"),
            new sdk.Hash(
                "0x0a37c34865bcf1b70785f410486d099f5f7979eddd571be3987662ea14d9dc4671819700afe3552f76827653e741a443bfcf80382aa076bed1b62ad3fae4c65c"
            ),
            keypair.address
        );

        encryption_key.signature = keypair.secret.sign<sdk.EncryptionKey>(encryption_key);
        assert.ok(keypair.address.verify<sdk.EncryptionKey>(encryption_key.signature, encryption_key));

        const signature_agora = new sdk.Signature(
            "0x5f3445d7788815ecabd181d6cea1f4ab501f196e5375e1359e12975c1081c88605012fdaa85754202b9bb83c8bc27ba1c1657dd0dc316b78ebe04aaed1dab7f3"
        );
        assert.ok(keypair.address.verify<sdk.EncryptionKey>(signature_agora, encryption_key));
    });

    it("Test of encrypt and decrypt", () => {
        const pre_image = new sdk.Hash(
            "0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328"
        );
        const app_name = "Votera";
        const proposal_id = "ID1234567890";
        const key_agora_admin = sdk.hashMulti(pre_image.data, Buffer.from(app_name));
        const key_encrypt = sdk.Encrypt.createKey(key_agora_admin.data, proposal_id);

        const message = Buffer.from([sdk.BallotData.YES]);
        const cipher_message = sdk.Encrypt.encrypt(message, key_encrypt);
        const decode_message = sdk.Encrypt.decrypt(cipher_message, key_encrypt);
        assert.deepStrictEqual(message, decode_message);

        const cipher_message1 = sdk.Encrypt.encrypt(Buffer.from([sdk.BallotData.YES]), key_encrypt);
        const cipher_message2 = sdk.Encrypt.encrypt(Buffer.from([sdk.BallotData.NO]), key_encrypt);
        const cipher_message3 = sdk.Encrypt.encrypt(Buffer.from([sdk.BallotData.BLANK]), key_encrypt);

        assert.notDeepStrictEqual(cipher_message1, cipher_message2);
        assert.notDeepStrictEqual(cipher_message2, cipher_message3);
        assert.notDeepStrictEqual(cipher_message3, cipher_message1);

        assert.strictEqual(cipher_message1.length, 41);
        assert.strictEqual(cipher_message2.length, 41);
        assert.strictEqual(cipher_message3.length, 41);
    });

    it("The size of BallotData", () => {
        // The seed key of the validator
        const seed = `SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4`;

        // The KeyPair of the validator
        const validator_key = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));
        // The temporary KeyPair
        const temporary_key = sdk.KeyPair.random();
        const voter_card = new sdk.VoterCard(validator_key.address, temporary_key.address, "2021-04-15T00:00:00Z");
        voter_card.signature = validator_key.secret.sign<sdk.VoterCard>(voter_card);

        //  This is sample
        const pre_image = new sdk.Hash(
            "0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328"
        );
        const app_name = "Votera";
        const proposal_id = "ID1234567890";
        const key_agora_admin = sdk.hashMulti(pre_image.data, Buffer.from(app_name));
        const key_encrypt = sdk.Encrypt.createKey(key_agora_admin.data, proposal_id);
        const ballot = sdk.Encrypt.encrypt(Buffer.from([sdk.BallotData.BLANK]), key_encrypt);
        const ballot_data = new sdk.BallotData(app_name, proposal_id, ballot, voter_card, 100);
        ballot_data.signature = temporary_key.secret.sign<sdk.BallotData>(ballot_data);

        const ballot_bytes = new SmartBuffer();
        ballot_data.serialize(ballot_bytes);

        assert.strictEqual(ballot_bytes.length, 285);
    });

    it("Test link data of ProposalFeeData", () => {
        const data = new sdk.ProposalFeeData("Votera", "ID1234567890");
        const proposal_address = new sdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e");
        const destination = new sdk.PublicKey("boa1xrgq6607dulyra5r9dw0ha6883va0jghdzk67er49h3ysm7k222ruhh7400");
        const amount = sdk.JSBI.BigInt("10000000000000");
        const link_data = data.getLinkData(proposal_address, destination, amount);
        const expected = {
            proposer_address: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
            destination: "boa1xrgq6607dulyra5r9dw0ha6883va0jghdzk67er49h3ysm7k222ruhh7400",
            amount: "10000000000000",
            payload: "CFBST1AtRkVFBlZvdGVyYQxJRDEyMzQ1Njc4OTA=",
        };
        assert.deepStrictEqual(link_data, expected);
    });

    it("Test link data of ProposalData", () => {
        const data = new sdk.ProposalData(
            "Votera",
            sdk.ProposalType.Fund,
            "ID1234567890",
            "Title",
            sdk.JSBI.BigInt(1000),
            sdk.JSBI.BigInt(3026),
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            sdk.JSBI.BigInt(10000000000000),
            sdk.JSBI.BigInt(100000000000),
            sdk.JSBI.BigInt(27000000),
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            new sdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e"),
            new sdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s")
        );
        const proposer_address = new sdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e");
        const validators = [
            new sdk.PublicKey("boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqx78z5en"),
            new sdk.PublicKey("boa1xrdwrymw40ae7kdumk5uf24rf7wj6kxeem0t3mh9yclz6j46rnen6htq9ju"),
            new sdk.PublicKey("boa1xrdwryuhc2tw2j97wqe3ahh37qnjya59n5etz88n9fvwyyt9jyvrvfq5ecp"),
            new sdk.PublicKey("boa1xrdwryayr9r3nacx26vwe6ymy2kl7zp7dc03q5h6zk65vnu6mtkkzdqg39f"),
            new sdk.PublicKey("boa1xrdwry7vltf9mrzf62qgpdh282grqn9nlnvhzp0yt8y0y9zedmgh64s2qjg"),
            new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac"),
            new sdk.PublicKey("boa1xrgr66gdm5je646x70l5ar6qkhun0hg3yy2eh7tf8xxlmlt9fgjd2q0uj8p"),
        ];
        const voting_fee = sdk.JSBI.BigInt("12000000");
        const link_data = data.getLinkData(proposer_address, validators, voting_fee);
        const expected = {
            proposer_address: "boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e",
            validators: [
                "boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqx78z5en",
                "boa1xrdwrymw40ae7kdumk5uf24rf7wj6kxeem0t3mh9yclz6j46rnen6htq9ju",
                "boa1xrdwryuhc2tw2j97wqe3ahh37qnjya59n5etz88n9fvwyyt9jyvrvfq5ecp",
                "boa1xrdwryayr9r3nacx26vwe6ymy2kl7zp7dc03q5h6zk65vnu6mtkkzdqg39f",
                "boa1xrdwry7vltf9mrzf62qgpdh282grqn9nlnvhzp0yt8y0y9zedmgh64s2qjg",
                "boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac",
                "boa1xrgr66gdm5je646x70l5ar6qkhun0hg3yy2eh7tf8xxlmlt9fgjd2q0uj8p",
            ],
            voting_fee: "12000000",
            payload:
                "CFBST1BPU0FMBlZvdGVyYQEMSUQxMjM0NTY3ODkwBVRpdGxl/egD/dILAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AoHJOGAkAAP8A6HZIFwAAAP7A/JsBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN2tOi+MKGfTMi85pssUrbmVFl5Vu3UowAYGsEqeEt26xOYx2v6aWx69nACIFINcMrCytXJmcWy99/N+ZlGEIWM=",
        };
        assert.deepStrictEqual(link_data, expected);
    });

    it("Test link data of Vote", () => {
        // The KeyPair of the validator
        const validator_key = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SDZQW3XBFXRXW2L7GVLS7DARGRKPQR5QIB5CDMGQ4KB24T46JURAAOLT")
        );

        // The temporary KeyPair
        const temporary_key = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SANGEY2BIMFZ3K3T3NWSVYBS65N55SZE7WBEVVXQFLLZI6GLZBKACO6G")
        );

        const voter_card = new sdk.VoterCard(validator_key.address, temporary_key.address, "2021-04-15T00:00:00Z");
        voter_card.signature = validator_key.secret.sign<sdk.VoterCard>(voter_card);

        const pre_image = new sdk.Hash(
            "0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328"
        );
        const app_name = "Votera";
        const proposal_id = "ID1234567890";
        const key_agora_admin = sdk.hashMulti(pre_image.data, Buffer.from(app_name));
        const key_encrypt = sdk.Encrypt.createKey(key_agora_admin.data, proposal_id);
        const ballot = sdk.Encrypt.encrypt(Buffer.from([sdk.BallotData.YES]), key_encrypt);
        const ballot_data = new sdk.BallotData(app_name, "ID1234567890", ballot, voter_card, 100);
        ballot_data.signature = temporary_key.secret.sign<sdk.BallotData>(ballot_data);

        const link_data = ballot_data.getLinkData();
        const expected = {
            payload:
                "CEJBTExPVCAgBlZvdGVyYQxJRDEyMzQ1Njc4OTApGXLapWasRzV8O4JpIQmMI20eN2G7rwfkViiJUcxAVfQJgBObfZ7Nh9TFrSKdkwbnyCSISJw+l76oyJmY8Vncx0mYjWFV1big5setAqNd51Ay94fqSlwrBuOtBR0YA2VpyRX02J3If7S4FDIwMjEtMDQtMTVUMDA6MDA6MDBaqSfS45lGInLqc1rO5oZZwm31S+PYuS8j9mMut3XZugj0vt+z9XtUMY0FRA7ZaPonnSq6PZU1kASLlL/X076jaGTNZaxoxd1cmXYrMNM60T7atWboCmNjnMhfUdD9LxTDCLpfFGBSbkpL9pyd6EtQZ8N304PJbD7t6S9Fav5NBiII",
        };

        const deserialized_ballot_data = sdk.BallotData.deserialize(
            SmartBuffer.fromBuffer(Buffer.from(link_data.payload, "base64"))
        );
        assert.deepStrictEqual(ballot_data, deserialized_ballot_data);

        const expected_ballot_data = sdk.BallotData.deserialize(
            SmartBuffer.fromBuffer(Buffer.from(expected.payload, "base64"))
        );
        assert.deepStrictEqual(ballot_data.proposal_id, expected_ballot_data.proposal_id);
        assert.deepStrictEqual(
            sdk.Encrypt.decrypt(ballot_data.ballot, key_encrypt),
            sdk.Encrypt.decrypt(expected_ballot_data.ballot, key_encrypt)
        );
        assert.deepStrictEqual(ballot_data.card.validator_address, expected_ballot_data.card.validator_address);
        assert.deepStrictEqual(ballot_data.card.address, expected_ballot_data.card.address);
        assert.deepStrictEqual(ballot_data.card.expires, expected_ballot_data.card.expires);
        assert.deepStrictEqual(ballot_data.sequence, expected_ballot_data.sequence);
    });
});
