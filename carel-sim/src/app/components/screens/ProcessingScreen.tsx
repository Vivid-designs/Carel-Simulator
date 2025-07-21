"use client";
import React from "react";

interface ProcessingScreenProps {
  image: File | null;
  processing: boolean;
  error: string | null;
}

export function ProcessingScreen({ image, processing, error }: ProcessingScreenProps) {
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
          style={{ marginTop: "1.5rem", maxWidth: "300px", borderRadius: "1rem", border: "1px solid #ccc" }}
        />
      )}
      {error && <p style={{ color: "red", marginTop: 16 }}>{error}</p>}
    </div>
  );
}
