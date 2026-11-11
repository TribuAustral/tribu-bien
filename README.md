# Club Tribu Austral · Tareas y cargos

App web para repartir tareas entre la directiva, los delegados y los entrenadores.
Hecha con Next.js 15 y Supabase, y desplegada en Vercel. Se entra con una sola contraseña compartida.

## 1. Crear el proyecto en Supabase
1. Entra a https://supabase.com y crea un proyecto nuevo (región: São Paulo es la más cercana a Chile).
2. Ve a **SQL Editor → New query**, pega todo el contenido de `supabase/schema.sql` y presiona **Run**.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

> La service_role key solo se usa en el servidor. Nunca la publiques ni la subas a GitHub.

## 2. Probar en local (opcional)
Crea un archivo `.env.local` con estas variables:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_PASSWORD=elige-una-clave-segura
AUTH_SECRET=una-frase-larga-y-secreta
```
Luego ejecuta:
```
npm install
npm run dev
```
Y abre http://localhost:3000.

## 3. Subir a GitHub
1. En GitHub crea un repositorio **privado** nuevo, por ejemplo `club-tribu-austral`, sin README.
2. En esta carpeta ejecuta:
```
git remote add origin https://github.com/TU-USUARIO/club-tribu-austral.git
git branch -M main
git push -u origin main
```

## 4. Importar en Vercel
1. Entra a https://vercel.com con tu cuenta de GitHub.
2. Haz clic en **Add New → Project** e importa el repositorio.
3. En **Environment Variables** carga las 4 variables:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_PASSWORD`, `AUTH_SECRET`.
4. Presiona **Deploy**. Cada `git push` a `main` vuelve a desplegar la app automáticamente.

## Notas
- Si cambias `APP_PASSWORD` o `AUTH_SECRET`, todos tendrán que volver a entrar.
- Todas las tablas tienen RLS activado y ninguna política, así que solo el servidor puede leer y escribir los datos.
