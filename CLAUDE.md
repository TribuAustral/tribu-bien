# Instrucciones para Claude Code — App del Club Tribu Austral

Este proyecto es la app web del **Club Tribu Austral Hockey Club** para repartir tareas entre la directiva, los delegados y los entrenadores.
Quien abre esta carpeta es, muy probablemente, **la presidenta del club**. Quiere **montar su propia copia de la app desde cero, con sus propias cuentas**, y después poder hacerle cambios.

## Cómo comportarte

- **Habla siempre en español**, simple y cercano. La usuaria **no es programadora**: nada de jerga sin explicar.
- **Al empezar**, salúdala, explícale en 3–4 líneas qué van a hacer (Supabase → GitHub → Vercel → probar) y pregúntale si quiere comenzar. Luego avanza **un paso a la vez** y espera su confirmación ("listo") antes de seguir.
- Cuando ella deba hacer algo en una página web, dale **pasos numerados y cortos**, con los nombres exactos de los botones. Si te manda una captura, léela y dile qué tocar.
- **Pide permiso antes** de: hacer `git push`, crear repositorios, instalar programas, o cualquier acción sobre sus cuentas.
- **Nunca pidas que pegue claves secretas en el chat** (la `sb_secret_...`, `AUTH_SECRET`, `CRON_SECRET`). Si necesitas un `.env.local` para probar en local, pídele que **ella** lo cree y lo llene. Si igual pega una clave, no la repitas y recomiéndale rotarla al final.
- **Nunca** subas a GitHub archivos `.env*` (ya están en `.gitignore`).
- Si algo falla, **no adivines**: lee el error (logs de Vercel, salida de comandos) y explica en palabras simples qué pasó.
- La guía para personas está en `GUIA-PRESIDENTA.md` (y en Word, `GUIA-PRESIDENTA.docx`). Úsala como referencia de los pasos en las páginas web.

## Lo que ya está hecho (no hay que programar nada para montarla)

- **Stack:** Next.js 15.5 (App Router, TypeScript), CSS propio en `app/globals.css` (sin Tailwind), Supabase con `@supabase/supabase-js` **solo en el servidor** con la service role key, deploy en Vercel.
- **Acceso:** sin usuarios. Una contraseña compartida (`APP_PASSWORD`). `/login` guarda una cookie httpOnly con SHA-256 de `APP_PASSWORD + AUTH_SECRET` (180 días). `middleware.ts` manda a `/login` todo lo que no tenga la cookie; las server actions también la revisan (`guard()` en `app/actions.ts`).
- **Pestañas:** Inicio, Eventos (carpetas con tareas: quién, cómo, hasta cuándo), Tareas, Cargos, Personas.
- **Base de datos:** `supabase/schema.sql` (idempotente: se puede ejecutar varias veces). RLS activado **sin políticas** a propósito: solo el servidor accede.
- **Extras:** instalación como app (`app/manifest.ts`, íconos en `public/`, botón en `app/InstallButton.tsx`), calendario (`app/DatePicker.tsx`), hora deslizable (`app/TimeSlider.tsx`), visita diaria para que Supabase gratis no se pause (`app/api/keepalive/route.ts` + `vercel.json`).
- Fechas en español, zona `America/Santiago` (`lib/fecha.ts`).

## Plan para montarla desde cero

