import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

// Vercel llama a esta ruta 1 vez al día (ver vercel.json) para que Supabase
// vea actividad y no pause el proyecto gratis por 7 días sin uso.
// Solo cuenta filas: no lee ni modifica datos del club.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Si existe CRON_SECRET en Vercel, solo Vercel puede llamar a esta ruta.
  const secret = process.env.CRON_SECRET?.trim();
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { error } = await db().from("cargos").select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
