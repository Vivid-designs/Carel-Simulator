"use client";
import { useEffect, useState } from "react";
import { Item } from "@/app/types";
import { fileToBase64 } from "@/app/utils/fileToBase64";

interface UseGeminiProps {
  step: number;
  image: File | null;
  onItems: (items: Item[]) => void;
  onError: (msg: string) => void;
  onNext: () => void;
}

export function useGeminiProcessing({
  step,
  image,
  onItems,
  onError,
  onNext,
}: UseGeminiProps) {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (step !== 2 || !image) return;
    setProcessing(true);
    fileToBase64(image)
      .then(base64data =>
        fetch("/api/process-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64data }),
        })
      )
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        const parsed: Item[] = (data.items || []).map((it: any, idx: number) => ({
          id: it.id ?? idx + 1,
          description: it.description,
          rate: it.rate ?? it.amount ?? 0,
          quantity: it.quantity ?? 1,
        }));
        onItems(parsed);
        onNext();
      })
      .catch(err => onError(err.message || "Processing failed"))
      .finally(() => setProcessing(false));
  }, [step, image, onItems, onError, onNext]);

  return processing;
}
