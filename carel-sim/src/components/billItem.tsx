"use client";

import { useState } from "react";
import { Edit2, Check } from "lucide-react";

interface BillItemData {
  name: string;
  price: number;
  quantity?: number;
}

interface BillItemProps {
  index: number;
  item: BillItemData;
  selectedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onItemChange: (updatedItem: BillItemData) => void;
}

export function BillItem({ index, item, selectedQuantity, onQuantityChange, onItemChange }: BillItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toFixed(2));

  const handleNameSave = () => {
    setIsEditingName(false);
    onItemChange({ ...item, name });
  };

  const handlePriceSave = () => {
    const parsedPrice = parseFloat(price);
    if (!isNaN(parsedPrice) && parsedPrice >= 0) {
      setIsEditingPrice(false);
      onItemChange({ ...item, price: parsedPrice });
    } else {
      setPrice(item.price.toFixed(2)); // Revert on invalid input
    }
  };

  return (
    <div className="flex flex-col p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-lg w-2/3"
              autoFocus
            />
            <button
              onClick={handleNameSave}
              className="text-pastel-blue hover:text-pastel-pink"
            >
              <Check size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white">{name}</span>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-pastel-blue hover:text-pastel-pink"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
        {isEditingPrice ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-lg w-24"
              step="0.01"
              min="0"
              autoFocus
            />
            <button
              onClick={handlePriceSave}
              className="text-pastel-blue hover:text-pastel-pink"
            >
              <Check size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white">${item.price.toFixed(2)}</span>
            <button
              onClick={() => setIsEditingPrice(true)}
              className="text-pastel-blue hover:text-pastel-pink"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-300">How many?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(Math.max(0, selectedQuantity - 1))}
            className="bg-pastel-blue text-dark-bg w-10 h-10 rounded-lg flex items-center justify-center hover:bg-pastel-pink transition-colors"
            disabled={selectedQuantity <= 0}
          >
            -
          </button>
          <input
            type="number"
            value={selectedQuantity}
            onChange={(e) => {
              const qty = parseInt(e.target.value);
              if (!isNaN(qty) && qty >= 0) {
                onQuantityChange(qty);
              }
            }}
            className="bg-gray-800 text-white w-12 text-center p-2 rounded-lg"
            min="0"
          />
          <button
            onClick={() => onQuantityChange(selectedQuantity + 1)}
            className="bg-pastel-blue text-dark-bg w-10 h-10 rounded-lg flex items-center justify-center hover:bg-pastel-pink transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}