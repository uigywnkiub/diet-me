process.env.NODE_NO_WARNINGS = "stream/web";
import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MimeType } from "@/types/api/upload";

// configs
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not defined.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Note: gemini-pro is an alias for gemini-1.0-pro.
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

// main
export async function POST(req: NextRequest, res: NextResponse) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob | null;

  if (!file) {
    return NextResponse.json(
      { error: "File blob is required." },
      { status: 400 }
    );
  }

  try {
    const imageParts = [
      {
        inlineData: {
          data: Buffer.from(await file.arrayBuffer()).toString("base64"),
          mimeType: file?.type as MimeType,
        },
      },
    ];
    const prompt = "What calories does it have?";

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text().trim();

    return NextResponse.json({ text });
  } catch (e: any) {
    const errMsg = e.message?.split(":")?.[4]?.trim();
    const errStatus = parseInt(errMsg.split(" ")?.[0]?.slice(1), 10);
    console.error("Error while trying to upload a file\n", e);
    return NextResponse.json(
      { error: errMsg || "Something went wrong." },
      { status: errStatus || 500 }
    );
  }
}
