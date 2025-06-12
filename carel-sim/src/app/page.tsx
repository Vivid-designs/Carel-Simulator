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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-4 shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Carel Sim</h1>
        <p className="text-center text-white/80 mb-4 text-sm">Snap a bill, split the cost—because life’s too short for math drama.</p>

        {!image ? (
          <label htmlFor="bill-upload" className="block w-full py-4 bg-white/20 rounded-2xl text-white font-semibold text-center hover:scale-105 transform transition text-base">
            📸 Upload Bill
            <input id="bill-upload" type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/30 shadow-md">
              <Image src={image} alt="Bill preview" width={300} height={450} className="object-cover w-full h-auto max-h-96" />
              {isProcessing && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="loader ease-linear rounded-full border-4 border-t-4 border-white w-12 h-12"></span></div>}
            </div>
            {billDetails && (
              <div className="text-white text-center text-sm">
                {billDetails.restaurant_name && <p>🍽️ {billDetails.restaurant_name}</p>}
                {billDetails.date && <p>📅 {billDetails.date}</p>}
              </div>
            )}
            {!showItems && !isProcessing && (
              <button onClick={handleProcessBill} className="w-full py-3 bg-white/20 rounded-2xl text-white font-semibold hover:bg-white/30 transition text-base">
                🔄 Process Bill
              </button>
            )}
          </div>
        )}

        {error && <p className="text-red-500 mt-3 text-center text-sm">{error}</p>}

        {showItems && items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-3">Select Your Items</h2>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/20 rounded-xl text-sm">
                  <p className="flex-1 font-medium text-white truncate">
                    {item.description} • {item.quantity}×@R{item.rate.toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-2 bg-white/30 rounded-full px-2 py-1">
                    <button onClick={() => handleMyItemCountChange(idx, -1)} className="text-xl font-bold text-white">–</button>
                    <span className="w-4 text-center font-medium text-white">{myItemsCount[idx] || 0}</span>
                    <button onClick={() => handleMyItemCountChange(idx, 1)} className="text-xl font-bold text-white">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="text-base font-semibold text-white mb-2">Add a Tip</h3>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 15].map(tp => (
                  <button key={tp} onClick={() => setTipPercentage(tp)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition text-white ${tipPercentage === tp ? 'bg-white/30' : 'bg-white/10'}`}>{tp}%</button>
                ))}
                <input type="number" placeholder="Other" onChange={e => setTipPercentage(+e.target.value)} className="w-20 p-2 rounded-xl text-sm text-center bg-white/10 placeholder-white/50 text-white" />
              </div>
            </div>

            <button onClick={calculateMyShare} className="mt-5 w-full py-3 bg-white/20 rounded-xl text-white font-semibold hover:bg-white/30 transition text-base">
              Calculate My Share
            </button>

            {myTotal !== null && (
              <div className="mt-6 p-4 bg-white/10 rounded-2xl text-center text-sm">
                <h2 className="font-medium text-white">You Owe:</h2>
                <p className="text-2xl font-bold text-white mt-1">R{myTotal.toFixed(2)}</p>
                <p className="text-white/80 mt-1">(Subtotal R{(myTotal/(1+tipPercentage/100)).toFixed(2)} + Tip R{(myTotal - (myTotal/(1+tipPercentage/100))).toFixed(2)})</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-white/60 text-sm text-center">Powered by AI ✨</p>

      <style jsx global>{`
        html, body { background-color: #1e1e1e; height: 100%; color: #fff; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 5px; }
        .loader { border-color: rgba(255,255,255,0.2); border-top-color: #fff; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
