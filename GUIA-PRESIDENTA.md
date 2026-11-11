# App del Club Tribu Austral — Guía para montarla desde cero

Esta guía es para tener **tu propia copia de la app**, con **tus propias cuentas**.
Al terminar, la app será 100% tuya: el código, la publicación y los datos.

No hace falta saber programar. Necesitas:
- Un **computador** con Chrome o Edge.
- Un **correo** (idealmente el del club, para que las cuentas queden a nombre del club).
- El archivo **`Club-Tribu-Austral-App.zip`** que te envió Diego.
- Unos **30–40 minutos**.

---

## ⭐ La forma fácil: que Claude Code te guíe

La carpeta trae instrucciones para **Claude Code** (el archivo `CLAUDE.md`). Claude las lee solo y te va guiando paso a paso: instala lo necesario, sube el código y revisa que todo funcione.

1. **Guarda el ZIP** en tu computador (por ejemplo en el Escritorio) y descomprímelo: clic derecho → **Extraer todo**.
2. Abre **Claude** en tu computador (la app de escritorio de Claude, pestaña **Code**).
   Si no la tienes: descárgala en https://claude.ai/download e inicia sesión (necesitas un plan que incluya Claude Code).
3. Elige **abrir una carpeta** y selecciona la carpeta **`Club-Tribu-Austral-App`** que descomprimiste.
4. Escríbele:
   > **Hola, quiero montar la app del club desde cero con mis cuentas. Guíame paso a paso.**
5. Sigue lo que te diga. Claude **no puede crear tus cuentas** ni copiar tus claves secretas: en esos pasos te dirá exactamente dónde hacer clic. Si te pierdes, mándale una captura de pantalla.

> 🔒 Si Claude te pide algo que diga *secret*, **no lo pegues en el chat**: ponlo directo en Vercel como te indique.

El resto de esta guía explica **los mismos pasos a mano**, por si prefieres hacerlo sin Claude o quieres entender qué está pasando.

---

## 0. Cómo funciona (para entender lo que vas a hacer)

La app vive en tres servicios **gratuitos**:

| Servicio | Para qué sirve | Analogía |
|---|---|---|
| **GitHub** | Guarda el **código** de la app y su historial de cambios | La receta |
| **Supabase** | Guarda los **datos**: personas, cargos, tareas y eventos | La despensa |
| **Vercel** | **Publica** la app en internet y te da el link | La cocina que la prepara y la sirve |

Orden de los pasos: **1. Supabase → 2. GitHub → 3. Vercel → 4. Probar**.

> ✍️ Ten a mano un **bloc de notas** para ir anotando los datos que se piden. Algunos son **secretos**: no los mandes por WhatsApp ni correo.

---

## 1. Supabase (la base de datos)

### 1.1 Crear la cuenta y el proyecto
1. Entra a **https://supabase.com** → **Start your project** → crea tu cuenta (puedes usar **Continue with GitHub** después del paso 2, o con tu correo).
2. Presiona **New project** y completa:
   - **Name:** `club-tribu-austral`
   - **Database Password:** inventa una y **anótala** (la app no la usa, pero no la pierdas).
   - **Region:** **South America (São Paulo)**.
3. Presiona **Create new project** y espera ~2 minutos.

### 1.2 Crear las tablas
1. Descomprime el ZIP en tu computador (clic derecho → **Extraer todo**).
2. Dentro de `Club-Tribu-Austral-App`, abre la carpeta **`supabase`** y abre el archivo **`schema.sql`** con el Bloc de notas.
3. Selecciona **todo** el texto (Ctrl+A) y cópialo (Ctrl+C).
4. En Supabase, menú izquierdo → **SQL Editor** → **New query**.
5. Pega el texto (Ctrl+V) y presiona **Run**.
6. Debe aparecer **"Success. No rows returned"**. ✅

Para comprobarlo: menú izquierdo → **Table Editor** → abre la tabla **cargos**. Deben aparecer 9 cargos (Presidente, Vicepresidente, etc.).

> ⚠️ **No** presiones **"Add RLS policy"** en ninguna tabla. Las tablas están cerradas a propósito: solo la app puede leerlas.

### 1.3 Activar la Data API
1. Menú izquierdo → **Project Settings** (engranaje) → **Data API**.
2. Si ves un interruptor o botón **Enable Data API**, actívalo.
3. Copia la **API URL** / **Project URL** al bloc de notas. Es del tipo:
   `https://xxxxxxxxxxxx.supabase.co`
   (sin nada más al final: sin `/rest/v1` y sin `/`).

