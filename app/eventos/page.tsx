import Shell from "../Shell";
import EventoCard, { EventoForm } from "./EventoCard";
import { addEvento } from "../actions";
import { getEventos, getPersonas } from "@/lib/data";
import { diasHasta } from "@/lib/fecha";

export const dynamic = "force-dynamic";

export default async function EventosPage({ searchParams }: { searchParams: Promise<{ abrir?: string }> }) {
  const { abrir = "" } = await searchParams;
  const [eventos, personas] = await Promise.all([getEventos(), getPersonas()]);
  const nombre = new Map(personas.map((p) => [p.id, p.nombre]));
  const pasados = eventos.filter((e) => (diasHasta(e.fecha) ?? 0) < 0).reverse();
  const proximos = eventos.filter((e) => (diasHasta(e.fecha) ?? 0) >= 0);

  return (
    <Shell>
      <div className="page-head">
        <h1>Eventos</h1>
        <details className="add">
          <summary className="btn">+ Nuevo evento</summary>
          <div className="card"><EventoForm action={addEvento} submitLabel="Crear evento" /></div>
        </details>
      </div>

      <div className="list">
        {proximos.length === 0 && <p className="muted">No hay eventos próximos. Crea uno con “+ Nuevo evento”.</p>}
        {proximos.length > 0 && <p className="muted small">Toca un evento para abrirlo y ver sus tareas.</p>}
        {proximos.map((e) => <EventoCard key={e.id} e={e} personas={personas} nombre={nombre} abierto={e.id === abrir} />)}
      </div>

      {pasados.length > 0 && (
        <details>
          <summary className="link">Ver eventos pasados ({pasados.length})</summary>
          <div className="list" style={{ marginTop: 10 }}>
            {pasados.map((e) => <EventoCard key={e.id} e={e} personas={personas} nombre={nombre} abierto={e.id === abrir} />)}
          </div>
        </details>
      )}
    </Shell>
  );
}
