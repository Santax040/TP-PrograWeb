# Bitácora del TP

Registro de cambios y decisiones del proyecto. Entrada más reciente arriba.

---

## 2026-09-24 (2) — Definición del proyecto y primera versión navegable

### Qué es el sitio
Revista digital sobre la noche: crónicas de fiestas, música y "quilombo", más
una agenda de eventos. Nombre provisorio: **SUBSUELO**.

Todo el contenido, los artistas y los lugares son **ficticios**. Se decidió así
para poder escribir libremente sin atribuirle dichos ni hechos a personas o
locales reales.

### Qué se hizo
- Modelo de datos con tres entidades relacionadas: **notas**, **eventos** y **artistas**.
- Contenido de ejemplo cargado: 6 notas, 6 eventos y 5 artistas.
- Páginas navegables:
  - `/` portada con destacados, próximas fechas y últimas notas
  - `/notas` listado completo
  - `/notas/[slug]` nota individual
  - `/notas/categoria/[categoria]` filtrado por categoría
  - `/agenda` eventos agrupados por mes
  - `/agenda/[slug]` evento individual con line-up
  - `/artistas/[slug]` perfil con sus fechas y sus menciones en la revista
- Tema visual oscuro, header fijo y layout responsive.
- Build de producción verificado: **27 páginas** generadas, sin errores de
  TypeScript ni de ESLint.

### Decisiones
- **Datos en `src/lib/data.ts`, no en base de datos todavía.** Las funciones de
  consulta ya son `async` aunque hoy no hagan falta. Cuando se conecte la base
  real, cambia solo el cuerpo de esas funciones y **ninguna página se toca**.
- **Tema oscuro únicamente, sin modo claro.** Es una revista sobre la noche;
  la decisión es estética y deliberada.
- **Gradientes de color en vez de imágenes.** Evita fotos rotas o de derechos
  dudosos mientras no haya material propio. Cada nota y evento define su
  gradiente en el campo `portada`.
- **Nombre del sitio centralizado en `src/lib/site.ts`.** Como todavía no está
  decidido, cambiarlo ahí lo actualiza en todo el sitio.
- **El campo `premium` ya existe en las notas** y se muestra la etiqueta
  "Suscriptores", pero **todavía no bloquea nada**. La suscripción quedó en
  stand by; dejar el campo desde ahora evita migrar datos después.
- **`generateStaticParams` en todas las rutas dinámicas.** Next genera el HTML
  de cada nota y evento durante el build en vez de armarlo en cada visita:
  carga más rápida y mejor posicionamiento en buscadores.
- **Fechas formateadas forzando UTC** (`src/lib/formato.ts`). Sin eso, una fecha
  guardada como `2026-10-03` se muestra como 2 de octubre en Argentina, porque
  el navegador la interpreta en horario local.

### Pendiente
- [ ] Decidir el nombre definitivo.
- [ ] Push inicial a GitHub.
- [ ] Conectar el repo a Vercel.
- [ ] Buscador de notas y eventos.
- [ ] Base de datos real.
- [ ] Registro y login de usuarios.
- [ ] Panel de administración para escribir notas.
- [ ] Definir si la suscripción se implementa y cómo.

---

## 2026-09-24 (1) — Setup inicial

### Qué se hizo
- Se clonó el repo `TP-PrograWeb` dentro de `Desktop/Programacion Web/TP`.
- Se generó el proyecto base con `create-next-app`.
- Se verificó que el servidor de desarrollo levanta en `localhost:3000`.
- Primer commit: `32139fb`.

### Stack elegido
| Pieza | Versión | Por qué |
|---|---|---|
| Next.js | 16.3.6 | Pedido por la cátedra. Aporta ruteo, renderizado en servidor y backend en un solo proyecto. |
| React | 19.2.8 | Base de la interfaz por componentes. |
| TypeScript | 5.x | Detecta errores de tipos antes de ejecutar. Cuesta un poco más al principio, ahorra mucho debugging después. |
| Tailwind CSS | 4.x | Estilos con clases directo en el markup, sin mantener archivos CSS aparte. |
| ESLint | 9.x | Marca errores y malas prácticas mientras se escribe. |

### Decisiones
- **App Router en vez de Pages Router.** Es el sistema actual de Next; `pages/`
  quedó como legado. Implica que los componentes son de servidor por defecto y
  hay que marcar con `'use client'` los que necesiten interactividad.
- **Carpeta `src/`.** Separa el código de la app de los archivos de
  configuración de la raíz.
- **Identidad de git solo local al repo.** Se configuró `user.name` y
  `user.email` con `git config` sin `--global`, para no afectar otros proyectos
  de la máquina. Se usa el mail `noreply` de GitHub para no exponer el mail real
  en el historial público.
