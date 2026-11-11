import Link from "next/link";
import Shell from "./Shell";
import InstallButton from "./InstallButton";
import SubmitButton from "./SubmitButton";
import { updateClub } from "./actions";
import { getCargos, getClub, getEventos, getPersonas, getTareas } from "@/lib/data";
import { diasHasta, formatFecha, formatHora, hoyChile } from "@/lib/fecha";
import { TareaMini } from "./tareas/TareaMini";

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const [club, tareas, cargos, personas, eventos] = await Promise.all([
    getClub(), getTareas(), getCargos(), getPersonas(), getEventos().catch(() => []),
  ]);
  const proxEventos = eventos.filter((e) => {
    const d = diasHasta(e.fecha);
    return d !== null && d >= 0 && d <= 30;
  });
  const abiertas = tareas.filter((t) => t.estado !== "lista");
  const vencidas = abiertas.filter((t) => (diasHasta(t.fecha_entrega) ?? 1) < 0);
  const proximas = abiertas.filter((t) => {
    const d = diasHasta(t.fecha_entrega);
    return d !== null && d >= 0 && d <= 14;
  });
  const sinFecha = abiertas.filter((t) => !t.fecha_entrega);
  const cargosVacios = cargos.filter((c) => c.cargo_personas.length === 0);
  const nombre = new Map(personas.map((p) => [p.id, p.nombre]));

  return (
    <Shell>
      <section className="hero card">
        <h1>{club.nombre}</h1>
        {club.descripcion ? <p className="pre">{club.descripcion}</p> : <p className="muted">Agrega una descripción del club con “Editar”.</p>}
        <details>
          <summary className="link">Editar</summary>
          <form action={updateClub} className="stack">
            <label>Nombre del club<input name="nombre" defaultValue={club.nombre} required /></label>
            <label>Descripción / avisos<textarea name="descripcion" rows={4} defaultValue={club.descripcion} /></label>
            <SubmitButton>Guardar</SubmitButton>
          </form>
        </details>
      </section>

      <InstallButton />

      <section className="stats">
        <Link href="/tareas" className="stat card"><b>{abiertas.length}</b><span>Tareas abiertas</span></Link>
        <Link href="/tareas" className={`stat card ${vencidas.length ? "danger" : ""}`}><b>{vencidas.length}</b><span>Atrasadas</span></Link>
        <Link href="/cargos" className="stat card"><b>{cargos.length}</b><span>Cargos</span></Link>
        <Link href="/personas" className="stat card"><b>{personas.length}</b><span>Personas</span></Link>
      </section>

      {proxEventos.length > 0 && (
        <section>
          <h2>Próximos eventos (30 días)</h2>
          <div className="list">
            {proxEventos.map((e) => {
              const pend = e.evento_tareas.filter((t) => !t.hecha).length;
              return (
                <Link key={e.id} href={`/eventos?abrir=${e.id}#${e.id}`} className="card row mini">
                  <div>
                    <b>{e.nombre}</b>
                    <div className="muted small">
                      {formatFecha(e.fecha)}{e.hora && ` · ${formatHora(e.hora)}`}{e.lugar && ` · ${e.lugar}`}
                    </div>
                  </div>
                  <span className={`badge ${pend ? "warn" : "ok"}`}>{pend ? `${pend} tarea(s) pendientes` : "Todo listo"}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {vencidas.length > 0 && (
        <section>
          <h2>⚠️ Atrasadas</h2>
          <div className="list">{vencidas.map((t) => <TareaMini key={t.id} t={t} nombre={nombre} />)}</div>
        </section>
      )}

      <section>
        <h2>Próximas 2 semanas</h2>
        {proximas.length === 0 ? <p className="muted">Nada con fecha en los próximos 14 días.</p> : (
          <div className="list">{proximas.map((t) => <TareaMini key={t.id} t={t} nombre={nombre} />)}</div>
        )}
      </section>

      {sinFecha.length > 0 && (
        <section>
          <h2>Sin fecha</h2>
          <div className="list">{sinFecha.map((t) => <TareaMini key={t.id} t={t} nombre={nombre} />)}</div>
        </section>
      )}

      {cargosVacios.length > 0 && (
        <section>
          <h2>Cargos sin persona asignada</h2>
          <div className="chips">
            {cargosVacios.map((c) => <Link key={c.id} href={`/cargos#${c.id}`} className="chip">{c.nombre}</Link>)}
          </div>
        </section>
      )}
      <p className="muted small">Hoy: {formatFecha(hoyChile())}</p>
    </Shell>
  );
}
