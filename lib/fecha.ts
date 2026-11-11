// Fechas tipo "2026-11-20" (sin zona horaria) -> "vie 20 nov 2026"
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatFecha(f: string | null): string {
  if (!f) return "Sin fecha";
  const [y, m, d] = f.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${DIAS[date.getUTCDay()]} ${d} ${MESES[m - 1]} ${y}`;
}

// "18:30:00" -> "18:30"
export function formatHora(h: string | null): string {
  return h ? h.slice(0, 5) : "";
}

export function hoyChile(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
}

export function diasHasta(f: string | null): number | null {
  if (!f) return null;
  const a = Date.parse(hoyChile() + "T00:00:00Z");
  const b = Date.parse(f + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}
