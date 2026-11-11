"use client";
import { useEffect, useState } from "react";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Botón para instalar la app en la pantalla de inicio del teléfono.
// Chrome/Edge/Samsung en Android muestran su ventana de instalación;
// si el navegador no la ofrece, se muestran los pasos para hacerlo a mano.
export default function InstallButton() {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [instalada, setInstalada] = useState(true); // oculto hasta saber
  const [esMovil, setEsMovil] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [ayuda, setAyuda] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setEsMovil(/Android|iPhone|iPad|iPod/i.test(ua));
    setEsIOS(/iPhone|iPad|iPod/i.test(ua));
    setInstalada(window.matchMedia("(display-mode: standalone)").matches);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as PromptEvent);
    };
    const onInstalled = () => setInstalada(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (instalada || (!evt && !esMovil)) return null;

  const instalar = async () => {
    if (!evt) return setAyuda(!ayuda);
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "accepted") setInstalada(true);
    setEvt(null);
  };

  return (
    <section className="card install">
      <div className="row">
        <div>
          <b>📲 Tener la app en el teléfono</b>
          <div className="muted small">Queda con su ícono en la pantalla de inicio, como cualquier app.</div>
        </div>
        <button type="button" className="btn" onClick={instalar}>Instalar</button>
      </div>
      {ayuda && (
        <ol className="small install-pasos">
          {esIOS ? (
            <>
              <li>Abre esta página en <b>Safari</b>.</li>
              <li>Toca el botón <b>Compartir</b> (cuadrado con flecha ↑).</li>
              <li>Elige <b>“Agregar a pantalla de inicio”</b> y toca <b>Agregar</b>.</li>
            </>
          ) : (
            <>
              <li>Abre esta página en <b>Chrome</b>.</li>
              <li>Toca el menú <b>⋮</b> (arriba a la derecha).</li>
              <li>Elige <b>“Instalar app”</b> o <b>“Agregar a la pantalla principal”</b>.</li>
            </>
          )}
        </ol>
      )}
    </section>
  );
}
