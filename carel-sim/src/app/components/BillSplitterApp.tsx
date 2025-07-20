"use client";
import React, { useState, useEffect } from "react";

// Example color palette
const COLORS = [
  "#4F8EF7", // blue
  "#43D675", // green
  "#A67CF5", // purple
  "#FFC645", // orange
  "#FF6F61", // red
];

// Simple Welcome Screen
function WelcomeScreen({ onNext }: { onNext: () => void }) {
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

// Camera screen
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

// Processing screen
function ProcessingScreen({ image, processing, error }: { image: File | null; processing: boolean; error: string | null }) {
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

// Completion screen
function CompletionScreen() {
  return (
    <div className="centered-container">
      <h2 className="completion-title">Thank you for using Carel Sim</h2>
      <p className="completion-desc">Please enjoy the time you saved with your friends</p>
    </div>
  );
}

// Advanced Bill Assignment Screen
function BillAssignmentAdvanced({
  image,
  items,
  people,
  setPeople,
  assignments,
  setAssignments,
  onFinish,
}: {
  image: File | null;
  items: any[];
  people: { id: number; name: string; color: string; tipPercentage: number }[];
  setPeople: any;
  assignments: { [itemId: number]: { [personId: number]: number } };
  setAssignments: any;
  onFinish: () => void;
}) {
  // Active person focus
  const [activePersonId, setActivePersonId] = useState(people[0]?.id || 1);
  const [editingPerson, setEditingPerson] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<number | null>(null);

  // Add/remove people
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
    setPeople(people.filter(p => p.id !== id));
    setAssignments((prev: any) => {
      const out = { ...prev };
      for (const itemId in out) {
        if (out[itemId][id]) delete out[itemId][id];
      }
      return out;
    });
    if (activePersonId === id) {
      const remain = people.filter(p => p.id !== id);
      if (remain.length > 0) {
        setActivePersonId(remain[0].id);
      }
      // If no people remain, do not update activePersonId (or handle as needed)
    }
  };
  // Rename logic
  const handleEditPerson = (id: number, currentName: string) => {
    setEditingPerson(id);
    setNameInput(currentName);
  };
  const handleNameChange = (id: number) => {
    setPeople(people.map(p => (p.id === id ? { ...p, name: nameInput || p.name } : p)));
    setEditingPerson(null);
  };

  // Per person tip editing
  const setPersonTip = (id: number, tip: number) => {
    setPeople(people.map(p => (p.id === id ? { ...p, tipPercentage: tip } : p)));
  };

  // Assignment logic
  const setPersonQty = (itemId: number, personId: number, qty: number) => {
    setAssignments((prev: any) => {
      const itemAssign = { ...(prev[itemId] || {}) };
      itemAssign[personId] = qty;
      return { ...prev, [itemId]: itemAssign };
    });
  };

  // Unassigned qty for each item
  const getUnassignedQty = (item: any) => {
    const assigned = Object.values(assignments[item.id] || {}).reduce((a, b) => a + b, 0);
    return item.quantity - assigned;
  };

  // Calculate totals
  const perPerson = React.useMemo(() => {
    const result: { [personId: number]: { items: {desc: string, qty: number, total: number}[]; subtotal: number; tip: number; total: number } } = {};
    people.forEach(person => {
      let subtotal = 0, itemsArr: {desc: string, qty: number, total: number}[] = [];
      items.forEach(item => {
        const qty = assignments[item.id]?.[person.id] || 0;
        if (qty > 0) {
          itemsArr.push({ desc: item.description, qty, total: qty * item.rate });
          subtotal += qty * item.rate;
        }
      });
      const tip = +(subtotal * ((person.tipPercentage ?? 10) / 100)).toFixed(2);
      result[person.id] = {
        items: itemsArr,
        subtotal,
        tip,
        total: subtotal + tip,
      };
    });
    return result;
  }, [people, assignments, items]);

  const groupSubtotal = Object.values(perPerson).reduce((sum, p) => sum + p.subtotal, 0);
  const groupTip = Object.values(perPerson).reduce((sum, p) => sum + p.tip, 0);
  const groupTotal = groupSubtotal + groupTip;
  const billTotal = items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
  const outstanding = billTotal - groupSubtotal;

  return (
    <div className="centered-container">
      <h2>Your Bill is Finished being processed</h2>
      {image && (
        <img src={URL.createObjectURL(image)} alt="Bill preview" className="image-preview" />
      )}
      {/* People badges */}
      <div style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}>
        {people.map(person => (
          <div key={person.id} style={{ display: "flex", alignItems: "center" }}>
            <button
             className={`person-btn${activePersonId === person.id ? " active" : ""}`}
              style={{
                background: activePersonId === person.id ? person.color : "#eaeaea",
                color: activePersonId === person.id ? "#fff" : person.color,
                borderRadius: 20,
                padding: "6px 16px",
                fontWeight: 600,
                marginRight: 5,
                border: "none",
                cursor: "pointer",
                outline: activePersonId === person.id ? `2px solid ${person.color}` : "none",
                minWidth: 100,
                position: "relative",
              }}
              onClick={() => setActivePersonId(person.id)}
              tabIndex={0}
            >
              {editingPerson === person.id ? (
                <form
                  style={{ display: "inline" }}
                  onSubmit={e => { e.preventDefault(); handleNameChange(person.id); }}
                >
                  <input
                    type="text"
                    value={nameInput}
                    autoFocus
                    onBlur={() => handleNameChange(person.id)}
                    onChange={e => setNameInput(e.target.value)}
                    style={{
                      borderRadius: 8,
                      padding: "0 6px",
                      fontWeight: 600,
                      border: "1px solid #bbb",
                      width: 80,
                      marginRight: 2,
                    }}
                  />
                </form>
              ) : (
                <span
                  onDoubleClick={() => handleEditPerson(person.id, person.name)}
                  style={{
                    color: activePersonId === person.id ? "#fff" : person.color,
                    cursor: "pointer",
                  }}
                  title="Double click to rename"
                >
                  {person.name}
                </span>
              )}
              <span
                onClick={e => {
                  e.stopPropagation();
                  removePerson(person.id);
                }}
                style={{ marginLeft: 6, color: "#fff", cursor: "pointer", fontWeight: "bold", opacity: 0.7 }}
                title="Remove"
              >
                ×
              </span>
            </button>
          </div>
        ))}
        <button
          onClick={addPerson}
          style={{
            padding: "6px 12px", borderRadius: 20, background: "#eee", border: "none", fontWeight: 600, minWidth: 60,
          }}
        >
          + Add
        </button>
      </div>
      {/* Per-person tip */}
      {people.length > 0 && (
        <div style={{ margin: "8px 0 22px" }}>
          {people.map(
            person =>
              activePersonId === person.id && (
                <div
                  key={person.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: person.color,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Tip for {person.name}:</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={person.tipPercentage}
                    onChange={e => setPersonTip(person.id, Number(e.target.value))}
                    style={{
                      width: 50,
                      borderRadius: 7,
                      border: `1.5px solid ${person.color}`,
                      background: "#fff",
                      color: person.color,
                      fontWeight: 700,
                    }}
                  />
                  <span>%</span>
                </div>
              )
          )}
        </div>
      )}
      {/* Bill table */}
      <table style={{ width: "100%", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            {people.map(p => (
              <th key={p.id}>{p.name}</th>
            ))}
            <th>Unclaimed</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const unclaimed = getUnassignedQty(item);
            return (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>R{item.rate.toFixed(2)}</td>
                <td>{item.quantity}</td>
                {people.map(person => (
                  <td key={person.id}>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={assignments[item.id]?.[person.id] || 0}
                      onChange={e => {
                        const val = Math.max(0, Math.min(item.quantity, parseInt(e.target.value) || 0));
                        // Prevent over-assignment
                        const otherAssigned = people.reduce(
                          (sum, p) => p.id !== person.id ? sum + (assignments[item.id]?.[p.id] || 0) : sum,
                          0
                        );
                        if (val + otherAssigned > item.quantity) return;
                        setPersonQty(item.id, person.id, val);
                      }}
                      style={{
                        width: 36,
                        border: `2px solid ${person.color}`,
                        borderRadius: 6,
                        textAlign: "center",
                        background: activePersonId === person.id ? `${person.color}22` : "#fff",
                        color: person.color,
                        fontWeight: activePersonId === person.id ? "bold" : "normal"
                      }}
                    />
                  </td>
                ))}
                <td style={{ color: unclaimed > 0 ? "red" : "#888" }}>{unclaimed}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ margin: "8px 0 16px", fontWeight: 600 }}>
        <span>The Total payment is: </span>
        <span style={{ color: "#222", fontSize: 20 }}>R{billTotal.toFixed(2)}</span>
        {outstanding > 0 && (
          <span style={{ marginLeft: 20, color: "#2196F3" }}>Amount left to pay is: R{outstanding.toFixed(2)}</span>
        )}
      </div>
      {/* Unclaimed prompt */}
      {items.some(item => getUnassignedQty(item) > 0) && (
        <div style={{ background: "#fff8e1", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>Some items are unclaimed!</strong> Please assign all items to people.
        </div>
      )}
      {/* Per-person summary */}
      <div>
        <h3>Each individual total payment is:</h3>
        <table style={{ width: "100%", marginTop: 8 }}>
          <thead>
            <tr>
              <th>Person</th>
              <th>Item summary</th>
              <th>Tip</th>
              <th>Sub Total</th>
              <th>Total payment</th>
            </tr>
          </thead>
          <tbody>
            {people.map(person => (
              <tr key={person.id}>
                <td style={{ color: person.color, fontWeight: 700 }}>{person.name}</td>
                <td>
                  <div
                    style={{
                      border: `2px solid ${person.color}`,
                      borderRadius: 14,
                      padding: "3px 11px",
                      background: `${person.color}12`,
                      color: person.color,
                      cursor: perPerson[person.id].items.length > 0 ? "pointer" : "not-allowed",
                      display: "inline-block",
                      minWidth: 60,
                      textAlign: "center",
                      fontWeight: 600,
                      position: "relative",
                    }}
                    onClick={() =>
                      perPerson[person.id].items.length > 0
                        ? setExpandedSummary(expandedSummary === person.id ? null : person.id)
                        : undefined
                    }
                  >
                    {perPerson[person.id].items.length > 0
                      ? `${perPerson[person.id].items.length} item${perPerson[person.id].items.length > 1 ? "s" : ""}`
                      : "—"}
                    {expandedSummary === person.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "120%",
                          left: 0,
                          minWidth: 140,
                          background: "#fff",
                          border: `2px solid ${person.color}`,
                          borderRadius: 14,
                          boxShadow: "0 2px 14px #0002",
                          color: "#333",
                          zIndex: 10,
                          padding: "10px 18px",
                          fontWeight: 400,
                        }}
                        onMouseLeave={() => setExpandedSummary(null)}
                      >
                        <div style={{ fontWeight: 700, color: person.color, marginBottom: 4 }}>
                          {person.name}'s Items
                        </div>
                        {perPerson[person.id].items.map((it, i) => (
                          <div key={i}>
                            {it.desc} x{it.qty} <span style={{ float: "right", color: "#888" }}>R{it.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td>R{perPerson[person.id].tip.toFixed(2)}</td>
                <td>R{perPerson[person.id].subtotal.toFixed(2)}</td>
                <td style={{ color: person.color, fontWeight: 700 }}>R{perPerson[person.id].total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 24, fontWeight: 600 }}>
        <span>The Group's total bill is: </span>
        <span style={{ color: "#222" }}>R{groupSubtotal.toFixed(2)}</span>
        <span style={{ marginLeft: 18 }}>The Tip is: R{groupTip.toFixed(2)}</span>
      </div>
      <div style={{ margin: "30px 0" }}>
        <button className="button-primary" disabled={outstanding > 0} onClick={onFinish}>
          Save and continue
        </button>
      </div>
    </div>
  );
}

// MAIN APP
export default function BillSplitterApp() {
  // 0 = Welcome, 1 = Camera, 2 = Processing, 3 = Assignment, 4 = Completion
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // People and assignments
  const [people, setPeople] = useState([
    { id: 1, name: "Person 1", color: COLORS[0], tipPercentage: 10 },
  ]);
  const [assignments, setAssignments] = useState<{ [itemId: number]: { [personId: number]: number } }>({});

  // Handle Gemini image processing
  useEffect(() => {
    if (step === 2 && image) {
      setProcessing(true);
      setError(null);
      const processWithGemini = async () => {
        try {
          const toBase64 = (file: File) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
            });
          const base64data = await toBase64(image);
          const response = await fetch("/api/process-bill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: base64data }),
          });
          if (!response.ok) throw new Error(`Failed to process bill: ${response.statusText}`);
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            setItems(
              data.items.map((item: any, idx: number) => ({
                ...item,
                id: item.id ?? idx + 1,
                quantity: item.quantity ?? 1,
                rate: item.rate ?? (item.amount || 0),
              }))
            );
          } else {
            setItems([]);
          }
          setStep(3);
        } catch (err: any) {
          setError(err.message || "Failed to process bill. Please try again.");
        } finally {
          setProcessing(false);
        }
      };
      processWithGemini();
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
      <style jsx global>{`
        html, body { background-color: #f4f4f4; height: 100%; color: #222; }
        .centered-container { max-width: 480px; margin: 30px auto; background: #fff; border-radius: 18px; padding: 32px 24px; box-shadow: 0 2px 20px #0001; }
        .button-primary { background: #4F8EF7; color: #fff; border: none; border-radius: 1em; padding: 0.7em 1.5em; font-weight: 700; font-size: 1rem; cursor: pointer; }
        .button-primary:disabled { background: #a0c7fd; cursor: not-allowed; }
        .image-preview { border-radius: 1em; border: 1px solid #ddd; width: 100%; max-width: 300px; }
        .processing-spinner { display: flex; justify-content: center; align-items: center; height: 48px; margin-bottom: 1rem; }
        .processing-dot { font-size: 2.5rem; color: #4F8EF7; animation: pulse 1s infinite cubic-bezier(0.4,0,0.6,1); }
        @keyframes pulse { 0% { opacity: 0.4; transform: scale(1);} 50% { opacity: 1; transform: scale(1.2);} 100% { opacity: 0.4; transform: scale(1);} }
        .camera-box { display: block; padding: 2em; border: 2px dashed #aaa; border-radius: 1.5em; text-align: center; cursor: pointer; color: #888; font-weight: 600; }
        .camera-label { font-size: 1.2em; }
        .hidden { display: none; }
      `}</style>
    </>
  );
}