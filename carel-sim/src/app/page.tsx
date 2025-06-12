"use client";
import { useState } from "react";
import Image from "next/image";
import { BillItem, BillDetails } from "../app/api/process-bill/route";

export default function Home() {
  const [items, setItems] = useState<BillItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [myItemsCount, setMyItemsCount] = useState<Record<number, number>>({});
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [myTotal, setMyTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setImage(URL.createObjectURL(uploadedFile));
    setItems([]);
    setBillDetails(null);
    setMyItemsCount({});
    setMyTotal(null);
    setTipPercentage(10);
    setError(null);
    setShowItems(false);
  };

  const handleProcessBill = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const response = await fetch('/api/process-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64data }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.items) setItems(data.items);
        const { items: _, ...details } = data;
        setBillDetails(details);
        setShowItems(true);
      };
    } catch (err) {
      console.error(err);
      setError("Failed to process bill. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMyItemCountChange = (idx: number, change: number) => {
    setMyTotal(null);
    setMyItemsCount(prev => {
      const current = prev[idx] || 0;
      const newCnt = current + change;
      const maxQty = items[idx]?.quantity || 1;
      if (newCnt < 0 || newCnt > maxQty) return prev;
      return { ...prev, [idx]: newCnt };
    });
  };

  const calculateMyShare = () => {
    const subtotal = Object.entries(myItemsCount).reduce((sum, [i, c]) => {
      const item = items[+i];
      return sum + (item && c > 0 ? item.rate * c : 0);
    }, 0);
    const tipAmt = +(subtotal * (tipPercentage / 100)).toFixed(2);
    setMyTotal(+(subtotal + tipAmt).toFixed(2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-lavender via-pastel-mint to-pastel-peach flex flex-col items-center justify-center p-4">
      <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-3xl p-6 shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-pastel-peach text-center mb-2">Carel Sim</h1>
        <p className="text-center text-pastel-peach/80 mb-4 text-sm">Snap a bill, split the cost—because life’s too short for math drama.</p>

        {!image ? (
          <label htmlFor="bill-upload" className="block w-full py-4 bg-pastel-mint rounded-2xl text-pastel-lavender font-semibold text-center hover:scale-105 transform transition">
            📸 Upload Bill
            <input id="bill-upload" type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-pastel-peach/30 shadow-md">
              <Image src={image} alt="Bill preview" width={300} height={450} className="object-cover w-full h-auto" />
              {isProcessing && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="loader ease-linear rounded-full border-4 border-t-4 border-pastel-peach w-12 h-12"></span></div>}
            </div>
            {billDetails && (
              <div className="text-pastel-peach text-center">
                {billDetails.restaurant_name && <p className="text-sm">🍽️ {billDetails.restaurant_name}</p>}
                {billDetails.date && <p className="text-sm">📅 {billDetails.date}</p>}
              </div>
            )}
            {!showItems && !isProcessing && (
              <button onClick={handleProcessBill} className="w-full py-3 bg-pastel-peach rounded-2xl font-semibold hover:bg-pastel-peach/90 transition">
                🔄 Process Bill
              </button>
            )}
          </div>
        )}

        {error && <p className="text-red-500 mt-3 text-center text-sm">{error}</p>}

        {showItems && items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-pastel-peach mb-3">Select Your Items</h2>
            <div className="space-y-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-pastel-mint/20 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-pastel-lavender">{item.description}</p>
                    <p className="text-xs text-pastel-lavender/80">{item.quantity}× @ R{item.rate.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-pastel-peach/20 rounded-full px-3 py-1">
                    <button onClick={() => handleMyItemCountChange(idx, -1)} className="text-xl font-bold">–</button>
                    <span className="w-6 text-center font-medium text-pastel-lavender">{myItemsCount[idx] || 0}</span>
                    <button onClick={() => handleMyItemCountChange(idx, 1)} className="text-xl font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="text-md font-semibold text-pastel-peach mb-2">Add a Tip</h3>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 15].map(tp => (
                  <button key={tp} onClick={() => setTipPercentage(tp)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${tipPercentage === tp ? 'bg-pastel-peach text-pastel-lavender' : 'bg-pastel-mint/30 text-pastel-peach'}`}>{tp}%</button>
                ))}
                <input type="number" placeholder="Other" onChange={e => setTipPercentage(+e.target.value)} className="w-20 p-2 rounded-xl text-sm text-center bg-pastel-mint/30 placeholder-pastel-peach/60" />
              </div>
            </div>

            <button onClick={calculateMyShare} className="mt-5 w-full py-3 bg-pastel-peach rounded-xl font-semibold hover:bg-pastel-peach/90 transition">
              Calculate My Share
            </button>

            {myTotal !== null && (
              <div className="mt-6 p-4 bg-pastel-mint/40 rounded-2xl text-center">
                <h2 className="text-sm font-medium text-pastel-lavender">You Owe:</h2>
                <p className="text-2xl font-bold text-pastel-peach mt-1">R{myTotal.toFixed(2)}</p>
                <p className="text-xs text-pastel-lavender/70 mt-1">(Subtotal R{(myTotal/(1+tipPercentage/100)).toFixed(2)} + Tip R{(myTotal - (myTotal/(1+tipPercentage/100))).toFixed(2)})</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-pastel-lavender/60 text-xs">Powered by AI ✨</p>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
        :root {
          --pastel-mint: #DFF7F0;
          --pastel-peach: #FFE5D9;
          --pastel-lavender: #E8DAFF;
        }
        .bg-pastel-mint { background-color: var(--pastel-mint); }
        .bg-pastel-peach { background-color: var(--pastel-peach); }
        .bg-pastel-lavender { background-color: var(--pastel-lavender); }
        .text-pastel-mint { color: var(--pastel-mint); }
        .text-pastel-peach { color: var(--pastel-peach); }
        .text-pastel-lavender { color: var(--pastel-lavender); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.2); border-radius: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 5px; }
        .loader { border-color: rgba(255,229,217,0.2); border-top-color: var(--pastel-peach); animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .max-w-sm { width: 90%; }
        }
      `}</style>
    </div>
  );
}
