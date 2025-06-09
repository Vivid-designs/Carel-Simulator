// app/api/process-bill/route.ts
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

function base64ToGenerativePart(base64String: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64String.split(',')[1] || base64String,
      mimeType: mimeType,
    },
  };
}

export async function POST(req: Request) {
  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return new Response(JSON.stringify({ error: "Image data is required." }), { status: 400 });
    }

    const parts = [
      base64ToGenerativePart(imageData, "image/jpeg"),
      {
        text: `Analyze this restaurant bill image. Extract all item details including 'description', 'quantity', 'rate', and 'amount'. Also, extract the 'total_amount', 'serc_at_10_percent', 'state_gst_at_2_5_percent', 'central_gst_at_2_5_percent', 'round_off', and 'net_amount'. If available, also extract 'restaurant_name', 'address', 'bill_no', 'date', 'time', 'table_no', and 'covers'.
        
        Format the output strictly as a JSON object. If a field is not found, omit it from the JSON. For items, if quantity or rate is missing, infer them if possible or set to null/0. Ensure numerical values are parsed correctly.
        `,
      },
    ];

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    console.log("Gemini Raw Response Text:", text);

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.log("Raw Gemini text:", text);
      return new Response(JSON.stringify({ error: "Failed to parse bill data from Gemini. Raw response was not valid JSON." }), { status: 500 });
    }

    return new Response(JSON.stringify(parsedData), { status: 200 });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return new Response(JSON.stringify({ error: "Failed to process bill with Gemini API." }), { status: 500 });
  }
}