"use client";

import { useState } from "react";
import { BillItem } from "./billItem";
import { Plus } from "lucide-react";

interface BillItemData {
  name: string;
  price: number;
  quantity?: number;
}

interface BillItemsListProps {
  items: BillItemData[];
  selectedItems: { [key: number]: number };
  onSelectionChange: (selected: { [key: number]: number }) => void;
}

export function BillItemsList({ items, selectedItems, onSelectionChange }: BillItemsListProps) {
  const [editableItems, setEditableItems] = useState<BillItemData[]>(items);

  const handleItemChange = (index: number, updatedItem: BillItemData) => {
    const newItems = [...editableItems];
    newItems[index] = updatedItem;
    setEditableItems(newItems);
  };

  const handleAddItem = () => {
    setEditableItems([...editableItems, { name: "New Item", price: 0, quantity: 1 }]);
  };

  return (
    <div className="w-full max-w-md bg-dark-surface rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Pick what you had</h2>
      <div className="flex flex-col gap-2">
        {editableItems.map((item, index) => (
          <BillItem
            key={index}
            index={index}
            item={item}
            selectedQuantity={selectedItems[index] || 0}
            onQuantityChange={(qty) =>
              onSelectionChange({ ...selectedItems, [index]: qty })
            }
            onItemChange={(updatedItem) => handleItemChange(index, updatedItem)}
          />
        ))}
      </div>
      <button
        onClick={handleAddItem}
        className="mt-4 bg-pastel-green text-dark-bg py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-pastel-pink transition-colors"
      >
        <Plus size={20} />
        Add Item
      </button>
    </div>
  );
}