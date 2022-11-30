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
import { NextPage } from "next";
import { useEffect, useState } from "react";

const IS_TESTNET = !process.argv.includes("--mainnet");

const MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi";
const TESTNET_RPC = "https://rpc.streamswap-devnet.omniflix.co:443/";

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

const Home: NextPage = () => {
const [streamInfo, setStreamInfo] = useState("");

  const CONTRACT_ADDRESS =
  "wasm1sr06m8yqg0wzqqyqvzvp5t07dj4nevx9u8qc7j4qa72qu8e3ct8qzuktnp"

  let signerBob, signerAlice, signerRick : DirectSecp256k1HdWallet
  let clientBob: SigningCosmWasmClient
  let clientAlice: SigningCosmWasmClient
  let clientRick: SigningCosmWasmClient
  
  const init = async () => {
    signerBob = await getSigner(Bob.mnemonic);
    signerAlice = await getSigner(Alice.mnemonic);
    signerRick = await getSigner(Rick.mnemonic);
    
    clientBob = await SigningCosmWasmClient.connectWithSigner(
    IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
    signerBob,
    {
      prefix: "wasm",
      gasPrice: GasPrice.fromString("0.025uwasm"),
    }
  )

  clientAlice = await SigningCosmWasmClient.connectWithSigner(
    IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
    signerAlice,
    {
      prefix: "wasm",
      gasPrice: GasPrice.fromString("0.025uwasm"),
    }
  )

  clientRick = await SigningCosmWasmClient.connectWithSigner(
    IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
    signerRick,
    {
      prefix: "wasm",
      gasPrice: GasPrice.fromString("0.025uwasm"),
    }
  )
  }

  useEffect (() => {
    init()
  }, [])

  const updateDistribution = async () => {
    const response = await clientBob.execute(Bob.address,
      CONTRACT_ADDRESS,
      {
        update_distribution: {
          stream_id: 1,
        },
      },
      "auto",
    )
    console.log(response)
  }

  const queryStream = async () => {
    const response = await clientBob.queryContractSmart(
      CONTRACT_ADDRESS,
    {
      stream: { stream_id: 1 },
    })
    console.log(response)
    setStreamInfo(JSON.stringify(response))
  }

  const queryPositionBob = async () => {
    const response = await clientBob.queryContractSmart(
      CONTRACT_ADDRESS,
    {
      position: { stream_id: 1, owner: Bob.address },
    })
    console.log(response)
  }

  const subscribeBob = async () => {
    const response = await clientBob.execute(Bob.address,
      CONTRACT_ADDRESS,
      {
        subscribe: {
          stream_id: 1,
          position_owner: null,
          operator: null
        },
      },
      "auto",
    )
    console.log(response)
  }


  return (
    <div className='ml-9 mt-40  flex flex-col'>
      <div className="flex flex-col mb-10">
        <input className='w-full h-48 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={streamInfo}/>
        <div className="flex flex-row">
          <button className="w-[100px] border-2 rounded-sm" onClick={queryStream}>Query Stream</button>
          <button className="w-[100px] border-2 rounded-sm" onClick={updateDistribution}>Update Distribution</button>
         </div>
      </div>
      <input type={'text'} defaultValue={JSON.stringify(Rick)} className='w-full h-48 border-2 border-black overflow-scroll overflow-x-auto'/>
      <div className="flex flex-row mb-8">
        <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionBob}>Query Bob's Position</button>
        <button className="w-[100px] border-2 rounded-sm" onClick={subscribeBob}>Subscribe for Bob</button>
        {/* <button title="Withdraw" onClick={withdrawBob}/>
        <button title="Exit Stream" onClick={exitBob}/> */}
      </div>
      <input type={'text'} defaultValue="adssd" className='w-1/3 h-48 border-2 border-black'/>
      <input type={'text'} defaultValue="adssd" className='w-1/3 h-48 border-2 border-black'/>
      <input type={'text'} defaultValue="adssd" className='w-1/3 h-48 border-2 border-black'/>

    </div>

  )
}
export default Home
