import Shell from "../Shell";
import SubmitButton from "../SubmitButton";
import { addCargo, assignPersonaCargo, deleteCargo, unassignPersonaCargo, updateCargo } from "../actions";
import { getCargos, getPersonas } from "@/lib/data";
import { AREAS } from "@/lib/types";

export const dynamic = "force-dynamic";

function AreaSelect({ value }: { value?: string }) {
  return (
    <select name="area" defaultValue={value ?? "directiva"}>
      {AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
    </select>
  );
}

export default async function CargosPage() {
  const [cargos, personas] = await Promise.all([getCargos(), getPersonas()]);
  const nombre = new Map(personas.map((p) => [p.id, p.nombre]));

  return (
    <Shell>
      <div className="page-head">
        <h1>Cargos y estatutos</h1>
        <details className="add">
          <summary className="btn">+ Nuevo cargo</summary>
          <form action={addCargo} className="card stack">
            <label>Nombre del cargo<input name="nombre" placeholder="Ej: Tesorero" required /></label>
            <label>Área<AreaSelect /></label>
            <label>En qué consiste (estatuto)<textarea name="estatuto" rows={5} placeholder="Funciones y responsabilidades del cargo" /></label>
            <SubmitButton>Crear cargo</SubmitButton>
          </form>
        </details>
      </div>

      {AREAS.map((area) => {
        const lista = cargos.filter((c) => c.area === area.id);
        if (lista.length === 0) return null;
        return (
          <section key={area.id}>
            <h2>{area.label}</h2>
            <div className="grid">
              {lista.map((c) => {
                const asignados = new Set(c.cargo_personas.map((cp) => cp.persona_id));
                const disponibles = personas.filter((p) => !asignados.has(p.id));
                return (
                  <article key={c.id} id={c.id} className="card cargo">
                    <h3>{c.nombre}</h3>

                    <div className="chips">
                      {c.cargo_personas.length === 0 && <span className="muted small">Sin persona asignada</span>}
                      {c.cargo_personas.map((cp) => (
                        <form key={cp.persona_id} action={unassignPersonaCargo} className="chip">
                          <input type="hidden" name="cargo_id" value={c.id} />
                          <input type="hidden" name="persona_id" value={cp.persona_id} />
                          {nombre.get(cp.persona_id) ?? "?"}
                          <SubmitButton className="x" confirm="¿Quitar a esta persona del cargo?">×</SubmitButton>
                        </form>
                      ))}
                    </div>

                    <form action={assignPersonaCargo} className="inline">
                      <input type="hidden" name="cargo_id" value={c.id} />
                      <select name="persona_id" defaultValue="">
                        <option value="">Elegir persona…</option>
                        {disponibles.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                      <input name="nueva_persona" placeholder="…o nombre nuevo" />
                      <SubmitButton className="btn small">Agregar</SubmitButton>
                    </form>

                    <p className="pre estatuto">{c.estatuto || <span className="muted">Sin descripción todavía.</span>}</p>

                    <details>
                      <summary className="link">Editar cargo</summary>
                      <form action={updateCargo} className="stack">
                        <input type="hidden" name="id" value={c.id} />
                        <label>Nombre<input name="nombre" defaultValue={c.nombre} required /></label>
                        <label>Área<AreaSelect value={c.area} /></label>
                        <label>En qué consiste (estatuto)<textarea name="estatuto" rows={8} defaultValue={c.estatuto} /></label>
                        <SubmitButton>Guardar</SubmitButton>
                      </form>
                      <form action={deleteCargo}>
                        <input type="hidden" name="id" value={c.id} />
                        <SubmitButton className="btn danger small" confirm={`¿Eliminar el cargo "${c.nombre}"?`}>Eliminar cargo</SubmitButton>
                      </form>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      {cargos.length === 0 && <p className="muted">Todavía no hay cargos. Crea el primero con “+ Nuevo cargo”.</p>}
    </Shell>
  );
}
