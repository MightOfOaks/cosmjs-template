import { makeCosmoshubPath } from "@cosmjs/amino"
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import { LedgerSigner } from "@cosmjs/ledger-amino"

const walletOptions = {
  hdPaths: [makeCosmoshubPath(0)],
  prefix: "wasm",
}

export const getSigner = async (mnemonic: string) => {
  const signer = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic,
    walletOptions
  )
  return signer
}
