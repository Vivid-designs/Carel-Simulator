"use client";
import React from "react";

interface CameraScreenProps {
  onCapture: (file: File) => void;
}

export function CameraScreen({ onCapture }: CameraScreenProps) {
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
            const file = e.target.files?.[0];
            if (file) onCapture(file);
          }}
        />
      </label>
    </div>
  );
}
