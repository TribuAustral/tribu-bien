import Link from "next/link";
import Shell from "../Shell";
import SubmitButton from "../SubmitButton";
import TareaForm from "./TareaForm";
import { DueBadge } from "./TareaMini";
import {
  addSubtarea, addTarea, deleteSubtarea, deleteTarea, setEstadoTarea, toggleSubtarea, updateTarea,
} from "../actions";
import { getCargos, getPersonas, getTareas } from "@/lib/data";
import { formatFecha } from "@/lib/fecha";
import { ESTADOS } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = Promise<{ ver?: string; persona?: string }>;

export default async function TareasPage({ searchParams }: { searchParams: SP }) {
  const { ver = "abiertas", persona = "" } = await searchParams;
  const [tareas, cargos, personas] = await Promise.all([getTareas(), getCargos(), getPersonas()]);
  const nombre = new Map(personas.map((p) => [p.id, p.nombre]));
  const cargoNombre = new Map(cargos.map((c) => [c.id, c.nombre]));

  const filtradas = tareas.filter((t) => {
    if (ver === "abiertas" && t.estado === "lista") return false;
    if (ver === "listas" && t.estado !== "lista") return false;
    if (persona) {
      const esResp = t.tarea_personas.some((r) => r.persona_id === persona) || t.subtareas.some((s) => s.persona_id === persona);
      if (!esResp) return false;
    }
    return true;
  });

  const q = (o: Record<string, string>) => {
    const p = new URLSearchParams({ ver, persona, ...o });
    if (!p.get("persona")) p.delete("persona");
    return `/tareas?${p.toString()}`;
  };

  return (
    <Shell>
      <div className="page-head">
        <h1>Tareas</h1>
        <details className="add">
          <summary className="btn">+ Nueva tarea</summary>
          <div className="card"><TareaForm action={addTarea} cargos={cargos} personas={personas} submitLabel="Crear tarea" /></div>
        </details>
      </div>

      <div className="filters">
        {[["abiertas", "Abiertas"], ["listas", "Listas"], ["todas", "Todas"]].map(([id, label]) => (
          <Link key={id} href={q({ ver: id })} className={`chip ${ver === id ? "on" : ""}`}>{label}</Link>
        ))}
        <span className="sep" />
        <Link href={q({ persona: "" })} className={`chip ${!persona ? "on" : ""}`}>Todos</Link>
        {personas.map((p) => (
          <Link key={p.id} href={q({ persona: p.id })} className={`chip ${persona === p.id ? "on" : ""}`}>{p.nombre}</Link>
        ))}
      </div>

      <div className="list">
        {filtradas.length === 0 && <p className="muted">No hay tareas con este filtro.</p>}
        {filtradas.map((t) => {
          const para = [t.para_cargo_id ? cargoNombre.get(t.para_cargo_id) : null, t.para].filter(Boolean).join(" · ");
          const hechas = t.subtareas.filter((s) => s.hecha).length;
          return (
            <article key={t.id} id={t.id} className={`card tarea ${t.estado === "lista" ? "done" : ""}`}>
              <div className="row">
                <h3>{t.titulo}</h3>
                <DueBadge fecha={t.fecha_entrega} estado={t.estado} />
              </div>
              <div className="meta small">
                <span>📅 {formatFecha(t.fecha_entrega)}</span>
                {para && <span>🎯 Para: {para}</span>}
              </div>
              {t.descripcion && <p className="pre">{t.descripcion}</p>}

              <div className="chips">
                <span className="muted small">Responsables:</span>
                {t.tarea_personas.length === 0 && <span className="muted small">nadie asignado</span>}
                {t.tarea_personas.map((r) => <span key={r.persona_id} className="chip">{nombre.get(r.persona_id)}</span>)}
              </div>

              <div className="sub">
                <div className="small muted">Quién hace qué {t.subtareas.length > 0 && `(${hechas}/${t.subtareas.length})`}</div>
                {t.subtareas.map((s) => (
                  <div key={s.id} className="subrow">
                    <form action={toggleSubtarea}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="hecha" value={String(!s.hecha)} />
                      <SubmitButton className={`tick ${s.hecha ? "on" : ""}`}>{s.hecha ? "✓" : ""}</SubmitButton>
                    </form>
                    <span className={s.hecha ? "strike" : ""}>{s.descripcion}</span>
                    <span className="chip">{s.persona_id ? nombre.get(s.persona_id) : "sin asignar"}</span>
                    <form action={deleteSubtarea}>
                      <input type="hidden" name="id" value={s.id} />
                      <SubmitButton className="x">×</SubmitButton>
                    </form>
                  </div>
                ))}
                <form action={addSubtarea} className="inline">
                  <input type="hidden" name="tarea_id" value={t.id} />
                  <input name="descripcion" placeholder="Ej: Llevar las vallas" required />
                  <select name="persona_id" defaultValue="">
                    <option value="">¿Quién?</option>
                    {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <SubmitButton className="btn small">Agregar</SubmitButton>
                </form>
              </div>

              <div className="row actions">
                <div className="estados">
                  {ESTADOS.map((e) => (
                    <form key={e.id} action={setEstadoTarea}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="estado" value={e.id} />
                      <SubmitButton className={`chip ${t.estado === e.id ? "on" : ""}`}>{e.label}</SubmitButton>
                    </form>
                  ))}
                </div>
              </div>

              <details>
                <summary className="link">Editar tarea</summary>
                <TareaForm action={updateTarea} tarea={t} cargos={cargos} personas={personas} submitLabel="Guardar cambios" />
                <form action={deleteTarea}>
                  <input type="hidden" name="id" value={t.id} />
                  <SubmitButton className="btn danger small" confirm={`¿Eliminar la tarea "${t.titulo}"?`}>Eliminar tarea</SubmitButton>
                </form>
              </details>
            </article>
          );
        })}
      </div>
    </Shell>
  );
}
