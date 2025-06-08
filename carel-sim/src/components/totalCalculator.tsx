"use client";

import { useMemo } from "react";
import { DollarSign, RotateCcw } from "lucide-react";

interface BillItem {
  name: string;
  price: number;
  quantity?: number;
}

interface TotalCalculatorProps {
  items: BillItem[];
  selectedItems: { [key: number]: number };
  tipPercentage: number;
  onReset?: () => void; // optional reset button
}

export function TotalCalculator({
  items,
  selectedItems,
  tipPercentage,
  onReset,
}: TotalCalculatorProps) {
  const { subtotal, tip, total } = useMemo(() => {
    const subtotal = Object.entries(selectedItems).reduce((sum, [index, quantity]) => {
      const itemIndex = Number(index);
      const item = items[itemIndex];
      if (!item || quantity <= 0) return sum;
      return sum + item.price * quantity;
    }, 0);

    const tip = subtotal * (tipPercentage / 100);
    const total = subtotal + tip;

    return { subtotal, tip, total };
  }, [items, selectedItems, tipPercentage]);

  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow-lg border-0">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign size={32} className="text-pastel-blue" />
        <div>
          <h2 className="text-2xl font-semibold text-sunset">Your Share</h2>
          <p className="text-sm text-text-secondary">Here’s what you owe</p>
        </div>
        {onReset && (
          <button
            type="button"
            className="ml-auto text-text-secondary hover:text-sunset rounded-full p-2 transition"
            onClick={onReset}
            aria-label="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-lg">
          <span className="text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-400">Tip ({tipPercentage}%)</span>
          <span className="font-medium text-gray-900">${tip.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 my-2" />
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-pastel-blue">Total</span>
          <span className="text-pastel-blue">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}