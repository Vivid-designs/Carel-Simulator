"use client";
import { useState } from "react";
import Image from "next/image";
import { BillItem, BillDetails } from "../app/api/process-bill/route";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, setItems] = useState<BillItem[]>([]); // Used in map below
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
        console.log("Sending image data:", base64data.substring(0, 50) + "..."); // Log first 50 chars for debug
        const response = await fetch('/api/process-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64data }),
        });

        console.log("Response status:", response.status); // Debug response
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data); // Debug received data
        if (data.items) {
          setItems(data.items);
        }
        const { items, ...details } = data;
        setBillDetails(details);
        setShowItems(true);
      };
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to process bill. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMyItemCountChange = (itemIndex: number, change: number) => {
    setMyTotal(null);
    setMyItemsCount(prev => {
      const currentCount = prev[itemIndex] || 0;
      const newCount = currentCount + change;
      const itemQuantityOnBill = items[itemIndex]?.quantity || 1;
      if (newCount < 0 || newCount > itemQuantityOnBill) {
        return prev;
      }
      return { ...prev, [itemIndex]: newCount };
    });
  };

  const calculateMyShare = () => {
    const mySubtotal = Object.entries(myItemsCount).reduce((total, [itemIndexStr, count]) => {
      const itemIndex = parseInt(itemIndexStr, 10);
      const item = items[itemIndex];
      if (item && count > 0) {
        return total + (item.rate * count);
      }
      return total;
    }, 0);

    const tipAmount = Number((mySubtotal * (tipPercentage / 100)).toFixed(2));
    const finalTotal = Number((mySubtotal + tipAmount).toFixed(2));
    setMyTotal(finalTotal);
  };

  return (
    <div className="min-h-screen bg-pastel-lavender flex flex-col items-center justify-center px-4 py-8">
      <div className="relative bg-pastel-mint/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-pastel-peach/20 max-w-md w-full">
        <h1 className="text-3xl font-semibold text-pastel-peach text-center mb-4 tracking-wide">
          Carel Sim
        </h1>
        <p className="text-center text-pastel-peach/80 mb-5 leading-relaxed text-base">
          Snap a bill, split the cost—because life\'s too short for math drama.
        </p>

        {!image ? (
          <label htmlFor="bill-upload" className="w-full flex items-center justify-center bg-pastel-peach text-gray-800 text-lg font-medium py-4 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200">
            Snap Bill
            <input id="bill-upload" type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="relative w-full rounded-xl overflow-hidden border border-pastel-peach/30 shadow-md">
              <Image src={image} alt="Preview of uploaded bill" width={300} height={450} className="object-contain" />
              {isProcessing && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="loader ease-linear rounded-full border-4 border-t-4 border-pastel-peach w-10 h-10"></span></div>}
            </div>
            {billDetails && (
              <div className="mt-4 text-pastel-peach">
                <h2 className="text-lg font-medium">Bill Details</h2>
                {billDetails.restaurant_name && <p className="text-sm">Restaurant: {String(billDetails.restaurant_name)}</p>}
                {billDetails.date && <p className="text-sm">Date: {String(billDetails.date)}</p>}
              </div>
            )}
            {!showItems && !isProcessing && (
              <button
                onClick={handleProcessBill}
                className="w-full bg-pastel-mint text-gray-800 py-3 rounded-xl font-medium hover:bg-pastel-mint/80 transition-colors"
              >
                Process Bill
              </button>
            )}
          </div>
        )}

        {error && <p className="text-pastel-peach/70 mt-4 text-sm">{error}</p>}

        {showItems && items.length > 0 && (
          <div className="mt-6 w-full">
            <h2 className="text-xl font-medium text-pastel-peach mb-3">Select Your Items</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-pastel-peach bg-pastel-mint/20 p-3 rounded-lg">
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs opacity-80">{item.quantity}x on bill @ R{item.rate.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-pastel-peach/20 rounded-full px-2">
                    <button onClick={() => handleMyItemCountChange(index, -1)} className="text-xl font-bold">-</button>
                    <span className="text-base font-medium w-5 text-center">{myItemsCount[index] || 0}</span>
                    <button onClick={() => handleMyItemCountChange(index, 1)} className="text-xl font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-pastel-peach mb-3">Add a Tip</h3>
              <div className="flex items-center space-x-2 flex-wrap">
                {[5, 10, 15].map(tip => (
                  <button 
                    key={tip} 
                    onClick={() => setTipPercentage(tip)} 
                    className={`flex-grow py-2 rounded-lg font-medium text-sm transition-colors ${tipPercentage === tip ? 'bg-pastel-peach text-gray-800' : 'bg-pastel-mint/20 text-pastel-peach'}`}
                  >
                    {tip}%
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Other"
                  onChange={(e) => setTipPercentage(Number(e.target.value))}
                  className="w-20 p-2 text-center rounded-lg bg-pastel-mint/20 text-pastel-peach placeholder-pastel-peach/50 text-sm"
                />
              </div>
            </div>

            <button
              onClick={calculateMyShare}
              className="mt-6 w-full bg-pastel-peach text-gray-800 py-3 rounded-xl font-medium hover:bg-pastel-peach/80 transition-colors text-base"
            >
              Calculate My Share
            </button>
            
            {myTotal !== null && (
              <div className="mt-6 p-4 bg-pastel-mint/40 rounded-xl text-center">
                <h2 className="text-base font-medium text-gray-800">You Owe:</h2>
                <p className="text-2xl font-bold text-pastel-peach">
                  R{myTotal.toFixed(2)}
                </p>
                <p className="text-gray-800 text-xs">(Subtotal: R{(myTotal / (1 + tipPercentage/100)).toFixed(2)} + Tip: R{(myTotal - (myTotal / (1 + tipPercentage/100))).toFixed(2)})</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-pastel-peach/70 text-xs">Powered by AI ✨</p>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Arial', sans-serif;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 229, 217, 0.5); border-radius: 5px; }
        .loader { border-color: rgba(255, 229, 217, 0.2); border-top-color: #FFE5D9; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .max-w-md { max-width: 100%; width: 90%; }
          h1 { font-size: 2rem; }
          h2, h3 { font-size: 1.2rem; }
          button { font-size: 1rem; padding: 0.75rem; }
          input { font-size: 0.9rem; padding: 0.5rem; }
          p { font-size: 0.85rem; }
          .max-h-48 { max-height: 40vh; }
        }
      `}</style>
    </div>
  );
}