import { makeCosmoshubPath } from "@cosmjs/amino"
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"

const walletOptions = {
  hdPaths: [makeCosmoshubPath(0)],
  prefix: "stars",
}

export const getSigner = async (mnemonic: string) => {
  const signer = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic,
    walletOptions
  )
  return signer
}