### Paso 0 — Preparar el computador
1. Verifica `node -v` (≥ 20), `npm -v` y `git --version`. Si falta algo, explícale cómo instalarlo (https://nodejs.org, https://git-scm.com) y espera.
2. `npm install` y luego `npm run build`. Debe compilar sin errores. Si falla, corrígelo antes de seguir.

### Paso 1 — Supabase (ella lo hace en la web; tú guías)
1. Que cree cuenta en https://supabase.com y un proyecto `club-tribu-austral`, región **South America (São Paulo)**. Que anote la Database Password.
2. Que abra **SQL Editor → New query**, pegue **todo** `supabase/schema.sql` y presione **Run** → debe decir "Success". (Puedes mostrarle el archivo o abrírselo.)
   - Si el MCP de Supabase está conectado en esta sesión y ella lo autoriza, puedes aplicar el SQL tú mismo.
3. Que verifique en **Table Editor → cargos** que hay 9 cargos.
4. **Project Settings → Data API**: que confirme que la Data API está **activada** y anote la **Project URL** (`https://xxxx.supabase.co`, sin `/rest/v1` ni `/` final).
5. **Project Settings → API Keys**: que copie la **Secret key** `sb_secret_...` a su bloc de notas. **No la pegue en el chat.** La publishable key no se usa.
6. Advierte: **no** presionar "Add RLS policy".

### Paso 2 — GitHub
1. Que cree cuenta en https://github.com/signup (si no tiene) y te diga su **nombre de usuario** y el **correo** de esa cuenta.
2. Configura git **solo en este repo** con su identidad (importante: Vercel gratis bloquea despliegues cuyo autor no coincide con el dueño de la cuenta):
   ```
   git init -b main
   git config user.name "<su usuario de GitHub>"
   git config user.email "<el correo de su cuenta de GitHub/Vercel>"
   git add -A
   git commit -m "Primer commit: app del Club Tribu Austral"
   ```
   Antes del commit, revisa con `git status` que **no** aparezca ningún `.env*`.
3. Crear el repo **privado** `club-tribu-austral`:
   - Si `gh` (GitHub CLI) está instalado y con sesión (`gh auth status`), pide permiso y usa `gh repo create club-tribu-austral --private --source . --push`.
   - Si no, que lo cree ella en https://github.com/new (Private, **sin** README/.gitignore/license) y te dé la URL; luego `git remote add origin <url>` y, con su permiso, `git push -u origin main`. Si aparece una ventana de inicio de sesión de GitHub, que entre con **su** cuenta.

### Paso 3 — Vercel (ella lo hace en la web; tú guías)
1. https://vercel.com/signup → **"I'm working on personal projects" (Hobby, gratis)**. Advierte que **no** elija Pro ni acepte pruebas de pago. **Continue with GitHub** con su cuenta.
2. **Add New → Project → GitHub** → dar acceso al repo → **Import** `club-tribu-austral`. No cambiar nada (Next.js se detecta solo).
3. **Environment Variables** (nombres exactos, sin espacios):

   | Key | Value | Sensitive |
   |---|---|---|
   | `SUPABASE_URL` | Project URL de Supabase | No |
   | `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Sí |
   | `APP_PASSWORD` | Contraseña que ella elija para el club | No |
   | `AUTH_SECRET` | Frase larga inventada | Sí |
   | `CRON_SECRET` | Otra frase larga inventada | Sí |

   Puedes **generarle** frases aleatorias para `AUTH_SECRET` y `CRON_SECRET` con `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"` y decirle que las copie directo a Vercel.
4. **Deploy**. **No** agregar la integración "Supabase" que ofrece Vercel.
5. Si aparece una verificación de identidad por correo, es normal.

### Paso 4 — Verificar
1. Pídele el link (`https://....vercel.app`). Comprueba sin cookie:
   ```
   curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://<link>/
   curl -s -o /dev/null -w "%{http_code}\n" https://<link>/manifest.webmanifest
   ```
   Esperado: `/` → `307` a `/login`; manifest → `200`.
   `/api/keepalive` sin header → `401` si `CRON_SECRET` está activa (si da `200`, la variable no se aplicó: hay que hacer Redeploy).
2. Que entre con su contraseña y confirme que ve "Club Tribu Austral" y los 9 cargos.
3. Si en incógnito Vercel pide login: **Settings → Deployment Protection → desactivar Vercel Authentication**.
4. **Settings → Cron Jobs** debe mostrar `/api/keepalive`.

### Problemas conocidos (ya resueltos antes, por si reaparecen)

| Síntoma | Causa | Solución |
|---|---|---|
| "Algo salió mal" + log `Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY` | Variables no cargadas o sin redeploy | Cargar variables → **Deployments → ⋯ → Redeploy** |
| Log `Invalid path specified in request URL` | `SUPABASE_URL` con sufijo | Dejar `https://xxxx.supabase.co` (el código ya limpia `/rest/v1` y `/` final) |
| Log `Invalid API key` | Clave mal copiada o publishable | Copiar la `sb_secret_...` |
| Error de tabla/relación inexistente | No se ejecutó `schema.sql` o Data API apagada | Ejecutar `schema.sql`; activar Data API |
| Deploy **Blocked** en Vercel | Autor del commit ≠ dueño de la cuenta Vercel | Corregir `git config user.email`, hacer un commit nuevo y push |
| Vercel pide login al abrir el link | Deployment Protection | Desactivar Vercel Authentication |

## Después: hacer cambios

- Ella pedirá cambios en palabras. Antes de editar, **lee los archivos** involucrados. Mantén el estilo existente (server actions + `revalidatePath`, CSS en `globals.css`, componentes cliente solo cuando hace falta).
- Si un cambio necesita columnas/tablas nuevas: agrégalas a `supabase/schema.sql` de forma **idempotente** (`create table if not exists`, `alter table ... add column if not exists`) y dile que ejecute ese SQL en Supabase **antes** de publicar.
- Siempre `npm run build` antes de commitear. Pide permiso antes de `git push` (cada push a `main` se publica solo en Vercel).
- Para probar en local necesita `.env.local` con las 4 variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_PASSWORD`, `AUTH_SECRET`): que lo cree ella. Advierte que con las claves reales, las pruebas locales modifican los datos reales.
- Mantención: cambiar contraseña = cambiar `APP_PASSWORD` + Redeploy; sacar a todos = cambiar `AUTH_SECRET` + Redeploy; Supabase pausado = **Restore project**; respaldos = exportar tablas a CSV.
