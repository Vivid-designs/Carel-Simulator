"use client";
import React, { useState } from "react";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { CameraScreen } from "./screens/CameraScreen";
import { ProcessingScreen } from "./screens/ProcessingScreen";
import { BillAssignmentAdvanced } from "./bill-assignment/BillAssignmentAdvanced";
import { CompletionScreen } from "./screens/CompletionScreen";
import { Item, Assignments, Person } from "@/app/types";
import { COLORS } from "@/app/constants/colors";
import { useGeminiProcessing } from "@/app/hooks/useGeminiProcessing";
import "@/app/styles/globals.css";
import "@/app/styles/custom-styles.css"

export default function BillSplitterApp() {
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Person 1", color: COLORS[0], tipPercentage: 10 },
  ]);
  const [assignments, setAssignments] = useState<Assignments>({});

  // useGeminiProcessing returns a boolean `processing`
  const processing = useGeminiProcessing({
    step,
    image,
    onItems: setItems,
    onError: setError,
    onNext: () => setStep(3),
  });

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
        <BillAssignmentAdvanced
          image={image}
          items={items}
          people={people}
          setPeople={setPeople}
          assignments={assignments}
          setAssignments={setAssignments}
          onFinish={() => setStep(4)}
        />
      )}
      {step === 4 && <CompletionScreen />}
    </>
  );
}
