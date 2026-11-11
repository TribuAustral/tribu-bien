import Link from "next/link";
import Shell from "../Shell";
import SubmitButton from "../SubmitButton";
import { addPersona, deletePersona, updatePersona } from "../actions";
import { getCargos, getEventos, getPersonas, getTareas } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const [personas, cargos, tareas, eventos] = await Promise.all([getPersonas(), getCargos(), getTareas(), getEventos().catch(() => [])]);

  return (
    <Shell>
      <div className="page-head">
        <h1>Personas</h1>
      </div>
      <form action={addPersona} className="card inline">
        <input name="nombre" placeholder="Nombre" required />
        <input name="contacto" placeholder="Teléfono o correo (opcional)" />
        <SubmitButton>+ Agregar persona</SubmitButton>
      </form>

      <div className="list">
        {personas.map((p) => {
          const susCargos = cargos.filter((c) => c.cargo_personas.some((cp) => cp.persona_id === p.id));
          const susTareas = tareas.filter(
            (t) => t.estado !== "lista" &&
              (t.tarea_personas.some((r) => r.persona_id === p.id) || t.subtareas.some((s) => s.persona_id === p.id && !s.hecha))
          );
          const susEventoTareas = eventos.flatMap((e) =>
            e.evento_tareas.filter((t) => t.persona_id === p.id && !t.hecha).map((t) => ({ t, e }))
          );
          return (
            <article key={p.id} className="card">
              <div className="row">
                <div>
                  <b>{p.nombre}</b>
                  {p.contacto && <span className="muted small"> · {p.contacto}</span>}
                </div>
                <span className="muted small">{susTareas.length + susEventoTareas.length} tarea(s) abiertas</span>
              </div>
              <div className="chips">
                {susCargos.map((c) => <Link key={c.id} href={`/cargos#${c.id}`} className="chip">{c.nombre}</Link>)}
                {susCargos.length === 0 && <span className="muted small">Sin cargo</span>}
              </div>
              {susTareas.length > 0 && (
                <ul className="small">
                  {susTareas.map((t) => <li key={t.id}><Link href={`/tareas#${t.id}`}>{t.titulo}</Link></li>)}
                </ul>
              )}
              {susEventoTareas.length > 0 && (
                <ul className="small">
                  {susEventoTareas.map(({ t, e }) => (
                    <li key={t.id}><Link href={`/eventos?abrir=${e.id}#${e.id}`}>{t.titulo}</Link> <span className="muted">· evento: {e.nombre}</span></li>
                  ))}
                </ul>
              )}
              <details>
                <summary className="link">Editar</summary>
                <form action={updatePersona} className="inline">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="nombre" defaultValue={p.nombre} required />
                  <input name="contacto" defaultValue={p.contacto ?? ""} placeholder="Contacto" />
                  <SubmitButton className="btn small">Guardar</SubmitButton>
                </form>
                <form action={deletePersona}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton className="btn danger small" confirm={`¿Eliminar a ${p.nombre}? Se quitará de cargos y tareas.`}>Eliminar</SubmitButton>
                </form>
              </details>
            </article>
          );
        })}
        {personas.length === 0 && <p className="muted">Aún no hay personas.</p>}
      </div>
    </Shell>
  );
}
