@AGENTS.md

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

### Tipografía (roles fijos, cargadas en `layout.jsx`)
- `font-ancha` (Audiowide): logo, títulos de página y de sección. En
  **mayúscula**, llena de blanco con brillo o solo en contorno.
- `font-mono` (Share Tech Mono): datos del HUD, fechas, precios, la marquesina
  y el menú del header, en mayúscula.
- `font-texto` / `font-titular` (Albert Sans): texto corrido y títulos de
  notas, en caja normal.
- El texto fuente se escribe en caja normal ("Artificial", "Música"); la
  mayúscula se pone con la clase `uppercase`.

### Piezas propias
- `.tarjeta`: capa de vidrio translúcido sin esquinas redondeadas; al pasar
  por encima aparece el marco corrido del HUD (`outline-offset`).
- `.cartel`: panel azul translúcido con letra blanca (botón "Suscribete",
  próxima fecha, datos).
- `.etiqueta`: rótulo del HUD, mono chica en mayúscula con raya a la izquierda.
- `.bruma`: tiñe de menta y agua lo que tenga como **primer hijo** (foto o
  gradiente de `portada`). Lo que vaya encima de la foto lleva `z-[2]`.
- Utilidades: `contorno` (blanco) y `contorno-oscuro` (letra solo en borde,
  **solo en tamaños grandes**: a 12px no se lee), `subrayado` +
  `group-hover:subrayado-activo`, `titular-apretado`, `resplandor`,
  `linea-brillo` (línea blanca de 1px), `.capitular`, `.marquesina`.
- Las piezas van en `@layer components`, así las utilidades de Tailwind pueden
  sobreescribirlas. Fuera de capa, le ganan a las utilidades.
- Componentes: `Titular`, `TituloSeccion`, `ArticuloCard` (`destacado`),
  `EventoCard`, `Avatar` y `Codigo` (las columnas verticales del costado, hechas
  con slugs y fechas reales; solo desde 1280px).

### Layout
- Contenedor `mx-auto max-w-6xl px-4`; lectura `max-w-3xl`/`max-w-4xl`;
  formularios `max-w-md`.
- Header sin fondo: logo a la izquierda y solo cuatro opciones a la derecha:
  **Música, Eventos, Suscribete, Entrar**. No agregar más sin preguntar.
- La portada es un collage en una grilla de 12 columnas
  (`md:grid-cols-12`) con piezas que se superponen a propósito; en celular se
  apilan.
- En grillas con texto truncado, usar `grid-cols-1` en celular; si no, la
  columna se estira y aparece scroll horizontal.
- Las portadas de la base vienen en fucsias y naranjas: no se migran,
  `.bruma` las unifica.
- Verificar en 1440px y 375px sin scroll horizontal, y respetar
  `prefers-reduced-motion`.
- Nombres de clases, tokens y componentes en castellano.
