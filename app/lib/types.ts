export type TRequestContext = {
  params: {
    id: string
  }
}

export type TMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/heic'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'

export type TUploadData = {
  status: 'idle' | 'loading' | 'success' | 'error'
  res: {
    calories: number
    text: string
  }
}
