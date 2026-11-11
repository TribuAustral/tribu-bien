"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="login-wrap">
      <div className="card login">
        <h1>Algo salió mal</h1>
        <p className="muted small">{error.message || "Error inesperado."}</p>
        <button className="btn" onClick={reset}>Reintentar</button>
      </div>
    </div>
  );
}
