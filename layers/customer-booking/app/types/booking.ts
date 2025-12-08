export interface SlotItem {
  id: string
  label?: string
  value?: string
  color?: string
}

export interface LocationData {
  id: string
  teamId: string
  owner: string
  title: string
  street?: string | null
  zip?: string | null
  city?: string | null
  location?: string | null
  content?: string | null
  allowedMemberIds?: string | string[] | null
  slots?: SlotItem[] | string | null
  createdAt?: string | Date
  updatedAt?: string | Date
  createdBy?: string
  updatedBy?: string
}
