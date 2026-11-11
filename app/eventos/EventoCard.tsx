import SubmitButton from "../SubmitButton";
import DatePicker from "../DatePicker";
import TimeSlider from "../TimeSlider";
import { DueBadge } from "../tareas/TareaMini";
import {
  addEventoTarea, deleteEvento, deleteEventoTarea, toggleEventoTarea, updateEvento, updateEventoTarea,
} from "../actions";
import { diasHasta, formatFecha, formatHora } from "@/lib/fecha";
import type { Evento, EventoTarea, Persona } from "@/lib/types";

function CuandoBadge({ fecha }: { fecha: string | null }) {
  const d = diasHasta(fecha);
  if (d === null) return <span className="badge">Sin fecha</span>;
  if (d < 0) return <span className="badge ok">Ya pasó</span>;
  if (d === 0) return <span className="badge warn">¡Es hoy!</span>;
  if (d === 1) return <span className="badge warn">Mañana</span>;
  return <span className="badge">En {d} d</span>;
}

export function EventoForm({ evento, submitLabel, action }: {
  evento?: Evento; submitLabel: string; action: (fd: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="stack">
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <label>Nombre del evento<input name="nombre" defaultValue={evento?.nombre} placeholder="Ej: Campeonato regional" required /></label>
      <div className="two">
        <DatePicker name="fecha" label="Fecha" defaultValue={evento?.fecha} />
        <TimeSlider name="hora" label="Hora" defaultValue={evento?.hora} />
      </div>
      <label>Lugar<input name="lugar" defaultValue={evento?.lugar ?? ""} placeholder="Ej: Estadio municipal" /></label>
      <label>Descripción<textarea name="descripcion" rows={3} defaultValue={evento?.descripcion} placeholder="Detalles, avisos, qué llevar…" /></label>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

function TareaFields({ t, personas }: { t?: EventoTarea; personas: Persona[] }) {
  return (
    <>
      <label>¿Qué hay que hacer?<input name="titulo" defaultValue={t?.titulo} placeholder="Ej: Comprar las medallas" required /></label>
      <div className="two">
        <label>¿Quién lo hace?
          <select name="persona_id" defaultValue={t?.persona_id ?? ""}>
            <option value="">— Sin asignar —</option>
            {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </label>
        <DatePicker name="fecha_limite" label="¿Hasta cuándo?" defaultValue={t?.fecha_limite} />
      </div>
      <label>¿Cómo lo hace?<textarea name="como" rows={3} defaultValue={t?.como} placeholder="Ej: Pedirlas en la tienda del centro, pagar con la caja del club" /></label>
    </>
  );
}

function TareaEvento({ t, personas, nombre }: { t: EventoTarea; personas: Persona[]; nombre: Map<string, string> }) {
  return (
    <div className="etarea">
      <form action={toggleEventoTarea}>
        <input type="hidden" name="id" value={t.id} />
        <input type="hidden" name="hecha" value={String(!t.hecha)} />
        <SubmitButton className={`tick ${t.hecha ? "on" : ""}`}>{t.hecha ? "✓" : ""}</SubmitButton>
      </form>
      <details>
        <summary>
          <span className={`etitulo ${t.hecha ? "strike" : ""}`}>{t.titulo}</span>
          <span className="chip">{t.persona_id ? nombre.get(t.persona_id) ?? "?" : "Sin asignar"}</span>
          <DueBadge fecha={t.fecha_limite} estado={t.hecha ? "lista" : "pendiente"} />
          <span className="caret" aria-hidden>▾</span>
        </summary>
        <div className="edetalle">
          <p className="small"><b>Quién:</b> {t.persona_id ? nombre.get(t.persona_id) : "sin asignar"}</p>
          <p className="small"><b>Hasta cuándo:</b> {formatFecha(t.fecha_limite)}</p>
          <p className="small pre"><b>Cómo:</b> {t.como || <span className="muted">sin detalle</span>}</p>
          <details>
            <summary className="link">Editar tarea</summary>
            <form action={updateEventoTarea} className="stack">
              <input type="hidden" name="id" value={t.id} />
              <TareaFields t={t} personas={personas} />
              <SubmitButton>Guardar</SubmitButton>
            </form>
          </details>
          <form action={deleteEventoTarea}>
            <input type="hidden" name="id" value={t.id} />
            <SubmitButton className="btn danger small" confirm={`¿Eliminar la tarea "${t.titulo}"?`}>Eliminar tarea</SubmitButton>
          </form>
        </div>
      </details>
    </div>
  );
}

export default function EventoCard({ e, personas, nombre, abierto }: {
  e: Evento; personas: Persona[]; nombre: Map<string, string>; abierto?: boolean;
}) {
  const hechas = e.evento_tareas.filter((t) => t.hecha).length;
  const total = e.evento_tareas.length;
  return (
    <details id={e.id} className="card evento carpeta" open={abierto || undefined}>
      <summary>
        <span className="folder" aria-hidden><span className="f-closed">📁</span><span className="f-open">📂</span></span>
        <span className="carpeta-info">
          <b className="carpeta-nombre">{e.nombre}</b>
          <span className="muted small">
            {formatFecha(e.fecha)}{e.hora && ` · ${formatHora(e.hora)}`}{e.lugar && ` · ${e.lugar}`}
          </span>
        </span>
        <span className="carpeta-badges">
          <CuandoBadge fecha={e.fecha} />
          <span className={`badge ${total && hechas === total ? "ok" : ""}`}>
            {total === 0 ? "Sin tareas" : `${hechas}/${total} tareas`}
          </span>
        </span>
        <span className="caret" aria-hidden>▾</span>
      </summary>

      <div className="carpeta-body">
      <div className="meta small">
        <span>📅 {formatFecha(e.fecha)}</span>
        {e.hora && <span>🕒 {formatHora(e.hora)}</span>}
        {e.lugar && <span>📍 {e.lugar}</span>}
      </div>
      {e.descripcion && <p className="pre">{e.descripcion}</p>}

      <div className="sub">
        <div className="row small">
          <b>Tareas del evento</b>
          {total > 0 && <span className="muted">{hechas} de {total} listas</span>}
        </div>
        {total > 0 && <div className="progress"><span style={{ width: `${Math.round((hechas / total) * 100)}%` }} /></div>}
        {total === 0 && <p className="muted small">Todavía no hay tareas. Agrega la primera abajo.</p>}
        {e.evento_tareas.map((t) => <TareaEvento key={t.id} t={t} personas={personas} nombre={nombre} />)}
        <details>
          <summary className="link">+ Agregar tarea</summary>
          <form action={addEventoTarea} className="stack">
            <input type="hidden" name="evento_id" value={e.id} />
            <TareaFields personas={personas} />
            <SubmitButton>Agregar tarea</SubmitButton>
          </form>
        </details>
      </div>

      <details>
        <summary className="link">Editar evento</summary>
        <EventoForm evento={e} action={updateEvento} submitLabel="Guardar cambios" />
        <form action={deleteEvento}>
          <input type="hidden" name="id" value={e.id} />
          <SubmitButton className="btn danger small" confirm={`¿Eliminar el evento "${e.nombre}" y todas sus tareas?`}>Eliminar evento</SubmitButton>
        </form>
      </details>
      </div>
    </details>
  );
}
