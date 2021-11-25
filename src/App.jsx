import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/IndulgencePortal.json';

export default function App() {

  const contractAddress = "0xbE443BafF080451595C431d9b9ba3D41F20b2312";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");
  const [mining, setMining] = useState(false);
  const [sin, setSin] = useState("");
  const [sinners, setSinners] = useState([]);


  useEffect(async () => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try {
      var { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object");
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const acc = accounts[0];
        console.log("Found an authorized account:", acc);
        getAllSinners();
      } else {
        console.log("No authorized account found");
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Install Metamask");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      getAllSinners();
    } catch (err) {
      console.log(err);
    }
  }


  const getAllSinners = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const indulgencePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const sins = await indulgencePortalContract.getAllSins();
        const addSins = [];
        for (var i = 0; i < sins.users.length; i++) {
          let newSin = {
            from: sins.users[i],
            timestamp: new Date(sins.timestamps[i] * 1000),
            message: sins.messages[i]
          }
          addSins.push(newSin);
        }
        addSins.sort((a, b) => b.timestamps - a.timestamps);
        setSinners(addSins);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (err) {
      console.log(err);
    }

  }

  const submitSin = async () => {
    event.preventDefault();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const indulgencePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const indulgeTxn = await indulgencePortalContract.indulgeTheSin(sin);
        console.log("Mining...", indulgeTxn.hash);
        setMining(true);
        await indulgeTxn.wait();
        setMining(false);
        console.log("Mined -- ", indulgeTxn.hash);
        setSin("");
        getAllSinners();
      }
      else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <div className="container flex flex-wrap justify-center max-w-md">
      <h1 className="text-center">
        Come and tell us your sins!
      </h1>
      {!currentAccount ? (
        <button
          onClick={connectWallet} className="group relative w-full flex justify-center py-2  border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-500">
          Connect Wallet
        </button>
      ) : (<>
        <textarea value={sin} onChange={(s) => setSin(s.target.value)} id="sin-text" className="form-textarea w-80 px-3 py-2 text-gray-700 border shadow-sm -space-y-px rounded-lg focus:outline-none" rows="4" >
        </textarea>
        <button onClick={submitSin} disabled={mining} className="group relative w-full flex justify-center py-2 my-8 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-500">
          Indulge your sin
        </button>
      </>
        )}



    </div>
  );
}
