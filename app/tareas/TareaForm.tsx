import SubmitButton from "../SubmitButton";
import DatePicker from "../DatePicker";
import type { Cargo, Persona, Tarea } from "@/lib/types";
import { ESTADOS } from "@/lib/types";

export default function TareaForm({
  action,
  tarea,
  cargos,
  personas,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  tarea?: Tarea;
  cargos: Cargo[];
  personas: Persona[];
  submitLabel: string;
}) {
  const resp = new Set(tarea?.tarea_personas.map((r) => r.persona_id) ?? []);
  return (
    <form action={action} className="stack">
      {tarea && <input type="hidden" name="id" value={tarea.id} />}
      <label>Título<input name="titulo" defaultValue={tarea?.titulo} placeholder="Ej: Inscribir atletas al regional" required /></label>
      <div className="two">
        <label>Para (cargo)
          <select name="para_cargo_id" defaultValue={tarea?.para_cargo_id ?? ""}>
            <option value="">—</option>
            {cargos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </label>
        <label>Para (otro / texto libre)<input name="para" defaultValue={tarea?.para ?? ""} placeholder="Ej: Apoderados sub-14" /></label>
      </div>
      <label>En qué consiste<textarea name="descripcion" rows={4} defaultValue={tarea?.descripcion} placeholder="Detalle de la tarea" /></label>
      <div className="two">
        <DatePicker name="fecha_entrega" label="Fecha de entrega / listo para" defaultValue={tarea?.fecha_entrega} />
        <label>Estado
          <select name="estado" defaultValue={tarea?.estado ?? "pendiente"}>
            {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </label>
      </div>
      <fieldset>
        <legend>Responsables (quién la hace)</legend>
        {personas.length === 0 && <span className="muted small">Agrega personas en la pestaña Personas o Cargos.</span>}
        <div className="checks">
          {personas.map((p) => (
            <label key={p.id} className="check">
              <input type="checkbox" name="responsables" value={p.id} defaultChecked={resp.has(p.id)} />
              {p.nombre}
            </label>
          ))}
        </div>
      </fieldset>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
