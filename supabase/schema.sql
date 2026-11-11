-- =========================================================
-- Club Tribu Austral · Esquema de base de datos
-- Pegar completo en Supabase -> SQL Editor -> Run
-- Se puede volver a ejecutar sin perder datos (solo crea lo que falta)
-- =========================================================

create extension if not exists "pgcrypto";

create table if not exists club_info (
  id int primary key default 1 check (id = 1),
  nombre text not null default 'Club Tribu Austral',
  descripcion text not null default ''
);

create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text,
  created_at timestamptz not null default now()
);

create table if not exists cargos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  area text not null default 'otros' check (area in ('directiva','delegados','entrenadores','otros')),
  estatuto text not null default '',
  orden int not null default 999,
  created_at timestamptz not null default now()
);

create table if not exists cargo_personas (
  cargo_id uuid not null references cargos(id) on delete cascade,
  persona_id uuid not null references personas(id) on delete cascade,
  primary key (cargo_id, persona_id)
);

create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null default '',
  para text,
  para_cargo_id uuid references cargos(id) on delete set null,
  fecha_entrega date,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_progreso','lista')),
  created_at timestamptz not null default now()
);

create table if not exists tarea_personas (
  tarea_id uuid not null references tareas(id) on delete cascade,
  persona_id uuid not null references personas(id) on delete cascade,
  primary key (tarea_id, persona_id)
);

-- "Quién hace qué" dentro de una tarea
create table if not exists subtareas (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references tareas(id) on delete cascade,
  descripcion text not null,
  persona_id uuid references personas(id) on delete set null,
  hecha boolean not null default false,
  created_at timestamptz not null default now()
);

-- Eventos (campeonatos, onces, viajes…) con sus propias tareas dentro
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha date,
  hora time,
  lugar text,
  descripcion text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists evento_tareas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  titulo text not null,
  como text not null default '',
  persona_id uuid references personas(id) on delete set null,
  fecha_limite date,
  hecha boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seguridad: RLS activado y SIN políticas => nadie puede leer/escribir con la
-- clave pública. Solo el servidor de la app (service_role) accede.
alter table club_info enable row level security;
alter table personas enable row level security;
alter table cargos enable row level security;
alter table cargo_personas enable row level security;
alter table tareas enable row level security;
alter table tarea_personas enable row level security;
alter table subtareas enable row level security;
alter table eventos enable row level security;
alter table evento_tareas enable row level security;

-- ---------- Datos iniciales (editables desde la app) ----------
insert into club_info (id, nombre, descripcion)
values (1, 'Club Tribu Austral', 'Bienvenidos al panel de organización del club. Aquí está quién hace qué y para cuándo.')
on conflict (id) do nothing;

-- Los cargos solo se insertan si la tabla está vacía (se puede volver a ejecutar sin duplicar)
insert into cargos (nombre, area, orden, estatuto)
select v.nombre, v.area, v.orden, v.estatuto from (values
('Presidenta', 'directiva', 1,
 'Representa judicial y extrajudicialmente al club.
Preside las reuniones de directorio y las asambleas de socios.
Vela por el cumplimiento de los estatutos y de los acuerdos.
Firma junto a la tesorera los documentos financieros.'),
('Secretario', 'directiva', 3,
 'Lleva los libros de actas de directorio y asamblea.
Despacha citaciones y correspondencia.
Mantiene actualizado el registro de socios.'),
('Tesorera', 'directiva', 4,
 'Administra los fondos del club y lleva la contabilidad.
Cobra las cuotas sociales y emite comprobantes.
Presenta el balance y la rendición de cuentas a la asamblea.'),
('Delegado de competencias', 'delegados', 10,
 'Inscribe a los deportistas en competencias y torneos.
Coordina traslados, horarios y documentación.
Es el nexo con la asociación / federación.'),
('Delegado de apoderados', 'delegados', 11,
 'Canaliza la comunicación entre apoderados, entrenadores y directiva.
Organiza actividades de apoyo y recaudación.'),
('Entrenador jefe', 'entrenadores', 20,
 'Planifica la temporada deportiva y los objetivos por categoría.
Coordina al equipo técnico y propone la nómina para competencias.'),
('Entrenador', 'entrenadores', 21,
 'Dirige los entrenamientos de su grupo según la planificación.
Registra asistencia y avance de los deportistas.')
) as v(nombre, area, orden, estatuto)
where not exists (select 1 from cargos);

-- Directorio actual (solo se inserta si aún no hay personas)
insert into personas (nombre)
select v.nombre from (values
  ('Daniela Urdangarin Mahn'),
  ('Daniela Ríos Carvajal'),
  ('Ronald Schirmer')
) as v(nombre)
where not exists (select 1 from personas);

insert into cargo_personas (cargo_id, persona_id)
select c.id, p.id from cargos c join personas p on
  (c.nombre = 'Presidenta' and p.nombre = 'Daniela Urdangarin Mahn') or
  (c.nombre = 'Tesorera' and p.nombre = 'Daniela Ríos Carvajal') or
  (c.nombre = 'Secretario' and p.nombre = 'Ronald Schirmer')
on conflict do nothing;
