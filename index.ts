import { CosmWasmClient, SigningCosmWasmClient,  } from "@cosmjs/cosmwasm-stargate"
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
//"olive hamster circle beyond parent lab cup million manual someone kiss acquire ginger layer valley gorilla repair mandate actress organ domain siren fuel else"
"alarm awful problem wage syrup source van engage pact drill virtual mansion category ice dynamic alone begin employ mention flower wheel flag boy movie"
// "chest jungle ring glad bounce purse soup saddle prize tongue ride ginger flavor volume news private donor report action twice roast useful lion leopard"
//"anger ivory inside rocket reopen long flee jump elite wear negative distance income involve lobster boil panel champion reflect horse dial lion doctor prosper"

const CONTRACT_ADDRESS =
  //"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"
  //"juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5"
  //"juno16u4knekeyqqs45ywxejm4x9v0m6rsy0xp5vlahrc5a0gp7sm78ks87gqw9"
  "juno1ke559k9wh8akdrtf7nyv465c047nt6hpcg0ntfke6c4s2s74kses6recpp"

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

  //Instantiate CW20 contract
  
  // const msg = {
  //   name: 'Test Coin',
  //   symbol: 'TST',
  //   decimals: 6,
  //   initial_balances: [
  //     {
  //       address: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //       amount: '10000000',
  //     },
  //   ],
  //   //Optional
  //   mint: {
  //     minter: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //     // cap: '1000000000', // Optional
  //   },
  //   // Optional
  //   // marketing: {
  //   //   project: 'Horse Project',
  //   //   description: 'Horses are cool',
  //   //   marketing: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //   //   logo: {
  //   //     url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK3vUxZZXhDrHoLtbVbMNChIy71A8K8yMjtg&usqp=CAU',
  //   //   },
  //   }
  

  // const label = 'Test Coin'

  // const response = await client.instantiate(
  //   "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //   5,
  //   msg,
  //   label,
  //   "auto"
  // )

  // console.log(response)

  //Query Balance

  // const balance = async (address: string): Promise<string> => {
  //   const result = await client.queryContractSmart("juno1z4chusdz400jydm7vcpurkpxrm0hfkj8pessnuyvpjn3p37s34yq8wxsyu", {
  //     balance: { address },
  //   })
  //   return result.balance
  // }
  // console.log(await balance("juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"))

  
  // const queryClient = await CosmWasmClient.connect("https://rpc.double-double-1.stargaze-apis.com/")
  // const balance= await queryClient.getBalance("stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz","ustars")      
  // console.log(balance)
    


  //console.log(await client.getCodeDetails(733))
  // const {data} = await client.getCodeDetails(733)
  
  // let kod = ""
  // data.forEach(el => {
  //   kod += String.fromCharCode(el)
  // });

  // console.log(kod)

  //Token Info
  // const result = await client.queryContractSmart("juno1ek7vp4wky62zqrmgvwvegak7vxkg63cvyprklmgj9j7y6tg7uw5saw2mnh", 
  // { token_info: {} }
  // )
  // console.log(result)
  
  //Instantiate To-Do List
  //const response = await client.instantiate("wasm1t9jfuyv8xqas7j7pf4jrt7r4sq7s6epeatkz9y", 1345, {}, "Test List", "auto")
  //console.log(response)

  //Instantiate Lockbox
  // const response = await client.instantiate(
  //     "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //     732,
  //     {},
  //     "Test Lockbox",
  //     "auto"
  //   )
  //   console.log(response)

  //Create Lockbox
  
  // const executeResponse = await client.execute(
  //     "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //     "juno1d2rce675x6apuhz3ceve8xg69vprvexw5y5un93n87rfm8ymzjpq358ldy",
  //     {
  //       create_lockbox: {
  //         owner: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //         claims: [
  //           {
  //             addr: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //             amount: "30"
  //           },
  //           {
  //             addr: "juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5",
  //             amount: "20"
  //           }
  //         ],
  //         expiration: {at_height: 1820900},
  //         cw20_addr: "juno1z4chusdz400jydm7vcpurkpxrm0hfkj8pessnuyvpjn3p37s34yq8wxsyu",
  //       }
  //     },
  //     "auto",
  //   )
  //   console.log(executeResponse)


  // const executeResponse = await client.execute(
  //     "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //     "juno1d2rce675x6apuhz3ceve8xg69vprvexw5y5un93n87rfm8ymzjpq358ldy",
  //     {
  //       create_lockbox: {
  //         owner: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //         claims: [
  //           {
  //             addr: "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //             amount: "1000"
  //           },
  //           {
  //             addr: "juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5",
  //             amount: "2500"
  //           }
  //         ],
  //         expiration: {at_height: 1820900},
  //         native_token: "ujunox",
  //       }
  //     },
  //     "auto",
  //   )

  //    console.log(executeResponse)


    //Get Lockboxes
    // const queryResponse = await client.queryContractSmart(
    //   "juno1tznakkarqwgpvwug0q2zq8v6n0rpl7yztxdwlyr9fhls2w0s76kquryzym",
    //   {
    //     list_lock_boxes: {}
    //   },
    // )
    // console.log(queryResponse)

    //Get Lockbox
    // const queryResponse = await client.queryContractSmart(
    //   "juno1fdm4d8a5xtluvxrmm0tk3zxnhusf7enhjkk3pplw8f30jzrqzpgqqzs2eq",
    //   {
    //     get_lock_box: {id: "1"}
    //   },
    // )
    // console.log(queryResponse)

    //Reset Lockbox
    // const res = await client.execute(
    //   "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //   "juno1fdm4d8a5xtluvxrmm0tk3zxnhusf7enhjkk3pplw8f30jzrqzpgqqzs2eq",
    //   {
    //     reset: {id: "3"},
    //   },
    //   'auto',
    //   '',
    // )
    // console.log(res)

    //Deposit Native
    // const res = await client.execute(
    //   "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //   "juno1fdm4d8a5xtluvxrmm0tk3zxnhusf7enhjkk3pplw8f30jzrqzpgqqzs2eq",
    //   {
    //     deposit: {id: "2"},
    //   },
    //   'auto',
    //   '',
    //   [coin(1, "ujunox")]
    // )
    // console.log(res)
    
  /* ACCOUNT */
  //const account = (await signer.getAccounts())[0]
  //console.log(account)

  // const res = await client.getAccount(account.address)
  // console.log(res)

  // let res2 = await client.getBlock()
  // console.log(res2)

  // let res8 = await client.instantiate( "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  // 648,
  // {
  //   admins: ['juno1smz9wdg5v7wywquyy7zn7ujvu54kuumwzw5ss8',"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"],
  //   proposers: ['juno1smz9wdg5v7wywquyy7zn7ujvu54kuumwzw5ss8', "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"],
  //   min_delay: "10000000000"
  // },
  // 'timelock test',
  // 'auto',
  // {
  //   admin: 'juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74'
  // })
  // console.log(res8) //juno1t5xudvdl4qlu30ta9lh4gzqkk47ldpuc7leveutjpulqmq8wufksk0zu4x

  // const msg = {
  //   mint: {
  //     amount: '1000'
  //   }
  // }
  // const encode = (str: string):string => Buffer.from(str, 'binary').toString('base64');

  // const res = await client.execute(
  //   'juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74',
  //   'juno1t5xudvdl4qlu30ta9lh4gzqkk47ldpuc7leveutjpulqmq8wufksk0zu4x',
  //   {
  //     schedule: {
  //       data: encode(JSON.stringify(msg)),
  //       target_address: 'juno154xu4268g2rdtnxjjsfr3wy9t3vx97308rdgau66s0d3amlxp7zq4j78us',
  //       execution_time: Number(17146744073709551515).toString(),
  //       executors: ['juno1smz9wdg5v7wywquyy7zn7ujvu54kuumwzw5ss8',"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"]
  //     }
  //   },
  //   'auto'
  // )

  // console.log(res)

  // const res = await client.queryContractSmart(
  //     'juno1hr575ypkccxs978ahtue3a7t5e2cqw8z598ky4007ftzz96kv29s683fw0',
  //     {
  //       get_min_delay: {}
  //     },
  //   )
  
  //   console.log(res) 

  // const executeResponse = await client.execute(
  //       "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //       "juno1wcxt66hze5sedzhepjjv7llrd4snzplpcsczx5egue9z3t6sh62q7n8f0v",
  //       { 
  //       update_min_delay: {
  //               new_delay: {time: 30},
                
  //           }
  //       },
  //       "auto",
  //     )
  //     console.log(executeResponse)

  // const executeResponse = await client.execute(
  //     "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
  //     "juno18hqxsyrtawd6fpm6lyfsxd7tt890g4et9u5k904vhh0eqt84wmeqyar69n",
  //     { 
  //     schedule: {
  //             target: {at_height: 480900},
  //             owner: account.address
  //         }
  //     },
  //     "auto",
  //   )
  //   console.log(executeResponse)

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
    
    // 

    // const res = await client.execute(
    //   "juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //   "juno14tu3xs4w58kh90k86nf5sycck6l0x6tr4mkyfuun76aex5tltqrq0lfmrt",
    //   {
    //          deposit: {id:"1"}
    //   },
    //   "auto","",
    //   [coin(3, "ujunox")],
    // )

    // console.log(res)
    
    // const queryResponse = await client.queryContractSmart(
    //     //"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74",
    //     "juno1vknw4cnp6g2eh8mzthdlgr759prhtypa3r6pgmgj4naxtcakqkes5zxuuk",
    //     {
    //       get_votebox_count: {}
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
