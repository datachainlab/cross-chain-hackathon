import {encodeByteSlice} from "@tendermint/amino-js";
import * as secp256k1 from "secp256k1";

import {CrossTx, StdSignature, StdTx} from "~src/libs/api";
import {Cosmos} from "~src/libs/cosmos/util";
//import { parse } from 'yargs';

describe("cosmos lib", () => {
  const alice =
    "vague domain finger zero service door father scheme immense gravity warfare kiwi park glimpse real twist this crunch loud hello throw camera era stool";
  const aliceAddress = "cosmos1w9tumxvvxevq5gac5se2uq0s50q7yk9gyyvwe9";

  // const bob =
  //   "basic rotate junk scorpion orient enlist inspire tooth eight hunt loyal rain pitch chaos cart brisk fringe program zero blood electric apart lady walnut";

  test("get getPubKeyBase64 from mnemonic phrase", () => {
    const address = Cosmos.getAddress(alice);
    expect(address).toEqual(aliceAddress);
    const privateKey = Cosmos.getPrivateKey(alice);

    const pubKeyByte: Buffer = secp256k1.publicKeyCreate(privateKey, true);
    const u8Array = encodeByteSlice(pubKeyByte);
    const aaa: Uint8Array = Uint8Array.of(235, 90, 233, 135);
    const compressed = Buffer.concat([aaa, u8Array]).toString("base64");
    expect(compressed).not.toBeUndefined();

    // const crossTx: CrossTx = JSON.parse(noSigJson);
    // const signCrossTx = Cosmos.signCrossTx(crossTx.value, privKey);
    // expect(signCrossTx).toEqual(
    //   "61rphyEDo1Q6phBwqF0x5eqp8hJyzsCyVpee81V2r1KlP+kTDrQ="
    // );
    // expect(pubKeyBase64).toEqual(
    //   "61rphyEDo1Q6phBwqF0x5eqp8hJyzsCyVpee81V2r1KlP+kTDrQ="
    // );
  });
});

const noSigJson = `{"type":"cosmos-sdk/StdTx","value":{"msg":[{"type":"cross/MsgInitiate","value":{"Sender":"cosmos1w9tumxvvxevq5gac5se2uq0s50q7yk9gyyvwe9","ChainID":"coordinatorz","ContractTransactions":[{"source":{"port":"cross","channel":"ibconexfer"},"signers":["cosmos1l4ggreypq0gr8n96e7246tsy95pqpyu9zdd498"],"contract":"TKH1iNgKA2RjYxIIdHJhbnNmZXIaLWNvc21vczF3OXR1bXh2dnhldnE1Z2FjNXNlMnVxMHM1MHE3eWs5Z3l5dndlORoIAAAAAAAAAAE=","ops":[{"type":"store/lock/Write","value":{"K":"YWNjb3VudC9jb3Ntb3MxbDRnZ3JleXBxMGdyOG45NmU3MjQ2dHN5OTVwcXB5dTl6ZGQ0OTg=","V":"AAAAAAAPQj8="}},{"type":"store/lock/Write","value":{"K":"YWNjb3VudC9jb3Ntb3Mxdzl0dW14dnZ4ZXZxNWdhYzVzZTJ1cTBzNTBxN3lrOWd5eXZ3ZTk=","V":"AAAAAAAPQkE="}}]},{"source":{"port":"cross","channel":"ibctwoxfer"},"signers":["cosmos1w9tumxvvxevq5gac5se2uq0s50q7yk9gyyvwe9"],"contract":"WaH1iNgKBmVzdGF0ZRIIdHJhbnNmZXIaCAAAAAAAAAABGi1jb3Ntb3MxbDRnZ3JleXBxMGdyOG45NmU3MjQ2dHN5OTVwcXB5dTl6ZGQ0OTgaCAAAAAAAAAAB","ops":[{"type":"store/lock/Write","value":{"K":"YWNjb3VudC9jb3Ntb3Mxdzl0dW14dnZ4ZXZxNWdhYzVzZTJ1cTBzNTBxN3lrOWd5eXZ3ZTkvdG9rZW4vMQ==","V":"AAAAAAAAA+Y="}},{"type":"store/lock/Write","value":{"K":"YWNjb3VudC9jb3Ntb3MxbDRnZ3JleXBxMGdyOG45NmU3MjQ2dHN5OTVwcXB5dTl6ZGQ0OTgvdG9rZW4vMQ==","V":"AAAAAAAAAAE="}},{"type":"store/lock/Write","value":{"K":"b3duZXJDb3VudC8x","V":"AAAAAAAAAAM="}},{"type":"store/lock/Read","value":{"K":"Y3JlYXRvci8x"}},{"type":"store/lock/Read","value":{"K":"d2hpdGVsaXN0L2Nvc21vczFsNGdncmV5cHEwZ3I4bjk2ZTcyNDZ0c3k5NXBxcHl1OXpkZDQ5OC9ieS9jb3Ntb3MxeWsweDRwcWN3eXV4dHJzZDhucXoyeDB4ZDN1Y2FmZWQ5NndkMDI="}}]}],"TimeoutHeight":"1051","Nonce":"0"}}],"fee":{"amount":[],"gas":"200000"},"signatures":null,"memo":""}}`;

describe("sign", () => {
  test("sign test", () => {
    const alice =
      "vague domain finger zero service door father scheme immense gravity warfare kiwi park glimpse real twist this crunch loud hello throw camera era stool";

    const crossTx: CrossTx = JSON.parse(noSigJson);
    expect(crossTx.type).toEqual("cosmos-sdk/StdTx");

    const privateKey = Cosmos.getPrivateKey(alice);
    const signedTx: StdTx = Cosmos.signCrossTx(crossTx.value, privateKey);
    const sig: StdSignature = {
      pub_key: "61rphyEDo1Q6phBwqF0x5eqp8hJyzsCyVpee81V2r1KlP+kTDrQ=",
      signature:
        "U8QY15AHI8R9qGN2QKGQHWMm/q7hjBRD346QbYpK6/hmwmF7d6kiY7IUxBNdjc9dp7slNq3mDm0TARZX8C4v6g=="
    };
    expect(signedTx.signatures).toEqual([sig]);
  });
});
