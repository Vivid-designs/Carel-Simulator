"use client";

import { useMemo } from "react";
import { DollarSign } from "lucide-react";

interface BillItem {
  name: string;
  price: number;
  quantity?: number;
}

interface TotalCalculatorProps {
  items: BillItem[];
  selectedItems: { [key: number]: number };
  tipPercentage: number;
}

export function TotalCalculator({ items, selectedItems, tipPercentage }: TotalCalculatorProps) {
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
    <div className="w-full max-w-md bg-dark-surface rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-pastel-green" />
        Your Share
      </h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-lg">
          <span className="text-gray-300">Subtotal</span>
          <span className="text-white">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-300">Tip ({tipPercentage}%)</span>
          <span className="text-white">${tip.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-semibold mt-2 border-t border-gray-700 pt-2">
          <span className="text-pastel-blue">Total</span>
          <span className="text-pastel-blue">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}