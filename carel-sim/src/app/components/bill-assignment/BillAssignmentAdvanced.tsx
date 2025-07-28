// components/bill-assignment/BillAssignmentAdvanced.tsx
"use client";
import React, { useState, useMemo } from "react";
import { Item, Person, Assignments, PerPersonMap } from "@/app/types";
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

export function BillAssignmentAdvanced({
  image,
  items,
  people,
  setPeople,
  assignments,
  setAssignments,
  onFinish,
}: BillAssignmentAdvancedProps) {
  // === LOCAL UI STATE ===
  const [activePersonId, setActivePersonId] = useState(people[0]?.id || 1);
  const [editingPerson, setEditingPerson] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<number | null>(null);

  // === HANDLERS ===
  const addPerson = () => {
    const nextId = people.length > 0 ? Math.max(...people.map(p => p.id)) + 1 : 1;
    setPeople([
      ...people,
      {
        id: nextId,
        name: `Person ${nextId}`,
        color: COLORS[(nextId - 1) % COLORS.length],
        tipPercentage: 10,
      },
    ]);
    setActivePersonId(nextId);
  };

  const removePerson = (id: number) => {
    setPeople(ps => ps.filter(p => p.id !== id));
    setAssignments(prev => {
      const out = { ...prev };
      for (const itemId in out) {
        delete out[itemId][id];
      }
      return out;
    });
    if (activePersonId === id && people.length > 1) {
      const next = people.find(p => p.id !== id);
      setActivePersonId(next!.id);
    }
  };

  const handleEditPerson = (id: number, currentName: string) => {
    setEditingPerson(id);
    setNameInput(currentName);
  };

  const handleNameChange = (id: number) => {
    setPeople(ps => ps.map(p => p.id === id ? { ...p, name: nameInput || p.name } : p));
    setEditingPerson(null);
  };

  const setPersonTip = (id: number, tip: number) => {
    setPeople(ps => ps.map(p => p.id === id ? { ...p, tipPercentage: tip } : p));
  };

  const setPersonQty = (itemId: number, personId: number, qty: number) => {
    setAssignments(prev => {
      const itemAssign = { ...(prev[itemId] || {}) };
      itemAssign[personId] = qty;
      return { ...prev, [itemId]: itemAssign };
    });
  };

  // === CALCULATIONS ===
  const perPerson: PerPersonMap = useMemo(
    () => calculatePerPerson(people, items, assignments),
    [people, items, assignments]
  );

  const groupSubtotal = Object.values(perPerson).reduce((sum, p) => sum + p.subtotal, 0);
  const groupTip = Object.values(perPerson).reduce((sum, p) => sum + p.tip, 0);
  const billTotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const outstanding = billTotal - groupSubtotal;

  return (
    <div className="centered-container">
      <h2 className="text-xl font-semibold mb-4">Your Bill</h2>
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Receipt"
          className="image-preview mb-4"
        />
      )}

      {/* People badges & add */}
      <div className="flex flex-wrap gap-2 mb-4">
        {people.map(person => (
          <div key={person.id} className="flex items-center">
            <button
              className={`px-3 py-1 rounded-full font-medium ${
                activePersonId === person.id
                  ? `bg-[${person.color}] text-white`
                  : `bg-gray-200 text-[${person.color}]`
              }`}
              onClick={() => setActivePersonId(person.id)}
            >
              {editingPerson === person.id ? (
                <input
                  className="w-16 border-b focus:outline-none"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onBlur={() => handleNameChange(person.id)}
                  onKeyDown={e => e.key === "Enter" && handleNameChange(person.id)}
                  autoFocus
                />
              ) : (
                <span onDoubleClick={() => handleEditPerson(person.id, person.name)}>
                  {person.name}
                </span>
              )}
            </button>
            <button
              className="ml-1 text-red-500"
              onClick={() => removePerson(person.id)}
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="px-3 py-1 bg-gray-300 rounded-full font-medium"
          onClick={addPerson}
        >
          + Add
        </button>
      </div>

      {/* Tip input for active person */}
      {people.map(p =>
        p.id === activePersonId ? (
          <div key={p.id} className="flex items-center mb-4">
            <span className="font-medium mr-2">Tip for {p.name}:</span>
            <input
              type="number"
              min={0}
              max={100}
              value={p.tipPercentage}
              onChange={e => setPersonTip(p.id, Number(e.target.value))}
              className="w-12 text-center border rounded"
            />
            <span className="ml-1">%</span>
          </div>
        ) : null
      )}

      {/* Items assignment table */}
      <table className="w-full mb-4 text-sm">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            {people.map(p => (
              <th key={p.id}>{p.name}</th>
            ))}
            <th>Unassigned</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const unassigned = getUnassignedQty(item, assignments);
            return (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>R{item.rate.toFixed(2)}</td>
                <td>{item.quantity}</td>
                {people.map(p => (
                  <td key={p.id}>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={assignments[item.id]?.[p.id] || 0}
                      onChange={e => {
                        const val = Math.max(
                          0,
                          Math.min(item.quantity, Number(e.target.value) || 0)
                        );
                        // prevent over-assign
                        const other = Object.entries(assignments[item.id] || {})
                          .filter(([pid]) => Number(pid) !== p.id)
                          .reduce((s, [, q]) => s + q, 0);
                        if (val + other <= item.quantity) {
                          setPersonQty(item.id, p.id, val);
                        }
                      }}
                      className="w-12 text-center border rounded"
                    />
                  </td>
                ))}
                <td className={`font-medium ${unassigned > 0 ? "text-red-500" : "text-green-600"}`}>
                  {unassigned}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mb-4">
        <p className="font-medium">
          Total: <span className="font-bold">R{billTotal.toFixed(2)}</span>
        </p>
        {outstanding > 0 && (
          <p className="text-blue-600">
            Unassigned amount: R{outstanding.toFixed(2)}
          </p>
        )}
      </div>

      {/* Per-person breakdown */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Each Person Pays:</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Person</th>
              <th>Subtotal</th>
              <th>Tip</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {people.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>R{perPerson[p.id].subtotal.toFixed(2)}</td>
                <td>R{perPerson[p.id].tip.toFixed(2)}</td>
                <td>R{perPerson[p.id].total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onFinish}
        disabled={outstanding > 0}
        className={`w-full py-2 font-semibold rounded ${
          outstanding > 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        Save & Continue
      </button>
    </div>
  );
}
