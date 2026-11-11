"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { appPassword, COOKIE_NAME, expectedToken, isValidToken } from "@/lib/auth";

// ---------- helpers ----------
async function guard() {
  const c = await cookies();
  if (!(await isValidToken(c.get(COOKIE_NAME)?.value))) redirect("/login");
}
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const optional = (v: string) => (v === "" ? null : v);
function refresh() {
  revalidatePath("/", "layout");
}
function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
const AREAS_OK = ["directiva", "delegados", "entrenadores", "otros"];
const ESTADOS_OK = ["pendiente", "en_progreso", "lista"];
const area = (v: string) => (AREAS_OK.includes(v) ? v : "otros");
const estado = (v: string) => (ESTADOS_OK.includes(v) ? v : "pendiente");
const fecha = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

// ---------- login ----------
export async function login(_prev: string | null, fd: FormData): Promise<string | null> {
  const pass = str(fd, "password");
  if (pass !== appPassword()) return "Contraseña incorrecta";
  const c = await cookies();
  c.set(COOKIE_NAME, await expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 días
  });
  redirect("/");
}

export async function logout() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
  redirect("/login");
}

// ---------- club ----------
export async function updateClub(fd: FormData) {
  await guard();
  const { error } = await db()
    .from("club_info")
    .upsert({ id: 1, nombre: str(fd, "nombre"), descripcion: str(fd, "descripcion") });
  check(error);
  refresh();
}

// ---------- personas ----------
async function crearPersona(nombre: string, contacto: string | null = null): Promise<string> {
  const { data, error } = await db().from("personas").insert({ nombre, contacto }).select("id").single();
  check(error);
  return data!.id as string;
}

export async function addPersona(fd: FormData) {
  await guard();
  const nombre = str(fd, "nombre");
  if (!nombre) return;
  await crearPersona(nombre, optional(str(fd, "contacto")));
  refresh();
}

