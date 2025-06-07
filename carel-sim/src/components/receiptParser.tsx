"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

interface BillItem {
  name: string;
  price: number;
  quantity?: number;
}

interface Bill {
  items: BillItem[];
  subtotal: number;
  tax?: number;
  total: number;
}

interface ReceiptParserProps {
  image: File;
  onBillParsed: (bill: Bill) => void;
}

export function ReceiptParser({ image, onBillParsed }: ReceiptParserProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function parseReceipt() {
      try {
        const { data: { text } } = await Tesseract.recognize(image, 'eng');
        const lines = text.split('\n').filter(line => line.trim() && !/^\s*$/.test(line));
        
        // Simple parsing logic (improve based on testing)
        const items: BillItem[] = [];
        let subtotal = 0;
        let total = 0;

        lines.forEach(line => {
          // Skip subtotal/tax/total lines
          if (/subtotal|tax|total/i.test(line)) {
            const match = line.match(/(\d+\.\d{2})/);
            if (match) {
              if (/subtotal/i.test(line)) subtotal = parseFloat(match[1]);
              if (/total/i.test(line)) total = parseFloat(match[1]);
            }
            return;
          }

          // Parse item lines (e.g., "Burger 12.99" or "2 Burger 25.98")
          const match = line.match(/(\d+)?\s*([^\d]+)\s+(\d+\.\d{2})/);
          if (match) {
            const [, qty, name, price] = match;
            items.push({
              name: name.trim(),
              price: parseFloat(price),
              quantity: qty ? parseInt(qty) : 1,
            });
          }
        });

        onBillParsed({ items, subtotal, total });
      } catch (error) {
        console.error("OCR failed:", error);
        onBillParsed({ items: [], subtotal: 0, total: 0 }); // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    parseReceipt();
  }, [image, onBillParsed]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-md">
      <p className="text-pastel-green text-lg">Scanning your receipt...</p>
    </div>
  );
}