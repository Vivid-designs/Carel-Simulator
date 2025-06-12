"use client";
import { useState } from "react";
import Image from "next/image";
import { BillItem, BillDetails } from "../app/api/process-bill/process-bill";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, setItems] = useState<BillItem[]>([]);
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [myItemsCount, setMyItemsCount] = useState<Record<number, number>>({});
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [myTotal, setMyTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null); // Added for user-facing errors

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
    setError(null); // Clear any previous errors
  };

  const handleProcessBill = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null); // Clear previous errors

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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.items) {
          setItems(data.items);
        }
        const handleProcessBill = async () => {
  if (!file) return;
  setIsProcessing(true);

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.items) {
        setItems(data.items);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { items, ...details } = data;
      setBillDetails(details);
    };
  } catch (error) {
    console.error("API call failed:", error);
  } finally {
    setIsProcessing(false);
  }
};
        const { items, ...details } = data;
        setBillDetails(details);
      };
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to process bill. Please try again."); // User-facing error
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
    <div className="min-h-screen bg-blue-300 flex flex-col items-center justify-center px-4 py-8">
      <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-black max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-white text-center mb-2 tracking-wide">
          Carel Sim
        </h1>
        <p className="text-center text-white mb-6 leading-relaxed">
          Snap a bill, split the cost—because life's too short for math drama.
        </p>

        {!image ? (
          <label htmlFor="bill-upload" className="w-full flex items-center justify-center bg-[#FF6F61] text-gray-900 text-lg font-semibold py-3 rounded-full cursor-pointer hover:scale-105 transform transition-transform duration-200">
            Snap Bill
            <input id="bill-upload" type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="relative w-full rounded-lg overflow-hidden border border-white/30 shadow-md">
              <Image src={image} alt="Preview of uploaded bill" width={400} height={600} className="object-contain" />
              {isProcessing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="loader ease-linear rounded-full border-4 border-t-4 border-white w-12 h-12"></span></div>}
            </div>
            {billDetails && (
              <div className="mt-4 text-white">
                <h2 className="text-xl font-bold">Bill Details</h2>
                {billDetails.restaurant_name && <p>Restaurant: {String(billDetails.restaurant_name)}</p>}
                {billDetails.bill_no && <p>Bill No: {String(billDetails.bill_no)}</p>}
                {billDetails.date && <p>Date: {String(billDetails.date)}</p>}
              </div>
            )}
            {!isProcessing && items.length === 0 && <button onClick={handleProcessBill} className="mt-4 w-full bg-green-500 text-white py-2 rounded-full font-semibold hover:bg-green-600 transition-colors">Process Bill</button>}
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>} {/* User-facing error message */}

        {items.length > 0 && (
          <div className="mt-6 w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Select Your Items</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-white bg-white/10 p-2 rounded-lg">
                  <div className="flex-grow">
                    <p className="font-semibold">{item.description}</p>
                    <p className="text-sm opacity-80">{item.quantity}x on bill @ R{item.rate.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/20 rounded-full px-2">
                    <button onClick={() => handleMyItemCountChange(index, -1)} className="text-2xl font-bold">-</button>
                    <span className="text-xl font-semibold w-6 text-center">{myItemsCount[index] || 0}</span>
                    <button onClick={() => handleMyItemCountChange(index, 1)} className="text-2xl font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Add a Tip</h3>
              <div className="flex items-center space-x-2">
                {[5, 10, 15].map(tip => (
                  <button 
                    key={tip} 
                    onClick={() => setTipPercentage(tip)} 
                    className={`flex-grow py-2 rounded-full font-semibold transition-colors ${tipPercentage === tip ? 'bg-[#FF6F61] text-black' : 'bg-white/20 text-white'}`}
                  >
                    {tip}%
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Other"
                  onChange={(e) => setTipPercentage(Number(e.target.value))}
                  className="w-20 p-2 text-center rounded-full bg-white/20 text-white placeholder-white/70"
                />
              </div>
            </div>

            <button
              onClick={calculateMyShare}
              className="mt-6 w-full bg-purple-500 text-white py-3 rounded-full font-semibold hover:bg-purple-600 transition-colors text-lg"
            >
              Calculate My Share
            </button>
            
            {myTotal !== null && (
              <div className="mt-6 p-4 bg-green-500/80 rounded-lg text-center">
                <h2 className="text-lg font-semibold text-black">You Owe:</h2>
                <p className="text-4xl font-extrabold text-white">
                  R{myTotal.toFixed(2)}
                </p>
                <p className="text-black text-sm">(Subtotal: R{(myTotal / (1 + tipPercentage/100)).toFixed(2)} + Tip: R{(myTotal - (myTotal / (1 + tipPercentage/100))).toFixed(2)})</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-10 text-black text-sm">Powered by AI ✨</p>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
        .loader { border-color: rgba(255, 255, 255, 0.2); border-top-color: #fff; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}