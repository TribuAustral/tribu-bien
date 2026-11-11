export type Area = "directiva" | "delegados" | "entrenadores" | "otros";
export const AREAS: { id: Area; label: string }[] = [
  { id: "directiva", label: "Directiva" },
  { id: "delegados", label: "Delegados" },
  { id: "entrenadores", label: "Entrenadores" },
  { id: "otros", label: "Otros" },
];

export type Estado = "pendiente" | "en_progreso" | "lista";
export const ESTADOS: { id: Estado; label: string }[] = [
  { id: "pendiente", label: "Pendiente" },
  { id: "en_progreso", label: "En progreso" },
  { id: "lista", label: "Lista" },
];

export type Persona = { id: string; nombre: string; contacto: string | null };
export type Cargo = {
  id: string;
  nombre: string;
  area: Area;
  estatuto: string;
  orden: number;
  cargo_personas: { persona_id: string }[];
};
export type Subtarea = {
  id: string;
  tarea_id: string;
  descripcion: string;
  persona_id: string | null;
  hecha: boolean;
  created_at: string;
};
export type Tarea = {
  id: string;
  titulo: string;
  descripcion: string;
  para: string | null;
  para_cargo_id: string | null;
  fecha_entrega: string | null;
  estado: Estado;
  created_at: string;
  tarea_personas: { persona_id: string }[];
  subtareas: Subtarea[];
};
export type EventoTarea = {
  id: string;
  evento_id: string;
  titulo: string;
  como: string;
  persona_id: string | null;
  fecha_limite: string | null;
  hecha: boolean;
  created_at: string;
};
export type Evento = {
  id: string;
  nombre: string;
  fecha: string | null;
  hora: string | null;
  lugar: string | null;
  descripcion: string;
  created_at: string;
  evento_tareas: EventoTarea[];
};
export type ClubInfo ={ id: number; nombre: string; descripcion: string };
