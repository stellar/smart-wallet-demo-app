import { NftSupply } from 'api/core/entities/nft-supply/types'
import { User } from 'api/core/entities/user/types'
import { ClaimNft } from 'api/embedded-wallets/use-cases/claim-nft'
import {
  RequestSchemaT as ClaimNftRequestSchemaT,
  ResponseSchemaT as ClaimNftResponseSchemaT,
} from 'api/embedded-wallets/use-cases/claim-nft/types'

import { flushMintQueue } from './mint-queue'

type ValidatedPayload = ClaimNftRequestSchemaT & {
  user: User
  nftSupply: NftSupply
}

type QueueItem = {
  payload: ClaimNftRequestSchemaT
  resolve: (result: ClaimNftResponseSchemaT) => void
  reject: (error: unknown) => void
}

type SuccessfulValidation = {
  item: QueueItem
  validatedPayload: ValidatedPayload
}

// create a shared instance of your use case
const claimNft = new ClaimNft()

setInterval(async () => {
  const queue = flushMintQueue()
  if (queue.length === 0) return

  let successfulValidations: SuccessfulValidation[] = []

  try {
    // Validate each payload before calling handle
    const validationResults = await Promise.allSettled(
      queue.map(async item => {
        try {
          const validatedPayload = await claimNft['validatePayload'](item.payload)
          return { item, validatedPayload }
        } catch (error) {
          item.reject(error)
          throw error
        }
      })
    )

    // Filter out failed validations and collect successful ones
    successfulValidations = validationResults
      .filter((result): result is PromiseFulfilledResult<SuccessfulValidation> => result.status === 'fulfilled')
      .map(result => result.value)

    if (successfulValidations.length === 0) {
      return // All validations failed, errors already handled
    }

    // call handle ONCE with an array of validated payloads
    const validatedPayloads = successfulValidations.map(v => v.validatedPayload)
    const batchResult = await claimNft.handle(validatedPayloads)

    // distribute results back to successful validations only
    if (Array.isArray(batchResult)) {
      successfulValidations.forEach(({ item }, i) => {
        item.resolve(batchResult[i])
      })
    } else {
      successfulValidations.forEach(({ item }) => {
        item.resolve(batchResult)
      })
    }
  } catch (err) {
    // Only reject items that haven't already been rejected during validation
    successfulValidations.forEach(({ item }) => {
      item.reject(err)
    })
  }
  // must be greater than the blockchain block time
}, 6500)
