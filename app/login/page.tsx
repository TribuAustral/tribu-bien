"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <div className="login-wrap">
      <form action={action} className="card login">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Escudo Tribu Austral Hockey Club" width={120} height={120} className="login-logo" />
        <h1>Bienvenido</h1>
        <p className="muted">Ingresa la contraseña del club</p>
        <input type="password" name="password" placeholder="Contraseña" autoFocus required />
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}
