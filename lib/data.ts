import "server-only";
import { db } from "@/lib/supabase";
import type { Cargo, ClubInfo, Evento, Persona, Tarea } from "@/lib/types";

export async function getPersonas(): Promise<Persona[]> {
  const { data, error } = await db().from("personas").select("*").order("nombre");
  if (error) throw new Error(error.message);
  return data as Persona[];
}

export async function getCargos(): Promise<Cargo[]> {
  const { data, error } = await db()
    .from("cargos")
    .select("*, cargo_personas(persona_id)")
    .order("orden")
    .order("nombre");
  if (error) throw new Error(error.message);
  return data as Cargo[];
}

export async function getTareas(): Promise<Tarea[]> {
  const { data, error } = await db()
    .from("tareas")
    .select("*, tarea_personas(persona_id), subtareas(*)")
    .order("fecha_entrega", { ascending: true, nullsFirst: false })
    .order("created_at");
  if (error) throw new Error(error.message);
  const tareas = data as Tarea[];
  // Subtareas en el orden en que se crearon
  tareas.forEach((t) => t.subtareas.sort((a, b) => a.created_at.localeCompare(b.created_at)));
  return tareas;
}

export async function getEventos(): Promise<Evento[]> {
  const { data, error } = await db()
    .from("eventos")
    .select("*, evento_tareas(*)")
    .order("fecha", { ascending: true, nullsFirst: false })
    .order("created_at");
  if (error) throw new Error(error.message);
  const eventos = data as Evento[];
  // Tareas del evento: primero las pendientes, por fecha límite; luego las hechas
  eventos.forEach((e) =>
    e.evento_tareas.sort(
      (a, b) =>
        Number(a.hecha) - Number(b.hecha) ||
        (a.fecha_limite ?? "9999").localeCompare(b.fecha_limite ?? "9999") ||
        a.created_at.localeCompare(b.created_at)
    )
  );
  return eventos;
}

export async function getClub(): Promise<ClubInfo> {
  const { data } = await db().from("club_info").select("*").eq("id", 1).maybeSingle();
  return (data as ClubInfo) ?? { id: 1, nombre: "Mi Club", descripcion: "" };
}
