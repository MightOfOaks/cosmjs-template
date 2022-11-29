import { CosmWasmClient, SigningCosmWasmClient,  } from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing"
import { LedgerSigner } from "@cosmjs/ledger-amino"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { toUtf8 } from "@cosmjs/encoding"
import { getSigner, getLedgerSigner } from "./wallet"
import { coin } from "@cosmjs/amino"
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp"

const IS_TESTNET = !process.argv.includes("--mainnet")

const MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi"
const TESTNET_RPC = "https://rpc.streamswap-devnet.omniflix.co:443/"

const MNEMONIC =
"draft weird switch quality approve steel voice catch place apology million solar winter crunch expire accident rare enhance return genius praise peasant dress maid"

const CONTRACT_ADDRESS =
  "wasm12xmuhsl5lc2qmrdk4fhythgt733aswm9q5wppl2gq33l4nytdx0q7vnvfl"

let signer: DirectSecp256k1HdWallet | LedgerSigner
let client: SigningCosmWasmClient

const querySmartContract = async (message: Record<string, unknown>) => {
  client.queryContractSmart(CONTRACT_ADDRESS, message)
}

const main = async () => {
  /* SIGNER INIT */
  if (process.argv.includes("--ledger")) signer = await getLedgerSigner()
  else signer = await getSigner(MNEMONIC)

  /* CLIENT INIT */
  client = await SigningCosmWasmClient.connectWithSigner(
    IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
    signer,
    {
      prefix: "wasm",
      gasPrice: GasPrice.fromString("0.025uwasm"),
    }
  )

  console.log((await signer.getAccounts())[0].address)
  console.log(await client.getBalance("wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm", "uosmo"))

  //Instantiate SS contract
  
  const msg = {
    min_stream_seconds: 3600,
    min_seconds_until_start_time: 300,
    stream_creation_denom: "uosmo",
    stream_creation_fee: 10000000,
    fee_collector: "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
    }

  const response = await client.instantiate(
    "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    6,
    msg,
    'SS Contract',
    "auto"
  )

  console.log(response)
  
  //Execute

  //  const executeResponse = await client.execute(
  //       "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
  //       "Contract Address",
  //       {
  //         create_stream: {
  //           treasury: "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
  //           name: "First Stream",
  //           url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  //           in_denom: "uosmo",
  //           out_denom: "usomething",
  //           out_supply: 100000000000,
  //           start_time: new Date().getTime()*1000000 + 300*1000000000,
  //           end_time: new Date().getTime()*1000000 + 3600*1000000000,
  //         }
  //       },
  //       "auto",
  //     )
  //     console.log(executeResponse)
  
  // const executeResponse = await client.execute(
  //   "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
  //   "Contract Address",
  //   {
  //     subscribe: {
  //       stream_id: 1,
  //       position_owner: null,
  //       operator: null
  //     },
  //   },
  //   "auto",
  // )
  // console.log(executeResponse)  

  //Query

  const balance = async (address: string): Promise<string> => {
    const result = await client.queryContractSmart("juno1z4chusdz400jydm7vcpurkpxrm0hfkj8pessnuyvpjn3p37s34yq8wxsyu", {
      balance: { address },
    })
    return result.balance
  }
  console.log(await balance("wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm"))
  

}

main()
