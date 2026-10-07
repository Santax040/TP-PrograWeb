@AGENTS.md

## Dos versiones del sitio

Desde el 2026-10-07 hay dos versiones vivas, y **todo cambio (de formato o de
lo que sea) se hace en las dos, siempre que aplique**:

| Versión | Rama | Qué es |
|---|---|---|
| Oficial | `main` | Lo que se publica en Vercel. |
| Con tocadiscos | `muestra-disco` | Portada con el disco y Descubrimientos, para cuando haya música. Respaldo en GitHub; no se publica ni se une a `main` hasta que el usuario lo pida. |

- **Cómo:** el cambio se hace y se commitea en `main`, y después se trae a
  la rama con `git merge main` desde su copia de trabajo (`../muestra-disco`).
  Se verifica también ahí.
- **Conflictos en la portada (`src/app/page.jsx`):** la rama manda. Su portada
  es distinta a propósito (el disco reemplaza a la foto de la nota principal).
- **Cuándo no aplica:** lo que solo existe en una de las dos. Por ejemplo, el
  collage de la portada de `main` o el tocadiscos de la rama. Si no está
  claro, preguntar.
- Subir `main` publica el sitio; subir `muestra-disco` solo actualiza el
  respaldo. Cada una se sube cuando el usuario lo pide.

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
