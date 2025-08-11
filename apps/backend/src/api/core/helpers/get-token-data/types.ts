export type TokenData = {
  symbol: string
  name: string
  description: string
  url?: string
  image?: string
  imageData?: string
  externalUrl?: string
  animationUrl?: string
  backgroundColor?: string
  namePrefix?: string
  nameSuffix?: string
  collection?: {
    name: string
    family: string
  }
  attributes?: {
    traitType: string
    value: string | number | boolean
    displayType?: string
    maxValue?: number
  }[]
  properties?: Record<
    string,
    | string
    | number
    | boolean
    | string[]
    | number[]
    | {
        type?: string
        uri?: string
        [key: string]: unknown
      }[]
  >
}
