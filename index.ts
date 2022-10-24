import { CosmWasmClient, SigningCosmWasmClient,  } from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing"
import { LedgerSigner } from "@cosmjs/ledger-amino"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { fromHex, toBase64, toUtf8 } from "@cosmjs/encoding"
import { getSigner, getLedgerSigner } from "./wallet"
import { coin, makeCosmoshubPath } from "@cosmjs/amino"

const IS_TESTNET = !process.argv.includes("--mainnet")

const JUNO_MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi"
const JUNO_TESTNET_RPC = "https://rpc.elgafar-1.stargaze-apis.com/"

const MNEMONIC = 
//stargaze test "wait boring drastic roast ranch close prefer sibling total across faint empty"
//"olive hamster circle beyond parent lab cup million manual someone kiss acquire ginger layer valley gorilla repair mandate actress organ domain siren fuel else"
//"alarm awful problem wage syrup source van engage pact drill virtual mansion category ice dynamic alone begin employ mention flower wheel flag boy movie"
"chest jungle ring glad bounce purse soup saddle prize tongue ride ginger flavor volume news private donor report action twice roast useful lion leopard"
//"anger ivory inside rocket reopen long flee jump elite wear negative distance income involve lobster boil panel champion reflect horse dial lion doctor prosper"
//"track huge holiday father slice combine all canal harbor grunt hub keen badge faint victory achieve forum december quiz topple improve island small logic"

const CONTRACT_ADDRESS = 
  // "stars10t2y7f9m0twpsrz3kvfp55nlgzc86kace2se3uarkv380h3pk6qq5cnvr9"
  //"juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"
  //"juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5"
  //"juno16u4knekeyqqs45ywxejm4x9v0m6rsy0xp5vlahrc5a0gp7sm78ks87gqw9"
  //"juno1ke559k9wh8akdrtf7nyv465c047nt6hpcg0ntfke6c4s2s74kses6recpp"
  "stars134d6rrhpwjtz356t42553tlc6gpqcm82nzv0xc5klshm2x4p6vxs95yw3k"

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
      prefix: "stars",
      gasPrice: GasPrice.fromString("0.025ustars"),
    }
  )
  console.log((await signer.getAccounts())[0].address)
  //client.migrate('juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5', 'juno1fvpmck9vtf2ys85zvtud2ss5pr63sh0th3yf32072g7s23emk5vs4u4lve', 1174, {}, 'auto')
  // console.log(await client.getContracts(1268))
  // console.log(await client.getContractCodeHistory("juno143rmxg4khjkxzk56pd3tru6wapenwls20y3shahlc5p9zgddyk8q27n0k4"))
  // console.log(await client.getContract("juno1mfx2wy7g87mv42mnvrqktplggqwqh7phvehk7sfpamgrqvzmln0qkkulak"))
  
  // console.log(await client.getCodeDetails(752))
  // console.log(await client.getBlock())
  // console.log(await signer.getAccounts())
  // console.log(await client.getBlock(1000000))
  // const byteArray = [51, 0, 112, 117,  98, 108, 105, 115, 104, 101, 100,
  //   0, 119,  97, 108, 108, 101, 116, 0,  97, 103, 111,
  // 114, 105,  99,  49,  50, 102, 108, 99, 106, 109, 113,
  //  55,  48,  48, 102, 117, 107,  48,  52,  50, 100, 103,
  // 100, 119,  50,  99,  97, 101, 116, 107,  99, 106, 106,
  //  55, 118,  55, 119,  52, 107, 119,  55, 104]
  // const bytesString = String.fromCharCode(...byteArray)
  
  // let byteArray = await client.getCodeDetails(500)
  // //Convert Uint8Array array to string
  // var string = new TextDecoder().decode(byteArray.data);
  // console.log(string)


  // Instantiate CW20 contract
  
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
  // let senderAddress = (await signer.getAccounts())[0].address
  // const response = await client.instantiate(
  //  senderAddress,
  //   15,
  //   msg,
  //   label,
  //   "auto"
  // )

  // console.log(response)

  //RAW QUERY
  // console.log(Buffer.from("balance").toString("hex"))
  // let res = await client.queryContractRaw(
  //   "juno1fa7sxluzg27unysrgnmckpnjk8xpy70fe0kv7cf423fwu4ftcmxs3d4pyl",
  //   toUtf8(
  //     Buffer.from(
  //       "000B" +
  //         Buffer.from("permissions").toString("hex") +
  //         Buffer.from("juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt").toString(
  //           "hex"
  //         ),
  //       "hex"
  //     ).toString()
  //   )
  // )
  // console.log(res)

  // let res = await client.queryContractRaw(
  //   "juno19j78q9l3zqm6c4mavyv0j055xcm48ust80y5lrznax4jt43rpkmsz8zl7s",
  //   toUtf8(
  //     Buffer.from(
  //       // "000C" +
  //       Buffer.from("config").toString("hex"),
  //       // Buffer.from("mint_module").toString("hex"),
  //       "hex"
  //     ).toString()
  //   )
  // )
  // console.log(res)
  
  // Query Balance

  // const balance = async (address: string): Promise<string> => {
  //   const result = await client.queryContractSmart("juno1n0cp0gu4scqk6dujldj4c7gvhsrvdvn4zwj2tnfjvc2kt2c9z2lq9sw2eg", {
  //       balance: { address },
  //   })
  //   return result.balance
  // }
  // console.log(await balance("juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74"))
  
  // const utf8Encode = new TextEncoder();
  // let rawMessage = Buffer.from("0006636f6e666967","hex").toString();
  // console.log(rawMessage)
  // const res = await client.queryContractRaw("juno1hdnkxjstq04l2jfuterh8nmgzxm9ygythent6f2vnr6l5u8ph55sjhscl6", utf8Encode.encode(rawMessage));
  // console.log(res)  
  
