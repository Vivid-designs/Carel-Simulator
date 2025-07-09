"use client";
import { useState, useEffect } from "react";
import "./custom-styles.css";

// Welcome screen component 
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="centered-container">
      <h1 className="welcome-title">Welcome to Carel-Sim</h1>
      <p className="welcome-desc">
        Because life is too short to be doing math and arguing over bill drama
      </p>
      <button className="button-primary" onClick={onNext}>
        Take A Pic
      </button>
      <p className="welcome-note">
        Take a picture of the bill and stop sweating the small stuff.
      </p>
    </div>
  );
}

// Camera screen component
function CameraScreen({ onCapture }: { onCapture: (file: File) => void }) {
  return (
    <div className="centered-container">
      <label className="camera-box">
        <span className="camera-label">Open Camera</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              onCapture(e.target.files[0]);
            }
          }}
        />
      </label>
    </div>
  );
}

// Processing screen component
function ProcessingScreen({
  image,
  processing,
  error,
}: {
  image: File | null;
  processing: boolean;
  error: string | null;
}) {
  return (
    <div className="centered-container">
      <div className="processing-spinner">
        <span className="processing-dot">●</span>
      </div>
      <h2 className="processing-title">Analysing your bill</h2>
      <p className="processing-desc">
        {processing ? "The process will be done shortly." : "Processing complete."}
      </p>
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Bill preview"
          className="image-preview"
          style={{
            marginTop: "1.5rem",
            maxWidth: "300px",
            borderRadius: "1rem",
            border: "1px solid #ccc",
          }}
        />
      )}
      {error && <p style={{ color: "red", marginTop: 16 }}>{error}</p>}
    </div>
  );
}

// Bill Assignment screen component
function BillAssignmentScreen({
  image,
  items,
  assignments,
  setAssignments,
  onFinish,
}: {
  image: File | null;
  items: any[];
  assignments: { [itemId: number]: string };
  setAssignments: (a: { [itemId: number]: string }) => void;
  onFinish: () => void;
}) {
  // Helper to update assignments
  const handleAssign = (itemId: number, name: string) => {
    setAssignments({ ...assignments, [itemId]: name });
  };

  // Check if all items are assigned
  const allAssigned = items.every(
    (item, idx) => assignments[idx] && assignments[idx].trim().length > 0
  );

  return (
    <div className="centered-container">
      <h2 className="assignment-title">Assign Items to People</h2>
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Bill preview"
          className="image-preview"
          style={{
            marginBottom: "1.5rem",
            maxWidth: "300px",
            borderRadius: "1rem",
            border: "1px solid #ccc",
          }}
        />
      )}
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="assignment-item"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "0.5rem",
            }}
          >
            <span style={{ flex: 2 }}>
              {item.description || item.name} (${item.rate?.toFixed(2) || item.price?.toFixed(2) || "??"})
            </span>
            <input
              style={{
                flex: 2,
                padding: "0.3rem 0.6rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
              }}
              placeholder="Assign to..."
              value={assignments[idx] || ""}
              onChange={e => handleAssign(idx, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        className="button-primary"
        style={{ marginTop: "2rem" }}
        onClick={onFinish}
        disabled={!allAssigned}
      >
        Finish
      </button>
      {!allAssigned && (
        <div style={{ color: "#c00", marginTop: "0.5rem" }}>
          Please assign all items before finishing.
        </div>
      )}
    </div>
  );
}

// Completion screen component
function CompletionScreen() {
  return (
    <div className="centered-container">
      <h2 className="completion-title">Thank you for using Carel Sim</h2>
      <p className="completion-desc">Please enjoy the time you saved with your friends</p>
    </div>
  );
}

export default function BillSplitterApp() {
  // 0 = Welcome, 1 = Camera, 2 = Processing, 3 = Assignment, 4 = Completion
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<File | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For step 3: assignments state
  const [assignments, setAssignments] = useState<{ [itemId: number]: string }>({});

  // When entering the Processing step, call Gemini API
  useEffect(() => {
    const processWithGemini = async (file: File) => {
      setProcessing(true);
      setError(null);
      try {
        // Convert image file to base64
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });

        const base64data = await toBase64(file);
        // Call your /api/process-bill endpoint
        const response = await fetch("/api/process-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64data }),
        });
        if (!response.ok) throw new Error(`Failed to process bill: ${response.statusText}`);
        const data = await response.json();
        // Defensive: fallback if items field is missing
        setItems(data.items || []);
        setStep(3);
      } catch (err: any) {
        setError(err.message || "Failed to process bill. Please try again.");
      } finally {
        setProcessing(false);
      }
    };

    if (step === 2 && image) {
      processWithGemini(image);
    }
  }, [step, image]);

  return (
    <>
      {step === 0 && <WelcomeScreen onNext={() => setStep(1)} />}
      {step === 1 && (
        <CameraScreen
          onCapture={file => {
            setImage(file);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <ProcessingScreen image={image} processing={processing} error={error} />
      )}
      {step === 3 && (
        <BillAssignmentScreen
          image={image}
          items={items}
          assignments={assignments}
          setAssignments={setAssignments}
          onFinish={() => setStep(4)}
        />
      )}
      {step === 4 && <CompletionScreen />}
    </>
  );
}