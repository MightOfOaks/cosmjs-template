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
  import { coin, makeCosmoshubPath, Secp256k1HdWallet } from "@cosmjs/amino";
  import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
  import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
  import { NextPage } from "next";
  import { SetStateAction, useEffect, useRef, useState } from "react";
  import { InputDateTime } from "../components/InputDateTime";
  import {treasury, Rick, Alice, Bob, addresses} from '../users'
  import { Any } from "cosmjs-types/google/protobuf/any";
  import { time } from "console";
  import { Bip39, Random } from "@cosmjs/crypto";
  import { mnemonics } from "../users";
  import axios from "axios";
import { resolve } from "path";
  
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
  const [creationDenom, setCreationDenom] = useState("uwasm");
  const [creationFee, setCreationFee] = useState("1000");
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [contractAddress, setcontractAddress] = useState("wasm1x3960tw9cml6xsqtvzt4gmw3scauaxdd83rhs9dmlpjfjf9z9s7q7pmem3");
  //state definitions for InstantiationParams
  const [minStreamSeconds, setMinStreamSeconds] = useState("60");
  const [minSecondsUntilStartTime, setMinSecondsUntilStartTime] = useState("30");
  const [streamCreationDenom, setStreamCreationDenom] = useState("uwasm");
  const [streamCreationFee, setStreamCreationFee] = useState("1000");
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
  const [codeId , setCodeId] = useState(9);
  const [treasuryBalance , setTreasuryBalance] = useState<any>();
  const [bobBalance , setBobBalance] = useState<any>();
  const [aliceBalance , setAliceBalance] = useState<any>();
  const [rickBalance , setRickBalance] = useState<any>();
  const [lastAction , setLastAction] = useState("");
  const [testDuration , setTestDuration] = useState(30);
  const [totalPurchased , setTotalPurchased] = useState(0);
  
  //subscribe parameters
  const [subscribeAmountBob , setSubscribeAmountBob] = useState("1000000");
  const [subscribeAmountAlice , setSubscribeAmountAlice] = useState("1000000");
  const [subscribeAmountRick , setSubscribeAmountRick] = useState("1000000");
  const [subscribeDenomBob , setSubscribeDenomBob] = useState("ujuno");
  const [subscribeDenomAlice , setSubscribeDenomAlice] = useState("ujuno");
  const [subscribeDenomRick , setSubscribeDenomRick] = useState("ujuno");
  
    
    const init = async () => {
      await DirectSecp256k1HdWallet.fromMnemonic(treasury.mnemonic, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: "wasm",
      }).then(async (signer) => { 
        let client = await SigningCosmWasmClient.connectWithSigner(
        IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
          signer,
          {
            prefix: "wasm",
            gasPrice: GasPrice.fromString("0.025uwasm"),
          }
        );
        setSignerTreasury(signer)
        return client
        }).then(async (client) => {
            setClientTreasury(client);
            console.log("Treasury: ",client)
            const ujunoBal = await client.getBalance(treasury.address, "ujuno")
            const uosmoBal = await client.getBalance(treasury.address, "uosmo")
            const uwasmBal = await client.getBalance(treasury.address, "uwasm")
            setTreasuryBalance(`ujuno: ${ujunoBal?.amount} uosmo: ${uosmoBal?.amount} uwasm: ${uwasmBal?.amount}`)
            const blockInfo = await client.getBlock()
            setHeight(JSON.stringify({height: blockInfo?.header.height, time: new Date(blockInfo?.header.time).toLocaleString()},null,2).trim())      
        });

        await DirectSecp256k1HdWallet.fromMnemonic(Bob.mnemonic, {
          hdPaths: [makeCosmoshubPath(0)],
          prefix: "wasm",
        }).then(async (signer) => { 
          let client = await SigningCosmWasmClient.connectWithSigner(
          IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
            signer,
            {
              prefix: "wasm",
              gasPrice: GasPrice.fromString("0.025uwasm"),
            }
          );
          setSignerBob(signer)
          return client
          }).then(async (client) => {
            setClientBob(client);
            console.log("Bob: ", client)
            const bobJunoBal = await client.getBalance(Bob.address, "ujuno")
            const bobOsmoBal = await client.getBalance(Bob.address, "uosmo")
            setBobBalance(`ujuno: ${bobJunoBal?.amount} uosmo: ${bobOsmoBal?.amount}`)   
          });

          await DirectSecp256k1HdWallet.fromMnemonic(Alice.mnemonic, {
            hdPaths: [makeCosmoshubPath(0)],
            prefix: "wasm",
          }).then(async (signer) => { 
            let client = await SigningCosmWasmClient.connectWithSigner(
            IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
              signer,
              {
                prefix: "wasm",
                gasPrice: GasPrice.fromString("0.025uwasm"),
              }
            );
            setSignerAlice(signer)
            return client
            }).then(async (client) => {
              setClientAlice(client);
              console.log("Alice: ", client)
              const aliceJunoBal = await client.getBalance(Alice.address, "ujuno")
              const aliceOsmoBal = await client.getBalance(Alice.address, "uosmo")
              setAliceBalance(`ujuno: ${aliceJunoBal?.amount} uosmo: ${aliceOsmoBal?.amount}`)
            });

            await DirectSecp256k1HdWallet.fromMnemonic(Rick.mnemonic, {
              hdPaths: [makeCosmoshubPath(0)],
              prefix: "wasm",
            }).then(async (signer) => { 
              let client = await SigningCosmWasmClient.connectWithSigner(
              IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
                signer,
                {
                  prefix: "wasm",
                  gasPrice: GasPrice.fromString("0.025uwasm"),
                }
              );
              setSignerRick(signer)
              return client
              }).then(async (client) => {
                setClientRick(client);
                console.log("Rick: ", client)
                const rickJunoBal = await client.getBalance(Rick.address, "ujuno")
                const rickOsmoBal = await client.getBalance(Rick.address, "uosmo")
                setRickBalance(`ujuno: ${rickJunoBal?.amount} uosmo: ${rickOsmoBal?.amount}`)
              });
      
    }

    useEffect (() => {
      init()
    }, [])
  
    useEffect(() => {
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
  
    
    const getHeight = async () => {
      if (clientTreasury) {
        const blockInfo = await clientTreasury?.getBlock()
        setHeight(JSON.stringify({height: blockInfo?.header.height,time: new Date(blockInfo?.header.time).toLocaleString()},null,2).trim())
      }
    }
    

    const updateBalances = async () => {
      console.log("Updating balances")
      const ujunoBal = await clientTreasury?.getBalance(treasury.address, "ujuno")
      const uosmoBal = await clientTreasury?.getBalance(treasury.address, "uosmo")
      const uwasmBal = await clientTreasury?.getBalance(treasury.address, "uwasm")
      const bobJunoBal = await clientTreasury?.getBalance(Bob.address, "ujuno")
      const aliceJunoBal = await clientTreasury?.getBalance(Alice.address, "ujuno")
      const rickJunoBal = await clientTreasury?.getBalance(Rick.address, "ujuno")
      const bobOsmoBal = await clientTreasury?.getBalance(Bob.address, "uosmo")
      const aliceOsmoBal = await clientTreasury?.getBalance(Alice.address, "uosmo")
      const rickOsmoBal = await clientTreasury?.getBalance(Rick.address, "uosmo")

      setTreasuryBalance(`ujuno: ${ujunoBal?.amount} uosmo: ${uosmoBal?.amount} uwasm: ${uwasmBal?.amount}`)
      setBobBalance(`ujuno: ${bobJunoBal?.amount} uosmo: ${bobOsmoBal?.amount}`)
      setAliceBalance(`ujuno: ${aliceJunoBal?.amount} uosmo: ${aliceOsmoBal?.amount}`)
      setRickBalance(`ujuno: ${rickJunoBal?.amount} uosmo: ${rickOsmoBal?.amount}`)
    }


    const downloadTestData = () => {
      //append balances as string
      let balances = `Treasury Balance: ${treasuryBalance} \nBob Balance: ${bobBalance} \nAlice Balance: ${aliceBalance} \nRick Balance: ${rickBalance}`
      const element = document.createElement("a");
      const file = new Blob([balances, "\n\n", "Contract Config\n", configData, "\n\n", height, "\n\nLast Action:\n", lastAction, "\n\nStream Details\n", streamData, "\n\nAlice's Position\n", positionAlice, "\n\nBob's Position\n", positionBob, "\n\nRick's Position\n", positionRick], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "testData.json";
      document.body.appendChild(element);
      element.click();
    }
  
    const instantiate = async () => {
      console.log("Instantiating a new contract")
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
      console.log("Creating a new stream")
      console.log(clientTreasury)
      setLastAction("Create New Stream")
      console.log(creationDenom)
      console.log(creationFee)
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
              [coin(Number(outSupply), outDenom), coin(Number(creationFee), creationDenom)]
            )
            console.log(executeResponse)
    }
  
    const updateDistribution = async () => {
      console.log("Update Distribution Index")
      const response = await clientBob?.execute(Bob.address,
        contractAddress,
        {
          update_distribution: {
            stream_id: streamId,
          },
        },
        "auto",
      )
      console.log(response)
    }
  
    const queryStream = async () => {
      console.log("Query Stream")
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
    const finalizeStream = async () => {
      console.log("Finalize Stream")
      console.log(clientTreasury)
      setLastAction("Finalize Stream")
     const executeResponse = await clientTreasury?.execute(
        treasury.address,
        contractAddress,
        {
          finalize_stream: {
            stream_id: streamId,
            new_treasury: null
          },
        },
        "auto",
      )
      console.log(executeResponse) 
    }
  
    const queryPositionBob = async () => {
      console.log("Query Bob's Position")
      const response = await clientBob?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: Bob.address },
      })
      console.log(response)
      setPositionBob(JSON.stringify(response,undefined,2).trim())
    }
  
    const subscribeBob = async () => {
      console.log("Subscribe Bob")
      setLastAction("Subscribe Bob")
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
      console.log("Withdraw Bob")
      setLastAction("Withdraw Bob")
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

    const exitStreamBob = async () => {
      console.log("Exit Stream Bob")
      setLastAction("Exit Stream Bob")
      const executeResponse = await clientBob?.execute(
        Bob.address,
        contractAddress,
        {
          exit_stream: {
            stream_id: streamId,
            position_owner: null
          },
        },
        "auto",
        "Exit Bob",
      )
      console.log(executeResponse) 
    }
  
    const queryPositionAlice = async () => {
      console.log("Query Alice's Position")
      const response = await clientAlice?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: Alice.address },
      })
      console.log(response)
      setPositionAlice(JSON.stringify(response,undefined,2).trim())
    }
  
    const subscribeAlice = async () => {
      console.log("Subscribe Alice")
      setLastAction("Subscribe Alice")
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
      console.log("Withdraw Alice")
      setLastAction("Withdraw Alice")
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

    const exitStreamAlice = async () => {
      console.log("Exit Stream Alice")
      setLastAction("Exit Stream Alice")
      const executeResponse = await clientAlice?.execute(
        Alice.address,
        contractAddress,
        {
          exit_stream: {
            stream_id: streamId,
            position_owner: null
          },
        },
        "auto",
        "Exit Alice",
      )
      console.log(executeResponse) 
    }
  
    const queryPositionRick = async () => {
      console.log("Query Rick's Position")
      const response = await clientRick?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: Rick.address },
      })
      console.log(response)
      setPositionRick(JSON.stringify(response,undefined,2).trim())
    }
  
    const subscribeRick = async () => {
      console.log("Subscribe Rick")
      setLastAction("Subscribe Rick")
      console.log(clientRick)
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
      console.log("Withdraw Rick")
      setLastAction("Withdraw Rick")
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
   
    const exitStreamRick = async () => {
      console.log("Exit Stream Rick")
      setLastAction("Exit Stream Rick")
      const executeResponse = await clientRick?.execute(
        Rick.address,
        contractAddress,
        {
          exit_stream: {
            stream_id: streamId,
            position_owner: null
          },
        },
        "auto",
        "Exit Rick",
      )
      console.log(executeResponse) 
    }

    const testStream = async () => {
    mnemonics.map(async (mnemonic) => await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: "wasm",
    }).then(async (signer) => { 
      let client = await SigningCosmWasmClient.connectWithSigner(
      IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signer,
        {
          prefix: "wasm",
          gasPrice: GasPrice.fromString("0.025uwasm"),
        }
      );
      let address = (await signer.getAccounts())[0].address;
      return { client, address };
      }).then(async (result) => {
        let waitTime = Math.floor(Math.random() * testDuration * 60000) + 10000;
        let minutes = Math.floor(waitTime / 60000);
        let seconds = ((waitTime % 60000) / 1000).toFixed(0);
        let waitTimeFormatted = minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
        console.log("Waiting " + waitTimeFormatted + " before sending transaction")

        setTimeout(async () => {
          console.log("Sending transaction")
          const response = await result.client.execute(
            result.address,
            contractAddress,
            {
              subscribe: {
                stream_id: streamId,
                position_owner: null,
                operator: null
              },
            },
            "auto",
            "Subscribe",
            [coin(Number(1000), inDenom)]
          ).then((response) => {
          console.log(response)
          }).catch((error) => {
            console.log(error)
          }).finally(() => {
          let remainingTime = testDuration * 60000 - waitTime;
          let waitTimeFromRemaining = Math.floor(Math.random() * remainingTime) + 10000;
          let remainingMinutes = Math.floor(waitTimeFromRemaining / 60000);
          let remainingSeconds = ((waitTimeFromRemaining % 60000) / 1000).toFixed(0);
          let remainingTimeFormatted = remainingMinutes + ":" + (Number(remainingSeconds) < 10 ? '0' : '') + remainingSeconds;
          console.log("Waiting " + remainingTimeFormatted + " before sending the second transaction")
          setTimeout(async () => {
            let random = Math.floor(Math.random() * 2) + 1;
            if (random == 1) {
              console.log("Sending transaction for Subscribe")
              const res = await result.client.execute(
              result.address,
              contractAddress,
              {
                subscribe: {
                  stream_id: streamId,
                  position_owner: null,
                  operator: null
                },
              },
              "auto",
              "Subscribe",
              [coin(Number(1000), inDenom)]
            )
            console.log(res)}
            else {
              console.log("Sending transaction for Withdraw")
              const res = await result.client.execute(
                result.address,
                contractAddress,
                {
                    withdraw: {
                      stream_id: streamId,
                      cap: null,
                      position_owner: null
                    },
                },
                "auto",
                "Withdraw",
              )
              console.log(res)
            }
          }, waitTimeFromRemaining)  
        })      
        }, waitTime)
      })   
    )
  }

  const updateTestPositions = async () => {
    mnemonics.map(async (mnemonic) => await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: "wasm",
    }).then(async (signer) => { 
      let client = await SigningCosmWasmClient.connectWithSigner(
      IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signer,
        {
          prefix: "wasm",
          gasPrice: GasPrice.fromString("0.025uwasm"),
        }
      );
      let address = (await signer.getAccounts())[0].address;
      return { client, address };
      }).then(async (result) => {
          console.log("Updating position for " + result.address)
          const response = await result.client.execute(
            result.address,
            contractAddress,
            {
              update_position: {
                stream_id: streamId,
                position_owner: null,
              },
            },
            "auto",
            "Update Position",
          ).then((response) => {
          console.log(response)
          }).catch((error) => {
            console.log(error)
          })      
      })   
    )
  }

  const queryTestStreamData = async () => {
    new Promise((resolve, reject) => {
    let total = 0;
    addresses.map(async (address) => {
      const response = await clientTreasury?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: address },
      }).then((response) => {
      total += Number(response.purchased)
      console.log(response.purchased)
      return response
      }).catch((error) => {
        console.log("Position not found")
      }).finally(() => {
        setTotalPurchased(total)
      })
    })
    resolve(total)
    })
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
          <br />
          <hr className="my-2 w-3/4"/>
          <label className='mx-2 font-bold'>Treasury Balance</label>
          <span>{treasuryBalance}</span>
          <br />
          <label className='mx-2 font-bold'>Bob's Balance</label>
          <span>{bobBalance}</span>
          <br />
          <label className='mx-2 font-bold'>Alice's Balance</label>
          <span>{aliceBalance}</span>
          <br />
          <label className='mx-2 font-bold'>Rick's Balance</label>
          <span>{rickBalance}</span>
          <br />
          <button className='mx-2 border-2 mt-2 border-black' onClick={updateBalances}>Update Balances</button>
          <button className='mx-2 border-2 mt-2 border-black' onClick={getHeight}>Update Time</button>

      </div>
      <div className='ml-8 mt-20  flex flex-col'>
        <div className='top-0 absolute mt-1 '>
          {height}
          </div>

        <div className='flex flex-row mb-4'>
          <div className='w-1/3 flex flex-col'>
            <span>Contract Instantiation Parameters</span>
            
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
              <div className="flex flex-col w-full">
              <label className='mb-2'>Stream Details</label>        
              <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{streamData}</pre>
              </div>
              </div>
              <div className="flex flex-col w-full">
              <label className='mb-2 ml-2'>Contract Config</label> 
              <div className="overflow-auto p-2 mx-2 w-full text-lg text-blue-800 border-2 border-black h-full font-mono">
                <pre>{configData}</pre>
              </div>
              </div>
  
            </div>
            <div className="flex flex-row ml-4">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryStream}>Query Stream</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={updateDistribution}>Update Distribution</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={finalizeStream}>Finalize Stream</button>
              <label className='mx-4 mt-4'>Stream Id</label>
              <input className='w-24 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="Number" value={streamId} onChange={e => setStreamId(Number(e.target.value))}/>
              <button className="w-[100px] border-2 rounded-sm ml-32" onClick={downloadTestData}>Download Test Data</button>
              <span className="ml-4">(Downloads the test data currently displayed. The user is expected to update the data beforehand.)</span>
              
              <div className="flex flex-row w-full ml-64">
                <div className="flex flex-col ml-4">
                  <label className=''>Test Duration in minutes</label>
                  <input className='w-24 h-12 ml-20 border-2 border-black' type="Number" value={testDuration} onChange={e => setTestDuration(Number(e.target.value))}/>
                </div>
                <button className="w-[100px] border-2 rounded-sm ml-2" onClick={testStream}>Test Stream</button>
                <button className="w-[100px] border-2 rounded-sm ml-2" onClick={updateTestPositions}>Update Test Positions</button>
                <div className="flex flex-col ml-4">
                  <button className="w-[100px] border-2 rounded-sm ml-2" onClick={queryTestStreamData}>Query Test Data</button>
                  <span className="mt-2">Total Purchased: {totalPurchased}</span>
                </div>
              </div>
           </div>
           </div> 
        </div>  
        
        <div className="w-full flex flex-row mx-4 mb-10">
          <div className="w-full flex flex-col mr-2">
              <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{positionBob}</pre>
              </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionBob}>Query Bob's Position</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={subscribeBob}>Subscribe for Bob</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawBob}>Withdraw for Bob</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={exitStreamBob}>Exit Stream for Bob</button>
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
            <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{positionAlice}</pre>
            </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionAlice}>Query Alice's Position</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={subscribeAlice}>Subscribe for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawAlice}>Withdraw for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={exitStreamAlice}>Exit Stream for Alice</button>


              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Subscription Denom</label>
              <input className='w-12 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeDenomAlice} onChange={e => setSubscribeDenomAlice(e.target.value)}/>
              <label className='mx-4 mt-4'>Subscription Amount</label>
              <input className='w-24 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeAmountAlice} onChange={e => setSubscribeAmountAlice(e.target.value)}/>
            </div>
          </div>
          <div className="w-full flex flex-col mr-2">
            <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{positionRick}</pre>
            </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryPositionRick}>Query Rick's Position</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={subscribeRick}>Subscribe for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawRick}>Withdraw for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={exitStreamRick}>Exit Stream for Rick</button>

              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Subscription Denom</label>
              <input className='w-12 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeDenomRick} onChange={e => setSubscribeDenomRick(e.target.value)}/>
              <label className='mx-4 mt-4'>Subscription Amount</label>
              <input className='w-24 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={subscribeAmountRick} onChange={e => setSubscribeAmountRick(e.target.value)}/>
            </div>
          </div>
          
        </div>
  
      </div>
      </div>
  
    )
  }
  export default Home
  