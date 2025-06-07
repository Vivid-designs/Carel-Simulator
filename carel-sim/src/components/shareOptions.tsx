"use client";

import { useState, useMemo } from "react";
import { Share2, Copy, Mail, MessageCircle } from "lucide-react";

interface BillItem {
  name: string;
  price: number;
  quantity?: number;
}

interface ShareOptionsProps {
  items: BillItem[];
  selectedItems: { [key: number]: number };
  tipPercentage: number;
}

export function ShareOptions({ items, selectedItems, tipPercentage }: ShareOptionsProps) {
  const [copyFeedback, setCopyFeedback] = useState("");

  const shareMessage = useMemo(() => {
    const selected = Object.entries(selectedItems).filter(([, qty]) => qty > 0);
    if (selected.length === 0) return "No items selected to share.";

    let subtotal = 0;
    const itemLines = selected.map(([index, quantity]) => {
      const itemIndex = Number(index);
      const item = items[itemIndex];
      if (!item) return "";
      const itemTotal = item.price * quantity;
      subtotal += itemTotal;
      return `${quantity}x ${item.name} - $${itemTotal.toFixed(2)}`;
    }).filter(Boolean);

    const tip = subtotal * (tipPercentage / 100);
    const total = subtotal + tip;

    return `My bill split:\n\n${itemLines.join("\n")}\n\nSubtotal: $${subtotal.toFixed(2)}\nTip (${tipPercentage}%): $${tip.toFixed(2)}\nTotal: $${total.toFixed(2)}`;
  }, [items, selectedItems, tipPercentage]);

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const url = `https://wa.me/?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("My Bill Split");
    const body = encodeURIComponent(shareMessage);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full max-w-md bg-dark-surface rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Share2 size={20} className="text-pastel-green" />
        Share Your Split
      </h2>
      <div className="flex flex-col gap-3">
        <button
          onClick={handleWhatsAppShare}
          disabled={!Object.values(selectedItems).some(qty => qty > 0)}
          className="flex items-center justify-center gap-2 bg-pastel-blue text-dark-bg py-3 px-4 rounded-lg text-lg hover:bg-pastel-pink transition-colors disabled:bg-gray-700 disabled:text-gray-400"
        >
          <MessageCircle size={20} />
          WhatsApp
        </button>
        <button
          onClick={handleCopyLink}
          disabled={!Object.values(selectedItems).some(qty => qty > 0)}
          className="flex items-center justify-center gap-2 bg-pastel-blue text-dark-bg py-3 px-4 rounded-lg text-lg hover:bg-pastel-pink transition-colors disabled:bg-gray-700 disabled:text-gray-400 relative"
        >
          <Copy size={20} />
          Copy
          {copyFeedback && (
            <span className="absolute top-0 right-0 bg-pastel-green text-dark-bg text-sm px-2 py-1 rounded-bl-lg rounded-tr-lg">
              {copyFeedback}
            </span>
          )}
        </button>
        <button
          onClick={handleEmailShare}
          disabled={!Object.values(selectedItems).some(qty => qty > 0)}
          className="flex items-center justify-center gap-2 bg-pastel-blue text-dark-bg py-3 px-4 rounded-lg text-lg hover:bg-pastel-pink transition-colors disabled:bg-gray-700 disabled:text-gray-400"
        >
          <Mail size={20} />
          Email
        </button>
      </div>
    </div>
  );
}