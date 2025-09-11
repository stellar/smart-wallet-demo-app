import {
  RequestSchemaT as ClaimNftRequestSchemaT,
  ResponseSchemaT as ClaimNftResponseSchemaT,
} from 'api/embedded-wallets/use-cases/claim-nft/types'

type QueueItem<T, R> = {
  payload: T
  resolve: (result: R) => void
  reject: (error: unknown) => void
}

let mintQueue: QueueItem<ClaimNftRequestSchemaT, ClaimNftResponseSchemaT>[] = []

export function addMintRequest(payload: ClaimNftRequestSchemaT): Promise<ClaimNftResponseSchemaT> {
  return new Promise<ClaimNftResponseSchemaT>((resolve, reject) => {
    mintQueue.push({ payload, resolve, reject })
  })
}

export function flushMintQueue() {
  const queue = mintQueue
  mintQueue = [] // reset
  return queue
}
