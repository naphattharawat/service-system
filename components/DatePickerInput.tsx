"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { Thai } from "flatpickr/dist/l10n/th.js";
import "flatpickr/dist/flatpickr.min.css";

// Ported from old/index.html.txt#makeFp: click-to-open (not focus-to-open),
// dd/mm/yyyy display, Thai locale.
export function DatePickerInput({
  id,
  placeholder,
  defaultValue,
  onChange,
  style,
}: {
  id?: string;
  placeholder: string;
  /** Initial date, formatted "d/m/Y" (matching dateFormat below) — e.g. to prefill from a previously-saved value. */
  defaultValue?: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  // Captured once, not reactive — this is meant for one-time initial prefill
  // (e.g. re-opening a completed job's saved done-date), consistent with how
  // callers key={}-remount this component when the "record" it edits changes.
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const fp = flatpickr(el, {
      locale: Thai,
      dateFormat: "d/m/Y",
      disableMobile: true,
      clickOpens: false,
      defaultDate: defaultValueRef.current || undefined,
      onChange: (_dates, dateStr) => onChangeRef.current(dateStr),
    });

    const toggle = () => (fp.isOpen ? fp.close() : fp.open());
    el.addEventListener("click", toggle);
    return () => {
      el.removeEventListener("click", toggle);
      fp.destroy();
    };
  }, []);

  return <input ref={inputRef} id={id} placeholder={placeholder} readOnly style={style} />;
}
