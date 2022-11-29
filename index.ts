import { CosmWasmClient, SigningCosmWasmClient,  } from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing"
import { LedgerSigner } from "@cosmjs/ledger-amino"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { toUtf8 } from "@cosmjs/encoding"
import { getSigner, getLedgerSigner } from "./wallet"
import { coin } from "@cosmjs/amino"
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp"
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin"

const IS_TESTNET = !process.argv.includes("--mainnet")

const MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi"
const TESTNET_RPC = "https://rpc.streamswap-devnet.omniflix.co:443/"

const MNEMONIC =
//wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm
"draft weird switch quality approve steel voice catch place apology million solar winter crunch expire accident rare enhance return genius praise peasant dress maid"

//wasm1hnsk554472szj6ex0lpvhsfszdmuc2lnd72ket
//"magnet prosper annual put weekend tomato join oil bottom pilot mother silly brush soft uncle drift profit shoe raccoon brand puzzle shock track hockey"

//wasm18w0lvf7lpmqhsggs0wfcy6snnpzwzhyatv7kzg
//senior print assume harvest charge alone another empty prepare hockey tired pony vivid bamboo slide describe build slab wife category escape jelly lamp come

const CONTRACT_ADDRESS =
  "wasm1sr06m8yqg0wzqqyqvzvp5t07dj4nevx9u8qc7j4qa72qu8e3ct8qzuktnp"

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

  const signer_address = (await signer.getAccounts())[0].address
  console.log(signer_address)
  console.log(await client.getBalance(signer_address, "uosmo"))
  console.log(await client.getBalance(signer_address, "ujuno"))
  // console.log(await client.getBalance(signer_address, "uatom"))
  // console.log(await client.getBalance(signer_address, "uflix"))
  
  // const msg = {
  //   min_stream_seconds: "3600",
  //   min_seconds_until_start_time: "300",
  //   stream_creation_denom: "uosmo",
  //   stream_creation_fee: "1000000",
  //   fee_collector: "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
  // }

  // const response = await client.instantiate(
  //   signer_address,
  //   6,
  //   msg,
  //   'SS Contract',
  //   "auto"
  // )

  // console.log(response)
  
  //Execute

  //  const executeResponse = await client.execute(
  //       signer_address,
  //       CONTRACT_ADDRESS,
  //       {
  //         create_stream: {
  //           treasury: "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
  //           name: "First Stream",
  //           url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  //           in_denom: "ujuno",
  //           out_denom: "uosmo",
  //           out_supply: "1000000",
  //           start_time: (new Date().getTime()*1000000 + 301*1000000000).toString(),
  //           end_time: (new Date().getTime()*1000000 + 4000*1000000000).toString(),
  //         }
  //       },
  //       "auto",
  //       "Create Stream",
  //       [coin(1000000, "uosmo")]
  //     )
  //     console.log(executeResponse)
  
  // const executeResponse = await client.execute(
  //   signer_address,
  //   CONTRACT_ADDRESS,
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

  //Query Stream

  const result = await client.queryContractSmart(CONTRACT_ADDRESS, {
    stream: { stream_id: 1 },
  })
  
  console.log(result)
  console.log("Stream Last Updated: ", new Date(parseInt(result.last_updated)/1000000).toLocaleString())
  console.log("Stream Start Time: ", new Date(parseInt(result.start_time)/1000000).toLocaleString())
  console.log("Stream End Time: ", new Date(parseInt(result.end_time)/1000000).toLocaleString())


  
  //Query Position
  
  //wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm
  //wasm1hnsk554472szj6ex0lpvhsfszdmuc2lnd72ket
  //wasm18w0lvf7lpmqhsggs0wfcy6snnpzwzhyatv7kzg

  // const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
  //   position: { stream_id: 1, owner: "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm" },
  // })

  // console.log(res)
  // console.log("Position Last Updated: ", new Date(parseInt(res.last_updated)/1000000).toLocaleString())
}

main()
