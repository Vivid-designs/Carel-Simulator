"use client";

import { useState } from "react";
import { Percent } from "lucide-react";

interface TipSelectorProps {
  tipPercentage: number;
  onTipChange: (tip: number) => void;
}
 function TipSelector({ tipPercentage, onTipChange }: TipSelectorProps) {
  const [customTip, setCustomTip] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);

  const presetTips = [15, 18, 20];

  const handlePresetClick = (percentage: number) => {
    setIsCustom(false);
    setCustomTip("");
    onTipChange(percentage);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTip(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      setIsCustom(true);
      onTipChange(parsed);
    } else if (value === "") {
      setIsCustom(true);
      onTipChange(0);
    }
  };

  return (
    <div className="w-full max-w-md bg-dark-surface rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Percent size={20} className="text-pastel-green" />
        Add a tip?
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {presetTips.map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePresetClick(percentage)}
              className={`flex-1 py-3 px-4 rounded-lg text-lg transition-colors ${
                tipPercentage === percentage && !isCustom
                  ? "bg-pastel-blue text-dark-bg"
                  : "bg-gray-700 text-white hover:bg-pastel-pink"
              }`}
            >
              {percentage}%
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customTip}
            onChange={handleCustomChange}
            placeholder="Custom %"
            className="bg-gray-800 text-white p-2 rounded-lg w-full max-w-[120px] text-center"
            min="0"
            step="0.1"
          />
          <span className="text-gray-300">or enter your own</span>
        </div>
      </div>
    </div>
  );
}
export default TipSelector;