import Link from "next/link";
import type { Tarea } from "@/lib/types";
import { diasHasta, formatFecha } from "@/lib/fecha";

export function DueBadge({ fecha, estado }: { fecha: string | null; estado: string }) {
  if (estado === "lista") return <span className="badge ok">Lista</span>;
  const d = diasHasta(fecha);
  if (d === null) return <span className="badge">Sin fecha</span>;
  if (d < 0) return <span className="badge danger">Atrasada {-d} d</span>;
  if (d === 0) return <span className="badge warn">Hoy</span>;
  if (d <= 3) return <span className="badge warn">En {d} d</span>;
  return <span className="badge">En {d} d</span>;
}

export function TareaMini({ t, nombre }: { t: Tarea; nombre: Map<string, string> }) {
  const resp = t.tarea_personas.map((r) => nombre.get(r.persona_id)).filter(Boolean);
  return (
    <Link href={`/tareas#${t.id}`} className="card row mini">
      <div>
        <b>{t.titulo}</b>
        <div className="muted small">
          {formatFecha(t.fecha_entrega)}
          {resp.length > 0 && <> · {resp.join(", ")}</>}
        </div>
      </div>
      <DueBadge fecha={t.fecha_entrega} estado={t.estado} />
    </Link>
  );
}
