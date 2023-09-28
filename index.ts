import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import { CosmWasmClient, SigningCosmWasmClient,  } from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing"
import { LedgerSigner } from "@cosmjs/ledger-amino"
import { fromHex, toBase64, toUtf8 } from "@cosmjs/encoding"
import { getSigner, getLedgerSigner } from "./wallet"
import { coin, makeCosmoshubPath, coins } from '@cosmjs/amino';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import axios from "axios"
import type { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgGrant, MsgExec, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { fromRfc3339WithNanoseconds } from "@cosmjs/tendermint-rpc";
import Long from "long";
import { SendAuthorization } from "cosmjs-types/cosmos/bank/v1beta1/authz";
import { AcceptedMessageKeysFilter, AllowAllMessagesFilter, ContractExecutionAuthorization, MaxFundsLimit, } from "cosmjs-types/cosmwasm/wasm/v1/authz";
import { AuthzExtension } from "@cosmjs/stargate/build/modules/authz/queries";
import { AminoMsgExecuteContract } from "@cosmjs/cosmwasm-stargate/build/modules";

const IS_TESTNET = !process.argv.includes("--mainnet")

const JUNO_MAINNET_RPC = "https://rpc.stargaze-apis.com"
const JUNO_TESTNET_RPC = "https://rpc.elgafar-1.stargaze-apis.com/"

const MNEMONIC = 
"wait boring drastic roast ranch close prefer sibling total across faint empty"
//"olive hamster circle beyond parent lab cup million manual someone kiss acquire ginger layer valley gorilla repair mandate actress organ domain siren fuel else"
//"alarm awful problem wage syrup source van engage pact drill virtual mansion category ice dynamic alone begin employ mention flower wheel flag boy movie"
//"chest jungle ring glad bounce purse soup saddle prize tongue ride ginger flavor volume news private donor report action twice roast useful lion leopard"
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
      gasPrice: GasPrice.fromString("0.025ustars"),
    }
  )
  console.log((await signer.getAccounts())[0].address)

  // const data = await client.queryContractRaw(
  //   "stars1w57up6s60r0ueshsprva3vyjtv8e49lf6auph5g7h95q9fqm87nqqk38pm",
  //   toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
  // )
  // console.log(JSON.parse(new TextDecoder().decode(data as Uint8Array)))
  // let res1 = await client.getContracts(2681)
  // console.log(res1)
  // client.migrate('juno153w5xhuqu3et29lgqk4dsynj6gjn96lrnl6qe5', 'juno1fvpmck9vtf2ys85zvtud2ss5pr63sh0th3yf32072g7s23emk5vs4u4lve', 1174, {}, 'auto')
  // console.log(await client.getContracts(1268))
  // let res = await client.getContractCodeHistory("stars1w57up6s60r0ueshsprva3vyjtv8e49lf6auph5g7h95q9fqm87nqqk38pm")
  // console.log(res)
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

  // const msg = {
  //   params:{
  //     allowed_sg721_code_ids: [2596],
  //     code_id: 2776,
  //     frozen: false,
  //     creation_fee: {amount: "5000000000", denom:"ustars"},
  //     min_mint_price: {amount: "10000000", denom:"factory/stars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3/uusdc"},
  //     mint_fee_bps: 500,
  //     max_trading_offset_secs: 1209600,
  //     extension: {
  //       max_token_limit: 10000,
  //       max_per_address_limit: 50,
  //       airdrop_mint_price: {amount: "0", denom:"factory/stars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3/uusdc"},
  //       airdrop_mint_fee_bps: 10000,
  //       shuffle_fee: {amount: "500000000", denom:"ustars"},
  //     },
  //   }
  // }
  
  // const label = 'Vending Factory USDC Updatable'
  // let senderAddress = (await signer.getAccounts())[0].address
  // const response = await client.instantiate(
  //  senderAddress,
  //   80,
  //   {},
  //   label,
  //   "auto"
  // )

  // console.log(response)

  // const msg = {
  //   params:{
  //     allowed_sg721_code_ids: [2661],
  //     code_id: 2664,
  //     frozen: false,
  //     creation_fee: {amount: "2250000000", denom:"ustars"},
  //     min_mint_price: {amount: "50000000", denom:"ustars"},
  //     mint_fee_bps: 10000,
  //     max_trading_offset_secs: 0,
  //     // extension: {
  //     //   max_token_limit: 10000,
  //     //   max_per_address_limit: 50,
  //     //   airdrop_mint_price: {amount: "0", denom:"ustars"},
  //     //   airdrop_mint_fee_bps: 10000,
  //     //   shuffle_fee: {amount: "500000000", denom:"ustars"},
  //     // },
  //   }
  // }
  
  // const label = 'Base Factory Updatable'
  // let senderAddress = (await signer.getAccounts())[0].address
  // const response = await client.instantiate(
  //  senderAddress,
  //   2663,
  //   msg,
  //   label,
  //   "auto"
  // )

  // console.log(response)

  const msg = {
    params:{
      allowed_sg721_code_ids: [2595],
      code_id: 3109,
      frozen: false,
      creation_fee: {amount: "1000000000", denom:"ustars"},
      min_mint_price: {amount: "0", denom:"factory/stars1paqkeyluuw47pflgwwqaaj8y679zj96aatg5a7/ufrienzies"},
      mint_fee_bps: 500,
      max_trading_offset_secs: 604800,
      extension: {
        max_per_address_limit: 50,
        airdrop_mint_price: {amount: "100000", denom:"factory/stars1paqkeyluuw47pflgwwqaaj8y679zj96aatg5a7/ufrienzies"},
        airdrop_mint_fee_bps: 10000,
        dev_fee_address: "stars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3",
      },
    }
  }
  
  const label = 'Open Edition FRNZ Factory'
  let senderAddress = (await signer.getAccounts())[0].address
  const response = await client.instantiate(
   senderAddress,
    3108,
    msg,
    label,
    "auto"
  )

  console.log(response)

  // AUTHZ

  // const expWithNano = fromRfc3339WithNanoseconds("1693934838000000000");
  // let expSec = Math.floor(expWithNano.getTime() / 1000);
  // let expNano =
  //   (expWithNano.getTime() % 1000) * 1000000 + (expWithNano.nanoseconds ?? 0);
  // const exp = Timestamp.fromPartial({
  //   nanos: expNano,
  //   seconds: Long.fromNumber(expSec),
  // });

  const authValue = ContractExecutionAuthorization.encode({
    grants: [{
        contract: "stars1vjd4ue5ymd25fphyqmck7urwynnvun29cdqsgjd2nzvdtwtlj4xsxg8f08",
        filter: {
            typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter",
            value: AllowAllMessagesFilter.encode({}).finish(),
        },
        limit: {
            typeUrl: "/cosmwasm.wasm.v1.MaxFundsLimit",
            value: MaxFundsLimit.encode({
                amounts: coins("10000000000", "ustars"),
            }).finish(),
        },
    }],
}).finish()

  const currentTimeInMilliSeconds = new Date().getTime();

  const grantValue = MsgGrant.fromPartial({
    grant: {
      authorization: {
        typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
        value: authValue,
      },
      expiration: {seconds: 1696508268},
    },
    granter: "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e",
    grantee: "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
  });

  // const res = await client.signAndBroadcast(
  //   "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e",
  //   [
  //     {
  //       typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
  //       value: grantValue,
  //     },
  //   ],
  //   'auto',
  // )

  // console.log(res)
 
  // const msg = {
  //   mint_to: { recipient: "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e"}
  // }

  // interface MsgExecAllowanceEncodeObject extends EncodeObject {
  //   readonly typeUrl: "/cosmos.authz.v1beta1.MsgExec";
  //   readonly value: Partial<MsgExec>;
  // }
 
  // const authzExecuteContractMsg: MsgExecAllowanceEncodeObject  = {
  //   typeUrl: "/cosmos.authz.v1beta1.MsgExec",
  //   value: MsgExec.fromPartial({
  //           grantee: "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
  //           msgs: [{
  //             typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
  //             value: MsgExecuteContract.encode({
  //               sender: "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e",
  //               contract: "stars1vjd4ue5ymd25fphyqmck7urwynnvun29cdqsgjd2nzvdtwtlj4xsxg8f08",
  //               msg: toUtf8(JSON.stringify(msg)),
  //               funds: [],
  //             }).finish(),
  //           }],
  //       }),
  // }

  // const response = await client.signAndBroadcast(
  //   "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
  //   [authzExecuteContractMsg],
  //   'auto',
  // )

  // console.log(response)

  //NAMES
  // const msg = {
  //   collection_code_id: 2962,
  //   admin: "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e",
  //   marketplace_addr: "stars1fn2fpunzvees5wpaxrcfnpxp4vsxn96jv2lxnsth0q0ddmmy632swuh99s",
  //   min_name_length: 3,
  //   max_name_length: 63,
  //   base_price: "100000000",
  //   fair_burn_bps: 6666,
  //   whitelists: [],
  //   verifier: "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e"
  // }
  
  // const label = 'Name Minter'
  // let senderAddress = (await signer.getAccounts())[0].address
  // const response = await client.instantiate(
  //  senderAddress,
  //   2961,
  //   msg,
  //   label,
  //   "auto"
  // )
  
  // console.log(response.contractAddress)
  // console.log(JSON.stringify(response.logs[0].events))
  
  // const msg = {
  //   associate_address: {
  //     name: "nametotest",
  //     address: "stars1exgwcgu85czk3xpkwzv258thqxw7qrpyupkl7s7u2ranttec9fws37j2gs"
  //   }
  // }
  
  // let senderAddress = (await signer.getAccounts())[0].address
  // const response = await client.execute(
    //  senderAddress,
  //   "stars1gmdsq08cg4mvxwd8v7h5ewa3ee2v8wd89f30vylyhnhpld8l27cq3lmm8g",
  //   msg,
  //   "auto",
  // )
  
  // console.log(response)
  
  //STAKING PROGRAM
  
  // const executeResponse = await client.execute(
    //     "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
    //     "stars1wcplnd8979nd88kelpr8lwwygan47n39l7aksdh7angm4rfk47wsa5f6t4",
    //     {
    //       update_tiers:{tiers: ["1000000000","2000000000","3000000000"]}
    //     },
    //     "auto",
    //     '',      
    //   )
    //   console.log(executeResponse)
      
    // const vip_minter_init_msg = {
    //   collection_code_id: 3059,
    //   update_interval: 50,
    // }

    // const vip_program_init_msg = {
    //   collection: "stars1vdax2s4yncc6jrz4fck9v459w7t8znk7d0yqnlj22j3cz8lvhrxqfq4d4j",
    //   tiers: ["1000","2000","3000"]
    // }


  
  // const label = 'VIP Program'
  // let senderAddress = (await signer.getAccounts())[0].address
  // const response = await client.instantiate(
  //  senderAddress,
  //   3053,
  //   vip_program_init_msg,
  //   label,
  //   "auto",
  //   {
  //     admin: "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz"
  //   }
  // )
  
  // console.log(response)
  // console.log(response.contractAddress)
  // console.log(JSON.stringify(response.logs[0].events))

  // const executeResponse = await client.execute(
  //     "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
  //     "stars1w0enyklvdv5ux5dnmj3wnc66v580tcvxw6r9rp6psly6z2p8udxqslw836",
  //     {
  //       update:{token_id: 3}
  //     },
  //     "auto",
  //     '',      
  //   )
  //   console.log(executeResponse)

  //stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz
  //stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e
    // const tier = await client.queryContractSmart("stars1wcplnd8979nd88kelpr8lwwygan47n39l7aksdh7angm4rfk47wsa5f6t4", {
    //   tier: { address: "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e" },
    // });

    // console.log("Tier: ", tier)

  // FRENS PARTY
    // const frens_factory_init_msg = {
    // protocol_fee_destination: "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
    // protocol_fee_bps: 5000,
    // creator_fee_bps: 5000,
    // max_supply: 500,
    // curve_coefficient: "0.05",
    // minter_code_id: 3088,
    // collection_code_id: 3089,
    // base_url: "ipfs://test",
    // }

    // const label = 'Frens Factory'
    // let senderAddress = (await signer.getAccounts())[0].address
    // const response = await client.instantiate(
    //  senderAddress,
    //   3087,
    //   frens_factory_init_msg,
    //   label,
    //   "auto",
    //   {
    //     admin: "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz"
    //   }
    // )

    // console.log(response)

      // const executeResponse = await client.execute(
      //     "stars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz",
      //     "stars1fxxs5sm77d6pkg3zf887kqjzugj5900uv40ua6mx7shkgmt0ch3s999cyz",
      //     {
      //       mint:{}
      //     },
      //     "auto",
      //     '',
      //     coins(1000000, "ustars")     
      //   )
      //   console.log(JSON.stringify(executeResponse))



  // SMART QUERY
  // const name = await client.queryContractSmart("stars138t6zjcrw943gtgahfpfl7k8z5t6hgvw3kk8nhqylw36asd3fw7qs2thmt", {
  //   num_tokens: { },
  // });

  // const name = await client.queryContractSmart("stars1gmdsq08cg4mvxwd8v7h5ewa3ee2v8wd89f30vylyhnhpld8l27cq3lmm8g", {
  //   associated_address: { name: "nametotest" },
  // });
  
  // console.log("name:", name);

  // const address = await client.queryContractSmart("stars1fx74nkqkw2748av8j7ew7r3xt9cgjqduwn8m0ur5lhe49uhlsasszc5fhr", {
  //   associated_address: { name: "serkan" },
  // });
  
  // console.log("address:", address);

  // RAW QUERY
  // console.log(Buffer.from("balance").toString("hex"))
  // let res = await client.queryContractRaw(
  //   "stars1fx74nkqkw2748av8j7ew7r3xt9cgjqduwn8m0ur5lhe49uhlsasszc5fhr",
  //   toUtf8(
  //     Buffer.from(
  //       "0006" +
  //         Buffer.from("tokens").toString("hex") +
  //         Buffer.from("serkan").toString(
  //           "hex"
  //         ),
  //       "hex"
  //     ).toString()
  //   )
  // )
  // console.log(JSON.parse(new TextDecoder().decode(res as Uint8Array)).token_uri)


  // let rm_res = await client.queryContractRaw(
  //   "stars1fx74nkqkw2748av8j7ew7r3xt9cgjqduwn8m0ur5lhe49uhlsasszc5fhr",
  //   toUtf8(
  //     Buffer.from(
  //       "0002" +
  //         Buffer.from("rm").toString("hex") +
  //         Buffer.from("stars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3").toString(
  //           "hex"
  //         ),
  //       "hex"
  //     ).toString()
  //   )
  // )
  // console.log(JSON.parse(new TextDecoder().decode(rm_res as Uint8Array)))

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

  // const result = await client.queryContractSmart("stars1hvu2ghqkcnvhtj2fc6wuazxt4dqcftslp2rwkkkcxy269a35a9pq60ug2q", {
  //     params:{},
  // })
  // console.log(result.params)

  // const feeRateRaw = await client.queryContractRaw(
  //   "stars13unm9tgtwq683wplupjlgw39nghm7xva7tmu7m29tmpxxnkhpkcq4gf3p4",
  //   toUtf8(Buffer.from(Buffer.from('fee_rate').toString('hex'), 'hex').toString()),
  // )
  // console.log('Fee Rate Raw: ', feeRateRaw)
  // const feeRate = JSON.parse(new TextDecoder().decode(feeRateRaw as Uint8Array))
  // console.log('Fee Rate: ', feeRate)
  
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
  //     "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e",
  //     "stars1w5tn8z88keqlfd60fal8n68efxaws689846z4mrucw7vhp4av62swvrel5",
  //     {
  //       mint:{}
  //     },
  //     "auto",
  //         '',
  //     [coin(55000000, "ustars")]
      
  //   )
  //   console.log(executeResponse)

  // const endpoint = "https://constellations-api.mainnet.stargaze-apis.com/graphql"

  // axios({
  //   url: endpoint,
  //   method: 'post',
  //   data: {
  //     query: `
  //       query Collections {
  //         collections(tokenOwnerAddr: "stars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3", limit: 100) {
  //           collections {
  //             collectionAddr
  //             name
  //           }
  //         }
  //       }
  //       `
  //   }
  // }).then((result) => {
  //   console.log(result.data.data.collections)
  // });


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
    //   "stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e",
    //   "stars1u62rtu66qeddpjsq50m7zv95gjfg20yz50fdja6s4rxe4qtnpstsv9dwng",
    //   {roll_dice: {job_id: "1"}},
    //   'auto',
    //   '',
    //   [coin(10000000, "ustars")]
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
  //   'stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e',
  //   'stars134d6rrhpwjtz356t42553tlc6gpqcm82nzv0xc5klshm2x4p6vxs95yw3k',
  //   {
  //     freeze_collection_info: {},
  //   },
  //   'auto'
  // )

  //  console.log(res)

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
