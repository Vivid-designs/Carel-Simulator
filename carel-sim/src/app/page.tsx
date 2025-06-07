"use client";

import { useState } from "react";
import { UploadReceipt } from "@/components/uploadReceipt";
import { ReceiptParser } from "@/components/receiptParser";
import { BillItemsList } from "@/components/billItemsList";
import { TipSelector } from "@/components/tipSelector";
import { TotalCalculator } from "@/components/totalCalculator";
import { ShareOptions } from "@/components/shareOptions";

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

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({});
  const [tipPercentage, setTipPercentage] = useState<number>(15);

  return (
    <main className="min-h-screen flex flex-col items-center p-4">
      {!image && (
        <UploadReceipt onImageUpload={setImage} />
      )}
      {image && !bill && (
        <ReceiptParser image={image} onBillParsed={setBill} />
      )}
      {bill && (
        <div className="w-full max-w-md flex flex-col gap-6">
          <BillItemsList
            items={bill.items}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
          />
          <TipSelector
            tipPercentage={tipPercentage}
            onTipChange={setTipPercentage}
          />
          <TotalCalculator
            items={bill.items}
            selectedItems={selectedItems}
            tipPercentage={tipPercentage}
          />
          <ShareOptions
            items={bill.items}
            selectedItems={selectedItems}
            tipPercentage={tipPercentage}
          />
        </div>
      )}
    </main>
  );
}