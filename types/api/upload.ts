export type RequestContext = {
  params: {
    id: string
  }
}

export type MimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/heic'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
