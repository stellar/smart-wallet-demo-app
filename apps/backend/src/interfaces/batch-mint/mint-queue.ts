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

export function addMintRequest<T, R>(payload: T): Promise<R> {
  return new Promise((resolve, reject) => {
    mintQueue.push({ payload, resolve, reject })
  })
}

export function flushMintQueue() {
  const queue = mintQueue
  mintQueue = [] // reset
  return queue
}
