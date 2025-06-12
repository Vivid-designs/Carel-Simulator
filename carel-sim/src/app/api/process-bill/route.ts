import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

console.log("Env loaded:", process.env); // Debug all env vars
const API_KEY = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY:", API_KEY); // Debug key
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using supported model

export type BillItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type BillData = {
  items: BillItem[];
  total_amount?: number;
  serc_at_10_percent?: number;
  state_gst_at_2_5_percent?: number;
  central_gst_at_2_5_percent?: number;
  round_off?: number;
  net_amount?: number;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  const { imageData } = await req.json();

  if (!imageData) {
    return NextResponse.json({ error: "Image data is required." }, { status: 400 });
  }

  function base64ToGenerativePart(base64String: string, mimeType: string): Part {
    return {
      inlineData: {
        data: base64String.split(',')[1] || base64String,
        mimeType: mimeType,
      },
    };
  }

  try {
    const parts = [
      base64ToGenerativePart(imageData, "image/jpeg"),
      {
        text: `Analyze this restaurant bill image. Extract all item details including 'description', 'quantity', 'rate', and 'amount'. Also, extract 'total_amount', 'serc_at_10_percent', 'state_gst_at_2_5_percent', 'central_gst_at_2_5_percent', 'round_off', 'net_amount', 'restaurant_name', 'date'. Return only the raw JSON object with the structure shown below, without any additional formatting (e.g., no \`\`\`json or code blocks). Omit fields if not found, infer quantity/rate if possible, and parse numbers correctly.

        Example structure:
        // {
        //   "items": [{"description": "ITEM NAME", "quantity": 1, "rate": 100.00, "amount": 100.00}],
        //   "restaurant_name": "...",
        //   "date": "...",
        //   "total_amount": 200.00,
        //   "serc_at_10_percent": 20.00,
        //   "state_gst_at_2_5_percent": 5.00,
        //   "central_gst_at_2_5_percent": 5.00,
        //   "round_off": -0.02,
        //   "net_amount": 230.00
        // }
        `,
      },
    ];

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text().trim(); // Trim whitespace/newlines
    console.log("Gemini Raw Response Text (trimmed):", text);

    let jsonStart = text.indexOf("{");
    let jsonEnd = text.lastIndexOf("}") + 1;
    let jsonString = text.substring(jsonStart, jsonEnd); // Extract raw JSON if wrapped

    let parsedData: BillData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.log("Raw Gemini text (untrimmed):", response.text());
      return NextResponse.json({ error: "Failed to parse bill data from Gemini. Raw response was not valid JSON." }, { status: 500 });
    }

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "Failed to process bill with Gemini API." }, { status: 500 });
  }
}