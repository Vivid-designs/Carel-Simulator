"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

interface UploadReceiptProps {
  onImageUpload: (image: File | null) => void;
}

export function UploadReceipt({ onImageUpload }: UploadReceiptProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUpload(e.target.files?.[0] || null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-md">
      <label
        htmlFor="upload"
        className="bg-pastel-blue text-dark-bg py-3 px-6 rounded-lg text-lg w-full text-center cursor-pointer flex items-center justify-center gap-2 hover:bg-pastel-pink transition-colors"
      >
        <Camera size={24} />
        Take Photo or Upload Receipt
      </label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="upload"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />
      <p className="text-gray-300 text-center">Snap a clear photo or upload from your gallery.</p>
    </div>
  );
}