"use client";

import { useState } from "react";
import { UploadReceipt } from "@/components/uploadReceipt";
import { ReceiptParser } from "@/components/receiptParser";
import { BillItemsList } from "@/components/billItemsList";
import TipSelector from "@/components/tipSelector";
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
    <main className="min-h-screen bg-neutral-bg/30 p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-sunset">Carel Simulator</h1>
          <p className="text-text-secondary">
           Jou Autisties Vriend, wat jou help om jou rekening te deel soos 'n baas!
          </p>
        </div>

        {/* Main Action Card */}
        <div className="shadow-lg border-0 rounded-2xl bg-gray-900">
          <div className="text-center pb-4 pt-6">
            <div className="text-xl font-semibold">Ready to split like a boss?</div>
          </div>
          <div className="px-4 pb-6 space-y-6">
            {!image && (
              <UploadReceipt onImageUpload={setImage} />
            )}
            {image && !bill && (
              <ReceiptParser image={image} onBillParsed={setBill} />
            )}
            {bill && (
              <div className="flex flex-col gap-6">
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
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border-0 shadow-sm bg-gray-900 rounded-xl">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-sm">Under 90s</h3>
            <p className="text-xs text-text-secondary">Lightning fast splits</p>
          </div>
          <div className="text-center p-4 border-0 shadow-sm bg-gray-900 rounded-xl">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-sm">AI Powered</h3>
            <p className="text-xs text-text-secondary">Smart receipt reading</p>
          </div>
        </div>
      </div>
    </main>
  );
}