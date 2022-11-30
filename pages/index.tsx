import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";
import { getSigner } from "../wallet";
import { coin } from "@cosmjs/amino";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

const IS_TESTNET = !process.argv.includes("--mainnet");

const MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi";
const TESTNET_RPC = "https://rpc.streamswap-devnet.omniflix.co:443/";

let client: SigningCosmWasmClient

let subscribe = (person:any) => {
  let signer = getSigner(person.mnemonic).then((signer) => {let client =SigningCosmWasmClient.connectWithSigner(
    TESTNET_RPC,
    signer,
    {
      prefix: "wasm",
      gasPrice: GasPrice.fromString("0.025uwasm"),
    }
  )}).then((client) => {console.log(client)})
  }

let Bob = {
  address: "wasm1lwcrr9ktsmn2f7fej6gywxcm8uvxlzz5ch40hm",
  mnemonic:
    "draft weird switch quality approve steel voice catch place apology million solar winter crunch expire accident rare enhance return genius praise peasant dress maid",
  moneyTospend: 1000000,
  //when did he enter the stream
  at_time: 1 / 12,
  withdraw_time: 1 / 6,
};

let Alice = {
  address: "wasm1hnsk554472szj6ex0lpvhsfszdmuc2lnd72ket",
  mnemonic:
    "magnet prosper annual put weekend tomato join oil bottom pilot mother silly brush soft uncle drift profit shoe raccoon brand puzzle shock track hockey",
  moneyTospend: 500000,
  //when did he enter the stream
  at_time: 1 / 5,
};

let Rick = {
  address: "wasm18w0lvf7lpmqhsggs0wfcy6snnpzwzhyatv7kzg",
  mnemonic:
    "senior print assume harvest charge alone another empty prepare hockey tired pony vivid bamboo slide describe build slab wife category escape jelly lamp come",
  moneyTospend: 300000000,
  //when did he enter the stream
  at_time: 1 / 2,
};


export default function Home() {
  return (
    <div className='ml-9 mt-40  flex-auto '>
     <span>
      <h1 className='h-10 font-bold'>Rick</h1>
      {JSON.stringify(Rick)}</span>
      <button onClick={() => subscribe(Rick)}>
        subscribe to stream 
      </button>
     <span>
     <h1 className='h-10 font-bold'>Alice</h1>
     {JSON.stringify(Alice)}
     <button onClick={subscribe}>
        subscribe to stream 
      </button>
     </span>
     <span><h1 className='h-10 font-bold'>Bob</h1>
      {JSON.stringify(Bob)}
      <button onClick={subscribe}>
        subscribe to stream 
      </button>
      </span>


    </div>

  )
}
