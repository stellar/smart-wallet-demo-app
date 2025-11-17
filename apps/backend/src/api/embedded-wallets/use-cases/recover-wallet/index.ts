import { Keypair, rpc, xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { buildTx } from 'api/core/helpers/build-tx'
import WebAuthnRegistration from 'api/core/helpers/webauthn/registration'
import { IWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/types'
import OtpRepository from 'api/core/services/otp'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { getValueFromEnv } from 'config/env-utils'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { generateToken } from 'interfaces/jwt'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType } from 'interfaces/sdp-embedded-wallets/types'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WalletBackendType } from 'interfaces/wallet-backend/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/recover/complete'

export class RecoverWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private otpRepository: OtpRepositoryType
  private webauthnRegistrationHelper: IWebAuthnRegistration
  private sorobanService: ISorobanService
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType
  private walletBackend: WalletBackendType
  private recoverySignerCosigner: Keypair

  constructor(
    otpRepository?: OtpRepositoryType,
    webauthnRegistrationHelper?: IWebAuthnRegistration,
    sorobanService?: ISorobanService,
    sdpEmbeddedWallets?: SDPEmbeddedWalletsType,
    walletBackend?: WalletBackendType,
    recoverySignerCosigner?: Keypair
  ) {
    super()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
    this.webauthnRegistrationHelper = webauthnRegistrationHelper || WebAuthnRegistration.getInstance()
    this.sorobanService =
      sorobanService ||
      SorobanService.getInstance({
        publicKey: getValueFromEnv('RECOVERY_SIGNER_MASTER_PUBLIC_KEY'),
      })
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
    this.recoverySignerCosigner =
      recoverySignerCosigner || Keypair.fromSecret(getValueFromEnv('RECOVERY_COSIGNER_PRIVATE_KEY'))
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const requestBody = {
      ...validatedData,
    }

    // Check if OTP exists
    const otp = await this.otpRepository.getOtpByCode(requestBody.code, { relations: ['user', 'user.passkeys'] })
    if (!otp) {
      throw new ResourceNotFoundException(messages.RECOVERY_LINK_PROVIDED_NOT_FOUND)
    }

    if (!otp.user.contractAddress) throw new BadRequestException(messages.USER_DOES_NOT_HAVE_WALLET)

    // Check auth challenge resolution
    const challengeResult = await this.webauthnRegistrationHelper.complete({
      user: otp.user,
      registrationResponseJSON: requestBody.registration_response_json,
    })

    if (!challengeResult) throw new UnauthorizedException(messages.UNABLE_TO_COMPLETE_PASSKEY_REGISTRATION)

    // Map new signer public key as Stellar value
    const newSignerPublicKey = ScConvert.hexPublicKeyToScVal(challengeResult.passkey.credentialHexPublicKey)

    // Handle 'rotate_signer' transaction
    await this.handleRotateSignerTx(otp.user.contractAddress, newSignerPublicKey)

    // Generate JWT token
    const authToken = generateToken(otp.user.userId, otp.user.email)

    return {
      data: {
        token: authToken,
      },
      message: 'Wallet recovery completed successfully',
    }
  }

  private async handleRotateSignerTx(contractAddress: string, newSignerPublicKey: xdr.ScVal): Promise<void> {
    // Simulate 'rotate_signer' transaction
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: contractAddress,
      method: 'rotate_signer',
      args: [newSignerPublicKey],
    })

    // Build transaction
    const builtTx = await buildTx({
      tx,
      simulationResponse,
      walletBackend: this.walletBackend,
    })

    // Sign transaction with recovery cosigner
    builtTx.sign(this.recoverySignerCosigner)

    // Cosign recovery with SDP
    const { transaction_xdr: signedXdr } = await this.sdpEmbeddedWallets.cosignRecovery(
      contractAddress,
      builtTx.toXDR()
    )

    // Wrap the transaction in a fee bump transaction
    const feeBumpedTxResponse = await this.walletBackend.createFeeBumpTransaction({
      transaction: signedXdr,
    })

    // Send the final XDR transaction
    const txResponse = await this.sorobanService.sendTransaction(feeBumpedTxResponse.transaction)

    if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_ROTATE_SIGNER)
    }
  }
}

export { endpoint }
