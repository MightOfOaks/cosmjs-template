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
import {treasury, Rick, Alice, Bob} from '../Users'
import { Any } from "cosmjs-types/google/protobuf/any";

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


const Home: NextPage = () => {
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
const [contractAddress, setcontractAddress] = useState("wasm1hnvfl0z2madv8k505msf9f4lztjtv9sh4pf5z4tjxpuded337unq9zfem0");
//state definitions for InstantiationParams
const [minStreamSeconds, setMinStreamSeconds] = useState("");
const [minSecondsUntilStartTime, setMinSecondsUntilStartTime] = useState("");
const [streamCreationDenom, setStreamCreationDenom] = useState("");
const [streamCreationFee, setStreamCreationFee] = useState("");
const [feeCollector, setFeeCollector] = useState("");
//state definitions for users positions
const [contracts , setcontracts] = useState<readonly string[]>([]);
const [positionBob , setPositionBob] = useState("");
const [positionAlice , setPositionAlice] = useState("");
const [positionRick , setPositionRick] = useState("");
const [streamData, setStreamData] = useState("");







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
  const streamContracts = await clientTreasury.getContracts(6)
  setcontracts(streamContracts)
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
  setcontractAddress(response.contractAddress)
  }


  const createStream = async () => {
    const executeResponse = await clientBob.execute(
            treasury.address,
            contractAddress,
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
      contractAddress,
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
      contractAddress,
    {
      stream: { stream_id: 1 },
    })
    console.log(response)
    setStreamData(JSON.stringify(response))
  }

  const queryPositionBob = async () => {
    const response = await clientBob.queryContractSmart(
      contractAddress,
    {
      position: { stream_id: 1, owner: Bob.address },
    })
    console.log(response)
  }

  const subscribeBob = async () => {
    const response = await clientBob.execute(Bob.address,
      contractAddress,
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
      <div className='flex flex-row '>
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
          <button className='mt-2 border-4 border-black' onClick={instantiate}>Instantiate
          </button>
          {contracts.map((contract, index) => (
            <div key={index}>
              <span>{contract}</span>
            </div>
          ))}

        </div>
        <div className='flex flex-col ml-4'>
          <span>Stream Creation Parameters</span>
          <label className="mt-2" > Contract adddress</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={contractAddress} onChange={e => setcontractAddress(e.target.value)} />
          <label className="mt-2">Treasury Address</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={treasuryAddress} onChange={e => setTreasuryAddress(e.target.value)} />
          <label className="mt-2"> Name</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={name} onChange={e => setName(e.target.value)} />
          <label className="mt-2">Url</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={url} onChange={e => setUrl(e.target.value)} />
          <label className="mt-2">inDenom</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={inDenom} onChange={e => setInDenom(e.target.value)} />
          <label className="mt-2">Out Denom</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={outDenom} onChange={e => setOutDenom(e.target.value)} />
          <label className="mt-2">Out supply</label>
          <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={outSupply} onChange={e => setOutSupply(e.target.value)} />
          <label className='mt-2'>Start Time</label>
          <div className="border-2 border-black mt-2">
            <InputDateTime minDate={new Date()} onChange={(date: SetStateAction<Date | undefined>) => setStartTime(date)} value={startTime} />
          </div>
          <label className='mt-2'>End Time</label>
          <div className="border-2 border-black mt-2">
            <InputDateTime minDate={new Date()} onChange={(date: SetStateAction<Date | undefined>) => setEndTime(date)} value={endTime} />
          </div>
          <button className='mt-2 border-4 border-black' onClick={createStream}>Create Stream
          </button>


        </div>
        <div className="flex flex-col mx-5 mb-10 w-full">
        <input className='w-full h-full border-2 border-black overflow-scroll overflow-x-auto' type="text" value={streamData}/>
        <div className="flex flex-row">
          <button className="w-[100px] border-2 rounded-sm" onClick={queryStream}>Query Stream</button>
          <button className="w-[100px] border-2 rounded-sm" onClick={updateDistribution}>Update Distribution</button>
         </div>
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
