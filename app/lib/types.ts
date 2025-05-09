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
    protein: number
    fat: number
    carbohydrates: number
    text: string
  }
}

export type TMacrosData = Omit<TUploadData['res'], 'text'>
