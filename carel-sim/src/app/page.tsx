"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      // Next step: Pass image to OCR processing (Tesseract.js)
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Glassmorphism Card */}
      <div className="bg-glass backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-peachy-pink/30 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-white mb-4 font-poppins">
          Carel-Sim
        </h1>
        <p className="text-center text-gray-300 mb-6 font-inter">
          Snap a bill, split the cost. Easy vibes.
        </p>

        {/* Camera Input Button */}
        <label
          htmlFor="bill-upload"
          className="block w-full bg-peachy-pink text-gray-900 text-center py-3 rounded-full font-semibold cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          Snap Bill
        </label>
        <input
          id="bill-upload"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Preview Image (if uploaded) */}
        {image && (
          <div className="mt-4">
            <Image
              src={image}
              alt="Uploaded bill"
              width={300}
              height={300}
              className="rounded-lg mx-auto"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-gray-400 text-sm font-inter">
        Powered by AI ✨ No login needed.
      </p>
    </div>
  );
}