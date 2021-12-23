/*
 * We are going to be using the useEffect hook!
 */
import { Program, Provider, web3 } from '@project-serum/anchor';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import './App.css';
import twitterLogo from './assets/twitter-logo.svg';
import idl from './idl.json';
import kp from './keypair.json';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Get the program account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = { preflightCommitment: "processed" }

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // State
  const [gifList, setGifList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);

  // Actions

  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          /*
           * The solana object gives us a function that will allow us to connect
           * directly with the user's wallet!
           */
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log('Connected with Public Key:', response.publicKey.toString());
          /*
          * Set the user's publicKey in state to be used later!
          */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Connect phantom wallet
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue('');
    } else {
      console.log('Empty input. Try again.');
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment);
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.initialize({
        accounts: {
          myAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();

    } catch (error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.addGif(inputValue, {
        accounts: {
          myAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
      // Refresh list
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  // UI Blocks
  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    }
    // Otherwise, we're good! Account exists. User can submit GIFs.
    else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input
              type="text"
              placeholder="Enter gif link!"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>

          <div className="gif-grid">
            {/* We use index as the key instead, also, the src is now item.gifLink */}
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} alt="Gif element" />
                <p className="footer-text"><span>Address: </span>{item.userAddress.toString()} </p>

                <div className='gif-item-votes-container'>
                  <div
                    className='gif-item-vote-button'
                    onClick={() => like(item)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" /><path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z" /></svg>
                    <p>{item.totalLikes.toString()}</p>
                  </div>

                  <div
                    className='gif-item-vote-button'
                    onClick={() => dislike(item)}
                  >
                    <svg
                      className='rotated'
                      xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" /><path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z" /></svg>

                    <p>{item.totalDislikes.toString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  // Effects
  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.myAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setGifList(account.gifList)

    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null);
    }
  }

  const like = async (item) => {
    try {
      console.log('Like clicked')
      if (item.userAddress.toString() === walletAddress) {
        console.log("You can't like your own gifs")
        return
      }

      if (item.likes.find(like => like.userAddress.toString() === walletAddress)) {
        console.log("You've already liked this gif")
        return
      }

      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.like(item.gifLink, {
        accounts: {
          myAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Item liked!")
      await getGifList();
    } catch (error) {
      console.log("Error in like: ", error)
    }
  }

  const dislike = async (item) => {
    try {
      console.log('Dislike clicked')
      if (item.userAddress.toString() === walletAddress) {
        console.log("You can't dislike your own gifs")
        return
      }

      if (item.dislikes.find(dislike => dislike.userAddress.toString() === walletAddress)) {
        console.log("You've already disliked this gif")
        return
      }

      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.dislike(item.gifLink, {
        accounts: {
          myAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Item disliked!")
      await getGifList();
    } catch (error) {
      console.log("Error in dislike: ", error)
    }
  }

  /*
   * Fetch the logged in wallet's gif list 
   */
  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList()
    }
  }, [walletAddress]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      {/* This was solely added for some styling fanciness */}
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">GIF's Solana Hello World</p>
          <div>
            <p className="sub-text">
              View your GIF collection in the metaverse ✨
            </p>
            <p className="footer-text">
              Open devtools to see errors and logs
            </p>
            <a
              className='footer-text'
              href="https://twitter.com/joaquimley"
              target="_blank"
              rel="noreferrer"
            >{`@JoaquimLey`}</a>
          </div>

          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
