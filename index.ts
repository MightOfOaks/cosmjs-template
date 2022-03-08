import { SigningCosmWasmClient,  } from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing"
import { LedgerSigner } from "@cosmjs/ledger-amino"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { toUtf8 } from "@cosmjs/encoding"
import { getSigner, getLedgerSigner } from "./wallet"
import { coin } from "@cosmjs/amino"

const IS_TESTNET = !process.argv.includes("--mainnet")

const JUNO_MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi"
const JUNO_TESTNET_RPC = "https://rpc.uni.juno.deuslabs.fi"

const MNEMONIC =
"alarm awful problem wage syrup source van engage pact drill virtual mansion category ice dynamic alone begin employ mention flower wheel flag boy movie"
// "chest jungle ring glad bounce purse soup saddle prize tongue ride ginger flavor volume news private donor report action twice roast useful lion leopard"
//"anger ivory inside rocket reopen long flee jump elite wear negative distance income involve lobster boil panel champion reflect horse dial lion doctor prosper"

const CONTRACT_ADDRESS =
  //"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"
  //"juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5"
  "juno16u4knekeyqqs45ywxejm4x9v0m6rsy0xp5vlahrc5a0gp7sm78ks87gqw9"

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
    IS_TESTNET ? JUNO_TESTNET_RPC : JUNO_MAINNET_RPC,
    signer,
    {
      prefix: "juno",
      gasPrice: GasPrice.fromString("0.0025ujunox"),
    }
  )

  
  /* ACCOUNT */
  //const account = (await signer.getAccounts())[0]
  //console.log(account)

  // const res = await client.getAccount(account.address)
  // console.log(res)

  // let res2 = await client.getBlock()
  // console.log(res2)
  
  //let res8 = await client.instantiate("juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74", 451, {admin: "Morph"}, "Test","auto")
  //console.log(res8)
  
  // let res3 = await client.sendTokens(
  //   account.address.toString(),
  //   'juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5',
  //   [coin(100, "ujunox")],"auto", "Test"
  //   )
  //   console.log(res3)

    // const executeResponse = await client.execute(
    //   "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //   "juno13qcfy3tlrs20430cx28w76c4fjlzsmhj9d0decyy30m5jsh70cps22vc06",
    //       create_vote_box: {
    //           deadline: {at_height: 480900},
    //           owner: account.address
    //       }
    //   },
    //   "auto",
    // )
    // console.log(executeResponse)

    //let res4 = await client.getContracts(451)
    //console.log(res4)

    // let res5 = await client.getContract("juno16u4knekeyqqs45ywxejm4x9v0m6rsy0xp5vlahrc5a0gp7sm78ks87gqw9")
    // console.log(res5)
    
    // const executeResponse = await client.execute(
    //   "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //   "juno16u4knekeyqqs45ywxejm4x9v0m6rsy0xp5vlahrc5a0gp7sm78ks87gqw9",
    //   {
    //     create_lockbox: {
    //       owner: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //       claims: [
    //         {
    //           addr: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //           amount: "10"
    //         },
    //         {
    //           addr: "juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5",
    //           amount: "10"
    //         }
    //       ],
    //       expiration: {at_height: 520900},
    //       native_token: "ujunox",
    //     }
    //   },
    //   "auto",
    // )

    // console.log(executeResponse)

    // const queryResponse = await client.queryContractSmart(
    //     //"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //     "juno16u4knekeyqqs45ywxejm4x9v0m6rsy0xp5vlahrc5a0gp7sm78ks87gqw9",
    //     {
    //       get_lock_box: {id:"1"}
    //     },
    //     //"auto",
    //   )
    //   console.log(queryResponse)
  
  // /* QUERY */
  // const queryMessage = {
    
  // }
  // const queryResponse = await querySmartContract(queryMessage)
  // console.log(queryResponse)

  // /* TRANSACTION */
  // const txMessage = {
  //   mint: {
  //     token_id: "some_id",
  //     owner: account.address,
  //   },
  // }

  // /* SIGN AND BROADCAST */
  // const signAndBroadcastMessage: EncodeObject = {
  //   typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
  //   value: MsgExecuteContract.fromPartial({
  //     sender: account.address,
  //     contract: CONTRACT_ADDRESS,
  //     msg: toUtf8(JSON.stringify(txMessage)),
  //   }),
  // }
  // const signAndBroadcastResponse = await client.signAndBroadcast(
  //   account.address,
  //   [signAndBroadcastMessage],
  //   "auto"
  // )
  // console.log(signAndBroadcastResponse)

  // /* EXECUTE */
  // const executeResponse = await client.execute(
  //   account.address,
  //   CONTRACT_ADDRESS,
  //   txMessage,
  //   "auto"
  // )
  // console.log(executeResponse)
}

main()
