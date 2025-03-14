import { NextRequest, NextResponse } from 'next/server'

import { type MimeType } from '@/types/api/upload'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'

process.env.NODE_NO_WARNINGS = 'stream/web'

const {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  RESEND_API_KEY,
  RESEND_EMAIL,
  IS_RESEND_ENABLE,
} = process.env

if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not defined.')
if (!GEMINI_MODEL) throw new Error('GEMINI_MODEL not defined.')
if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not defined.')
if (!RESEND_EMAIL) throw new Error('RESEND_EMAIL not defined.')
if (!IS_RESEND_ENABLE) throw new Error('IS_RESEND_ENABLE not defined.')

const resend = new Resend(RESEND_API_KEY)

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

export async function POST(req: NextRequest, res: NextResponse) {
  const formData = await req.formData()
  const file = formData.get('file') as Blob | null
  // Vercel geo docs: https://vercel.com/guides/geo-ip-headers-geolocation-vercel-functions
  // userGeo works on vercel prod and city may be as null.
  const userGeo = {
    country: req.headers.get('x-vercel-ip-country'),
    city: req.headers.get('x-vercel-ip-city'),
  }
  // const languageHelper = req.headers.get('accept-language') || ''
  // const preferredLanguage =
  //   languageHelper.length > 0 ? languageHelper.split(',')[0] : 'en-US'

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
          mimeType: file.type as MimeType,
        },
      },
    ]
    const base64ImageData = imageParts[0].inlineData.data

    if (RESEND_EMAIL && IS_RESEND_ENABLE === 'true') {
      resend.emails.send({
        from: 'diet-me@resend.dev',
        to: RESEND_EMAIL,
        subject: `Image of user food from ${userGeo.country}, ${userGeo.city}`,
        html: `<div>
          <img src="data:image/png;base64,${base64ImageData}" width="auto" height="auto" alt="User's food">
        <div>`,
      })
    }

    const prompt =
      'What calories does it have? Try to count or assume the approximate number value of calories. Get short info and wrap calorie number value into double asterisks.'

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
