"use client";
import { useState } from "react";
import Image from "next/image";
import Tesseract from "tesseract.js";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [items, setItems] = useState<{ name: string; price: number }[]>([]);
  const [extractedTotal, setExtractedTotal] = useState<number | null>(null);
  const [people, setPeople] = useState<string[]>([]);
  const [newPerson, setNewPerson] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, number[]>>({});
  const [currentPerson, setCurrentPerson] = useState<string | null>(null);
  const [calculatedTotals, setCalculatedTotals] = useState<Record<string, number> | null>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    const objectUrl = URL.createObjectURL(uploadedFile);
    setImage(objectUrl);
    setOcrText(null);
    setItems([]);
    setExtractedTotal(null);
    setCalculatedTotals(null);
  };

  // Process the bill with OCR and extract items and total
  const handleProcessBill = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: m => console.log(m) });
      console.log("Raw OCR Text:", text); // Debug: Log raw text
      setOcrText(text);
      const { items: parsedItems, total } = parseBillText(text);
      console.log("Parsed Items:", parsedItems, "Parsed Total:", total); // Debug: Log parsed results
      setItems(parsedItems);
      setExtractedTotal(total);
    } catch (error) {
      console.error("OCR failed:", error);
      setOcrText("Failed to recognize text.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse OCR text to extract items and total amount
  const parseBillText = (text: string) => {
    const items: { name: string; price: number }[] = [];
    let total: number | null = null;

    // Extract items (exclude subtotal, discounts, etc.)
    const itemRegex = /([A-Za-z\s]+?)\s*[R\$\s]*(\d+\.\d{2})/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const name = match[1].trim();
      if (!/Subtotal|Discounts|Tendered|Amount Due|ABount Dye/i.test(name)) {
        items.push({ name, price: parseFloat(match[2]) });
      }
    }

    // Extract total amount (more flexible detection)
    const totalRegex = /(?:Total|Subtotal|Amount Due|ABount Dye)\s*[R\$\s]*(\d+\.\d{2})/i;
    const totalMatch = text.match(totalRegex);
    if (totalMatch) {
      total = parseFloat(totalMatch[1]);
    } else {
      // Fallback: Look for any number that might be the total after misreads
      const numberRegex = /\b(\d+\.\d{2})\b/g;
      let numberMatch;
      while ((numberMatch = numberRegex.exec(text)) !== null) {
        const potentialTotal = parseFloat(numberMatch[1]);
        if (potentialTotal > items.reduce((sum, item) => sum + item.price, 0)) {
          total = potentialTotal;
          break;
        }
      }
    }

    return { items, total };
  };

  // Add a new person
  const addPerson = () => {
    if (newPerson && !people.includes(newPerson)) {
      setPeople([...people, newPerson]);
      setNewPerson("");
    }
  };

  // Handle item selection for the current person
  const handleItemSelection = (itemIndex: number, checked: boolean) => {
    if (!currentPerson) return;
    setSelectedItems(prev => {
      const current = prev[currentPerson] || [];
      if (checked) {
        return { ...prev, [currentPerson]: [...current, itemIndex] };
      } else {
        return { ...prev, [currentPerson]: current.filter(i => i !== itemIndex) };
      }
    });
  };

  // Calculate totals using the extracted total or fallback to item sum
  const calculateTotals = () => {
    if (items.length === 0) return;

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const effectiveTotal = extractedTotal || subtotal; // Fallback to subtotal if no total detected
    const taxAndTip = effectiveTotal - subtotal;

    const personTotals: Record<string, number> = {};

    items.forEach((item, index) => {
      const selectedPeople = people.filter(person => selectedItems[person]?.includes(index));
      const numSelected = selectedPeople.length;
      if (numSelected > 0) {
        const share = item.price / numSelected;
        selectedPeople.forEach(person => {
          personTotals[person] = (personTotals[person] || 0) + share;
        });
      }
    });

    const totalSelectedSubtotal = Object.values(personTotals).reduce((sum, val) => sum + val, 0);

    const finalTotals: Record<string, number> = {};
    people.forEach(person => {
      const personSubtotal = personTotals[person] || 0;
      const shareOfTaxAndTip = totalSelectedSubtotal > 0 ? (personSubtotal / totalSelectedSubtotal) * taxAndTip : 0;
      finalTotals[person] = personSubtotal + shareOfTaxAndTip;
    });

    setCalculatedTotals(finalTotals);
  };

  return (
    <div className="min-h-screen bg-blue-300 flex flex-col items-center justify-center px-4 py-8">
      {/* Glassmorphism Card */}
      <div
        className="relative bg-white/5 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-black max-w-md w-full"
        aria-live="polite"
      >
        <h1 className="text-4xl font-extrabold text-white text-center mb-2 tracking-wide">
          Carel Sim
        </h1>
        <p className="text-center text-white mb-6 leading-relaxed">
          Snap a bill, split the cost—because life&apos;s too short for math drama.
        </p>

        {/* Upload Section */}
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

        {/* Image Preview and Controls */}
        {image && (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="relative w-full rounded-lg overflow-hidden border border-white/30 shadow-md">
              <Image
                src={image}
                alt="Preview of uploaded bill"
                width={400} // Adjustable width
                height={600} // Adjustable height, can be dynamic
                className="object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="loader ease-linear rounded-full border-4 border-t-4 border-white w-12 h-12"></span>
                </div>
              )}
            </div>

            {!isProcessing && !ocrText && (
              <button
                onClick={handleProcessBill}
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-full font-semibold hover:bg-green-600 transition-colors duration-200"
              >
                Process Bill
              </button>
            )}

            {/* Assignment UI (render if items exist or processing is done) */}
            {(items.length > 0 || ocrText) && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-white mb-4">Assign Items to People</h2>

                {/* Display Extracted Total */}
                {extractedTotal && (
                  <p className="text-white mb-4">Extracted Total: ${extractedTotal.toFixed(2)}</p>
                )}
                {!extractedTotal && ocrText && (
                  <p className="text-yellow-400 mb-4">Could not detect total amount automatically.</p>
                )}

                {/* Add People */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="Enter person's name"
                    className="p-2 rounded-lg w-full text-black"
                  />
                  <button
                    onClick={addPerson}
                    className="mt-2 w-full bg-blue-200 text-white py-2 rounded-full font-semibold hover:bg-blue-600"
                  >
                    Add Person
                  </button>
                </div>

                {/* Select Current Person */}
                {people.length > 0 && (
                  <select
                    value={currentPerson || ""}
                    onChange={(e) => setCurrentPerson(e.target.value)}
                    className="p-2 rounded-lg w-full text-black mb-4"
                  >
                    <option value="">Select a person</option>
                    {people.map(person => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                )}

                {/* Item Checkboxes for Current Person */}
                {currentPerson && (
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItems[currentPerson]?.includes(index) || false}
                          onChange={(e) => handleItemSelection(index, e.target.checked)}
                        />
                        <span className="text-white">{item.name} - ${item.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Calculate Button */}
                <button
                  onClick={calculateTotals}
                  className="mt-4 w-full bg-purple-500 text-white py-2 rounded-full font-semibold hover:bg-purple-600"
                >
                  Calculate Totals
                </button>

                {/* Display Calculated Totals */}
                {calculatedTotals && (
                  <div className="mt-6 p-4 bg-white/10 rounded-lg text-white">
                    <h2 className="text-xl font-bold mb-2">Totals:</h2>
                    {Object.entries(calculatedTotals).map(([person, total]) => (
                      <p key={person}>
                        {person}: ${total.toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-black text-sm">
        Powered by AI ✨ No login needed.
      </p>
    </div>
  );
}