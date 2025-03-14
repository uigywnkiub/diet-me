// // THIS CODE WORKS ONLY LOCALLY AND ADDITIONALLY STORES USER IMAGES BUT DOES NOT WORK SERVERLESS FUNCTIONS LIKE VERCEL, OR AMAZON...
// // USER IMAGES STORES IN /public/uploads FOLDER ON EACH REQUEST TIME

// Temp plug to keep the route to avoid build error.
export async function POST() {}

// import { NextRequest, NextResponse } from 'next/server'

// import type { MimeType, RequestContext } from '@/types/api/upload'
// import { GoogleGenerativeAI } from '@google/generative-ai'
// import * as dateFn from 'date-fns'
// import fs from 'fs'
// import mime from 'mime'
// import path from 'path'

// const { GEMINI_API_KEY, GEMINI_MODEL } = process.env

// if (!GEMINI_API_KEY) {
//   throw new Error('GEMINI_API_KEY environment variable is not defined.')
// }
// if (!GEMINI_MODEL) {
//   throw new Error('GEMINI_MODEL environment variable is not defined.')
// }

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
// const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

// async function fileToGenerativePart(pathName: string, mimeType: MimeType) {
//   return {
//     inlineData: {
//       data: Buffer.from(fs.readFileSync(path.resolve(pathName))).toString(
//         'base64',
//       ),
//       mimeType,
//     },
//   }
// }

// function generateRandomFilename(file: Blob, uniqueSuffix: string) {
//   const extension = mime.getExtension(file.type)
//   const randomString = Math.random().toString(36).substring(2, 15)

//   return `${randomString}-${uniqueSuffix}.${extension}`
// }

// function generateRandomUniqueSuffix(numberLimit: number = 1e4): string {
//   const timestamp = Date.now()
//   const randomNumber = Math.round(Math.random() * numberLimit)

//   return `${timestamp}-rand(${randomNumber})`
// }

// function generateFilename(file: Blob, uniqueSuffix: string): string {
//   const extension = mime.getExtension(file.type)

//   let filename: string
//   if (file instanceof File && file.name) {
//     filename = file.name.replace(/\.[^/.]+$/, '')
//   } else {
//     filename = generateRandomFilename(file, uniqueSuffix)
//   }

//   return `${filename}-${uniqueSuffix}.${extension}`
// }

// export async function POST(req: NextRequest, ctx: RequestContext) {
//   const formData = await req.formData()
//   const file = formData.get('file') as Blob | null

//   if (!file) {
//     return NextResponse.json(
//       { error: 'File blob is required.' },
//       { status: 400 },
//     )
//   }

//   const buffer = Buffer.from(await file.arrayBuffer())
//   const relativeUploadDir = `/uploads/${dateFn.format(Date.now(), 'dd-MM-y')}`
//   // const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);
//   const uploadDir = path.join(process.cwd(), 'public', 'uploads')

//   try {
//     fs.statSync(uploadDir)
//     // if (!fs.existsSync(uploadDir)) {
//     //   fs.mkdirSync(uploadDir, { recursive: true });
//     // }
//   } catch (e: any) {
//     if (e.code === 'ENOENT') {
//       // await fs.mkdir(uploadDir, { recursive: true });
//       fs.mkdirSync(uploadDir, { recursive: true })
//     } else {
//       console.error(
//         'Error while trying to create directory when uploading a file\n',
//         e,
//       )
//       return NextResponse.json(
//         { error: 'Something went wrong.' },
//         { status: 500 },
//       )
//     }
//   }

//   try {
//     const uniqueSuffix = generateRandomUniqueSuffix()
//     const filename = generateFilename(file, uniqueSuffix)
//     // await fs.writeFile(`${uploadDir}/${filename}`, buffer);
//     // const filePath = `public${relativeUploadDir}/${filename}`;
//     const filePath = path.join(uploadDir, filename)

//     fs.writeFileSync(filePath, buffer)

//     const prompt = 'What calories does it have?'
//     const imageParts = [
//       await fileToGenerativePart(filePath, file?.type as MimeType),
//     ]

//     const result = await model.generateContent([prompt, ...imageParts])
//     const text = result.response.text().trim()
//     return NextResponse.json({ text })
//   } catch (e: any) {
//     // let errMsg, errStatus;
//     const errMsg = e.message.split(':')?.[4]?.trim()
//     const errStatus = parseInt(errMsg.split(' ')?.[0]?.slice(1), 10)
//     console.error('Error while trying to upload a file\n', e)
//     return NextResponse.json(
//       { error: errMsg || 'Something went wrong.' },
//       { status: errStatus || 500 },
//     )
//   }
// }
