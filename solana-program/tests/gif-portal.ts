import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { GifPortal } from '../target/types/gif_portal';
// Native program from Solana VM
const { SystemProgram } = anchor.web3;

describe('gif-portal', () => {
  console.log('🚀 Starting test...')

  // Configure the client to use the node/net defined from `solana config get`.
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);

  // Compile the program.
  const program = anchor.workspace.GifPortal as Program<GifPortal>;

  // Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate();

  it('Is initialized!', async () => {
    // Create the new account and initialize it with the program.
    const tx = await program.rpc.initialize({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount]
    });
    console.log("Program initialised with signature: ", tx);
  })

  it('Fetches gif list from account', async () => {
    // Fetch data from the account.
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('👀 Initial GIF Count', account.totalGifs.toString())
  })

  it('Adds a gif', async () => {
    // Given
    // [no setup]
    // When
    await program.rpc.addGif("insert_a_giphy_link_here", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    // Then
    console.log('👀 GIF List', account.gifList)
  })

  it('Adding a gif increments total gif count', async () => {
    // Given
    let accountBefore = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const initialCount = accountBefore.totalGifs
    console.log('🎬 Initial GIF Count', initialCount.toString())

    // When
    console.log('1️⃣  Incrementing....')
    await program.rpc.addGif("insert_another_giphy_link_here", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })

    // Then
    let accountAfter = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const currentCount = accountAfter.totalGifs
    console.log('🙌 Current GIF Count', currentCount.toString())
  })

  it('Likes a gif', async () => {
    // Given
    console.log('1️⃣  Adding test gif....')
    const gifLink = "like_giphy_link_here"
    await program.rpc.addGif(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })

    let accountBefore = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifBefore = (accountBefore.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('👀 Gif likes before: ', gifBefore.likes.map(like => like.toString()));

    // When
    console.log('👍 Liking gif...')
    const likeTx = await program.rpc.like(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })
    console.log('✅ Gif liked!', likeTx)

    // Then
    let accountCurrent = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifCurrent = (accountCurrent.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('🔥 Gif likes now: ', gifCurrent.likes.map(like => like.toString()))
  })

  it('Liking a gif increments total likes', async () => {
    // Given
    console.log('1️⃣  Adding test gif....')
    const gifLink = "like_increment_giphy_link_here"
    await program.rpc.addGif(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })

    let accountBefore = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifBefore = (accountBefore.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('👀 Total gif likes before: ', gifBefore.totalLikes.toString())

    // When
    console.log('👍 Liking gif...', gifBefore.totalLikes.toString())
    const likeTx = await program.rpc.like(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })
    console.log('✅ Gif liked!', likeTx)

    // Then
    let accountCurrent = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifCurrent = (accountCurrent.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('🔥 Total gif likes now: ', gifCurrent.totalLikes.toString())
  })


  it('Dislikes a gif', async () => {
    // Given
    console.log('1️⃣  Adding test gif....')
    const gifLink = "dislike_giphy_link_here"
    await program.rpc.addGif(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })

    let accountBefore = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifBefore = (accountBefore.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('👀 Gif dislikes before: ', gifBefore.dislikes.map(dislike => dislike.toString()));

    // When
    console.log('👎 Disliking gif...')
    const likeTx = await program.rpc.dislike(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })
    console.log('✅ Gif disliked!', likeTx)

    // Then
    let accountCurrent = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifCurrent = (accountCurrent.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('🔥 Gif dislikes now: ', gifCurrent.dislikes.map(dislike => dislike.toString()))
  })

  it('Disliking a gif increments total dislikes', async () => {
    // Given
    console.log('1️⃣  Adding test gif....')
    const gifLink = "dislike_increment_giphy_link_here"
    await program.rpc.addGif(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })

    let accountBefore = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifBefore = (accountBefore.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('👀 Total gif dislikes before: ', gifBefore.totalDislikes.toString())

    // When
    console.log('👎 Disliking gif...', gifBefore.totalLikes.toString())
    const likeTx = await program.rpc.dislike(gifLink, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })
    console.log('✅ Gif disliked!', likeTx)

    // Then
    let accountCurrent = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const gifCurrent = (accountCurrent.gifList as Array<any>).find(gif => gif.gifLink === gifLink)
    console.log('🔥 Total gif dislikes now: ', gifCurrent.totalDislikes.toString())
  })  
});
