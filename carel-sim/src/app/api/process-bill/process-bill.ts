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

export type BillItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type BillDetails = BillData; // If you want to export BillData as BillDetails

type BillData = {
  items: BillItem[];
  total_amount?: number;
  serc_at_10_percent?: number;
  state_gst_at_2_5_percent?: number;
  central_gst_at_2_5_percent?: number;
  round_off?: number;
  net_amount?: number;
  [key: string]: unknown; // Allow other fields like restaurant_name, bill_no, etc.
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
        text: `Analyze this restaurant bill image. Extract all item details including 'description', 'quantity', 'rate', and 'amount'. Also, extract the 'total_amount', 'serc_at_10_percent', 'state_gst_at_2_5_percent', 'central_gst_at_2_5_percent', 'round_off', and 'net_amount'. If available, also extract 'restaurant_name', 'address', 'bill_no', 'date', 'time', 'table_no', and 'covers'.
        
        Format the output as a JSON object, strictly following this structure. If a field is not found, omit it from the JSON. For items, if quantity or rate is missing, infer them if possible or set to null/0. Ensure numerical values are parsed correctly.

        Example JSON structure (do not include example, just produce the data):
        {
          "restaurant_name": "...",
          "address": "...",
          "bill_no": "...",
          "date": "...",
          "time": "...",
          "table_no": "...",
          "covers": "...",
          "items": [
            {
              "description": "ITEM NAME",
              "quantity": 1,
              "rate": 100.00,
              "amount": 100.00
            },
            {
              "description": "ANOTHER ITEM",
              "quantity": 2,
              "rate": 50.00,
              "amount": 100.00
            }
          ],
          "total_amount": 200.00,
          "serc_at_10_percent": 20.00,
          "state_gst_at_2_5_percent": 5.00,
          "central_gst_at_2_5_percent": 5.00,
          "round_off": -0.02,
          "net_amount": 230.00
        }
        `,
      },
    ];

    const result = await model.generateContent( parts);
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