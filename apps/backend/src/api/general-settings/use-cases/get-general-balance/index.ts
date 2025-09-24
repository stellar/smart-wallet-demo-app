/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from 'express'
import { IsNull, Not } from 'typeorm'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { getWalletBalance } from 'api/core/helpers/get-balance'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { sleep } from 'api/core/utils/sleep'

import { ResponseSchemaT } from './types'

const endpoint = '/general-balance'

export class GetGeneralBalance extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType

  constructor(userRepository?: UserRepositoryType) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle() {
    const users = await this.userRepository.getUsers({
      where: { contractAddress: Not(IsNull()) },
    })

    // Chunk addresses to make batch requests
    const batches = chunk(
      users.filter(u => u.contractAddress).map(u => u.contractAddress),
      50
    ) as string[][]

    const balances = new Map()
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]

      try {
        const batchResults = await processParallel(batch)
        for (const [addr, balance] of batchResults) {
          balances.set(addr, balance)
        }
      } catch {
        // Fallback to sequential processing in case of failure
        for (const addr of batch) {
          try {
            const balance = await getWalletBalance({
              userContractAddress: addr,
            })
            balances.set(addr, balance)
            await sleep(50)
          } catch {
            balances.set(addr, 0n)
          }
        }
      }
    }

    return {
      data: users.map(u => ({
        address: u.contractAddress!,
        balance: balances.get(u.contractAddress!) || 0,
        email: u.email,
      })),
      message: 'Balances fetched successfully',
    }
  }
}

async function processParallel(addresses: string[]) {
  const results = new Map()
  let activeRequests = 0

  const processOne = async (address: string) => {
    while (activeRequests >= 8) await sleep(50)
    activeRequests++

    try {
      const balance = await getWalletBalance({
        userContractAddress: address,
      })
      results.set(address, balance)
      await sleep(10)
    } finally {
      activeRequests--
    }
  }

  await Promise.all(addresses.map(processOne))
  return results
}

const chunk = (arr: unknown[], size: number): unknown[][] => {
  const chunks: unknown[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export { endpoint }