// const msg: EncodeObject = {
//     typeUrl: "/cosmos.bank.v1beta1.MsgSend",
//     value: {
//         from_address: "anAddress",
//         to_address: "anotherAddress",
//         amount: [
//             {
//                 denom: "ujunox",
//                 amount: "1000000",
//             },
//         ],
//     },
// };

// const defaultFee = {
//   amount: [],
//   gas: "200000",
// };

// let tx = client.sign("juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74", [msg], defaultFee, "" )
// console.log((await tx).signatures)

  //const queryClient = await CosmWasmClient.connect("https://rpc.double-double-1.stargaze-apis.com/")
  // const balance= await queryClient.getBalance("stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz","ustars")      
  // console.log(balance)

  // const queryClient = await CosmWasmClient.connect("https://rpc.uni.juno.deuslabs.fi")
  // const tokenInfo= await queryClient.queryContractSmart("juno1kydyh8xeraz280e6pprvtmtyuetjxdn7kyfdypk2gr4a24czk5nqp0njap", {token_info:{ }})      
  // console.log(tokenInfo)


  //console.log(await client.getCodeDetails(733))
  // const {data} = await client.getCodeDetails(733)
  
  // let kod = ""
  // data.forEach(el => {
  //   kod += String.fromCharCode(el)
  // });

  // console.log(kod)
  //console.log(await client.getContractCodeHistory("juno1mfx2wy7g87mv42mnvrqktplggqwqh7phvehk7sfpamgrqvzmln0qkkulak"))
  // Token Info
  // const result = await client.queryContractSmart("juno1mfx2wy7g87mv42mnvrqktplggqwqh7phvehk7sfpamgrqvzmln0qkkulak", 
  // { proposal_modules: {} }
  // )
  // console.log(result)

  // Token Info
  // const result = await client.queryContractSmart("juno1x7j0xaf2gru7m8f6lvnyqd8ctl6pwy540dckje3uxm79q5xy4wesgrs29f", 
  // { is_paused: {stage:1} }
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
  //     "auto"
  //   )
  //     "Test Lockbox",
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
    //   "juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5",
    //   "juno1x7j0xaf2gru7m8f6lvnyqd8ctl6pwy540dckje3uxm79q5xy4wesgrs29f",
    //   {
    //     pause: {stage: 1},
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

  const res = await client.execute(
    'stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e',
    'stars134d6rrhpwjtz356t42553tlc6gpqcm82nzv0xc5klshm2x4p6vxs95yw3k',
    {
      freeze_collection_info: {},
    },
    'auto'
  )

   console.log(res)

  // const res = await client.queryContractSmart(
  //     'juno1n4txsd0494v4g2mqpq7s6wtk57shnut5hhnczcjq4dv774ek50nsyql45q',
  //     {
  //       all_account_maps: {
  //         stage: 1,
  //         start_after: "0",
  //         limit: 10
         
  //       }
  //     },
  //   )
  // console.log(res) 

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
