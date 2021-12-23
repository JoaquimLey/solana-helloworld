use anchor_lang::prelude::*;

declare_id!("5xAoCBhH8WbUiauQVyaSUorsbsfZ7VjL1oRTUeYJfb3K");

#[program]
mod gif_portal {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let my_account = &mut ctx.accounts.my_account;
        my_account.total_gifs = 0;
        Ok(())
    }

    // The function now accepts a gif_link param from the user. We also reference the user from the Context
    pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
        let my_account = &mut ctx.accounts.my_account;
        let user = &mut ctx.accounts.user;

        // Build the struct.
        let item = ItemStruct {
            gif_link: gif_link.to_string(),
            user_address: *user.to_account_info().key,
            likes: Vec::new(),
            dislikes: Vec::new(),
            total_likes: 0,
            total_dislikes: 0,
        };

        // Add it to the gif_list vector.
        my_account.gif_list.push(item);
        my_account.total_gifs += 1;
        Ok(())
    }

    pub fn like(ctx: Context<Like>, gif_link: String) -> ProgramResult {
        let my_account = &mut ctx.accounts.my_account;
        let user = &mut ctx.accounts.user;

        // Find the corresponding gif
        my_account.gif_list.iter_mut().for_each(|item| {
            if item.gif_link == gif_link {
                // Build the vote struct.
                let vote = VoteStruct {
                    gif_link: gif_link.to_string(),
                    user_address: *user.to_account_info().key,
                };
                // Add it to the vote to the item struct.
                item.likes.push(vote);
                item.total_likes += 1;
            }
        });
        Ok(())
    }
    pub fn dislike(ctx: Context<Like>, gif_link: String) -> ProgramResult {
        let my_account = &mut ctx.accounts.my_account;
        let user = &mut ctx.accounts.user;

        // Find the corresponding gif
        my_account.gif_list.iter_mut().for_each(|item| {
            if item.gif_link == gif_link {
                // Build the vote struct.
                let vote = VoteStruct {
                    gif_link: gif_link.to_string(),
                    user_address: *user.to_account_info().key,
                };
                // Add it to the vote to the item struct.
                item.dislikes.push(vote);
                item.total_dislikes += 1;
            }
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 10240)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Add the signer who calls the AddGif method to the struct so that we can save it
#[derive(Accounts)]
pub struct AddGif<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

// Add the signer who calls the Like method to the struct so that we can save it
#[derive(Accounts)]
pub struct Like<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

// Add the signer who calls the Dislike method to the struct so that we can save it
#[derive(Accounts)]
pub struct Dislike<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct MyAccount {
    pub total_gifs: u64,
    // Attach a Vector of type ItemStruct to the account.
    pub gif_list: Vec<ItemStruct>,
}

// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub gif_link: String,
    pub user_address: Pubkey,
    pub likes: Vec<VoteStruct>,
    pub dislikes: Vec<VoteStruct>,
    pub total_likes: u64,
    pub total_dislikes: u64,
}

// Create a custom struct for the vote (Like or Dislike).
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct VoteStruct {
    pub gif_link: String,
    pub user_address: Pubkey,
}
