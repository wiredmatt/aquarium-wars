import { Interface } from '@ethersproject/abi'
import { ethers } from 'ethers'

export const addressEqual = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase()
}

export const buildContract = (tokenAddress: string, abi: object, provider?) => {
  const _provider = new ethers.providers.JsonRpcProvider(null, {
    chainId: 1337,
    name: 'hardhat',
  })

  return new ethers.Contract(
    tokenAddress,
    new Interface(JSON.stringify(abi)),
    provider || _provider
  )
}

export const tokensOfOwner = async (token: ethers.Contract, account: string): Promise<string[]> => {
  const sentLogs = await token.queryFilter(token.filters.Transfer(null, account))
  const receivedLogs = await token.queryFilter(token.filters.Transfer(account, null))

  const logs = sentLogs
    .concat(receivedLogs)
    .sort((a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex)

  let owned = new Set<string>()

  for (const log of logs) {
    const { from, to, tokenId } = log.args

    if (addressEqual(account, to)) {
      owned.add(tokenId.toString())
    } else if (addressEqual(account, from)) {
      owned.delete(tokenId.toString())
    }
  }
  const ownedReturn = Array.from(owned)

  return ownedReturn
}
