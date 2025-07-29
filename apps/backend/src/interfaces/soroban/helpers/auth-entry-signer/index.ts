import { Buffer } from 'buffer'

import { authorizeEntry, hash, Keypair, xdr } from '@stellar/stellar-sdk'
import base64url from 'base64url'

import { logger } from 'config/logger'

import {
  AuthorizeEntryWithKeypairInput,
  AuthorizeEntryWithWebAuthnInput,
  GenerateWebAuthnChallengeInput,
  IAuthEntrySignerHelper,
} from './types'

export class AuthEntrySignerHelper implements IAuthEntrySignerHelper {
  /**
   * Generates a WebAuthn challenge for the given authorization entry.
   *
   * @param input - The input containing entry options.
   * @param input.entryOptions.unsignedEntry - The unsigned authorization entry.
   * @param input.entryOptions.validUntilLedgerSeq - The ledger sequence until which the signature is valid.
   * @param input.entryOptions.networkPassphrase - The network passphrase.
   * @returns A Promise that resolves to the WebAuthn challenge as a base64url string.
   * @throws An error if the challenge cannot be generated.
   */
  public async generateWebAuthnChallenge(input: GenerateWebAuthnChallengeInput): Promise<string> {
    try {
      this.logInfo('input', 'generateWebAuthnChallenge', { input })

      const {
        entryOptions: { unsignedEntry: unsignedEntry, validUntilLedgerSeq, networkPassphrase },
      } = input

      const entry = xdr.SorobanAuthorizationEntry.fromXDR(unsignedEntry.toXDR())
      const addressCredentials = entry.credentials().address()
      addressCredentials.signatureExpirationLedger(validUntilLedgerSeq)

      const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
        new xdr.HashIdPreimageSorobanAuthorization({
          networkId: hash(Buffer.from(networkPassphrase)),
          nonce: addressCredentials.nonce(),
          signatureExpirationLedger: addressCredentials.signatureExpirationLedger(),
          invocation: entry.rootInvocation(),
        })
      )
      const payload = hash(preimage.toXDR())

      this.logInfo('result', 'generateWebAuthnChallenge', { payload })
      return base64url(payload)
    } catch (error) {
      this.logError('generateWebAuthnChallenge', { error })
      throw error
    }
  }

  /**
   * Authorizes the given authorization entry with the given WebAuthn options.
   *
   * @param input - The input containing WebAuthn options and entry options.
   * @param input.webAuthnOptions - The options from WebAuthn startAuthentication response.
   * @param input.entryOptions.unsignedEntry - The unsigned authorization entry.
   * @param input.entryOptions.validUntilLedgerSeq - The ledger sequence until which the signature is valid.
   * @param input.entryOptions.networkPassphrase - The network passphrase.
   * @returns A Promise that resolves to the authorized Soroban authorization entry.
   * @throws An error if the entry cannot be authorized.
   */
  public async authorizeEntryWithWebAuthn(
    input: AuthorizeEntryWithWebAuthnInput
  ): Promise<xdr.SorobanAuthorizationEntry> {
    try {
      this.logInfo('input', 'authorizeEntryWithWebAuthn', { input })
      const {
        webAuthnOptions: { credentialId, clientDataJSON, authenticatorData, compactSignature },
        entryOptions: { unsignedEntry: unsignedEntry, validUntilLedgerSeq },
      } = input

      const entry = xdr.SorobanAuthorizationEntry.fromXDR(unsignedEntry.toXDR())
      const addressCredentials = entry.credentials().address()
      addressCredentials.signatureExpirationLedger(validUntilLedgerSeq)

      addressCredentials.signature(
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('authenticator_data'),
            val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticatorData)),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('client_data_json'),
            val: xdr.ScVal.scvBytes(base64url.toBuffer(clientDataJSON)),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('id'),
            val: xdr.ScVal.scvBytes(base64url.toBuffer(credentialId)),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('signature'),
            val: xdr.ScVal.scvBytes(compactSignature),
          }),
        ])
      )

      this.logInfo('result', 'authorizeEntryWithWebAuthn', { entry })
      return entry
    } catch (error) {
      this.logError('authorizeEntryWithWebAuthn', { error })
      throw error
    }
  }

  /**
   * Authorizes an entry using a keypair.
   *
   * @param input - The input containing keypair options and entry options.
   * @param input.keypairOptions.secret - The secret key for the keypair.
   * @param input.entryOptions.unsignedEntry - The unsigned authorization entry.
   * @param input.entryOptions.validUntilLedgerSeq - The ledger sequence until which the signature is valid.
   * @param input.entryOptions.networkPassphrase - The network passphrase.
   * @returns A Promise that resolves to the signed Soroban authorization entry.
   * @throws An error if the authorization process fails.
   */

  public async authorizeEntryWithKeypair(
    input: AuthorizeEntryWithKeypairInput
  ): Promise<xdr.SorobanAuthorizationEntry> {
    const {
      keypairOptions: { secret },
      entryOptions: { unsignedEntry, validUntilLedgerSeq, networkPassphrase },
    } = input
    try {
      this.logInfo('input', 'authorizeWithKeypair', { input })
      const keypair = Keypair.fromSecret(secret)

      const entry = await authorizeEntry(unsignedEntry, keypair, validUntilLedgerSeq, networkPassphrase)

      this.logInfo('result', 'authorizeWithKeypair', { entry })
      return entry
    } catch (error) {
      this.logError('authorizeWithKeypair', { error })
      throw error
    }
  }

  /**
   * Logs an info message for the given type.
   *
   * @param type - The type of log message.
   * @param method - The name of the method that generated the log message.
   * @param data - The data to log.
   */
  private logInfo(type: 'input' | 'result', method: string, data: Record<string, unknown>): void {
    logger.info(
      {
        ...data,
      },
      `${this.constructor.name} | ${method} | ${type === 'input' ? 'Input Received' : 'Result'}`
    )
  }

  /**
   * Logs an error message for the given method.
   *
   * @param method - The name of the method that generated the error log message.
   * @param data - The error data to log.
   */

  private logError(method: string, data: Record<string, unknown>): void {
    logger.info(
      {
        ...data,
      },
      `${this.constructor.name} | ${method} | Error`
    )
  }
}
