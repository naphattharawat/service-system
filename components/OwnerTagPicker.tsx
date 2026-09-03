"use client";

import { useState } from "react";

// Ported from old/index.html.txt's addOwnerTagWithName/addOwnerTag/addAssignTag —
// owner is stored as a single comma-joined string on the job row, so this
// component just splits/joins that same wire format rather than introducing
// a new schema.
export function OwnerTagPicker({
  value,
  staffOptions,
  onChange,
}: {
  value: string;
  staffOptions: string[];
  onChange: (csv: string) => void;
}) {
  const names = value.split(",").map((s) => s.trim()).filter(Boolean);
  const [selected, setSelected] = useState("");

  function addTag(name: string) {
    if (!name || name === "-" || names.includes(name)) return;
    onChange([...names, name].join(", "));
  }

  function removeTag(name: string) {
    onChange(names.filter((n) => n !== name).join(", "));
  }

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0 7px", minHeight: 28 }}>
        {names.map((name) => (
          <span
            key={name}
            style={{
              padding: "4px 10px", borderRadius: 99, fontSize: 13, background: "rgba(124,158,248,.15)",
              color: "var(--p)", border: "0.5px solid rgba(124,158,248,.3)", display: "inline-flex",
              alignItems: "center", gap: 5,
            }}
          >
            {name}
            <span onClick={() => removeTag(name)} style={{ fontSize: 14, lineHeight: 1, opacity: 0.6, cursor: "pointer" }}>
              ×
            </span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ flex: 1, margin: 0 }}>
          <option value="">— เลือก Staff เพิ่ม —</option>
          {staffOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          type="button" className="btn secondary" style={{ margin: 0, width: "auto", padding: "10px 12px" }}
          onClick={() => { addTag(selected); setSelected(""); }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 15, margin: 0 }}>add</span>
        </button>
      </div>
    </>
  );
}
