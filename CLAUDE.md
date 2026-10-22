@AGENTS.md

## Una sola versión: la del tocadiscos

Del 2026-10-07 al 2026-10-14 hubo dos versiones (`main` con el collage y
`muestra-disco` con el tocadiscos), y todo cambio se hacía en las dos. **El
2026-10-14 el usuario eligió la del tocadiscos como la oficial** y se subió
a `main`. Desde entonces hay una sola versión: los cambios se hacen en `main`.

- La rama `muestra-disco` quedó igual a `main` y ya no hace falta pasarle
  cambios. Se borra cuando el usuario lo pida.
- La portada con collage de foto grande quedó en el historial; no volver a
  ella sin preguntar.

## Música: archivos de audio

Decidido el 2026-10-15. **Cuando se empiece a cargar música, los archivos van
en Supabase Storage, en un bucket privado**, y la página los toca con links
firmados que vencen solos. Rige hasta que el usuario decida otro método.

- **Nunca commitear archivos de audio.** El repo de GitHub es público: un
  archivo commiteado se puede bajar desde ahí y queda para siempre en el
  historial, aunque después se borre.
- Tampoco en `public/`: todo lo de esa carpeta se publica en Vercel.
- En la base va solo la información del tema (título, artista, duración,
  ruta en Storage), no el archivo.
- El sitio publicado está abierto a cualquiera con el link y no tiene
  `robots.txt`: "nadie lo conoce" no alcanza como protección.
- Se descartaron por ahora: guardar el audio solo en local (carpeta ignorada
  por git) y commitearlo en el repo. Detalle en BITACORA.md, entrada (27).

### Cómo está armado (desde el 2026-10-22, BITACORA.md entrada 29)
- **Bucket `musica`**, privado, hasta 25 MB por archivo, solo audio. Cada
  artista sube en su carpeta (`<id>/…`); la carga inicial está en `semilla/`.
  Nadie lo lee directo.
- **Tabla `canciones`** (título, artista, género, duración, ruta, color de la
  etiqueta, `publicada`). Las ocultas solo las ve su artista.
- **Se escucha por `/api/canciones/[id]/audio`**: busca el tema con la sesión
  de quien escucha (la base decide si puede) y redirige a un link firmado de
  1 hora. Firma con `SUPABASE_SECRET_KEY`, que tiene que estar en
  `.env.local` para probar en local. La ruta del audio sale de
  `src/lib/audio.js` (no de `musica.js`, para no meter el cliente de
  Supabase en el navegador).
- **Artistas**: una cuenta con rol `artista` arma su ficha
  (`guardar_mi_ficha`, `artistas.perfil_id`) y sube temas en **/estudio**
  ("Mi música" en el menú del usuario). Hasta 10 temas por artista.
- **Carga inicial**: `scripts/cargar-musica.mjs` con una lista JSON que va
  fuera del repo. Son temas de DJs reales, sin voz, de la carpeta de música
  del usuario: se acreditan con su nombre real y la ficha no lleva bio
  inventada.
- `.gitignore` ignora `*.mp3`, `*.m4a`, `*.wav` y otros, como red de
  seguridad.

## Diseño

Revista **Artificial**. Estética **Gen X Soft Club, propuesta E · Collage**:
un andén de subte en menta y lavanda, con capas translúcidas superpuestas,
marcos blancos finos corridos de las fotos, líneas de HUD y columnas de código.
Referencia principal: la imagen "GEN X / young adult / contemporary soft club"
de `../Gen X Soft Club/` (fuera del repo). Historial en BITACORA.md, entradas
del 2026-10-05.

**Estado:** es el diseño oficial y está en `main` desde el 2026-10-05.
Reemplazó al fanzine grunge. Las otras propuestas (A, B, C, D, F y la versión
2 azul) quedaron descartadas: no reutilizar sus piezas.