### 1.4 Copiar la clave secreta
1. **Project Settings** → **API Keys**.
2. En **Secret keys**, copia la clave que empieza con **`sb_secret_...`** (botón de copiar).
3. Pégala en el bloc de notas. **🔒 Es secreta: da acceso total a los datos.**

> La **Publishable key** (`sb_publishable_...`) **no** se usa.

---

## 2. GitHub (el código)

### 2.1 Crear la cuenta
1. Entra a **https://github.com/signup** y crea tu cuenta (correo, contraseña y nombre de usuario).
2. Confirma el código que te llega al correo.

### 2.2 Crear el repositorio
1. Entra a **https://github.com/new**.
2. Completa:
   - **Repository name:** `club-tribu-austral`
   - Marca **Private**.
   - **No** marques "Add a README", ni .gitignore, ni license.
3. Presiona **Create repository**.

### 2.3 Subir el código
1. En la página que aparece, busca el link **"uploading an existing file"** y haz clic.
2. Abre la carpeta que descomprimiste del ZIP y entra a la carpeta **`Club-Tribu-Austral-App`**. Selecciona **todo lo que hay adentro** (Ctrl+A) — las carpetas `app`, `lib`, `public`, `supabase` y los archivos sueltos como `package.json`.
3. **Arrástralo** al recuadro de GitHub. Espera a que terminen de cargar todos (son ~45 archivos).
   - Verifica que se vean las carpetas `app/`, `lib/`, `public/`, `supabase/` y el archivo `package.json`.
   - Si no ves el archivo **`.gitignore`**, en el Explorador de Windows activa **Vista → Mostrar → Elementos ocultos** y arrástralo también.
4. Abajo, en "Commit changes", presiona **Commit changes**.

> ⚠️ Las carpetas deben quedar **en la raíz** del repositorio (que `package.json` se vea apenas abres el repo), no dentro de otra carpeta.

---

## 3. Vercel (publicar la app)

### 3.1 Crear la cuenta
1. Entra a **https://vercel.com/signup**.
2. Elige **"I'm working on personal projects"** → plan **Hobby** (gratis). **No** elijas Pro ni aceptes pruebas de pago.
3. Escribe un nombre (ej. `Tribu Austral`) → **Continue with GitHub** → entra con **tu** cuenta de GitHub → **Authorize Vercel**.
4. Si te pide verificar tu teléfono o correo, hazlo.

### 3.2 Importar el proyecto
1. Presiona **Add New… → Project**.
2. En "Import Git Repository" presiona **GitHub**. Si te lo pide, da acceso al repositorio **club-tribu-austral** → **Install**.
3. Al lado de `club-tribu-austral` presiona **Import**.
4. No cambies nada de lo de arriba (Vercel detecta solo que es **Next.js**).

### 3.3 Cargar las variables (lo más importante)
Abre **Environment Variables** y agrega estas **5**, una por una:

| Key (escribir exacto) | Value | ¿Marcar Sensitive? |
|---|---|---|
| `SUPABASE_URL` | La Project URL del paso 1.3 | No |
| `SUPABASE_SERVICE_ROLE_KEY` | La clave `sb_secret_...` del paso 1.4 | **Sí** |
| `APP_PASSWORD` | La contraseña que usará el club para entrar (tú la eliges) | No |
| `AUTH_SECRET` | Una frase larga inventada, ej. `Tribu-Hockey-2026-xK9qLm4vRt7z` | **Sí** |
| `CRON_SECRET` | Otra frase larga inventada, distinta a la anterior | **Sí** |

Cuidado:
- Los nombres de la izquierda van **exactamente así**, en mayúsculas y con guion bajo.
- Sin espacios al inicio ni al final de los valores.
- `AUTH_SECRET` y `CRON_SECRET` no hay que recordarlas nunca; solo inventarlas.

### 3.4 Publicar
1. Presiona **Deploy** y espera 1–2 minutos.
2. Si aparece "Optional Integrations → Supabase", **no** la agregues (no hace falta).
3. Al terminar aparece **"Deployed to Production"**. Presiona **Visit**.
4. Tu link será algo como **`https://club-tribu-austral-xxxx.vercel.app`**. 🎉

### 3.5 Que cualquiera pueda abrir el link
1. Abre el link en una **ventana de incógnito** (Ctrl+Shift+N).
2. Si en vez de la pantalla de contraseña del club te pide iniciar sesión en **Vercel**:
   tu proyecto → **Settings → Deployment Protection** → desactiva **Vercel Authentication** → **Save**.

---

## 4. Probar que todo funcione

