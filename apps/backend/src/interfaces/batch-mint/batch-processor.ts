import { ClaimNft } from 'api/embedded-wallets/use-cases/claim-nft'

import { flushMintQueue } from './mint-queue'

// create a shared instance of your use case
const claimNft = new ClaimNft()

setInterval(async () => {
  const queue = flushMintQueue()
  if (queue.length === 0) return

  try {
    const payloads = queue.map(item => item.payload)

    // call handle ONCE with an array of payloads
    const batchResult = await claimNft.handle(payloads)

    // distribute results back
    queue.forEach((item, i) => {
      item.resolve(batchResult[i])
    })
  } catch (err) {
    queue.forEach(item => item.reject(err))
  }
  // must be greater than the blockchain block time
}, 6500)
