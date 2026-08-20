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
  onChange,
  style,
}: {
  id?: string;
  placeholder: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);

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
