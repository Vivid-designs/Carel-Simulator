"use client";
import { useState } from "react";
import Image from "next/image";
import Tesseract from "tesseract.js";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setImage(objectUrl);

    // Start OCR processing
    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setOcrText(text);
    } catch (error) {
      console.error("OCR failed:", error);
      setOcrText("Failed to recognize text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setIsProcessing(false);
    setOcrText(null);
  };

  return (
    <div className="min-h-screen bg-blue-300 flex flex-col items-center justify-center px-4 py-8">
      {/* ─── Glassmorphism Card ────────────────────────────────────────────── */}
      <div
        className="relative bg-white/5 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-black max-w-md w-full"
        aria-live="polite"
      >
        <h1 className="text-4xl font-extrabold text-white text-center mb-2 tracking-wide">
          Carel Sim
        </h1>
        <p className="text-center text-white mb-6 leading-relaxed">
          Snap a bill, split the cost—because life's too short for math drama.
        </p>

        {/* ─── Upload Section ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center">
          {/* No image yet → “Snap Bill” button */}
          {!image && (
            <label
              htmlFor="bill-upload"
              className="w-full flex items-center justify-center bg-[#FF6F61] text-gray-900 text-lg font-semibold py-3 rounded-full cursor-pointer hover:scale-105 transform transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-[#FF6F61]/50"
            >
              Snap Bill
              <input
                id="bill-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleImageUpload}
                aria-label="Upload a photo of your bill"
              />
            </label>
          )}

          {/* Image is loaded → show preview + controls */}
          {image && (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-white/30 shadow-md">
                <Image
                  src={image}
                  alt="Preview of uploaded bill"
                  fill
                  className="object-cover animate-fade-in"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="loader ease-linear rounded-full border-4 border-t-4 border-white w-12 h-12"></span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 w-full">
                <label
                  htmlFor="bill-upload"
                  className="flex-1 bg-[#FDD835] text-gray-900 text-center py-2 rounded-full font-semibold cursor-pointer hover:bg-[#FBC02D] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#FDD835]/50"
                >
                  Change Bill
                  <input
                    id="bill-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={handleImageUpload}
                    aria-label="Change photo of bill"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex-1 bg-[#E53935] text-white text-center py-2 rounded-full font-semibold hover:bg-[#D32F2F] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#E53935]/50"
                  aria-label="Remove uploaded bill"
                >
                  Remove
                </button>
              </div>

              {/* Display OCR results */}
              {ocrText && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg text-white">
                  <h2 className="text-xl font-bold mb-2">Extracted Text:</h2>
                  <p>{ocrText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <p className="mt-10 text-black text-sm">
        Powered by AI ✨ No login needed.
      </p>
    </div>
  );
}