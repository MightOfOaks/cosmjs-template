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
  
  
  const IS_TESTNET = !process.argv.includes("--mainnet");
  
  const MAINNET_RPC = "https://rpc.juno-1.deuslabs.fi";
  const TESTNET_RPC = "https://rpc-test.osmosis.zone:443";
  
  
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
  const [creationFee, setCreationFee] = useState("1000");
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [contractAddress, setcontractAddress] = useState("osmo13nzjgafq86538q8q20ejrglfk533kasnjs0jpg4fay6wth6zxmxq7szz3w");
  //state definitions for InstantiationParams
  const [stakedTokenDenom, setStakedTokenDenom] = useState("factory/osmo1r5fz6rauxgpwd9lwqae3jn4y5v5h6m0370tv7z/abc");
  const [rewardDenom, setRewardDenom] = useState("uosmo");
  const [admin, setAdmin] = useState<string | undefined>(undefined);
  //state definitions for users positions
  const [contracts , setcontracts] = useState<readonly string[]>([]);
  const [holderResponseBob , setHolderResponseBob] = useState("");
  const [holderResponseAlice , setHolderResponseAlice] = useState("");
  const [holderResponseRick , setHolderResponseRick] = useState("");
  const [stateData, setStateData] = useState("");
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
  const [codeId , setCodeId] = useState(5150);
  const [treasuryBalance , setTreasuryBalance] = useState<any>();
  const [bobBalance , setBobBalance] = useState<any>();
  const [aliceBalance , setAliceBalance] = useState<any>();
  const [rickBalance , setRickBalance] = useState<any>();
  const [lastAction , setLastAction] = useState("");
  const [testDuration , setTestDuration] = useState(30);
  const [totalPurchased , setTotalPurchased] = useState(0);
  
  //bondStake parameters
  const [bondStakeAmountBob , setbondStakeAmountBob] = useState("1");
  const [bondStakeAmountAlice , setbondStakeAmountAlice] = useState("1");
  const [bondStakeAmountRick , setbondStakeAmountRick] = useState("1");
  const [bondStakeDenomBob , setbondStakeDenomBob] = useState("factory/osmo1r5fz6rauxgpwd9lwqae3jn4y5v5h6m0370tv7z/abc");
  const [bondStakeDenomAlice , setbondStakeDenomAlice] = useState("factory/osmo1r5fz6rauxgpwd9lwqae3jn4y5v5h6m0370tv7z/abc");
  const [bondStakeDenomRick , setbondStakeDenomRick] = useState("factory/osmo1r5fz6rauxgpwd9lwqae3jn4y5v5h6m0370tv7z/abc");
  
    
    const init = async () => {
      await DirectSecp256k1HdWallet.fromMnemonic(treasury.mnemonic, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: "osmo",
      }).then(async (signer) => { 
        let client = await SigningCosmWasmClient.connectWithSigner(
        IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
          signer,
          {
            prefix: "osmo",
            gasPrice: GasPrice.fromString("0.025uosmo"),
          }
        );
        setSignerTreasury(signer)
        return client
        }).then(async (client) => {
            setClientTreasury(client);
            console.log("Treasury: ",client)
            const uosmoBal = await client.getBalance(treasury.address, "uosmo")
            setTreasuryBalance(`uosmo: ${uosmoBal?.amount}`)
            const blockInfo = await client.getBlock()
            setHeight(JSON.stringify({height: blockInfo?.header.height, time: new Date(blockInfo?.header.time).toLocaleString()},null,2).trim())      
        });

        await DirectSecp256k1HdWallet.fromMnemonic(Bob.mnemonic, {
          hdPaths: [makeCosmoshubPath(0)],
          prefix: "osmo",
        }).then(async (signer) => { 
          let client = await SigningCosmWasmClient.connectWithSigner(
          IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
            signer,
            {
              prefix: "osmo",
              gasPrice: GasPrice.fromString("0.025uosmo"),
            }
          );
          setSignerBob(signer)
          return client
          }).then(async (client) => {
            setClientBob(client);
            console.log("Bob: ", client)
            const bobOsmoBal = await client.getBalance(Bob.address, "uosmo")
            setBobBalance(`uosmo: ${bobOsmoBal?.amount}`)   
          });

          await DirectSecp256k1HdWallet.fromMnemonic(Alice.mnemonic, {
            hdPaths: [makeCosmoshubPath(0)],
            prefix: "osmo",
          }).then(async (signer) => { 
            let client = await SigningCosmWasmClient.connectWithSigner(
            IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
              signer,
              {
                prefix: "osmo",
                gasPrice: GasPrice.fromString("0.025uosmo"),
              }
            );
            setSignerAlice(signer)
            return client
            }).then(async (client) => {
              setClientAlice(client);
              console.log("Alice: ", client)
              const aliceOsmoBal = await client.getBalance(Alice.address, "uosmo")
              setAliceBalance(`uosmo: ${aliceOsmoBal?.amount}`)
            });

            await DirectSecp256k1HdWallet.fromMnemonic(Rick.mnemonic, {
              hdPaths: [makeCosmoshubPath(0)],
              prefix: "osmo",
            }).then(async (signer) => { 
              let client = await SigningCosmWasmClient.connectWithSigner(
              IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
                signer,
                {
                  prefix: "osmo",
                  gasPrice: GasPrice.fromString("0.025uosmo"),
                }
              );
              setSignerRick(signer)
              return client
              }).then(async (client) => {
                setClientRick(client);
                console.log("Rick: ", client)
                const rickOsmoBal = await client.getBalance(Rick.address, "uosmo")
                setRickBalance(`uosmo: ${rickOsmoBal?.amount}`)
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

            if(streamContracts?.length){
              setcontractAddress(streamContracts[streamContracts?.length-1])
            }
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
      const uosmoBal = await clientTreasury?.getBalance(treasury.address, "uosmo")
      const bobOsmoBal = await clientTreasury?.getBalance(Bob.address, "uosmo")
      const aliceOsmoBal = await clientTreasury?.getBalance(Alice.address, "uosmo")
      const rickOsmoBal = await clientTreasury?.getBalance(Rick.address, "uosmo")

      setTreasuryBalance(`uosmo: ${uosmoBal?.amount}`)
      setBobBalance(`uosmo: ${bobOsmoBal?.amount}`)
      setAliceBalance(`uosmo: ${aliceOsmoBal?.amount}`)
      setRickBalance(`uosmo: ${rickOsmoBal?.amount}`)
    }


    const downloadTestData = () => {
      //append balances as string
      let balances = `Treasury Balance: ${treasuryBalance} \nBob Balance: ${bobBalance} \nAlice Balance: ${aliceBalance} \nRick Balance: ${rickBalance}`
      const element = document.createElement("a");
      const file = new Blob([balances, "\n\n", "Contract Config\n", configData, "\n\n", height, "\n\nLast Action:\n", lastAction, "\n\nStream Details\n", stateData, "\n\nAlice's Holder Response\n", holderResponseAlice, "\n\nBob's Holder Response\n", holderResponseBob, "\n\nRick's Holder Response\n", holderResponseRick], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "testData.json";
      document.body.appendChild(element);
      element.click();
    }
  
    const instantiate = async () => {
      console.log("Instantiating a new contract")
      const msg = {
        staked_token_denom: stakedTokenDenom,
        reward_denom: rewardDenom,
        admin: admin,
      
    }
  
    const response = await clientTreasury?.instantiate(
      treasury.address,
      codeId,
      msg,
      'cw-share instantiation',
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
  
    const updateRewardIndex = async () => {
      console.log("Update Reward Index")
      const response = await clientTreasury?.execute(treasury.address,
        contractAddress,
        {
          update_reward_index: {},
        },
        "auto",
      )
      console.log(response)
    }
  
    const queryState = async () => {
      console.log("Query Stream")
      console.log(contractAddress)
      console.log(clientTreasury)
      const response = await clientTreasury?.queryContractSmart(
        contractAddress,
      {
        state: {},
      })
      console.log(response)
      setStateData(JSON.stringify(response,undefined,2).trim())
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
  
    const queryHolderBob = async () => {
      console.log("Query Holder for Bob")
      const response = await clientBob?.queryContractSmart(
        contractAddress,
      {
        holder: { address: Bob.address },
      })
      console.log(response)
      setHolderResponseBob(JSON.stringify(response,undefined,2).trim())
    }
  
    const bondStakeBob = async () => {
      console.log("Bond Stake Bob")
      console.log(clientBob)
      setLastAction("Bond Stake Bob")
      const response = await clientBob?.execute(Bob.address,
        contractAddress,
        {
          bond_stake: {},
        },
        "auto",
        "Bond Stake Bob",
        [coin(Number(bondStakeAmountBob), bondStakeDenomBob)]
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
            withdraw_stake: {},
          },
          "auto",
          "Withdraw Bob",
        )
        console.log(executeResponse) 
    }

    const receiveRewardBob = async () => {
      console.log("Receive Reward Bob")
      setLastAction("Receive Reward Bob")
      const executeResponse = await clientBob?.execute(
        Bob.address,
        contractAddress,
        {
          receive_reward: {},
        },
        "auto",
        "Receive Reward Bob",
      )
      console.log(executeResponse) 
    }
    
    const updateHolderRewardBob = async () => {
      console.log("Update Reward Bob")
      setLastAction("Update Reward Bob")
      const executeResponse = await clientBob?.execute(
        Bob.address,
        contractAddress,
        {
          update_holders_reward: {},
        },
        "auto",
        "Update Reward Bob",
      )
      console.log(executeResponse) 
    }
  
    const queryHolderAlice = async () => {
      console.log("Query Holder for Alice")
      const response = await clientAlice?.queryContractSmart(
        contractAddress,
      {
        holder: { address: Alice.address },
      })
      console.log(response)
      setHolderResponseAlice(JSON.stringify(response,undefined,2).trim())
    }
  
    const bondStakeAlice = async () => {
      console.log("Bond Stake Alice")
      setLastAction("Bond Stake Alice")
      const response = await clientAlice?.execute(Alice.address,
        contractAddress,
        {
          bond_stake: {},
        },
        "auto",
        "Bond Stake Alice",
        [coin(Number(bondStakeAmountAlice), bondStakeDenomAlice)]
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
            withdraw_stake: {},
          },
          "auto",
          "Withdraw Alice",
        )
        console.log(executeResponse) 
    }

    const receiveRewardAlice = async () => {
      console.log("Receive Reward Alice")
      setLastAction("Receive Reward Alice")
      const executeResponse = await clientAlice?.execute(
        Alice.address,
        contractAddress,
        {
          receive_reward: {},
        },
        "auto",
        "Receive Reward Alice",
      )
      console.log(executeResponse) 
    }

    const updateHolderRewardAlice = async () => {
      console.log("Update Reward Alice")
      setLastAction("Update Reward Alice")
      const executeResponse = await clientAlice?.execute(
        Alice.address,
        contractAddress,
        {
          update_holders_reward: {},
        },
        "auto",
        "Update Reward Alice",
      )
      console.log(executeResponse) 
    }
  
    const queryHolderRick = async () => {
      console.log("Query Holder for Rick")
      const response = await clientRick?.queryContractSmart(
        contractAddress,
      {
        holder: { address: Rick.address },
      })
      console.log(response)
      setHolderResponseRick(JSON.stringify(response,undefined,2).trim())
    }
  
    const bondStakeRick = async () => {
      console.log("Bond Stake Rick")
      setLastAction("Bond Stake Rick")
      console.log(clientRick)
      const response = await clientRick?.execute(Rick.address,
        contractAddress,
        {
          bond_stake: {},
        },
        "auto",
        "Bond Stake Rick",
        [coin(Number(bondStakeAmountRick), bondStakeDenomRick)]
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
            withdraw_stake: {},
          },
          "auto",
          "Withdraw Rick",
        )
        console.log(executeResponse) 
    }
   
    const receiveRewardRick = async () => {
      console.log("Receive Reward Rick")
      setLastAction("Receive Reward Rick")
      const executeResponse = await clientRick?.execute(
        Rick.address,
        contractAddress,
        {
          receive_reward: {},
        },
        "auto",
        "Receive Reward Rick",
      )
      console.log(executeResponse) 
    }

    const updateHolderRewardRick = async () => {
      console.log("Update Reward Rick")
      setLastAction("Update Reward Rick")
      const executeResponse = await clientRick?.execute(
        Rick.address,
        contractAddress,
        {
          update_holders_reward: {},
        },
        "auto",
        "Update Reward Rick",
      )
      console.log(executeResponse) 
    }

    const testStream = async () => {
    mnemonics.map(async (mnemonic) => await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: "osmo",
    }).then(async (signer) => { 
      let client = await SigningCosmWasmClient.connectWithSigner(
      IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signer,
        {
          prefix: "osmo",
          gasPrice: GasPrice.fromString("0.025uosmo"),
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
              bond_stake: {},
            },
            "auto",
            "Bond Stake",
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
              console.log("Sending transaction for Bond Stake")
              const res = await result.client.execute(
              result.address,
              contractAddress,
              {
                bond_stake: {},
              },
              "auto",
              "Bond Stake",
              [coin(Number(1000), inDenom)]
            )
            console.log(res)
          }
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
      prefix: "osmo",
    }).then(async (signer) => { 
      let client = await SigningCosmWasmClient.connectWithSigner(
      IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signer,
        {
          prefix: "osmo",
          gasPrice: GasPrice.fromString("0.025uosmo"),
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

  const exitStreamForAllPositions = async () => {
    mnemonics.map(async (mnemonic) => await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: "osmo",
    }).then(async (signer) => { 
      let client = await SigningCosmWasmClient.connectWithSigner(
      IS_TESTNET ? TESTNET_RPC : MAINNET_RPC,
        signer,
        {
          prefix: "osmo",
          gasPrice: GasPrice.fromString("0.025uosmo"),
        }
      );
      let address = (await signer.getAccounts())[0].address;
      return { client, address };
      }).then(async (result) => {
          console.log("Exit Stream for " + result.address)
          const response = await result.client.execute(
            result.address,
            contractAddress,
            {
              exit_stream: {
                stream_id: streamId,
                position_owner: null
              },
            },
            "auto",
            "Exit Stream",
          ).then((response) => {
          console.log(response)
          }).catch((error) => {
            console.log(error)
          })      
      })   
    )
  }

  const queryTestStreamData = async () => {
    await new Promise((resolve, reject) => {
    let total = 0;
    addresses.map(async (address) => {
      const response = await clientTreasury?.queryContractSmart(
        contractAddress,
      {
        position: { stream_id: streamId, owner: address },
      }).then((response) => {
      total += Number(response.pending_purchase)
      console.log(response.spent, response.purchased, response.spent/response.purchased*100)
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
    <div className="mx-8 bg-gradient-to-r from-blue-300 to-blue-50"> 
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
        <div className='top-0 absolute mt-1'>
          {height}
          </div>

        <div className='flex flex-row mb-4'>
          <div className='w-1/3 flex flex-col'>
            <span>Contract Instantiation Parameters</span>
            
            <label className='mt-2'>Code Id</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="Number" value={codeId} onChange={e => setCodeId(Number(e.target.value))} />
            <label className='mt-2'>Staked Token Denom</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={stakedTokenDenom} onChange={e => setStakedTokenDenom(e.target.value)} />
            <label className='mt-2'>Reward Token Denom</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={rewardDenom} onChange={e => setRewardDenom(e.target.value)} />
            <label className='mt-2'>Admin Address</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={admin} onChange={e => setAdmin(e.target.value)} />
              <button className='mt-2 border-4 border-black' onClick={instantiate}>Instantiate
              </button>
  
          </div>
            
          <div className='flex flex-col ml-4 w-full'>
          <div className='w-1/3 flex flex-col mt-6 ml-5 mb-2'>
            <label className="mt-2" > Contract adddress</label>
            <input className='w-full h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={contractAddress} onChange={e => setcontractAddress(e.target.value)} />
          </div>            
            <div className="flex flex-row mx-5 mb-10 w-3/4">
              <div className="flex flex-col w-full">
              <label className='mb-2'>Current State</label>        
              <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{stateData}</pre>
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
              <button className="w-[100px] border-2 rounded-sm" onClick={queryState}>Query State</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={updateRewardIndex}>Update Reward Index</button>
              <button className="w-[100px] border-2 rounded-sm ml-8" onClick={downloadTestData}>Download Test Data</button>
              <span className="mt-6 ml-4">(Downloads the test data currently displayed. The user is expected to update the data beforehand.)</span>
           </div>
           </div> 
        </div>  
        
        <div className="w-full flex flex-row mx-4 mb-10">
          <div className="w-full flex flex-col mr-2">
              <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{holderResponseBob}</pre>
              </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryHolderBob}>Query Holder for Bob </button>
              <button className="w-[100px] border-2 rounded-sm" onClick={bondStakeBob}>Bond Stake for Bob</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawBob}>Withdraw Stake for Bob</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={receiveRewardBob}>Receive Reward for Bob</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={updateHolderRewardBob}>Update Holder Reward for Bob</button>

              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Bond Stake Denom</label>
              <input className='w-16 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={bondStakeDenomBob} onChange={e => setbondStakeDenomBob(e.target.value)}/>
              <label className='mx-4 mt-4'>Bond Stake Amount</label>
              <input className='w-28 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={bondStakeAmountBob} onChange={e => setbondStakeAmountBob(e.target.value)}/>
            </div>
          </div>
          <div className="w-full flex flex-col mr-2">
            <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{holderResponseAlice}</pre>
            </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryHolderAlice}>Query Holder for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={bondStakeAlice}>Bond Stake for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawAlice}>Withdraw Stake for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={receiveRewardAlice}>Receive Reward for Alice</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={updateHolderRewardAlice}>Update Holder Reward for Alice</button>


              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Bond Stake Denom</label>
              <input className='w-16 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={bondStakeDenomAlice} onChange={e => setbondStakeDenomAlice(e.target.value)}/>
              <label className='mx-4 mt-4'>Bond Stake Amount</label>
              <input className='w-28 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={bondStakeAmountAlice} onChange={e => setbondStakeAmountAlice(e.target.value)}/>
            </div>
          </div>
          <div className="w-full flex flex-col mr-2">
            <div className="overflow-auto p-2 w-full text-lg text-orange-800 border-2 border-black h-full font-mono">
                <pre>{holderResponseRick}</pre>
            </div>
            <div className="flex flex-row">
              <button className="w-[100px] border-2 rounded-sm" onClick={queryHolderRick}>Query Holder for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={bondStakeRick}>Bond Stake for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={withdrawRick}>Withdraw Stake for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={receiveRewardRick}>Receive Reward for Rick</button>
              <button className="w-[100px] border-2 rounded-sm" onClick={updateHolderRewardRick}>Update Holder Reward for Rick</button>


              {/* <button title="Withdraw" onClick={withdrawBob}/>
              <button title="Exit Stream" onClick={exitBob}/> */}
            </div>
            <div className="mt-2 flex flex-row">
              <label className='mx-4 mt-4'>Bond Stake Denom</label>
              <input className='w-16 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={bondStakeDenomRick} onChange={e => setbondStakeDenomRick(e.target.value)}/>
              <label className='mx-4 mt-4'>Bond Stake Amount</label>
              <input className='w-28 h-12 border-2 border-black overflow-scroll overflow-x-auto' type="text" value={bondStakeAmountRick} onChange={e => setbondStakeAmountRick(e.target.value)}/>
            </div>
          </div>
          
        </div>
        <label className='mt-2 underline'>Contracts instantiated with the Code Id of {codeId}</label>
              {contracts.map((contract, index) => (
                <div key={index}>
                  <span className="text-lg">{contract}</span>
                </div>
              ))}
  
      </div>
      </div>
  
    )
  }
  export default Home
  