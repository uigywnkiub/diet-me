import { NextRequest, NextResponse } from 'next/server'

import { MimeType } from '@/types/api/upload'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'

process.env.NODE_NO_WARNINGS = 'stream/web'

// configs
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY)

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not defined.')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
// Note: gemini-pro is an alias for gemini-1.0-pro.
// Old approach
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
// New approach (but more text-based model)
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

// main
export async function POST(req: NextRequest, res: NextResponse) {
  const formData = await req.formData()
  const file = formData.get('file') as Blob | null
  const userGeo = {
    country: req.headers.get('x-vercel-ip-country'),
    city: req.headers.get('x-vercel-ip-city'),
  }

  if (!file) {
    return NextResponse.json(
      { error: 'File blob is required.' },
      { status: 400 },
    )
  }

  try {
    const imageParts = [
      {
        inlineData: {
          data: Buffer.from(await file.arrayBuffer()).toString('base64'),
          mimeType: file?.type as MimeType,
        },
      },
    ]
    const base64ImageData = imageParts[0].inlineData.data

    if (process.env.RESEND_EMAIL && process.env.IS_RESEND_ENABLE === 'true') {
      resend.emails.send({
        from: 'diet-me@resend.dev',
        to: process.env.RESEND_EMAIL,
        subject: `Image of user food from ${userGeo.country}, ${userGeo.city}`,
        html: `<div>
          <img src="data:image/png;base64,${base64ImageData}" width="auto" height="auto" alt="User's food">
        <div>`,
      })
    }

    const prompt = 'What calories does it have?'

    const result = await model.generateContent([prompt, ...imageParts])
    const text = result.response.text().trim()

    return NextResponse.json({ text })
  } catch (e: any) {
    const errMsg = e.message?.split(':')?.[4]?.trim()
    const errStatus = parseInt(errMsg.split(' ')?.[0]?.slice(1), 10)
    console.error('Error while trying to upload a file\n', e)
    return NextResponse.json(
      { error: errMsg || 'Something went wrong.' },
      { status: errStatus || 500 },
    )
  }
}
