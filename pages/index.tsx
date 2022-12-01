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
  import {treasury, Rick, Alice, Bob} from '../users'
  import { Any } from "cosmjs-types/google/protobuf/any";
  import { time } from "console";
  
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
  const [treasuryAddress, setTreasuryAddress] = useState(treasury.address);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [inDenom, setInDenom] = useState("ujuno");
  const [outDenom, setOutDenom] = useState("uosmo");
  const [outSupply, setOutSupply] = useState("1000000");
  const [creationDenom, setCreationDenom] = useState("uosmo");
  const [creationFee, setCreationFee] = useState("1000000");
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [contractAddress, setcontractAddress] = useState("wasm1sr06m8yqg0wzqqyqvzvp5t07dj4nevx9u8qc7j4qa72qu8e3ct8qzuktnp");
  //state definitions for InstantiationParams
  const [minStreamSeconds, setMinStreamSeconds] = useState("60");
  const [minSecondsUntilStartTime, setMinSecondsUntilStartTime] = useState("30");
  const [streamCreationDenom, setStreamCreationDenom] = useState("uosmo");
  const [streamCreationFee, setStreamCreationFee] = useState("1000000");
  const [feeCollector, setFeeCollector] = useState(treasury.address);
  //state definitions for users positions
  const [contracts , setcontracts] = useState<readonly string[]>([]);
  const [positionBob , setPositionBob] = useState("");
  const [positionAlice , setPositionAlice] = useState("");
  const [positionRick , setPositionRick] = useState("");
  const [streamData, setStreamData] = useState("");
  const [configData, setConfigData] = useState("");
  
  const [signerBob, setSignerBob] = useState<DirectSecp256k1HdWallet>();
  const [signerAlice, setSignerAlice] = useState<DirectSecp256k1HdWallet>();
  const [signerRick, setSignerRick] = useState<DirectSecp256k1HdWallet>();
  const [signerTreasury, setSignerTreasury] = useState<DirectSecp256k1HdWallet>();
  
  const [clientBob, setClientBob] = useState<SigningCosmWasmClient>();
  const [clientAlice, setClientAlice] = useState<SigningCosmWasmClient>();
  const [clientRick, setClientRick] = useState<SigningCosmWasmClient>();
  const [clientTreasury, setClientTreasury] = useState<SigningCosmWasmClient>();
  
  //query params
  const [streamId , setStreamId] = useState(1);
  const [height , setHeight] = useState<any>();
  const [codeId , setCodeId] = useState(6);
  
  //subscribe parameters
  const [subscribeAmountBob , setSubscribeAmountBob] = useState("1000000");
  const [subscribeAmountAlice , setSubscribeAmountAlice] = useState("1000000");
  const [subscribeAmountRick , setSubscribeAmountRick] = useState("1000000");
  const [subscribeDenomBob , setSubscribeDenomBob] = useState("ujuno");
  const [subscribeDenomAlice , setSubscribeDenomAlice] = useState("ujuno");
  const [subscribeDenomRick , setSubscribeDenomRick] = useState("ujuno");
  
    
    const init = async () => {
      setSignerBob(await getSigner(Bob.mnemonic))
      setSignerAlice(await getSigner(Alice.mnemonic))
      setSignerRick(await getSigner(Rick.mnemonic))
      setSignerTreasury(await getSigner(treasury.mnemonic))
    }
  
    useEffect(() => {
      const setClients = async () => {
      setClientBob(await SigningCosmWasmClient.connectWithSigner(
        IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signerBob as DirectSecp256k1HdWallet,
        {
          prefix: "wasm",
          gasPrice: GasPrice.fromString("0.025uwasm"),
        }
      ))
    
      setClientAlice(await SigningCosmWasmClient.connectWithSigner(
        IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signerAlice as DirectSecp256k1HdWallet,
        {
          prefix: "wasm",
          gasPrice: GasPrice.fromString("0.025uwasm"),
        }
      ))
    
      setClientRick(await SigningCosmWasmClient.connectWithSigner(
        IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signerRick as DirectSecp256k1HdWallet,
        {
          prefix: "wasm",
          gasPrice: GasPrice.fromString("0.025uwasm"),
        }
      ))
    
      setClientTreasury(await SigningCosmWasmClient.connectWithSigner(
        IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signerTreasury as DirectSecp256k1HdWallet,
        {
          prefix: "wasm",
          gasPrice: GasPrice.fromString("0.025uwasm"),
        }
      ))
      }
      setClients()
    }, [signerAlice, signerBob, signerRick, signerTreasury])
    
  
    useEffect (() => {
      init()
      console.log(clientTreasury)
    }, [])
  
    useEffect(() => {
      //define async function
      const getContracts = async () => {
        if (clientTreasury) {
          if(Number(codeId)){
            const streamContracts = await clientTreasury?.getContracts(codeId)
            setcontracts(streamContracts)
          }
          const configRes= await clientTreasury?.queryContractRaw(contractAddress,toUtf8(Buffer.from(Buffer.from("config").toString("hex"),"hex").toString()))
          let decodedRes = JSON.parse(new TextDecoder().decode(configRes as Uint8Array))
          setConfigData((JSON.stringify(decodedRes, null, 2).trim()))
        }
      }
      getContracts()
    }, [clientTreasury, contractAddress, codeId])
  
    setInterval(() => {
      const getHeight = async () => {
        if (clientTreasury) {
        const blockInfo = await clientTreasury?.getBlock()
        setHeight(JSON.stringify({height: blockInfo?.header.height
        ,time: new Date(blockInfo?.header.time).toLocaleString()},null,2).trim())
  
        }
      }
      getHeight()  
    }, 10000)
  
    const instantiate = async () => {
      const msg = {
      min_stream_seconds: minStreamSeconds,
      min_seconds_until_start_time: minSecondsUntilStartTime,
      stream_creation_denom: streamCreationDenom,
      stream_creation_fee: streamCreationFee,
      fee_collector: treasury.address,
    }
  
    const response = await clientTreasury?.instantiate(
      treasury.address,
      codeId,
      msg,
      'SS Contract',
      "auto"
    )
    if(response)
    setcontractAddress(response.contractAddress)
    }
  
  
    const createStream = async () => {
      console.log(clientTreasury)
      const executeResponse = await clientTreasury?.execute(
              treasury.address,
              contractAddress,
              {
                create_stream: {
                  treasury: treasury.address,
                  name: name,
                  url: url,
                  in_denom: inDenom,
                  out_denom: outDenom, 
                  out_supply: outSupply,
                  start_time: (new Date(startTime as Date).getTime()*1000000).toString(),
                  end_time: (new Date(endTime as Date).getTime()*1000000).toString(),
                }
              },
              "auto",
              "Create Stream",
              //TODO: add creation fee
              [coin(Number(outSupply), outDenom)]
            )
            console.log(executeResponse)
    }
  
    const updateDistribution = async () => {
      const response = await clientBob?.execute(Bob.address,
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
      console.log(contractAddress)
      console.log(clientTreasury)
      const response = await clientTreasury?.queryContractSmart(
        contractAddress,
      {
        stream: { stream_id: streamId },
      })
      console.log(response)
      setStreamData(JSON.stringify(response,undefined,2).trim())
    }
  
    const queryPositionBob = async () => {
      const response = await clientBob?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: Bob.address },
      })
      console.log(response)
      setPositionBob(JSON.stringify(response,undefined,2).trim())
    }
  
    const subscribeBob = async () => {
      const response = await clientBob?.execute(Bob.address,
        contractAddress,
        {
          subscribe: {
            stream_id: streamId,
            position_owner: null,
            operator: null
          },
        },
        "auto",
        "Subscribe Bob",
        [coin(Number(subscribeAmountBob), subscribeDenomBob)]
      )
      console.log(response)
    }

    const withdrawBob = async () => {
      const executeResponse = await clientBob?.execute(
          Bob.address,
          contractAddress,
          {
            withdraw: {
              stream_id: streamId,
              cap: null,
              position_owner: null
            },
          },
          "auto",
          "Withdraw Bob",
        )
        console.log(executeResponse) 
    }
  
    const queryPositionAlice = async () => {
      const response = await clientAlice?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: Alice.address },
      })
      console.log(response)
      setPositionAlice(JSON.stringify(response,undefined,2).trim())
    }
  
    const subscribeAlice = async () => {
      const response = await clientAlice?.execute(Alice.address,
        contractAddress,
        {
          subscribe: {
            stream_id: streamId,
            position_owner: null,
            operator: null
          },
        },
        "auto",
        "Subscribe Alice",
        [coin(Number(subscribeAmountAlice), subscribeDenomAlice)]
      )
      console.log(response)
    }

    const withdrawAlice = async () => {
      const executeResponse = await clientAlice?.execute(
          Alice.address,
          contractAddress,
          {
            withdraw: {
              stream_id: streamId,
              cap: null,
              position_owner: null
            },
          },
          "auto",
          "Withdraw Alice",
        )
        console.log(executeResponse) 
    }
  
    const queryPositionRick = async () => {
      const response = await clientRick?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: Rick.address },
      })
      console.log(response)
      setPositionRick(JSON.stringify(response,undefined,2).trim())
    }
  
    const subscribeRick = async () => {
      const response = await clientRick?.execute(Rick.address,
        contractAddress,
        {
          subscribe: {
            stream_id: streamId,
            position_owner: null,
            operator: null
          },
        },
        "auto",
        "Subscribe Rick",
        [coin(Number(subscribeAmountRick), subscribeDenomRick)]
      )
      console.log(response)
    }

    const withdrawRick = async () => {
      const executeResponse = await clientRick?.execute(
          Rick.address,
          contractAddress,
          {
            withdraw: {
              stream_id: streamId,
              cap: null,
              position_owner: null
            },
          },
          "auto",
          "Withdraw Rick",
        )
        console.log(executeResponse) 
    }

    const testStream = async () => {
      
      await new Promise(r => setTimeout(r, 5000));
      
    }
  
  
  
    return (
    <div className="mx-8"> 
      <div className="ml-8 mt-10">
          <label className='mx-2 font-bold'>Wallet details</label>
          <br />
          <span>Treasury:{JSON.stringify(treasury)}</span>
          <br />
          <span>Bob:{JSON.stringify(Bob)}</span>
          <br />
          <span>Alice:{JSON.stringify(Alice)}</span>
          <br />
          <span>Rick:{JSON.stringify(Rick)}</span>
      </div>
      <div className='ml-8 mt-40  flex flex-col'>
        <div className='top-0 absolute mt-1 '>
          {height}
          </div>
        <div className='flex flex-row mb-4'>
          <div className='w-1/3 flex flex-col'>
            <span>Stream Instantiation Parameters</span>
            
            <label className='mt-2'>Code Id</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="Number" value={codeId} onChange={e => setCodeId(Number(e.target.value))} />
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
              <label className='mt-2 underline'>Contracts instantiated with the Code Id of {codeId}</label>
              {contracts.map((contract, index) => (
                <div key={index}>
                  <span className="text-lg">{contract}</span>
                </div>
              ))}
  
          </div>
          <div className='w-1/3 flex flex-col ml-4'>
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
            <label className="mt-2">Creation Fee Denom</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={creationDenom} onChange={e => setCreationDenom(e.target.value)} />
            <label className="mt-2">Creation Fee</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={creationFee} onChange={e => setCreationFee(e.target.value)} />
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
          <div className='flex flex-col ml-4 w-full'>
            <div className="flex flex-row mx-5 mb-10 w-full">        
              <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{streamData}</pre>
              </div>
              <div className="overflow-auto p-2 mx-2 w-full text-lg text-blue-800 border-2 border-black h-full font-mono">
                <pre>{configData}</pre>
              </div>
  
            </div>
            <div className="flex flex-row ml-4">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryStream}>Query Stream</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={updateDistribution}>Update Distribution</button>
              <label className='mx-4 mt-4'>Stream Id</label>
              <input className='w-12 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="Number" value={streamId} onChange={e => setStreamId(Number(e.target.value))}/>
           </div>
           </div> 
        </div>  
        
        <div className="w-full flex flex-row mx-4 mb-10">
          <div className="w-full flex flex-col mr-2">
              <div className="overflow-auto p-2 w-full text-2xl text-orange-800 border-2 border-black h-full font-mono">
                <pre>{positionBob}</pre>
              </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionBob}>Query Bob's Position</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={subscribeBob}>Subscribe for Bob</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawBob}>Withdraw for Bob</button>
              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Subscription Denom</label>
              <input className='w-12 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeDenomBob} onChange={e => setSubscribeDenomBob(e.target.value)}/>
              <label className='mx-4 mt-4'>Subscription Amount</label>
              <input className='w-24 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeAmountBob} onChange={e => setSubscribeAmountBob(e.target.value)}/>
            </div>
          </div>
          <div className="w-full flex flex-col mr-2">
            <div className="overflow-auto p-2 w-full text-2xl text-orange-800 border-2 border-black h-full font-mono">
                <pre>{positionAlice}</pre>
            </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionAlice}>Query Alice's Position</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={subscribeAlice}>Subscribe for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawAlice}>Withdraw for Alice</button>

              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Subscription Denom</label>
              <input className='w-12 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeDenomAlice} onChange={e => setSubscribeDenomBob(e.target.value)}/>
              <label className='mx-4 mt-4'>Subscription Amount</label>
              <input className='w-24 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeAmountAlice} onChange={e => setSubscribeAmountBob(e.target.value)}/>
            </div>
          </div>
          <div className="w-full flex flex-col mr-2">
            <div className="overflow-auto p-2 w-full text-2xl text-orange-800 border-2 border-black h-full font-mono">
                <pre>{positionRick}</pre>
            </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionRick}>Query Rick's Position</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={subscribeRick}>Subscribe for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawRick}>Withdraw for Rick</button>
              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Subscription Denom</label>
              <input className='w-12 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeDenomRick} onChange={e => setSubscribeDenomBob(e.target.value)}/>
              <label className='mx-4 mt-4'>Subscription Amount</label>
              <input className='w-24 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeAmountRick} onChange={e => setSubscribeAmountBob(e.target.value)}/>
            </div>
          </div>
          
        </div>
  
      </div>
      </div>
  
    )
  }
  export default Home
  