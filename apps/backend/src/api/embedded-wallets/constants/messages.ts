export const messages = {
  NOT_AUTHORIZED: 'You are not authorized to perform this action',
  USER_NOT_FOUND_BY_EMAIL: "We couldn't find an user with that email address",
  USER_NOT_FOUND_BY_ID: "We couldn't find an user with that id",
  USER_ALREADY_HAS_WALLET: 'You already have a wallet linked to your account',
  USER_DOES_NOT_HAVE_WALLET: 'You do not have a wallet linked to your account',
  UNKNOWN_CONTRACT_ADDRESS_CREATION_ERROR:
    'Unknown error occurred while registering your wallet. Please try again later',
  USER_DOES_NOT_HAVE_PASSKEYS: 'You do not have any passkeys registered. Try recovering your wallet',
  USER_DOES_NOT_HAVE_ENOUGH_BALANCE: 'You do not have enough balance for this transaction. Try adding some balance',
  UNABLE_TO_COMPLETE_PASSKEY_REGISTRATION:
    "We couldn't complete your passkey registration. Try again or use a different device",
  UNABLE_TO_COMPLETE_PASSKEY_AUTHENTICATION: "We couldn't verify your passkey. Please try again later",
  ALREADY_SENT_RECOVERY_LINK: 'A recovery link has already been sent. Check your email or try again shortly',
  RECOVERY_LINK_EXPIRED: 'The recovery link has expired. Try again or request a new one',
  RECOVERY_LINK_PROVIDED_NOT_FOUND: 'The recovery link you provided is invalid or has already been used',
  RESEND_INVITE_CONFLICT:
    "You're not eligible to create a wallet right now. Make sure your email is registered or the account hasn't been deployed yet",
  UNABLE_TO_EXECUTE_TRANSACTION: 'This transaction could not be executed. You may not have permission.',
  UNABLE_TO_FIND_SOROBAN_CUSTOM_METADATA:
    "Something went wrong and we couldn't find your transaction. Please start over to try again",
  UNABLE_TO_FIND_ASSET_OR_CONTRACT: "We couldn't find the asset or contract for this transaction.",
  AIRDROP_PROOF_NOT_FOUND: 'You are not eligible for this airdrop or the proof could not be found.',
  AIRDROP_ALREADY_CLAIMED: 'This airdrop has already been claimed for your address.',
  UNABLE_TO_EXECUTE_AIRDROP_CLAIM: 'The airdrop claim could not be executed. Please try again later.',
  NFT_NOT_FOUND_FOR_THE_USER: "We couldn't find that NFT associated with the user",
  NFT_SUPPLY_NOT_FOUND: "We couldn't find any NFT with that resource or collection",
  NFT_SUPPLY_NOT_ENOUGH: 'Insufficient NFT supply with that resource or collection',
  NFT_ALREADY_OWNED_BY_USER: 'You already have this NFT owned or minted to your account',
  UNABLE_TO_MINT_NFT:
    "We couldn't mint the NFT to your account. You may not have permission or the supply is not enough.",
  UNABLE_TO_SAVE_NFT_TO_USER: "We couldn't create or save the NFT to user account. Please try again later.",
  UNABLE_TO_DELETE_USER_NFT: "We couldn't delete the NFT from your account. Please try again later.",
  UNABLE_TO_UPDATE_NFT_SUPPLY: "We couldn't update the NFT supply.",
  GIFT_NOT_ELIGIBLE: 'Gift ID is not eligible for claiming',
  GIFT_ALREADY_CLAIMED_BY_ANOTHER_ADDRESS: 'Gift has already been claimed by another address',
  GIFT_PROOF_NOT_FOUND: 'Gift proof not found for your address',
  GIFT_ALREADY_CLAIMED: 'Gift has already been claimed and cannot be claimed again',
  UNABLE_TO_FIND_GIFT_PRODUCT: 'There is no gift available',
  UNABLE_TO_EXECUTE_GIFT_CLAIM: 'Unable to execute gift claim transaction',
  USER_SWAG_ALREADY_CLAIMED_OR_NOT_AVAILABLE:
    'The swag you are trying to claim has already been claimed or is not available',
  UNABLE_TO_EXECUTE_ROTATE_SIGNER: 'Unable to execute rotate signer transaction',
}
