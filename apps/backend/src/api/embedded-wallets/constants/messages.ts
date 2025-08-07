export const messages = {
  NOT_AUTHORIZED: 'You are not authorized to perform this action',
  USER_NOT_FOUND_BY_EMAIL: "We couldn't find an user with that email address",
  USER_NOT_FOUND_BY_ID: "We couldn't find an user with that id",
  USER_ALREADY_HAS_WALLET: 'You already have a wallet linked to your account',
  USER_DOES_NOT_HAVE_WALLET: 'You do not have a wallet linked to your account',
  UNKNOWN_CONTRACT_ADDRESS_CREATION_ERROR:
    'Unknown error occurred while registering your wallet. Please try again later',
  USER_DOES_NOT_HAVE_PASSKEYS: 'You do not have any passkeys registered. Try recovering your wallet',
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
}
