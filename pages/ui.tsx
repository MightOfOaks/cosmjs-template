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
import { SetStateAction, useEffect, useRef, useState } from "react";
import { InputDateTime } from "../components/InputDateTime";

interface InstantiationParams {
    min_stream_seconds: string,
    min_seconds_until_start_time: string,
    stream_creation_denom: string,
    stream_creation_fee: string,
    fee_collector: string,
}

interface CreateStreamParams {
    treasury: string,
    name: string,
    url: string,
    in_denom: string,
    out_denom: string,
    out_supply: string,
    start_time: string,
    end_time: string,
}

const IS_TESTNET = !process.argv.includes("--mainnet");

const MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi";
const TESTNET_RPC = "https://rpc.streamswap-devnet.omniflix.co:443/";

let treasury = {
  address: "wasm15nrpfjj85qm9l2qsc0d67qxq7w5p0h8p9pkypj",
  mnemonic:"real clarify canoe much tackle quiz jaguar test sad there patrol mixed cost clock crater cabin toilet culture later over pattern innocent reunion sunset",
};

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
// const [instantiationParams, setInstantiationParams] = useState<InstantiationParams>();
// const [createStreamParams, setCreateStreamParams] = useState<CreateStreamParams>();
//state definitions for CreateStreamParams
const [treasuryAddress, setTreasuryAddress] = useState("");
const [name, setName] = useState("");
const [url, setUrl] = useState("");
const [inDenom, setInDenom] = useState("");
const [outDenom, setOutDenom] = useState("");
const [outSupply, setOutSupply] = useState("");
const [startTime, setStartTime] = useState<Date | undefined>(undefined);
const [endTime, setEndTime] = useState<Date | undefined>(undefined);
//state definitions for InstantiationParams
const [minStreamSeconds, setMinStreamSeconds] = useState("");
const [minSecondsUntilStartTime, setMinSecondsUntilStartTime] = useState("");
const [streamCreationDenom, setStreamCreationDenom] = useState("");
const [streamCreationFee, setStreamCreationFee] = useState("");
const [feeCollector, setFeeCollector] = useState("");


  const CONTRACT_ADDRESS =
  "wasm1sr06m8yqg0wzqqyqvzvp5t07dj4nevx9u8qc7j4qa72qu8e3ct8qzuktnp"

  let signerBob, signerAlice, signerRick, signerTreasury : DirectSecp256k1HdWallet
  let clientBob: SigningCosmWasmClient
  let clientAlice: SigningCosmWasmClient
  let clientRick: SigningCosmWasmClient
  let clientTreasury: SigningCosmWasmClient
  
  const init = async () => {
    signerBob = await getSigner(Bob.mnemonic);
    signerAlice = await getSigner(Alice.mnemonic);
    signerRick = await getSigner(Rick.mnemonic);
    signerTreasury = await getSigner(treasury.mnemonic);
    
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

  clientTreasury = await SigningCosmWasmClient.connectWithSigner(
    IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
    signerTreasury,
    {
      prefix: "wasm",
      gasPrice: GasPrice.fromString("0.025uwasm"),
    }
  )
  }

  useEffect (() => {
    init()
  }, [])

  const instantiate = async () => {
    const msg = {
    min_stream_seconds: "300",
    min_seconds_until_start_time: "10",
    stream_creation_denom: "uosmo",
    stream_creation_fee: "1000000",
    fee_collector: treasury.address,
  }

  const response = await clientBob.instantiate(
    Bob.address,
    6,
    msg,
    'SS Contract',
    "auto"
  )
  }

  const createStream = async () => {
    const executeResponse = await clientBob.execute(
            Bob.address,
            CONTRACT_ADDRESS,
            {
              create_stream: {
                treasury: Bob.address,
                name: "First Stream",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                in_denom: "ujuno",
                out_denom: "uosmo",
                out_supply: "1000000",
                start_time: (new Date().getTime()*1000000 + 301*1000000000).toString(),
                end_time: (new Date().getTime()*1000000 + 4000*1000000000).toString(),
              }
            },
            "auto",
            "Create Stream",
            [coin(1000000, "uosmo")]
          )
          console.log(executeResponse)
  }

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

  const testStream = async () => {
    
    await new Promise(r => setTimeout(r, 5000));
  
  }



    


  return (
    <div className='ml-9 mt-40  flex flex-col'>
      <div className='flex flex-row'>
        <div className='flex flex-col'>
        <span>Stream Instantiation Parameters</span>
        
        <label className='mt-2'>Min Stream Seconds</label>
        <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={minStreamSeconds} onChange={e => setMinStreamSeconds(e.target.value)} />
        <label className='mt-2'>Min Seconds Until Start Time</label>
        <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={minSecondsUntilStartTime} onChange={e => setMinSecondsUntilStartTime(e.target.value)} />
        <label className='mt-2'>Stream Creation Denom</label>
        <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={streamCreationDenom} onChange={e => setStreamCreationDenom(e.target.value)} />
        <label className='mt-2'>Stream Creation Fee</label>
        <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={streamCreationFee} onChange={e => setStreamCreationFee(e.target.value)} />
        <label className='mt-2'>Fee Collector</label>
        <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={feeCollector} onChange={e => setFeeCollector(e.target.value)} />


        </div>
        <div className='flex flex-col ml-4'>
          <span>Stream Creation Parameters</span>
          
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={treasuryAddress} onChange={e => setTreasuryAddress(e.target.value)} />
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={name} onChange={e => setName(e.target.value)} />
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={url} onChange={e => setUrl(e.target.value)} />
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={inDenom} onChange={e => setInDenom(e.target.value)} />
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={outDenom} onChange={e => setOutDenom(e.target.value)} />
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={outSupply} onChange={e => setOutSupply(e.target.value)} />
          <label className='mt-2'>Start Time</label>
          <div className="border-2 border-black mt-2">
            <InputDateTime minDate={new Date()} onChange={(date: SetStateAction<Date | undefined>) => setStartTime(date)} value={startTime} />
          </div>

        </div>
      </div>  
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
