import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/IndulgencePortal.json';
import moment from 'moment';

export default function App() {
  const contractAddress = '0xd0B887FB8CB6afaB332161fAc8C1B99956e153a6';
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState('');
  const [mining, setMining] = useState(false);
  const [sin, setSin] = useState('');
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
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object');
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const acc = accounts[0];
        console.log('Found an authorized account:', acc);
        getAllSinners();
      } else {
        console.log('No authorized account found');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Install Metamask');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setCurrentAccount(accounts[0]);
      getAllSinners();
    } catch (err) {
      console.log(err);
    }
  };

  const transformAddress = (str) => {
    return `${str.substring(0, 6)}...${str.substring(
      str.length - 6,
      str.length
    )}`;
  };

  const getAllSinners = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const indulgencePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const sins = await indulgencePortalContract.getAllSins();
        var addSins = [];
        for (var i = 0; i < sins.message.length; i++) {
          addSins.push({
            address: transformAddress(sins.sinner[i]),
            message: sins.message[i],
            timestamp: sins.timestamp[i],
          });
        }
        addSins.sort((a, b) => b.timestamps - a.timestamps);
        setSinners(addSins);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const submitSin = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const indulgencePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const indulgeTxn = await indulgencePortalContract.indulgeTheSin(sin);
        setMining(true);
        setSin('');
        await indulgeTxn.wait();
        setMining(false);
        getAllSinners();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="container flex flex-wrap justify-center max-w-md">
        <h1 className="text-center">Come and tell us your sins!</h1>
        {!currentAccount ? (
          <button
            onClick={connectWallet}
            className="group relative w-full flex justify-center py-2  border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-500"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <textarea
              value={sin}
              onChange={(s) => setSin(s.target.value)}
              id="sin-text"
              className="form-textarea w-80 px-3 py-2 text-gray-700 border shadow-sm -space-y-px rounded-lg focus:outline-none"
              rows="4"
            ></textarea>
            <button
              onClick={submitSin}
              disabled={mining}
              className="group relative w-full flex justify-center py-2 my-8 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-500"
            >
              Indulge your sin
            </button>
          </>
        )}
      </div>
      <table className="table-auto rounded-t-lg m-5 w-5/6 mx-auto bg-gray-300 text-gray-900">
        <thead>
          <tr className="text-center border-b-2 border-gray-300">
            <th className="w-1/5 px-4 py-3 border-r-2 border-gray-400">
              Sinner
            </th>
            <th className="w-3/5 px-4 py-3 border-r-2 border-gray-400">
              Confession
            </th>
            <th className="px-4 py-3">Occured</th>
          </tr>
        </thead>
        <tbody>
          {sinners.map((sinner, index) => {
            return (
              <tr key={index} className="bg-gray-100 border-b border-gray-500">
                <td className="px-4 py-3 border-r-2 border-gray-400 text-center">
                  {sinner.address}
                </td>
                <td className="px-4 break-all py-3 text-center border-r-2 border-gray-400">
                  {sinner.message}
                </td>
                <td className="px-4 py-3 text-center">
                  {moment(sinner.timestamp).fromNow()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
