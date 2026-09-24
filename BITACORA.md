# Bitácora del TP

Registro de cambios y decisiones del proyecto. Entrada más reciente arriba.

---

## 2026-09-24 (3) — Propuesta de rediseño trash / grunge

> **Estado: propuesta, pendiente de aprobación.** Vive en la rama
> `diseno-grunge`. Si se aprueba se une a `main`; si no, se descarta la rama
> y el diseño anterior queda intacto.

### Concepto
Fanzine punk fotocopiado: hojas de papel sucio pegadas con cinta sobre un
fondo negro granulado, titulares armados con letras recortadas, sellos de goma
y resaltador amarillo pasado a mano.

### Sistema visual
| Elemento | Decisión |
|---|---|
| Fondo | Negro carbón con grano de fotocopia en toda la pantalla |
| Papel | Beige sucio con textura, bordes inferiores rotos |
| Colores de choque | Amarillo ácido `#d7ff1f` y rojo sello `#ff2e1f` |
| Titulares | **Anton**, condensada tipo afiche |
| Texto corrido | **Courier Prime**, máquina de escribir |
| Anotaciones | **Permanent Marker**, "escrito a mano" |
| Logo | **Rubik Dirt**, letra gastada, con impresión corrida en rojo |

### Piezas nuevas
- **`Recorte`**: texto estilo carta de secuestro, una letra por recorte con
  fondo, fuente y giro distintos. Se usa en el titular de portada y en los
  títulos de página.
- **`Marquesina`**: cinta amarilla de "última hora" que corre bajo el header,
  armada automáticamente con las próximas fechas y las notas más nuevas.
- **`TituloSeccion`**: tira de papel torcida con sombra roja y enlace "a mano".
- Notas como hojas pegadas con cinta, levemente giradas; se enderezan al pasar
  el mouse.
- Eventos como **entradas troqueladas**: talón amarillo con la fecha, línea
  punteada y precio como sello rojo.
- Página de evento como **flyer de festival**: line-up en tamaños decrecientes.
- Nota individual con capitular roja y bajada resaltada.

### Decisiones
- **El caos es controlado.** Los giros y combinaciones de colores dependen de la
  posición del elemento, no de números aleatorios. Si fueran aleatorios, el
  servidor y el navegador generarían versiones distintas y React tiraría error
  de hidratación; además el diseño cambiaría en cada recarga.
- **Legibilidad por encima de la estética en el texto largo.** Las letras
  recortadas se usan solo en títulos cortos. Los títulos de notas van en Anton
  normal, y el cuerpo en Courier Prime a buen tamaño.
- **Accesibilidad del texto recortado.** Cada letra es un elemento separado,
  así que los lectores de pantalla la leerían letra por letra. Se agrega el
  texto completo oculto visualmente y se marcan los recortes como decorativos.
- **Sin scroll horizontal en celular.** Las hojas giradas sobresalen unos
  píxeles; `overflow-x-clip` en el `main` lo evita. Verificado a 375px.
- **Animación de la marquesina desactivada** para quien tenga activada la
  preferencia de reducir movimiento en su sistema.
- **Texturas sin imágenes.** El grano, la trama de fotocopia y los bordes rotos
  están hechos con CSS y SVG embebido: cero archivos extra que descargar.

### Verificación
- TypeScript y ESLint sin errores.
- Build de producción OK, 27 páginas.
- Revisado en escritorio y en celular (375px).

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
