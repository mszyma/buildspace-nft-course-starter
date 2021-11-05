import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TWITTER_HANDLE = "Donmario";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-ro2fodhlr5";
const TOTAL_MINT_COUNT = 30;

const CONTRACT_ADDRESS = "0x5EdF44f8d63bD38Ac74FbEBB3a46673da8f4540D";

const { ethereum } = window;
const rinkebyChainId = "0x4";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintedNFTs, setMintedNFTs] = useState(0);
  const [chainId, setChainId] = useState("");

  ethereum.on("chainChanged", (_chainId) => window.location.reload());

  const checkifRightNetwork = async () => {
    let chain = await ethereum.request({ method: "eth_chainId" });
    setChainId(chain);
  };

  const checkIfWalletIsConnected = async () => {
    if (!ethereum) {
      toast("Make sure you have metamask", { autoClose: false });
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("found an authorized account", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        toast("Make sure you have metamask", { autoClose: false });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
        });

        console.log("Setup event listener");
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalNFTsMintedSoFar = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        let totalNFTsMinted = await connectedContract.mintedNFTs();
        setMintedNFTs(totalNFTsMinted.toNumber());
        console.log("we have updated the amount of NFTs minted");
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        await toast.promise(await nftTxn.wait(), {
          pending: "Minting...please wait",
          success: "Your NFT is ready 👌",
          error: "Someting went wrong 🤯",
        });

        console.log(
          `Minted, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalNFTsMintedSoFar();
    checkifRightNetwork();
  }, []);

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect Wallet
    </button>
  );

  const renderMintUi = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
    </button>
  );

  return (
    <div className="App">
      <ToastContainer />
      <div className="container">
        {chainId !== rinkebyChainId ? (
          <div className="container">
            <div className="header-container">
              <p className="header gradient-text">
                Wrong chain. Please switch to Rinkeby.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="header-container">
              <p className="header gradient-text">My NFT Collection</p>
              <p className="sub-text">Each unique. Each Beatiful</p>
              {currentAccount === ""
                ? renderNotConnectedContainer()
                : renderMintUi()}
              <p className="sub-text">
                Total NFTs minted so far {mintedNFTs}/{TOTAL_MINT_COUNT}
              </p>
            </div>
            <div className="header-container">
              <button className="cta-button connect-wallet-button">
                <a target="_blank" href={OPENSEA_LINK}>
                  🌊 View Collection on OpenSea
                </a>
              </button>
            </div>
            <div className="footer-container">
              <img
                alt="Twitter Logo"
                className="twitter-logo"
                src={twitterLogo}
              />
              <a
                className="footer-text"
                href={TWITTER_LINK}
                target="_blank"
                rel="noreferrer"
              >{`built by @${TWITTER_HANDLE}`}</a>
            </div>
          </div>
        )}
        ;
      </div>
    </div>
  );
};

export default App;
