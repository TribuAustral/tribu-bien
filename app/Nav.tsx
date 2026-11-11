"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "./actions";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/tareas", label: "Tareas" },
  { href: "/cargos", label: "Cargos" },
  { href: "/personas", label: "Personas" },
];

export default function Nav({ club }: { club: string }) {
  const path = usePathname();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">{club}</Link>
        <nav>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="btn ghost small" type="submit">Salir</button>
        </form>
      </div>
    </header>
  );
}
