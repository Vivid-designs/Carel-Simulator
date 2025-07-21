"use client";
import React, { useState, useMemo } from "react";
import { Item, Person, Assignments } from "@/app/types";
import { COLORS } from "@/app/constants/colors";
import { getUnassignedQty, calculatePerPerson } from "@/app/utils/assignment";

interface BillAssignmentAdvancedProps {
  image: File | null;
  items: Item[];
  people: Person[];
  assignments: Assignments;
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<Assignments>>;
  onFinish: () => void;
}

export function BillAssignmentAdvanced({ image, items, people, setPeople, assignments, setAssignments, onFinish }: BillAssignmentAdvancedProps) {
  const [activePersonId, setActivePersonId] = useState(people[0]?.id || 1);
  const [editingPerson, setEditingPerson] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<number | null>(null);

  const perPerson = useMemo(() => calculatePerPerson(people, items, assignments), [people, items, assignments]);
  const groupSubtotal = Object.values(perPerson).reduce((sum, p) => sum + p.subtotal, 0);
  const groupTip = Object.values(perPerson).reduce((sum, p) => sum + p.tip, 0);
  const billTotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const outstanding = billTotal - groupSubtotal;
  
 // handlers: addPerson, removePerson, handleEditPerson, handleNameChange, setPersonTip, setPersonQty
  // ... (same as before, but moved to utils where appropriate)


  return (
    <div className="centered-container">
      {/* the full JSX UI for bill assignment, using getUnassignedQty and perPerson */}
    </div>
  );
}