1. Abre tu link y entra con la contraseña que pusiste en `APP_PASSWORD`.
2. Debes ver **"Club Tribu Austral"**, las tarjetas de resumen y, en **Cargos**, los 9 cargos.
3. Prueba crear una persona, un evento y una tarea.
4. En Vercel → tu proyecto → **Settings → Cron Jobs** debe aparecer **`/api/keepalive`**. Presiona **Run** para probarlo.
   (Esta "visita diaria" evita que Supabase gratis se pause por 7 días sin uso.)

### Si aparece "Algo salió mal"
1. En Vercel → tu proyecto → pestaña **Logs**.
2. Recarga la app y mira la línea en rojo:

| Mensaje | Qué pasa | Cómo arreglarlo |
|---|---|---|
| `Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY` | Falta una variable | Agrégala en **Settings → Environment Variables** |
| `Invalid API key` | La clave está mal copiada o es la *publishable* | Vuelve a copiar la `sb_secret_...` |
| `Invalid path specified in request URL` | A `SUPABASE_URL` le sobra algo al final | Déjala como `https://xxxx.supabase.co` |
| Algo con *relation*, *table* o *schema* | Faltan las tablas o la Data API está apagada | Repite el paso **1.2** y **1.3** |

> **Después de cambiar cualquier variable** hay que volver a publicar: **Deployments → ⋯ del último → Redeploy**.

---

## 5. Usar e instalar la app

- Comparte con el club **el link** y **la contraseña**.
- Cada teléfono o computador nuevo pide la contraseña **una vez** (queda recordada 180 días).
- En **Inicio** aparece **"📲 Instalar"** para dejar la app con el escudo en la pantalla de inicio del teléfono (Android/Chrome) o en el PC (Chrome/Edge). En iPhone: Safari → **Compartir → Agregar a pantalla de inicio**.

---

## 6. Hacer cambios a la app (con Claude Code)

Como todo está a tu nombre, los cambios se publican solos.

1. Entra a **https://claude.ai/code** con tu cuenta de Claude (necesitas un plan que incluya Claude Code).
2. Conecta tu **GitHub** y elige el repositorio **club-tribu-austral**.
3. Pide los cambios **en palabras**. Ejemplos:
   - *"Agrega un teléfono de emergencia a cada persona."*
   - *"Quiero poder marcar un evento como suspendido."*
   - *"Cambia el color del menú al verde del escudo."*
4. Claude hace el cambio. Cuando lo apruebes y se guarde en GitHub (rama `main`), **Vercel lo publica solo** en 1–2 minutos.

> 💡 Recomendado: pídele *"hazlo en una rama nueva y abre un pull request"*. Vercel te dará un **link de vista previa** para revisar el cambio antes de que llegue al club. Si te gusta, en GitHub presiona **Merge**.

> ⚠️ Si Claude te dice que el cambio necesita **SQL** (por ejemplo, un campo nuevo), pégalo en Supabase → **SQL Editor → Run** **antes** de publicar el cambio.

---

## 7. Mantención y seguridad

- **Cambiar la contraseña del club:** cambia `APP_PASSWORD` en Vercel → Redeploy.
- **Sacar a todos** (por ejemplo, si alguien deja el club): cambia `AUTH_SECRET` → Redeploy. Todos tendrán que volver a escribir la contraseña.
- **Supabase pausado:** si la app falla y Supabase dice *Paused*, presiona **Restore project**. Los datos no se pierden.
- **Respaldos:** el plan gratis de Supabase no los hace. De vez en cuando: **Table Editor → cada tabla → Export → CSV**.
- **Nunca** compartas la `sb_secret_...` ni la pegues en un chat. Si se filtra: en Supabase crea una nueva en **API Keys**, cámbiala en Vercel y haz Redeploy.
- Las claves **nunca** van dentro del código ni de GitHub: solo en las variables de Vercel.

---

## 8. Si el club ya tenía datos en la app anterior

Tu copia empieza **vacía** (solo con los 9 cargos iniciales). Si quieres traer los datos de la app anterior:
1. Pide a quien la administra que exporte cada tabla a **CSV** (Supabase → Table Editor → **Export → CSV**).
2. En tu Supabase, abre la misma tabla → **Insert → Import data from CSV**.
3. Importa en este orden: `personas`, `cargos`, `cargo_personas`, `tareas`, `tarea_personas`, `subtareas`, `eventos`, `evento_tareas`.
   (Antes, borra los 9 cargos iniciales de tu tabla `cargos` para no duplicarlos.)
4. El nombre y los avisos del club no se importan: escríbelos directo en la app (**Inicio → Editar**).
