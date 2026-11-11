"use client";
import { useEffect, useRef, useState } from "react";
import { formatFecha, hoyChile } from "@/lib/fecha";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Calendario desplegable. Guarda la fecha en un input oculto ("YYYY-MM-DD" o vacío).
export default function DatePicker({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  const initial = defaultValue ?? "";
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const base = value || hoyChile();
  const [view, setView] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Cerrar al tocar fuera
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  // Volver al valor inicial cuando el formulario se reinicia tras guardar
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const reset = () => setValue(initial);
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [initial]);

  const toggle = () => {
    if (!open) {
      const b = value || hoyChile();
      setView({ y: Number(b.slice(0, 4)), m: Number(b.slice(5, 7)) - 1 });
    }
    setOpen(!open);
  };
  const move = (delta: number) =>
    setView(({ y, m }) => {
      const t = m + delta;
      return { y: y + Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
    });
  const pick = (v: string) => {
    setValue(v);
    setOpen(false);
  };

  const hoy = hoyChile();
  const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay(); // 0 = domingo
  const offset = (first + 6) % 7; // semana empieza el lunes
  const diasMes = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const celdas: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];

  return (
    <div className="field" ref={box}>
      <span className="flabel">{label}</span>
      <input ref={input} type="hidden" name={name} value={value} />
      <button type="button" className={`picker-btn ${value ? "" : "empty"}`} onClick={toggle} aria-expanded={open}>
        <span aria-hidden>📅</span> {value ? formatFecha(value) : "Elegir fecha"}
        <span className="caret" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="cal" role="dialog" aria-label={`Calendario: ${label}`}>
          <div className="cal-head">
            <button type="button" className="cal-nav" onClick={() => move(-1)} aria-label="Mes anterior">‹</button>
            <b>{MESES[view.m]} {view.y}</b>
            <button type="button" className="cal-nav" onClick={() => move(1)} aria-label="Mes siguiente">›</button>
          </div>
          <div className="cal-grid">
            {DIAS.map((d) => <span key={d} className="cal-dow">{d}</span>)}
            {celdas.map((d, i) => {
              if (d === null) return <span key={`x${i}`} />;
              const v = iso(view.y, view.m, d);
              return (
                <button
                  type="button"
                  key={v}
                  className={`cal-day ${v === value ? "sel" : ""} ${v === hoy ? "today" : ""}`}
                  onClick={() => pick(v)}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="cal-foot">
            <button type="button" className="btn ghost small" onClick={() => pick(hoy)}>Hoy</button>
            {value && <button type="button" className="btn ghost small" onClick={() => pick("")}>Quitar fecha</button>}
          </div>
        </div>
      )}
    </div>
  );
}