export async function updatePersona(fd: FormData) {
  await guard();
  if (!str(fd, "nombre")) return;
  const { error } = await db()
    .from("personas")
    .update({ nombre: str(fd, "nombre"), contacto: optional(str(fd, "contacto")) })
    .eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function deletePersona(fd: FormData) {
  await guard();
  const { error } = await db().from("personas").delete().eq("id", str(fd, "id"));
  check(error);
  refresh();
}

// ---------- cargos ----------
export async function addCargo(fd: FormData) {
  await guard();
  const nombre = str(fd, "nombre");
  if (!nombre) return;
  const { error } = await db().from("cargos").insert({
    nombre,
    area: area(str(fd, "area")),
    estatuto: str(fd, "estatuto"),
    orden: 999,
  });
  check(error);
  refresh();
}

export async function updateCargo(fd: FormData) {
  await guard();
  const nombre = str(fd, "nombre");
  if (!nombre) return;
  const { error } = await db()
    .from("cargos")
    .update({ nombre, area: area(str(fd, "area")), estatuto: str(fd, "estatuto") })
    .eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function deleteCargo(fd: FormData) {
  await guard();
  const { error } = await db().from("cargos").delete().eq("id", str(fd, "id"));
  check(error);
  refresh();
}

// Asigna una persona existente o crea una nueva y la asigna al cargo
export async function assignPersonaCargo(fd: FormData) {
  await guard();
  const cargo_id = str(fd, "cargo_id");
  let persona_id = str(fd, "persona_id");
  const nueva = str(fd, "nueva_persona");
  if (nueva) persona_id = await crearPersona(nueva);
  if (!persona_id) return;
  const { error } = await db()
    .from("cargo_personas")
    .upsert({ cargo_id, persona_id }, { onConflict: "cargo_id,persona_id", ignoreDuplicates: true });
  check(error);
  refresh();
}

export async function unassignPersonaCargo(fd: FormData) {
  await guard();
  const { error } = await db()
    .from("cargo_personas")
    .delete()
    .eq("cargo_id", str(fd, "cargo_id"))
    .eq("persona_id", str(fd, "persona_id"));
  check(error);
  refresh();
}

// ---------- tareas ----------
async function setResponsables(tarea_id: string, ids: string[]) {
  const { error: e1 } = await db().from("tarea_personas").delete().eq("tarea_id", tarea_id);
  check(e1);
  if (ids.length) {
    const { error: e2 } = await db()
      .from("tarea_personas")
      .insert(ids.map((persona_id) => ({ tarea_id, persona_id })));
    check(e2);
  }
}

function tareaFields(fd: FormData) {
  return {
    titulo: str(fd, "titulo"),
    descripcion: str(fd, "descripcion"),
    para: optional(str(fd, "para")),
    para_cargo_id: optional(str(fd, "para_cargo_id")),
    fecha_entrega: fecha(str(fd, "fecha_entrega")),
    estado: estado(str(fd, "estado")),
  };
}

export async function addTarea(fd: FormData) {
  await guard();
  const fields = tareaFields(fd);
  if (!fields.titulo) return;
  const { data, error } = await db().from("tareas").insert(fields).select("id").single();
  check(error);
  await setResponsables(data!.id, fd.getAll("responsables").map(String).filter(Boolean));
  refresh();
}

export async function updateTarea(fd: FormData) {
  await guard();
  const id = str(fd, "id");
  const fields = tareaFields(fd);
  if (!fields.titulo) return;
  const { error } = await db().from("tareas").update(fields).eq("id", id);
  check(error);
  await setResponsables(id, fd.getAll("responsables").map(String).filter(Boolean));
  refresh();
}

export async function setEstadoTarea(fd: FormData) {
  await guard();
  const { error } = await db().from("tareas").update({ estado: estado(str(fd, "estado")) }).eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function deleteTarea(fd: FormData) {
  await guard();
  const { error } = await db().from("tareas").delete().eq("id", str(fd, "id"));
  check(error);
  refresh();
}

// ---------- eventos (con sus tareas dentro) ----------
const hora = (v: string) => (/^\d{2}:\d{2}(:\d{2})?$/.test(v) ? v : null);

function eventoFields(fd: FormData) {
  return {
    nombre: str(fd, "nombre"),
    fecha: fecha(str(fd, "fecha")),
    hora: hora(str(fd, "hora")),
    lugar: optional(str(fd, "lugar")),
    descripcion: str(fd, "descripcion"),
  };
}

export async function addEvento(fd: FormData) {
  await guard();
  const fields = eventoFields(fd);
  if (!fields.nombre) return;
  const { error } = await db().from("eventos").insert(fields);
  check(error);
  refresh();
}

export async function updateEvento(fd: FormData) {
  await guard();
  const fields = eventoFields(fd);
  if (!fields.nombre) return;
  const { error } = await db().from("eventos").update(fields).eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function deleteEvento(fd: FormData) {
  await guard();
  const { error } = await db().from("eventos").delete().eq("id", str(fd, "id"));
  check(error);
  refresh();
}

function eventoTareaFields(fd: FormData) {
  return {
    titulo: str(fd, "titulo"),
    como: str(fd, "como"),
    persona_id: optional(str(fd, "persona_id")),
    fecha_limite: fecha(str(fd, "fecha_limite")),
  };
}

export async function addEventoTarea(fd: FormData) {
  await guard();
  const fields = eventoTareaFields(fd);
  if (!fields.titulo) return;
  const { error } = await db().from("evento_tareas").insert({ ...fields, evento_id: str(fd, "evento_id") });
  check(error);
  refresh();
}

export async function updateEventoTarea(fd: FormData) {
  await guard();
  const fields = eventoTareaFields(fd);
  if (!fields.titulo) return;
  const { error } = await db().from("evento_tareas").update(fields).eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function toggleEventoTarea(fd: FormData) {
  await guard();
  const { error } = await db()
    .from("evento_tareas")
    .update({ hecha: str(fd, "hecha") === "true" })
    .eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function deleteEventoTarea(fd: FormData) {
  await guard();
  const { error } = await db().from("evento_tareas").delete().eq("id", str(fd, "id"));
  check(error);
  refresh();
}

// ---------- subtareas (quién hace qué dentro de una tarea) ----------
export async function addSubtarea(fd: FormData) {
  await guard();
  const descripcion = str(fd, "descripcion");
  if (!descripcion) return;
  const { error } = await db().from("subtareas").insert({
    tarea_id: str(fd, "tarea_id"),
    descripcion,
    persona_id: optional(str(fd, "persona_id")),
  });
  check(error);
  refresh();
}

export async function toggleSubtarea(fd: FormData) {
  await guard();
  const { error } = await db()
    .from("subtareas")
    .update({ hecha: str(fd, "hecha") === "true" })
    .eq("id", str(fd, "id"));
  check(error);
  refresh();
}

export async function deleteSubtarea(fd: FormData) {
  await guard();
  const { error } = await db().from("subtareas").delete().eq("id", str(fd, "id"));
  check(error);
  refresh();
}