**Antes de un cambio estético grande**, pedir referencias o mostrar una
muestra chica antes de rehacer el sitio (DESENCUENTROS.md #3).

### Tokens (`src/app/globals.css`)
- Se definen en `:root` y se exponen en `@theme inline`; usar las clases
  (`bg-cobalto`, `text-humo`…), no hex sueltos. Excepción ya establecida:
  sombras y brillos con hex y alfa (`#ffffffb3`).
- `cielo` fondo menta · `escarcha` vidrio · `linea` blanco de marcos y líneas
  · `marino` texto · `humo` texto secundario · `cobalto` azul de la ventana del
  tren (botón principal, `.cartel`) · `lavanda` cielo de arriba · `cian` agua.
- **`cian` es para líneas y fondos, no para texto**: sobre el menta no se lee.
- El fondo del `body` es el andén desenfocado (lavanda → menta, con una franja
  oscura a la altura de las ventanas), fijo.
- Si un token cambia de significado, se renombra; no se le cambia solo el valor.
- Un solo tema claro; no hay modo oscuro.

### Tipografía (dos fuentes, cargadas en `layout.jsx`)
- `font-ancha` (Audiowide): **solo lo grande**: el logo, el título de la
  portada, el footer, los títulos de página (`Titular`) y de sección
  (`TituloSeccion`). Siempre en mayúscula, llena de blanco con
  brillo o en contorno. Nunca en rótulos chicos ni en párrafos, y tampoco en
  la capitular: aislada, una L de Audiowide parece una barra.
- `font-texto` / `font-titular` (Exo 2): **todo lo demás**: texto, títulos de
  notas, menú, fechas, precios, etiquetas, marquesina.
- Para lo que antes iba en mono (menú, fechas, datos) se usa la utilidad
  `rotulo` (espaciado y peso medio), con `uppercase` si corresponde. No hay
  fuente mono.
- Nada de texto inclinado (`skew`) ni contorno en tamaños chicos.
- El texto fuente se escribe en caja normal ("Artificial", "Música"); la
  mayúscula se pone con la clase `uppercase`.

### Piezas propias
- `.tarjeta`: capa de vidrio translúcido sin esquinas redondeadas; al pasar
  por encima aparece el marco corrido del HUD (`outline-offset`).
- `.cartel`: panel azul translúcido con letra blanca (botón "Suscribete",
  próxima fecha, datos).
- `.etiqueta`: rótulo del HUD, chico, en mayúscula y espaciado, con raya a la
  izquierda.
- `.bruma`: tiñe de menta y agua lo que tenga como **primer hijo** (foto o
  gradiente de `portada`). Lo que vaya encima de la foto lleva `z-[2]`.
- Utilidades: `contorno` (blanco) y `contorno-oscuro` (letra solo en borde,
  **solo en tamaños grandes**: a 12px no se lee), `subrayado` +
  `group-hover:subrayado-activo`, `rotulo`, `titular-apretado`, `resplandor`,
  `linea-brillo` (línea blanca de 1px), `.capitular`, `.marquesina`.
- Las piezas van en `@layer components`, así las utilidades de Tailwind pueden
  sobreescribirlas. Fuera de capa, le ganan a las utilidades.
- Componentes: `Titular`, `TituloSeccion`, `ArticuloCard` (`destacado`),
  `EventoCard`, `Avatar` y `Codigo` (las columnas verticales del costado, hechas
  con slugs y fechas reales; solo desde 1280px).
- Música: `Tocadiscos`, `Reproductor`, `BarraReproductor`, `LineaDeTiempo`
  (un `range` nativo), `ListaCanciones` (temas con play, en la ficha del
  artista y en /estudio), `SubirCancion`, `MisCanciones` y `FormularioFicha`.

### Layout
- Contenedor `mx-auto max-w-6xl px-4`; lectura `max-w-3xl`/`max-w-4xl`;
  formularios `max-w-md`.
- Header sin fondo: logo a la izquierda y solo cuatro opciones a la derecha:
  **Música, Eventos, Suscribete, Entrar**. No agregar más sin preguntar.
- La portada es el nombre grande y, debajo, **Descubrimientos**: un tocadiscos
  (`Tocadiscos.jsx`) que toca los 10 temas más nuevos de la base. Suena de
  verdad: el brazo baja y el disco gira cuando suena; sostener el disco pausa.
  Sin temas en la base, queda quieto y sin botón de play. Después van
  "Últimas notas", con la más nueva en grande, y "Lo que se viene".
- **La música no se corta al navegar**: hay un solo `<audio>` en el layout
  (`Reproductor.jsx`, con `useReproductor()`). Fuera de la portada aparece la
  barra fija de abajo (`BarraReproductor.jsx`); en la portada manda el
  tocadiscos. Nada suena solo al cargar la página.
- Antes, la portada era un collage en una grilla de 12 columnas
  (`md:grid-cols-12`) con piezas que se superponen a propósito; en celular se
  apilan.
- En grillas con texto truncado, usar `grid-cols-1` en celular; si no, la
  columna se estira y aparece scroll horizontal.
- Las portadas de la base vienen en fucsias y naranjas: no se migran,
  `.bruma` las unifica.
- Verificar en 1440px y 375px sin scroll horizontal, y respetar
  `prefers-reduced-motion`.
- Nombres de clases, tokens y componentes en castellano.
