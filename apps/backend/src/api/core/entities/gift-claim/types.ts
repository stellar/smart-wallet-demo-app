import { GiftClaim } from './model'

export interface GiftReservationRepositoryType {
  reserveGift(giftId: string, walletAddress: string): Promise<GiftClaim | null>
}
