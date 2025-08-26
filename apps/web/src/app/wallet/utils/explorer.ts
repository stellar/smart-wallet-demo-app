import { isPubnet } from 'src/helpers/environment'

export const getExplorerUrl = (transactionHash: string): string => {
  const baseUrl = isPubnet()
    ? 'https://stellar.expert/explorer/public/tx'
    : 'https://stellar.expert/explorer/testnet/tx'

  return `${baseUrl}/${transactionHash}`
}

export const openExplorer = (transactionHash: string): void => {
  const url = getExplorerUrl(transactionHash)
  window.open(url, '_blank', 'noopener,noreferrer')
}
