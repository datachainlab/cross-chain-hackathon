import {encodeByteSlice} from "@tendermint/amino-js";
import bech32 from "bech32";
import * as bip32 from "bip32";
import * as bip39 from "bip39";
import * as crypto from "crypto";
import * as secp256k1 from "secp256k1";

import {StdTx} from "~src/libs/api";

const path = "m/44'/118'/0'/0/0";
const bech32MainPrefix = "cosmos";

export const Cosmos = {
  getAddress: (mnemonic: string) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(path);
    const words = bech32.toWords(child.identifier);
    return bech32.encode(bech32MainPrefix, words);
  },

  getPrivateKey: (mnemonic: string): Buffer => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(path);
    if (!child.privateKey) {
      throw new Error("could not derive private key");
    }
    // const ecPair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey, {
    //   compressed: false
    // });
    //
    // if (!ecPair.privateKey) {
    //   throw new Error("could not create ec pair");
    // }
    return child.privateKey;
  },

  getPubKeyBase64: (privateKey: Buffer): string => {
    const pubKeyByte: Buffer = secp256k1.publicKeyCreate(privateKey, true);
    const pubBuf = Buffer.from(encodeByteSlice(pubKeyByte));
    const registeredPrefix: Uint8Array = Buffer.from(
      Uint8Array.of(235, 90, 233, 135)
    );
    const prefixedBuf = Buffer.from([
      ...registeredPrefix.slice(),
      ...pubBuf.slice()
    ]);
    return prefixedBuf.toString("base64");
  },

  signCrossTx: (stdTx: StdTx, ecPairPriv: Buffer) => {
    const signedStdTx: StdTx = {
      ...stdTx
    };

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(sortObject(signedStdTx)))
      .digest("hex");

    const buf = Buffer.from(hash, "hex");
    const signObj = secp256k1.sign(buf, ecPairPriv);
    const signatureBase64 = signObj.signature.toString("base64");

    const sig = {
      pub_key: Cosmos.getPubKeyBase64(ecPairPriv),
      signature: signatureBase64
    };

    const sigs = Array.isArray(signedStdTx.signatures)
      ? signedStdTx.signatures
      : [];

    sigs.unshift(sig);
    signedStdTx.signatures = sigs;

    return signedStdTx;
  }
} as const;

const sortObject = (msg: StdTx): StdTx => {
  return {
    fee: msg.fee,
    memo: msg.memo,
    msg: msg.msg,
    signatures: msg.signatures
  };
};
