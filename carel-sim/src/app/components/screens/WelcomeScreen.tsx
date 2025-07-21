"use client";
import React from "react";

export interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="centered-container">
      <h1 className="welcome-title">Welcome to Carel Sim</h1>
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
