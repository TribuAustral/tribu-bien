"use client";
import { useEffect, useRef, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const toMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const toHora = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

// Hora con barra deslizable (de 15 en 15 min). Guarda "HH:MM" o vacío en un input oculto.
export default function TimeSlider({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  const initial = defaultValue ? defaultValue.slice(0, 5) : "";
  const [value, setValue] = useState(initial);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const reset = () => setValue(initial);
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [initial]);

  const min = value ? toMin(value) : 0;
  const nudge = (d: number) => setValue(toHora(Math.min(1425, Math.max(0, min + d))));

  return (
    <div className="field">
      <span className="flabel">{label}</span>
      <input ref={input} type="hidden" name={name} value={value} />
      {!value ? (
        <button type="button" className="picker-btn empty" onClick={() => setValue("19:00")}>
          <span aria-hidden>🕒</span> Elegir hora
        </button>
      ) : (
        <div className="hora-box">
          <div className="hora-top">
            <button type="button" className="cal-nav" onClick={() => nudge(-15)} aria-label="15 minutos antes">−</button>
            <b className="hora-big">🕒 {value}</b>
            <button type="button" className="cal-nav" onClick={() => nudge(15)} aria-label="15 minutos después">+</button>
          </div>
          <input
            type="range"
            min={0}
            max={1425}
            step={15}
            value={min}
            onChange={(e) => setValue(toHora(Number(e.target.value)))}
            aria-label={label}
            className="hora-range"
          />
          <div className="hora-marks small muted"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:45</span></div>
          <button type="button" className="link" onClick={() => setValue("")}>Quitar hora</button>
        </div>
      )}
    </div>
  );
}
