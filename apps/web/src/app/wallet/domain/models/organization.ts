export interface Organization {
  id: string
  name: string
  description: string
  is_active: boolean
  display_order: number
  wallet_address: string
  profile_image?: string
}
