// pages/api/process-bill.ts
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import type { NextApiRequest, NextApiResponse } from "next";

// Ensure your API key is in your environment variables
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // Use gemini-pro-vision for image input

type BillItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type BillData = {
  items: BillItem[];
  total_amount?: number;
  serc_at_10_percent?: number;
  state_gst_at_2_5_percent?: number;
  central_gst_at_2_5_percent?: number;
  round_off?: number;
  net_amount?: number;
  [key: string]: any; // Allow other fields like restaurant_name, bill_no, etc.
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BillData | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageData } = req.body; // Base64 encoded image data

  if (!imageData) {
    return res.status(400).json({ error: "Image data is required." });
  }

  // Convert base64 image data to a GoogleGenerativeAI Part
  function base64ToGenerativePart(base64String: string, mimeType: string): Part {
    return {
      inlineData: {
        data: base64String.split(',')[1] || base64String, // Remove "data:image/jpeg;base64," prefix if present
        mimeType: mimeType,
      },
    };
  }

  try {
    const parts = [
      base64ToGenerativePart(imageData, "image/jpeg"), // Adjust mimeType if you handle other image types
      {
        text: ` You are an AI assistant. Analyze the attached image of a restaurant bill and extract all line items as a JSON array.
      Each item should have: description, quantity, and unit price.
      If possible, also extract restaurant name and date.
      Example output:
      {
        "restaurant_name": "Example Cafe",
        "date": "2025-07-08",
        "items": [
          {"description": "Burger", "quantity": 2, "rate": 12.99},
          {"description": "Fries", "quantity": 1, "rate": 4.99}
        ]
      }
        `,
      },
    ];

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    console.log("Gemini Raw Response Text:", text); // Debugging

    // Attempt to parse the JSON output from Gemini
    let parsedData: BillData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.log("Raw Gemini text:", text);
      return res.status(500).json({ error: "Failed to parse bill data from Gemini. Raw response was not valid JSON." });
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to process bill with Gemini API." });
  }
}