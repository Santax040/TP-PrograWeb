# Bitácora del TP

Registro de cambios y decisiones del proyecto. Entrada más reciente arriba.

Los errores y malentendidos se registran aparte, en
[DESENCUENTROS.md](DESENCUENTROS.md).

**Marcas ⚑ (desde el 2026-10-05).** Cada entrada termina con una sección
**⚑ Para charlar** donde se anota lo que conviene revisar juntos más adelante.
Cada punto lleva su tipo:

- **[error]**: algo que hizo mal el asistente, aunque lo haya corregido antes
  de entregar.
- **[rareza]**: algo que se comporta distinto de lo esperable, del proyecto o
  de las herramientas.
- **[atajo]**: algo que se resolvió rápido a propósito y deja deuda.
- **[a decidir]**: una pregunta abierta para el usuario.

Para encontrarlas todas, buscar "⚑".

---

## 2026-10-07 — Muestra: tocadiscos de "Descubrimientos" en la portada

### Qué se pidió
En lugar de la nota principal, un vinilo girando e interactivo. A futuro, los
artistas van a poder subir música y el disco la va a tocar; por ahora no hay
música. El lugar del disco pasa a ser **Descubrimientos**: lo que suena en
este momento, como una nota principal. Se hizo primero como muestra local
(DESENCUENTROS.md #3).

### Qué se hizo (rama `muestra-disco`, carpeta `../muestra-disco`)
- **`Tocadiscos.jsx`** (componente de cliente):
  - Vinilo translúcido menta y lavanda, con surcos y un reflejo que no gira,
    que es lo que hace que se note el giro.
  - Gira solo a 33⅓. Se puede agarrar y girar con el mouse o el dedo; al
    soltarlo vuelve de a poco a su velocidad.
  - Botón "Pausar el disco" / "Girar el disco". El brazo se apoya cuando gira
    y se levanta en pausa. Con "reducir movimiento" arranca quieto.
  - La etiqueta del centro es la portada de la nota elegida, con "Artificial"
    y "Lado A n". Gira con el disco.
  - A la izquierda va la lista **Descubrimientos** (A1 a A4), con título y
    artistas. Al elegir otro, la etiqueta cambia entrando con un giro, y abajo
    se actualizan "Sonando ahora" y "Leer la nota".
- **Portada:** el disco y la lista reemplazan a la foto grande y a la nota
  chica del collage. La próxima fecha queda en la esquina del disco, o arriba
  de él en celular. "Últimas notas" ya no repite las que están en el disco.
- **Sin botón de play:** un play que no reproduce nada sería una promesa sin
  cumplir (DESENCUENTROS.md #1).
- Los descubrimientos salen de las notas destacadas y las más nuevas, hasta
  cuatro. No se tocó la base.

### Verificado en `localhost:3007`
- El giro, midiendo el ángulo del disco: avanza solo; arrastrado un cuarto de
  vuelta hacia atrás, retrocedió unos 100°.
- Elegir A2 cambia la etiqueta a "Lado A 2" y el enlace a esa nota; la pausa
  levanta el brazo y cambia el botón.
- En 1440px y 375px, sin scroll horizontal en portada, notas, agenda y nota.
  `eslint` y `npm run build` sin errores.

### ⚑ Para charlar
- **[error]** En celular el disco empujaba la página hacia el costado: es un
  cuadrado que gira, y su diagonal ocupa hasta un 41% más que el lado. Se
  envolvió en un contenedor redondo que recorta, y la sombra pasó a ese
  contenedor porque el recorte la cortaba.
- **[error]** Al principio el brazo apoyaba la púa en el borde del disco, y
  una línea del HUD cruzaba por encima de la lista. Se corrigieron mirando la
  página.
- **[rareza]** En el panel del navegador las animaciones solo avanzan cuando
  se saca una captura: la ventana estaba tapada y no dibujaba cuadros. Por
  eso el giro se verificó midiendo el ángulo entre capturas.
- **[rareza]** No se pudo probar "reducir movimiento" de verdad: el panel no
  deja simularlo. El código lo lee del sistema.
- **[a decidir]** Que Descubrimientos tenga sus propios datos (tema, artista,
  disco, una nota opcional) en vez de salir de las notas. Es el paso previo
  a que los artistas suban música.
- **[a decidir]** El nombre ARTIFICIAL sigue apareciendo dos veces arriba
  (header y título grande).

---

## 2026-10-07 (19) — Roles definitivos: un solo admin y cuentas de artista

### Qué se pidió
Definir los roles:
- **Admin:** uno solo (el dueño), puede todo.
- **Publicador:** publica notas y borra solo las suyas.
- **Usuario:** lee y manda propuestas, con o sin suscripción.
- **Artista:** a futuro sube música; un usuario tiene que elegir serlo.

Se decidió que **artista lo elige cada usuario, al instante**, y que la
herramienta para manejar roles desde la página **queda para más adelante**:
los cambios de rol se siguen haciendo desde Supabase.

### Qué se hizo

**Base** (migraciones `20261007120000_rol_artista.sql` y
`20261007120100_un_admin_y_ser_artista.sql`):
- Rol nuevo `artista`. Por ahora tiene los mismos permisos que un usuario.
- **Un solo admin:** índice único parcial sobre `perfiles` para las filas
  admin. La base rechaza que haya dos.
- Función `public.elegir_ser_artista(quiero)`: es lo único que deja a alguien
  tocar su propio rol, y solo mueve entre `usuario` y `artista`. Un publicador
  o el admin no la pueden usar, y por ahí nadie se sube a publicador o admin.
  Los visitantes sin sesión no la pueden llamar.

**Suscriptor no es un rol:** sigue siendo el plan (`perfiles.plan` y
`suscripcion_hasta`), que vale para cualquier tipo de cuenta.

**Página:**
- **Configuración:** bloque "Tipo de cuenta" con **Soy artista** / **Dejar de
  ser artista**. Solo lo ven usuarios y artistas.
- **Perfil:** dos filas nuevas, "Tipo de cuenta" (Admin, Publicador, Usuario,
  Artista) y "Suscripción" ("Sin suscripción" o "Mensual, hasta el ..."), que
  reemplazan a "Plan" y "Suscripción hasta". La etiqueta junto a la foto
  aparece para cualquier rol que no sea usuario.
- **Menú:** misma etiqueta (Admin, Publicador o Artista).
- `src/lib/roles.js`: nombres de los roles, `puedeElegirArtista()` y
  `esSuscriptor()`.

### Datos que cambiaron
- Al activar el bloqueo de un solo admin, la base lo rechazó: había **dos
  admins**. Además de Santiago, Antonia Maciel (`antoniamacielbe@gmail.com`,
  alta del 2026-10-06) tenía rol admin, puesto a mano desde Supabase. A pedido
  del usuario, **pasó a publicadora** y recién ahí se aplicó la migración.
- Hoy: 1 admin, 1 publicadora, 9 usuarios.

### Verificación
- Prueba de permisos: **42/42 OK**. Suma: un segundo admin se rechaza; una
  usuaria se hace artista y vuelve; siendo artista no puede escribir notas
  pero sí mandar propuestas, y no puede subirse a publicador; una publicadora
  no puede pasarse a artista; un visitante no puede usar la función. La prueba
  pasa al admin real a usuario solo dentro de su transacción, que se deshace.
- ESLint sin errores; build OK.
- Bloque "Soy artista" revisado en una página temporal sin login (se borró):
  los dos estados, el mensaje de error sin sesión, y 375px sin scroll
  horizontal.
- **No se probó** pasar una cuenta real a artista: hace falta entrar con
  Google.

### ⚑ Para charlar
- **[rareza]** Había una segunda admin que nadie había registrado. El bloqueo
  nuevo lo detectó; sin él, habría seguido así sin que se note.
- **[atajo]** `elegir_ser_artista` está en el esquema público, así se puede
  llamar desde la página, y es "security definer" (se ejecuta con permisos
  propios, por encima de los del usuario). Por eso valida todo adentro. El
  chequeo de seguridad de Supabase no la marcó.
- **[a decidir]** Mientras no haya pagos, la suscripción se activa a mano en
  Supabase: `plan` (mensual o anual) y `suscripcion_hasta` (una fecha). Y las
  notas exclusivas se siguen leyendo gratis (`pagosActivos = false`).
- **[a decidir]** La herramienta de roles y propuestas desde la página quedó
  para más adelante. Hoy se hace todo desde el Table Editor de Supabase.

---

## 2026-10-06 (18) — Menú de la cuenta todo en mayúscula

### Qué se pidió
Que la lista que se abre desde la cuenta esté toda en mayúscula o toda en
minúscula. Se eligió mayúscula, como el resto del menú del header.

### Qué se hizo
- `MenuUsuario.jsx` → `Opcion`: las opciones llevan `uppercase` y `rotulo`
  explícitos, el mismo estilo que MÚSICA, EVENTOS, SUSCRIBETE.
- **Por qué estaba mezclada:** los enlaces (Perfil, Configuración, Redacción)
  heredaban la mayúscula del `<nav>`, pero "Cerrar sesión" es un `<button>`, y
  los botones no heredan `text-transform` (el reset de Tailwind lo pone en
  `none`).

### Verificado en `localhost:3000`
Sin sesión no se puede abrir el menú real. Se insertaron en el header
opciones de prueba con las mismas clases: con las clases viejas, el botón
quedaba en `none` ("Cerrar sesión"); con las nuevas, enlace y botón salen en
`uppercase` ("PERFIL", "CERRAR SESIÓN"). `eslint` sin errores.

### Publicado
- Push `f05aa12..5608770` a `main`. Vercel marcó el deploy de producción como
  `success`, y el código que sirve revista-digital-musica.vercel.app ya trae las
  clases nuevas del menú y no las viejas.

### ⚑ Para charlar
- **[error]** Para verificar la publicación se buscaron las clases en los
  scripts con la ruta `/_next/static/chunks/`, y durante cinco minutos no
  apareció nada. Next 16 los sirve en `/_next/static/immutable/chunks/`: el
  método encontraba cero archivos y daba "no está" sin estar mirando. Es el
  mismo tipo de error que con Exo 2 en la entrada (9). Para la próxima: antes
  de esperar un resultado, comprobar que el método encuentra lo viejo.
- **[rareza]** No se vio el menú abierto de verdad, porque hace falta entrar
  con Google. Conviene que el usuario lo mire con su sesión.
- **[a decidir]** El nombre del usuario en el botón sigue en caja normal (es
  un nombre propio) y las etiquetas Admin/Publicador van en mayúscula.

---

## 2026-10-06 (17) — Fotos de portada con recorte 16:9

### Qué se pidió
Poder subir una foto propia como portada de la nota y que se ajuste al
formato del sitio. Se eligió recortar en **16:9**.

### Qué se hizo

**En Redacción** (bloque "Portada" del editor, `CampoPortada.jsx`):
- **Subir foto** abre una ventana para encuadrar (`RecorteFoto.jsx`): la foto
  se arrastra con mouse o dedo, el zoom va con una barra (hasta 4×) y, con el
  marco enfocado, las flechas la mueven (Shift, más rápido) y + / − cambian el
  zoom. La foto siempre cubre el marco: no se puede dejar espacio vacío. Tiene
  líneas de tercios y la opción "Ver original" para encuadrar sin el tinte.
- Al confirmar, el navegador dibuja el recorte a **1600×900** y lo comprime en
  **WebP** (o JPEG en Safari, que no genera WebP). Se sube a Supabase Storage y
  se ve una vista previa con el tratamiento del sitio. Después se puede cambiar
  o quitar.
- El gradiente se sigue eligiendo: es la portada si no hay foto.

**En la base** (migración `20261006180000_fotos_de_portada.sql`):
- Bucket `portadas`: público para ver; hasta 1 MB; solo WebP o JPEG.
- Solo **admins y publicadores** suben, y siempre en una carpeta con su id
  (`<usuario>/<archivo>`). Cada uno borra las suyas; el admin, cualquiera.
- Columna `articulos.portada_url`, que solo acepta direcciones del bucket.

**En la revista** (`FondoPortada.jsx`): la tarjeta, la nota principal y la
secundaria de la home, y la cabecera de la nota muestran la foto si la hay, o
si no el gradiente. Las fotos pasan por `next/image`, que sirve el tamaño justo
para cada lugar.

### Decisiones
- **El tinte menta no se "quema" en la foto.** Se guarda limpia y `.bruma` lo
  aplica en pantalla, igual que a los gradientes. Si cambia la estética, las
  fotos se adaptan sin volver a subirlas.
- **Se recorta y comprime en el navegador**, antes de subir: una foto de 8 MB
  del celular llega como unos 200 KB, siempre del mismo tamaño. El servidor
  no procesa imágenes.
- **Recortador propio, sin librería.** Son unas 200 líneas con eventos de
  puntero (sirve para mouse y dedo) y un `<canvas>`.
- **Una sola proporción (16:9)** para los tres lugares donde se ve la portada;
  cada uno muestra la parte central.

### Verificación
- Prueba de permisos ampliada: **34/34 OK**. Suma: una publicadora sube en su
  carpeta, pero no en la de otro; un usuario común no sube; una nota no acepta
  fotos de otro sitio. No quedaron fotos de prueba.
- ESLint sin errores; build OK.
- Navegador (build local, página temporal borrada), con imágenes generadas de
  3000×2000 y una vertical de 1200×1600: el marco es 16:9 exacto (838×471 en
  escritorio, 301×169 en celular); 10 pulsaciones de "+" llevan el zoom a 2.0;
  con la foto en una esquina y el zoom al mínimo sigue cubriendo el marco; el
  resultado es WebP de 1600×900; el recorrido completo desde "Subir foto"
  llega hasta la subida (sin sesión, avisa). La home sigue con sus 7 portadas.
- **No se probó** subir una foto real a Storage ni verla publicada: hace falta
  entrar con Google.

### ⚑ Para charlar
- **[error]** El zoom con teclado sumaba sobre un valor viejo: 10 "+" seguidos
  dejaban el zoom en 1.1 en vez de 2.0. Manteniendo la tecla apretada casi no
  avanzaba. Se corrigió sumando sobre el último valor.
- **[error]** Un chequeo de la prueba ("la foto cubre el marco") dio bien por
  casualidad: el panel del navegador estaba oculto, el marco medía 1×1 y
  cualquier cosa lo cubría. Se repitió con la ventana a tamaño fijo, y ahí sí
  valió.
- **[rareza]** Con el panel del navegador oculto, el recortador se queda en
  "cargando": se entera del tamaño del marco con `ResizeObserver`, que solo
  avisa cuando la página se dibuja. Para una persona usándolo no pasa (la
  página está a la vista), pero en pruebas automáticas hay que traer el panel
  al frente.
- **[rareza]** La herramienta de pruebas del navegador manda las teclas "+" y
  "=" vacías, así que el zoom con teclado se probó mandando el evento desde la
  página.
- **[atajo]** Las fotos reemplazadas o quitadas no se borran del bucket: quedan
  huérfanas. Con 1 GB gratis entran miles, pero a la larga convendría una
  limpieza.
- **[a decidir]** Si en alguna portada se corta algo importante, se podría
  sumar un "punto de foco" para elegir qué parte se ve en cada lugar.

---

## 2026-10-06 (16) — Retoques de Redacción: una sola sección y artistas escritos a mano

### Qué se pidió
- Que en la lista de secciones no aparezcan opciones que ya no están en la
  página.
- Que los artistas de una nota se puedan escribir, y que no sea obligatorio.

### Qué se hizo

**Una sola sección: Música.** En el menú ya solo estaba Música, pero en la
base seguían las cuatro, con notas. El usuario eligió pasar todo a Música
(migración `20261006150000_una_seccion_y_artistas_libres.sql`):
- Las 4 notas de Fiestas, Quilombo y Entrevistas pasan a Música (quedan 7).
  También se corrigió la sección guardada en las propuestas de lectores.
- Se borran esas tres secciones de la tabla `categorias` y de `site.js`.
- Las URLs viejas (`/notas/categoria/fiestas`, `/quilombo`, `/entrevistas`)
  redirigen a Música con un 308 (`next.config.mjs`), así no quedan links
  rotos.
- En el editor y en el formulario de propuestas, con una sola sección no se
  muestra un desplegable de una opción: va fija. Si algún día vuelven a ser
  varias, el desplegable reaparece solo.

**Artistas escritos a mano** (`CampoArtistas.jsx`):
- Se escribe el nombre y se agrega con Enter o coma; el navegador sugiere los
  artistas que ya tienen ficha. Cada uno queda como etiqueta con ✕; Borrar con
  el campo vacío saca el último. Es opcional.
- Se ignoran mayúsculas, tildes y espacios de más: "nena tornado" se reconoce
  como "Nena Tornado" y no se repite.
- Al guardar: si el nombre coincide con un artista de la base, se vincula a su
  ficha como antes. Si no, se guarda en la columna nueva
  `articulos.artistas_mencionados` (hasta 20).
- En la nota, "Aparecen en esta nota" muestra los dos: los que tienen ficha,
  con link, y los otros sin link.

### Decisiones
- **Los artistas sin ficha no crean una ficha nueva.** Habría páginas de
  artista vacías, sin bio ni género. Se guardan como texto; si después se les
  arma la ficha, conviene vincularlos.
- **Sugerencias con `<datalist>` del navegador** en lugar de un desplegable
  propio: es accesible y funciona con teclado sin escribir código extra.

### Verificación
- ESLint sin errores; build OK (34 páginas, solo `/notas/categoria/musica`).
- En la base: una sola categoría y 7 notas en Música.
- Navegador (build local, página temporal sin login, borrada): los artistas se
  agregan con Enter y con coma, el repetido se ignora, Enter no manda la nota,
  Borrar y ✕ los sacan, y la sección aparece fija. Las tres URLs viejas
  terminan en `/notas/categoria/musica`.
- **No se probó** guardar una nota real con artistas sin ficha: hace falta
  entrar con Google.

### ⚑ Para charlar
- **[rareza]** Al pedirlo, el usuario contaba con que solo existía Música
  porque es lo único del menú, pero en la base seguían las cuatro secciones con
  notas publicadas. Se preguntó antes de borrar.
- **[atajo]** Si un artista sin ficha recibe una ficha después, las notas
  viejas lo siguen teniendo como texto, sin link. Habría que vincularlas a
  mano o con un script.
- **[a decidir]** Con una sola sección, la etiqueta "Música" en cada tarjeta y
  la página `/notas/categoria/musica` repiten lo mismo que `/notas`. Se podrían
  simplificar.

---

## 2026-10-06 (15) — Redacción para publicar, y "mandar una nota" desde la cuenta

### Qué se pidió
- Para los admins, una sección para escribir y publicar que quede
  profesional.
- Para las cuentas que no son admin, una opción en su cuenta para mandar
  notas, usando el aviso por mail de la entrada anterior.

### Qué se hizo

**Redacción** (`/redaccion`), para admins **y publicadores**:

| Página | Qué hace |
|---|---|
| `/redaccion` | Lista de notas, separada en Borradores y Publicadas. El admin ve todas; un publicador, las suyas. Al admin le avisa si hay propuestas de lectores sin revisar. |
| `/redaccion/nueva` | Nota nueva. Arranca como borrador, con tu nombre de firma y la fecha de hoy. |
| `/redaccion/[id]` | Editar una nota existente. |

**Editor** (`EditorNota.jsx`), en dos columnas que en celular se apilan:
- Izquierda, lo que se lee: título (grande, como se ve publicado), bajada y
  texto. Los párrafos se separan con un renglón en blanco.
- Derecha, los datos de publicación: estado, botones, sección, fecha, firma,
  "exclusiva para suscriptores", "destacar en la portada" (solo admin),
  portada y artistas que aparecen.
- Botones según el estado: **Publicar** / **Guardar borrador**, o, si ya está
  publicada, **Guardar cambios** / **Pasar a borrador**, más un link para ver
  la nota publicada.
- **Borrar** pide un segundo clic de confirmación.
- La dirección de la nota (`slug`) sale del título al crearla y no cambia
  después, para no romper links. Si ya existe, se le agrega un sufijo.
- Los minutos de lectura se calculan solos (200 palabras por minuto).
- Al guardar se regeneran las páginas públicas (`revalidatePath`), así la nota
  aparece sin esperar el minuto de revalidación.

**Cuenta** (`/perfil`): un bloque azul que cambia según el rol:
- Admin y publicador: "Redacción" → **Ir a Redacción**.
- Usuario: "¿Escribiste algo?" → **Mandar una nota** (lleva a `/colabora`,
  que guarda la propuesta y le manda el mail al admin).

El menú del usuario también cambia: "Redacción" o "Mandar una nota". Además,
`/perfil` muestra la etiqueta "Publicador".

**Mail:** `RESEND_API_KEY` y `AVISO_ENVIOS_PARA` cargadas en Vercel (production,
preview y development). El usuario las había puesto en `.env.local`.

**Helper nuevo** `src/lib/sesion.js`: `obtenerSesion()` (usuario y perfil),
`puedeEscribir(perfil)` y `exigirRedaccion(ruta)`, que manda al login o a
`/colabora` según corresponda. `/perfil` pasó a usarlo.

### Decisiones
- **"Redacción" y no "Panel" o "Admin":** es como se llama en una revista el
  lugar donde se escribe, y también la usan los publicadores, no solo el admin.
- **Portadas de una lista fija** (`src/lib/redaccion.js`). Tailwind solo genera
  las clases que encuentra escritas en el código: un gradiente inventado en el
  momento no tendría estilos.
- **Un borrador puede estar a medias; una nota publicada, no:** para publicar
  se exige bajada y texto.
- **Un publicador no puede editar notas ajenas, aunque las vea publicadas:** la
  página de edición da 404, y la base lo rechazaría igual.

### Verificación
- ESLint sin errores; build OK (36 páginas, las de Redacción dinámicas).
- Editor revisado en una página temporal sin login (se borró): se conservan
  los valores y la portada al guardar, borrar pide confirmación, 1440px y
  375px sin scroll horizontal, y en celular la columna de datos pasa abajo.
- Sin sesión, `/redaccion`, `/redaccion/nueva`, `/redaccion/[id]` y `/perfil`
  redirigen al login y vuelven a donde se quería ir.
- En Vercel, production y preview guardan las variables como "Secret": `vercel
  env pull` no las devuelve. Se comparó con development, que se cargó igual y
  coincide exacto.
- **No se probó** publicar una nota real ni el mail con una propuesta real:
  hace falta entrar con Google, y eso lo hace el usuario.

### ⚑ Para charlar
- **[error]** La primera versión del botón "Sí, borrar" era un `submit` con
  `formAction`: lo habría atrapado el `onSubmit` del editor y la nota se habría
  *guardado* en vez de borrarse. Se vio al revisar el código, antes de probar,
  y se cambió por un botón que llama a la acción directo.
- **[error]** Un script para editar `/perfil` falló porque el archivo tiene
  saltos de línea de Windows (CRLF). Como cortaba antes de escribir, no rompió
  nada; se hizo con el editor.
- **[rareza]** Vercel guarda las variables nuevas de production y preview como
  "Secret": no se pueden volver a bajar ni ver.
- **[atajo]** Los artistas de una nota se reemplazan borrando y volviendo a
  insertar la lista. No es una sola operación: si falla a la mitad, la nota
  puede quedar sin artistas.
- **[atajo]** Todavía no hay pantalla para revisar las propuestas de los
  lectores: Redacción solo avisa cuántas hay sin revisar.
- **[a decidir]** Las portadas son seis gradientes fijos. Más adelante se
  podrían subir fotos (Supabase Storage).

---

## 2026-10-06 (14) — Publicadores oficiales y propuestas de los lectores

### Qué se pidió
Tener 3 o 4 publicadores oficiales, y que el resto de los usuarios pueda
mandar notas o datos desde la página **sin que se publiquen**: que les
lleguen por mail a los admins, "estilo CV". Se acordó:
- Se pueden mandar **una nota, una fecha (evento) o un artista**.
- **Mail automático** con Resend, además de guardar la propuesta en la base.
- **Solo texto y links**, sin archivos adjuntos.

### Qué se hizo

**Roles** (migraciones `20261006120000_rol_publicador.sql` y
`20261006120100_publicadores_y_envios.sql`):

| Rol | Antes | Ahora |
|---|---|---|
| `usuario` | Leía y escribía sus notas | Lee y **manda propuestas**. Ya no escribe notas. |
| `publicador` | — | Escribe, edita y borra **sus** notas. |
| `admin` | Todo | Todo, y recibe las propuestas. |

- Si un publicador vuelve a ser usuario, pierde el acceso a sus notas viejas:
  quedan en manos del admin.
- Función nueva `privado.es_publicador()` (cuenta también al admin).

**Tabla `envios`** (las propuestas):
- `tipo` (nota/evento/artista), `titulo`, `datos` (jsonb con el resto de los
  campos), `estado` (nuevo, leído, aceptado, descartado) y `autor_id`.
- Permisos: el usuario manda **a su nombre** y solo elige el contenido; no
  puede poner el estado ni la fecha (permisos por columna). Ve solo las suyas.
  El admin ve todas y cambia el estado. Los visitantes sin sesión no ven ni
  mandan nada.
- **Freno anti-spam:** un trigger corta en 5 propuestas por persona cada 24
  horas.

**Página `/colabora`:**
- Elegís qué mandar (tres tarjetas) y aparecen los campos de ese tipo.
- Sin sesión, pide entrar con Google (`/login?siguiente=/colabora`).
- Abajo, "Lo que ya mandaste", con el estado de cada propuesta.
- Accesos: "Mandar una propuesta" en el menú del usuario, y "¿Tenés una nota,
  una fecha o un artista? Mandánoslo" en el footer. El header no se tocó,
  porque tiene sus cuatro opciones fijas (CLAUDE.md).
- El menú muestra la etiqueta "Publicador" igual que "Admin".

**Mail al admin** (`src/lib/aviso-envio.js`): se manda con la API de Resend
desde la Server Action. Lleva todos los campos y el `reply_to` es el mail del
lector, así que alcanza con responder el mail para contestarle. Todo lo que
escribe el lector se escapa: en el mail va como texto, nunca como HTML. Si el
mail falla, la propuesta ya quedó guardada.

**Una sola definición de campos** (`src/lib/envios.js`): el formulario, la
validación del servidor y el mail salen de la misma lista.

### Decisiones
- **Guardar además de mandar el mail.** Si el mail cae en spam o Resend falla,
  la propuesta no se pierde: está en la tabla `envios` del panel de Supabase.
- **Hace falta entrar con Google para mandar.** Así hay un mail real al que
  responder, y el límite de 5 por día se puede aplicar por persona.
- **Links solo `http(s)`.** Se rechazan los demás (por ejemplo `javascript:`)
  antes de guardarlos o ponerlos en el mail.
- **Descartado: adjuntar archivos.** Pedía Supabase Storage, límites de tamaño y
  cuidar qué se sube. Con links (Drive, Instagram, Spotify) alcanza.

### Verificación
- Prueba de permisos ampliada: **30/30 OK**. Suma casos de publicador, de
  usuario que ya no puede escribir notas, y de propuestas (mandar a nombre de
  otro, autoaprobarse, límite diario, visitante, admin).
- `supabase db advisors`: sin avisos nuevos.
- ESLint sin errores; build OK (34 páginas, `/colabora` dinámica).
- El formulario se revisó en una página temporal sin login (se borró): cambio
  de tipo, validación de links, mensajes de error, 1440px y 375px sin scroll
  horizontal.
- **No se probó** mandar una propuesta real ni el mail: hace falta sesión con
  Google y la clave de Resend.

### ⚑ Para charlar
- **[error]** La primera versión del formulario volvía solo a "Una nota"
  después de un error. React 19 vacía los formularios con `action` después de
  cada envío, y eso reseteaba la opción elegida aunque en pantalla siguieran
  los campos de otro tipo; el segundo envío mandaba el tipo equivocado. Se
  detectó en la prueba y se corrigió mandando el formulario a mano
  (`onSubmit` + `startTransition`).
- **[error]** La prueba de permisos tenía dos errores propios: esperaba un
  error donde la base simplemente no cambia nada (un `update` sin permiso
  afecta 0 filas), y el caso del límite diario se deshacía entero al fallar.
  Se corrigió la prueba; los permisos estaban bien.
- **[rareza]** Resend, sin dominio propio, solo manda mails a la dirección con
  la que se creó la cuenta. Para que les llegue a varios admins hay que
  comprar y verificar un dominio.
- **[rareza]** Había otro servidor de desarrollo corriendo en esta carpeta
  (otra conversación), así que se verificó con el build en otro puerto. Se
  agregó la configuración `tp-build-local` en
  `Programacion Web/.claude/launch.json`.
- **[atajo]** No hay pantalla de admin para ver y aceptar propuestas: por ahora
  se ven en el mail y en el panel de Supabase (tabla `envios`). El estado se
  cambia desde ahí.
- **[a decidir]** Quiénes son los publicadores. Se asignan con
  `update perfiles set rol = 'publicador' ...` cuando hayan entrado con
  Google.
- **[a decidir]** Todavía no hay forma de que un publicador escriba desde la
  página: la base lo permite, pero falta el panel de edición.

---

## 2026-10-05 (13) — Primer admin

### Qué se hizo
- La cuenta de Santiago (`santiagoj2004@gmail.com`, entra con Google) pasó de
  `usuario` a `admin`. Se hizo con un `update` directo en la base:
  ```
  supabase db query --linked "update perfiles set rol = 'admin' where id = (select id from auth.users where email = '...')"
  ```
- Es un cambio de datos, no de esquema: no lleva migración.

### ⚑ Para charlar
- **[a decidir]** Por ahora los roles solo se cambian por SQL. Cuando exista el
  panel de admin, convendría poder hacerlo desde la página.

---

## 2026-10-05 (12) — La revista primero: notas antes que eventos, y eventos sin precio

### Qué se pidió
La prioridad del sitio es la revista. La sección de notas tiene que ir antes
que la de próximos eventos. Artificial funciona como medio de difusión para
productoras: anuncia fiestas, no las vende.

### Qué se hizo
- **Portada:** "Últimas notas" pasó arriba de "Lo que se viene".
- **Sin precios en los eventos.** En el sitio no había ningún botón de compra,
  pero el precio aparecía en tres lugares con tono de venta:
  - Panel "Próxima fecha" de la portada: "desde $ 18.000" → ahora muestra el
    lugar y la ciudad.
  - Renglón de evento (`EventoCard`), en la portada y en la agenda: el precio
    de la derecha → ahora el género, como etiqueta.
  - Página del evento: "Entradas desde", resaltado en cian → ahora "Género". Se
    sacó la etiqueta de género de la foto, que quedaba repetida.
- **Aclaración en la página del evento:** "Artificial anuncia esta fecha. No
  vendemos entradas: la venta la maneja cada productora."
- Los precios de los planes de suscripción siguen, porque eso sí es el
  servicio de la revista.

### Verificado en `localhost:3000`
Las secciones de la portada salen en el orden nuevo; en la portada y en la
agenda no queda ningún "$"; la página del evento muestra fecha, lugar, género
y la aclaración. Sin scroll horizontal. `eslint` y `npm run build` sin errores.

### ⚑ Para charlar
- **[rareza]** El evento "Artificial presenta: octubre" dice en su nombre que
  lo organiza la revista, y debajo aparece "la venta la maneja cada
  productora". Para ese evento en particular, las dos cosas chocan.
- **[atajo]** El precio sigue guardado en la base (`precio_desde`) y se sigue
  leyendo en `data.js`, aunque ya no se muestra. Se dejó por si vuelve a hacer
  falta; si no, se puede sacar con una migración.
- **[a decidir]** Otras formas de darle prioridad a las notas, todavía sin
  hacer: que la marquesina pase notas en vez de fechas, o que el panel azul de
  la portada destaque una nota en vez de la próxima fecha.

---

## 2026-10-05 (11) — El evento "Subsuelo Presenta" pasa a "Artificial presenta: octubre"

### Qué se pidió
Renombrar el evento a "Artificial presenta: octubre".

### Qué se hizo
- Migración nueva `20261005230000_renombrar_evento_artificial.sql`: un
  `update` del campo `nombre` del evento con slug `subsuelo-presenta-octubre`.
- Se aplicó con `supabase db push` sobre el único proyecto, que es el de
  producción. Antes, `supabase migration list` confirmó que las cuatro
  migraciones anteriores ya estaban aplicadas, y `--dry-run` mostró que solo
  se iba a aplicar esta.
- Se hizo como migración, y no editando la base a mano, para que el repo siga
  diciendo exactamente qué contenido tiene la base.

### Verificado en producción
Después del minuto de regeneración de las páginas, el nombre nuevo aparece y
el viejo ya no en la portada (collage y marquesina), `/agenda`, la página del
evento y las de sus dos artistas (Nena Tornado y DJ Perejil).

### ⚑ Para charlar
- **[a decidir]** El slug sigue siendo `subsuelo-presenta-octubre`, así que
  la dirección de la página dice "subsuelo", y el slug también aparece en las
  columnas de código del costado. Se dejó así para no romper el enlace.
  Cambiarlo es otra migración: los line-ups apuntan por id, así que no se
  rompe nada adentro del sitio.
- **[rareza]** El nombre va como lo escribió el usuario, en minúscula
  ("presenta: octubre"). Los otros eventos usan mayúsculas variadas ("Ruido
  Blanco vol. 4", "Cierre de Temporada").

---

## 2026-10-05 (10) — Limpieza: se borran las propuestas descartadas

### Qué se pidió
"Borra el resto si ya está", después de publicar Exo 2.

### Qué se hizo
- **Carpetas:** se borraron las seis copias de trabajo de `../variantes/`
  (con sus `node_modules`) y la carpeta misma, donde solo quedaban los logs
  de instalación y build.
- **Ramas locales borradas:** `gxsc-a-terminal`, `gxsc-b-flyer`,
  `gxsc-c-consola`, `gxsc-d-anden`, `gxsc-e-collage`, `gxsc-f-cianotipo`,
  `fuentes-exo`, `fuentes-albert`, `rediseno-gxsc` y `diseno-grunge`.
- **Ramas borradas en GitHub:** `rediseno-gxsc` y `diseno-grunge`.
- **`launch.json`** (en `Programacion Web/.claude/` y en `TP/.claude/`):
  quedó solo la configuración del sitio, en el puerto 3000.
- Queda una sola rama, `main`, igual a la de GitHub.

### Qué se perdió y qué no
- `e-collage`, `fuentes-exo`, `rediseno-gxsc` y `diseno-grunge` estaban
  enteras en `main`: no se perdió nada.
- Las propuestas A, B, C, D y F y la versión con Albert Sans tenían commits
  propios que no están en `main`. Se perdieron a propósito: eran las
  descartadas. Su descripción, sus decisiones y lo que se aprendió quedan en
  las entradas (2), (3) y (8) de esta bitácora.

### ⚑ Para charlar
- **[rareza]** Las ramas que se borraron en GitHub pueden haber dejado
  previews viejos en Vercel. No molestan, pero se pueden limpiar desde el
  panel de Vercel.
- Quedan resueltos los **[a decidir]** de borrar propuestas de las entradas
  (7) y (9).

---

## 2026-10-05 (9) — Se publica Exo 2 como fuente general

### Qué se pidió
"Nos vamos a quedar con fuente de exo, pusheala".

### Qué se hizo
- Se unió la rama `fuentes-exo` a `main` y se subió a GitHub. Vercel publica
  `main`.
- Queda: **Audiowide** para el logo y los títulos grandes, **Exo 2** para
  todo lo demás. Las reglas están en `CLAUDE.md` → `## Diseño` → Tipografía.

### Verificado en producción
- `eslint` y `npm run build` sin errores antes del push (`1f64105..b5608ac`).
- En revista-digital-musica.vercel.app, midiendo la fuente de cada texto de la
  portada: Audiowide en 5 elementos y Exo 2 en 101. No queda ninguna otra.

### ⚑ Para charlar
- **[error]** Para saber cuándo estaba publicado, se buscó "Exo" en el HTML
  con `curl` durante siete minutos. Nunca podía aparecer: `next/font` sirve las
  fuentes con nombres generados. Había que medir la fuente en el navegador,
  como se hizo después.
- **[a decidir]** Borrar `fuentes-albert` y las ramas y carpetas de las
  propuestas descartadas (ver entrada 7).

---

## 2026-10-05 (8) — Menos fuentes: dos versiones para elegir

### Qué se pidió
El usuario notó que "cada parte parece que tiene una fuente distinta". Quiere
menos fuentes, una más general, y conservar la de "Artificial" (Audiowide).
Se acordó armar dos versiones para comparar antes de publicar.

### Diagnóstico
El sitio usaba 3 fuentes, y además Audiowide aparecía en tres formas (llena,
en contorno, inclinada). A la vista eran unas cinco "letras" distintas:
- **Audiowide** en el logo y los títulos, pero también en rótulos de 9 a 10px
  (agenda, nota, perfil, formulario) y en la descripción inclinada de la
  portada.
- **Share Tech Mono** en el menú, las fechas, las etiquetas y la marquesina:
  otra voz "techno" peleándose con Audiowide.
- **Albert Sans** en el texto y los títulos de notas.

### Qué se hizo
Regla nueva, igual en las dos versiones:
- **Audiowide solo para lo grande:** logo, título de la portada, footer y
  títulos de página y de sección.
- **Una fuente general para todo lo demás.** Lo que iba en mono pasa a la
  utilidad nueva `rotulo` (espaciada y en peso medio, con `uppercase` donde
  corresponde). Los rótulos chicos que estaban en Audiowide, también.
- La descripción de la portada deja de estar inclinada, y la volanta de los
  títulos deja de ir en contorno.
- La letra capital de las notas pasa a la fuente general en negrita.
- `CLAUDE.md` → `## Diseño` → Tipografía, reescrita con estas reglas.

| Versión | Fuente general | Rama | Carpeta | Puerto |
|---|---|---|---|---|
| Exo 2 (recomendada) | Exo 2: curvas cuadradas, de la misma familia que Audiowide | `fuentes-exo` | `variantes/d-anden` | 3004 |
| Albert Sans | Albert Sans: neutra, la de hoy | `fuentes-albert` | `variantes/f-cianotipo` | 3006 |

### Verificado
- Medido en la portada: cada versión usa exactamente dos fuentes (Audiowide en
  5 lugares, la general en el resto).
- Escritorio y 375px sin scroll horizontal en portada, notas, agenda, evento,
  nota, artista, suscribite y login. `eslint` y `npm run build` sin errores.

### ⚑ Para charlar
- **[error]** La letra capital en Audiowide se veía como una barra azul, no
  como una "L". Había quedado en la regla de "lo grande" sin mirarla aislada.
  Se vio al revisar la nota y se pasó a la fuente general.
- **[rareza]** Para no instalar todo de nuevo, las dos versiones usan las
  carpetas de propuestas descartadas (`d-anden` y `f-cianotipo`) con otra rama.
  Los nombres de las carpetas ya no dicen lo que tienen adentro. Las ramas
  viejas `gxsc-d-anden` y `gxsc-f-cianotipo` siguen intactas.
- **[rareza]** Al cambiar de rama, las pestañas del navegador de esas
  carpetas se cerraron y hubo que reiniciar los servidores. Se agregaron
  `fuentes-exo` y `fuentes-albert` al `launch.json`.
- **[a decidir]** Exo 2 o Albert Sans. Nada de esto está publicado.

---

## 2026-10-05 (7) — Collage pasa a ser el diseño oficial y se publica

### Qué se pidió
"Este nuevo diseño es el oficial": commitear y pushear todo para que sea lo
que se ve en la página publicada.

### Qué se hizo
- **`CLAUDE.md` → `## Diseño`** reescrita para la propuesta E: tokens,
  tipografías, piezas, layout y las lecciones de esta tanda (`@layer
  components`, `grid-cols-1` en celular, contorno solo en tamaños grandes, las
  cuatro opciones del header).
- **Se commitearon los documentos** que estaban pendientes en
  `rediseno-gxsc`: esta bitácora, `CLAUDE.md` y `DESENCUENTROS.md`.
- **Se unió `gxsc-e-collage` a `rediseno-gxsc`**, y `rediseno-gxsc` a `main`.
  Fue un avance directo: `main` no tenía commits nuevos.
- **Push de `main` a GitHub.** Vercel publica `main` en
  revista-digital-musica.vercel.app.

### Decisiones
- **Se publica todo junto:** la versión 2 azul y el Collage van en la misma
  subida. La 2 nunca llegó a producción; en el historial queda como paso
  intermedio.
- **Las ramas de las otras propuestas no se suben a GitHub** y siguen locales
  con sus carpetas en `../variantes/`. Borrarlas no tiene vuelta atrás: se
  pregunta antes.

### Verificado en producción
- `eslint` y `npm run build` sin errores antes del push.
- Push `a30e91a..1c42424` a `main`. A los 30 segundos,
  revista-digital-musica.vercel.app ya mostraba el título "Artificial".
- En el sitio publicado: el menú dice MÚSICA, EVENTOS, SUSCRIBETE y ENTRAR, la
  portada es el collage y no hay scroll horizontal. Portada, notas, agenda,
  evento, nota, categoría, suscribite, login y artista responden 200.

### ⚑ Para charlar
- **[a decidir]** Borrar las propuestas descartadas: ramas `gxsc-a`…`gxsc-f`
  (menos `e`), `diseno-grunge` y las carpetas de `../variantes/`, que ocupan
  bastante disco (cada una tiene su `node_modules`).
- **[rareza]** `rediseno-gxsc` y `main` quedan iguales. De acá en adelante
  conviene trabajar directo en `main`, como dice la regla del proyecto.
- **[atajo]** Siguen pendientes los puntos de las entradas (5) y (6): el
  evento "Subsuelo Presenta: Octubre" en la base, "Suscribete" o
  "Suscribite", y "Eventos" o "Agenda".

---

## 2026-10-05 (6) — Marcas ⚑ para charlar más adelante

### Qué se pidió
Registrar todo en la bitácora y, de acá en adelante, marcar las cosas raras,
los errores del asistente y las peculiaridades, para charlarlas después.

### Qué se hizo
- Arriba de este archivo quedó explicada la convención: cada entrada cierra
  con **⚑ Para charlar** y cada punto lleva su tipo (**[error]**,
  **[rareza]**, **[atajo]** o **[a decidir]**).
- Se marcaron hacia atrás todas las entradas de esta conversación, desde
  2026-10-01 (5) hasta 2026-10-05 (5). Algunos errores se habían corregido
  antes de entregar y no estaban escritos en ningún lado: ahora quedan
  anotados.

### Decisiones
- **Con DESENCUENTROS.md se reparten así:** allá van los casos en que lo que
  se pidió y lo que se hizo no coincidieron. Acá, con ⚑, va todo lo demás que
  conviene revisar: errores atrapados a tiempo, rarezas de las herramientas,
  deudas y preguntas abiertas.

### ⚑ Para charlar
- **[a decidir]** Cuando se repasen las marcas, ver si alguna merece pasar a
  DESENCUENTROS.md o convertirse en una regla de `CLAUDE.md`.

---

## 2026-10-05 (5) — La revista se llama Artificial y deja de tener lema

### Qué se pidió
"El título de la página tiene que ser Artificial", y borrar "noche, música y
quilombo".

### Qué se hizo (rama `gxsc-e-collage`)
- `site.js`: `nombre` pasó de "SUBSUELO" a **"Artificial"**, escrito en caja
  normal. Donde el diseño lo pide (header, portada, footer) se muestra en
  mayúscula con la clase `uppercase`.
- Se eliminó `site.tagline` y todos sus usos: debajo del logo en el header,
  debajo del título grande de la portada y en el título de la pestaña.
- Título de la pestaña: la portada dice "Artificial" y las demás páginas
  "Agenda — Artificial", "Notas — Artificial", etc.
- Como el logo ahora es de un solo renglón, el header se alinea al centro.

### Pendiente
- En la base, un evento se llama "Subsuelo Presenta: Octubre" y aparece en la
  marquesina y en la agenda. Es contenido, no diseño, y la base es la de
  producción: no se tocó sin preguntar.
- La categoría "Quilombo" sigue existiendo (ya no está en el header).

### Verificado
En `localhost:3005`: el título y los textos ya no incluyen el lema; sin scroll
horizontal; `eslint` sin errores.

### ⚑ Para charlar

- **[a decidir]** En la base hay un evento que se llama "Subsuelo Presenta:
  Octubre" y se ve en la marquesina y en la agenda. La base es la misma que
  usa producción, así que no se tocó.
- **[a decidir]** "Suscribete" sin voseo, cuando el resto del sitio dice
  "Suscribite", "Entrás"… Se escribió como lo pidió el usuario.
- **[a decidir]** El menú dice "Eventos", pero la página adentro sigue
  titulándose "Agenda".
- **[rareza]** "Quilombo" sigue siendo una categoría con página propia, aunque
  ya no aparece en el header ni en el lema.

---

## 2026-10-05 (4) — Elegida la propuesta E (Collage). Menú de cuatro opciones

### Qué se pidió
El usuario eligió **E · Collage** y empezó a ajustarla. Primer cambio: que el
header diga solo "MUSICA - EVENTOS - SUSCRIBETE - ENTRAR".

### Qué se hizo (rama `gxsc-e-collage`)
- `Header.jsx`: el menú pasó de seis opciones a cuatro, en mono y en
  mayúscula, como los rótulos del HUD:
  - **Música** → `/notas/categoria/musica`
  - **Eventos** → `/agenda`
  - **Suscribete** → `/suscribite`, como botón azul
  - **Entrar** → el mismo de antes; con sesión iniciada sigue mostrando el
    nombre con su menú
- Fiestas, Quilombo y Entrevistas salieron del header. Sus páginas siguen
  existiendo y se llega a ellas desde la etiqueta de cada nota.

### Decisiones
- "Suscribete" se escribió tal cual lo pidió el usuario, aunque el resto del
  sitio usa voseo ("Suscribite"). La dirección `/suscribite` no cambió.
- La página `/agenda` todavía se llama "Agenda" adentro; en el menú figura
  como "Eventos".

### Verificado
En `localhost:3005`: el header muestra las cuatro opciones. `eslint` sin errores.

### ⚑ Para charlar

- **[rareza]** Todo el ajuste de E se hace en su rama (`gxsc-e-collage`,
  carpeta `variantes/e-collage`), pero la bitácora se escribe en `TP/` (rama
  `rediseno-gxsc`). Hasta que E pase a `rediseno-gxsc`, el código y su registro
  viven en lugares distintos.
- **[atajo]** `CLAUDE.md` → `## Diseño` todavía describe la versión 2 (Lexend,
  vidrio, `.cartel` cobalto). Hay que reescribirla para E.
- **[a decidir]** Las otras cinco propuestas (A, B, C, D, F) siguen con sus
  ramas y carpetas. Borrarlas no tiene vuelta atrás: se pregunta antes.

---

## 2026-10-05 (3) — Tres propuestas más (D, E, F), una por cada foto nueva

### Qué se pidió
El usuario sumó tres fotos a `../Gen X Soft Club/`, cada una con colores y
esquemas distintos, y pidió tres propuestas nuevas tomándolas de referencia.

### Las fotos y lo que se tomó de cada una

| Foto | Colores | Esquema | Propuesta |
|---|---|---|---|
| Nine Days, *The Madding Crowd* | lima, chartreuse, blanco quemado, banda violeta con amarillo | foto movida a todo el ancho cruzada por una banda horizontal; subtítulo en itálica a la derecha | **D · Andén** |
| Gen X *Young Adult / Contemporary Soft Club* | menta, agua, lavanda, un panel azul | collage de capas translúcidas, marcos blancos corridos, líneas de HUD, columnas de código, letra techno en contorno | **E · Collage** |
| Aphex Twin, *SAW 85–92* (afiche) | cianotipo petróleo y turquesa, crema verdoso, papel gris claro | barras de código arriba, nombre calado en un recuadro, números gigantes en contorno, lista numerada, filetes, código de barras | **F · Cianotipo** |

Se hicieron igual que A, B y C: una rama por propuesta, salida de
`rediseno-gxsc`, con su copia en `../variantes/`.

| Propuesta | Rama | Carpeta | Puerto |
|---|---|---|---|
| D · Andén | `gxsc-d-anden` | `variantes/d-anden` | 3004 |
| E · Collage | `gxsc-e-collage` | `variantes/e-collage` | 3005 |
| F · Cianotipo | `gxsc-f-cianotipo` | `variantes/f-cianotipo` | 3006 |

### Cómo es cada una
- **D · Andén.** Figtree en negrita minúscula y bajadas en itálica. El
  header es la banda violeta, con el nombre partido en blanco y amarillo
  ("sub" + "suelo", como "nine" + "days"). La portada es la foto de la nota
  principal a todo el ancho, lima y sobreexpuesta, cruzada por la banda con
  el título. Los títulos de sección también son bandas.
- **E · Collage.** Audiowide (techno, en mayúscula y a veces solo contorno),
  Share Tech Mono para los datos y Albert Sans para leer. La portada es un
  collage en una grilla de 12 columnas con piezas que se superponen: el
  nombre, la foto grande con su marco corrido, la foto chica, el panel azul
  con la próxima fecha y líneas del HUD. Las columnas de código del costado
  son los slugs y las fechas reales, y solo aparecen desde 1280px.
- **F · Cianotipo.** Comfortaa en minúscula y Karla para leer. Header con
  barras petróleo y el nombre en un recuadro de papel. La portada es el
  afiche: el año y la próxima fecha en números enormes en contorno, las
  secciones apiladas, un filete y el sumario numerado como lista de temas.
  Debajo va un código de barras con datos reales: año y mes, cantidad de
  notas y de fechas.

### Autocrítica, mirando las páginas
- **D:** la foto salía verde oliva oscuro y los reflejos parecían una
  persiana. Se subió la exposición y se hicieron luces irregulares; ahora es
  el lima quemado de la tapa.
- **E:** el lema chico en contorno no se leía, y el nombre aparecía dos veces
  muy grande. El lema pasó a mono y se achicó el nombre del header. Los
  títulos de sección daban scroll horizontal en celular: ahora bajan de
  renglón.
- **F:** el panel salía demasiado oscuro y el texto petróleo no se leía
  encima. Se aclaró hacia el crema del afiche, y la lista lleva un velo de
  papel. El botón "Entrar" era blanco sobre papel: se pasó a petróleo.

### Verificado
- D, E y F en escritorio y en 375px, en portada, notas, agenda, evento,
  artista, categoría, suscribite y login. Sin scroll horizontal y sin errores
  en la consola. `eslint` y `npm run build` sin errores en las tres.
- El panel admite cinco servidores a la vez. Quedaron corriendo B, D, E y F;
  la versión actual (3000), A y C se frenaron y se levantan de nuevo desde el
  `launch.json`.

### Pendiente
- Que el usuario elija entre las seis (A–F), o pida mezclar piezas.

### ⚑ Para charlar

- **[error]** D: la foto salía verde oliva oscuro, lejos del lima quemado de la
  tapa. Fue por cómo funciona `mix-blend-mode: color`: conserva la luz de la
  imagen original, y las portadas de la base son oscuras. Se corrigió
  sobreexponiendo antes de teñir.
- **[error]** E: el lema en letra de contorno a 12px no se leía; el contorno
  sirve solo en tamaños grandes.
- **[error]** E: los títulos de sección daban scroll horizontal en celular
  (título, línea y enlace en un solo renglón sin `flex-wrap`).
- **[error]** F: el panel de cianotipo salía tan oscuro que el texto petróleo
  desaparecía encima, y el botón "Entrar" quedó blanco sobre papel: venía del
  diseño anterior y no se revisó.
- **[rareza]** El panel del navegador admite cinco servidores a la vez. Para
  levantar E y F se frenaron la versión actual (3000), A y C.
- **[rareza]** Con el tamaño de pantalla emulado (1440px), las capturas del
  panel salen corridas o en blanco al hacer scroll. Se verificó con el tamaño
  nativo del panel y midiendo el ancho por código.
- **[atajo]** En D, el token `cian` contiene el amarillo de la banda.

---

## 2026-10-05 (2) — Tres propuestas de Gen X Soft Club para elegir

### Qué se pidió
Rehacer el formato en **tres versiones realmente distintas entre sí**, todas
con Gen X Soft Club como referencia, mirando las páginas terminadas (no el
código) para evaluar cuál replica mejor la onda. Las tres se muestran y el
usuario elige la final.

### Cómo se armó
Cada propuesta es una rama propia, salida de `rediseno-gxsc`, con su copia de
trabajo en `../variantes/` (fuera del repo, con `git worktree`). Así corren las
tres a la vez sin pisarse:

| Propuesta | Rama | Carpeta | Puerto |
|---|---|---|---|
| A · Terminal | `gxsc-a-terminal` | `variantes/a-terminal` | 3001 |
| B · Flyer | `gxsc-b-flyer` | `variantes/b-flyer` | 3002 |
| C · Consola | `gxsc-c-consola` | `variantes/c-consola` | 3003 |

Se levantan desde el `launch.json` de la carpeta padre (`variante-a-terminal`,
etc.). La versión actual (v2) sigue en `TP/`, puerto 3000, sin cambios.

### Las tres propuestas

Cada una sale de imágenes distintas de la carpeta de referencia, para que no
fueran tres variaciones de lo mismo.

| | A · Terminal | B · Flyer | C · Consola |
|---|---|---|---|
| Referencia | cartel "Gates A", pasillo de Supreme Particles | flyer gen x soft club, tapa de Macy Gray | PS2, cartel de salida |
| Luz | de día, plana, sin brillo | bruma luminosa | de noche, brillo y profundidad |
| Fondo | gris aguamarina `#E3ECEB` | ultramar `#2A3DB5` con luces que derivan | azul BIOS `#070B33` con piso en perspectiva y torres |
| Letra | B612 y B612 Mono (las de la cabina de Airbus), caja normal | Unbounded finísima en minúscula + Hanken Grotesk | Michroma en minúscula + Chakra Petch |
| Pieza fuerte | la portada es un tablero de salidas con todas las fechas | el nombre enorme y la composición del flyer | el menú principal con la opción que se enciende |
| Categorías | puertas de embarque A, B, C, D | lista con comas, como "trip-hop, electronica, downtempo" | opciones del menú, con cantidad de notas |
| Notas | paneles blancos con foto teñida verde agua | fotos con marco blanco y texto suelto, sin caja | memory cards translúcidas |

### Autocrítica, mirando las páginas
- **A:** la más clara y la más legible: el tablero se entiende al instante. Es
  la que menos se parece a la onda: tiene el aeropuerto pero no lo "soft", ni
  la bruma ni el brillo. Se corrigió la luz del pasillo sobre las fotos, que
  quedaba como un óvalo blanco.
- **B:** la más fiel. La portada es literalmente el flyer de la carpeta. Lo
  flojo: letra blanca sobre azul en notas largas cansa más que texto oscuro
  sobre claro, y los desenfoques grandes pesan en máquinas lentas. Se
  corrigió la línea de datos, que salía pegada ("GALPÓN MECÁNICA3.10.26"), y el
  nombre del hero, que se cortaba.
- **C:** la más llamativa, pero tira más a Y2K / PS2 que a Gen X Soft Club,
  que es más calmo. Se corrigió que las torres del fondo casi no se veían y
  "1 notas".
- **B y C** tenían scroll horizontal en la portada en celular: los nombres
  largos de eventos estiraban la columna de la grilla. Se arregló con
  `grid-cols-1`.

**Recomendación:** B como réplica de Gen X Soft Club. Si se elige, se le puede
sumar el tablero de salidas de A para la agenda.

### Decisiones
- **Los tokens conservan sus nombres en las tres** (`marino`, `cobalto`…)
  para no tocar todas las páginas en un prototipo. En B y C el sitio es
  oscuro y `marino` termina siendo el color del texto, casi blanco. La que se
  elija se limpia: se renombran los tokens y se actualiza `## Diseño` en
  `CLAUDE.md`.
- **En B y C las piezas van en `@layer components`.** Fuera de capa, `.etiqueta`
  le ganaba a utilidades como `flex` y rompía la línea de datos.

### Verificado
- Las tres en 1440px y 375px: portada, nota, evento, agenda, artista,
  categoría, suscribite y login. Sin scroll horizontal y sin errores en la
  consola.
- `eslint` y `npm run build` sin errores en las tres.

### Pendiente
- Que el usuario elija. Después: llevar la elegida a `rediseno-gxsc`, limpiar
  los tokens, actualizar `CLAUDE.md` y borrar las otras dos ramas y la carpeta
  `variantes/`.

### ⚑ Para charlar

- **[rareza]** El primer `preview_start` levantó la versión actual en vez de
  la variante: el panel lee el `launch.json` de la carpeta padre
  (`Programacion Web/.claude/`), no el de `TP/.claude/`. Las configuraciones de
  las variantes quedaron en los dos.
- **[error]** B: la línea de datos salía pegada ("GALPÓN MECÁNICA3.10.26").
  Las piezas propias estaban fuera de `@layer`, y en Tailwind 4 el CSS fuera
  de capa le gana a las utilidades: `.etiqueta` pisaba al `flex`. En B, C, D,
  E y F se pasaron a `@layer components`. A y la versión actual siguen con el
  problema latente.
- **[error]** B y C tenían scroll horizontal en la portada del celular: en una
  grilla, una columna sin `grid-cols-1` se estira hasta el ancho del texto más
  largo, aunque tenga `truncate`.
- **[error]** C: las torres del fondo, que son la pieza principal, casi no se
  veían, y la portada decía "1 notas".
- **[error]** A: quedaron versalitas espaciadas de la versión anterior, que no
  van con la señalética, y la luz del pasillo sobre las fotos salía como un
  óvalo blanco.
- **[atajo]** En B y C el sitio es oscuro y el token `marino` (pensado como
  "texto oscuro") termina siendo el color del texto claro. Los nombres de
  tokens mienten en esas propuestas.
- **[rareza]** Cada propuesta es una copia completa del proyecto con su propio
  `node_modules` (seis `npm ci`). Ocupa bastante disco: se limpia cuando se
  borren las propuestas descartadas.
- **[rareza]** Los heredocs de Bash con varios archivos fallaban con
  "unexpected EOF". Se esquivó escribiendo los archivos de a uno.

---

## 2026-10-05 — Sección "Diseño" en CLAUDE.md y plugins de Claude Code

### Qué se pidió
Verificar los plugins nuevos de Claude Code (`frontend-design` y `supabase`) y
agregar a `CLAUDE.md` una sección corta con las decisiones de diseño ya tomadas.
Sin tocar código de la app.

### Qué se hizo
- **`CLAUDE.md`:** sección `## Diseño` debajo de `@AGENTS.md`, armada a partir
  de `globals.css`, `layout.jsx`, los componentes, esta bitácora y
  DESENCUENTROS.md. Tiene la referencia, los tokens, los roles de cada
  tipografía, las piezas propias y los patrones de layout.
- **Plugins:**
  - `frontend-design`: cargado (skill `frontend-design:frontend-design`).
  - `supabase`: habilitado en `.claude/settings.json`, pero no cargó. La
    sesión se había abierto en la carpeta padre (`Programacion Web/`) y no leyó
    la configuración de `TP/`. Como las sesiones se abren siempre ahí, se
    habilitó también en `Programacion Web/.claude/settings.json` (fuera del
    repo). Carga a partir de la próxima sesión.

### Decisiones
- **La sección vive solo en la rama `rediseno-gxsc`.** GXSC v2 todavía se está
  probando en local; `main` sigue con el fanzine grunge. La sección lo aclara y
  hay que borrarla o reescribirla si se descarta el rediseño.
- **El rediseño no se publica todavía.** El usuario va a seguir ajustándolo en
  la rama. Cada cambio de diseño actualiza también la sección de `CLAUDE.md`.
- **El usuario confirmó** que las imágenes de `../Gen X Soft Club/` son la
  referencia estética.
- **Supabase no tiene un proyecto de desarrollo aparte:** el único
  (`tsqcqboypfnyqhhyexte`) es el que usa producción. Hay que tenerlo en cuenta
  antes de conectar el MCP.

### ⚑ Para charlar

- **[rareza]** Los cambios de documentación de esta entrada (`BITACORA.md`,
  `CLAUDE.md`, `DESENCUENTROS.md`) siguen sin commitear en `rediseno-gxsc`.
  Todo lo que se fue sumando a la bitácora después también.

---

## 2026-10-01 (5) — Gen X Soft Club, segunda versión: todo azul, a partir de las referencias

### Qué se pidió
La primera versión de Gen X Soft Club no le gustó al usuario. Dejó seis
imágenes de referencia en la carpeta `Gen X Soft Club` (fuera del repo) y pidió
rehacer **solo el formato**, sin tocar contenido ni funcionalidad.

### Qué muestran las referencias
- Flyer "gen X soft club": azul hielo, título blanco en minúscula que brilla,
  datos en versalita ancha, texto alineado a la derecha, renglones de pantalla.
- Carteles de aeropuerto ("Gates A"): panel azul cobalto con letra blanca y
  pictogramas.
- Tapa de Macy Gray y foto de Kate Moss: fotos movidas, teñidas de azul
  profundo.
- Cartel de salida de emergencia: brillo cian.
- PS2: el violeta del logo y los colores saturados.

La versión anterior era gris claro, con verde musgo y tarjetas blancas planas:
sobria, casi corporativa. Las referencias son lo contrario: **saturadas,
azules y luminosas**.

### Qué se hizo

| | Versión 1 | Versión 2 |
|---|---|---|
| Fondo | gris `#EEF1F3` liso | cielo degradado cobalto → hielo, con manchas de luz cian y lavanda y renglones finos, fijo |
| Superficies | tarjeta blanca, borde gris, esquinas rectas | vidrio esmerilado (`backdrop-filter`), borde blanco, esquinas redondeadas, brillo cian al pasar |
| Header | gris translúcido | cartel de aeropuerto: banda cobalto, letra blanca, flecha ↑ |
| Marquesina | gris, "En cartel" | tablero de salidas: azul noche con letra cian que brilla, "Salidas" |
| Títulos | Archivo semibold | Lexend extralight en minúscula |
| Etiquetas | rectangulares, Archivo | píldoras en Lexend Zetta (extra ancha) |
| Fotos | desaturadas, velo celeste | blanco y negro teñido cobalto → cian, renglones y barrido de luz |
| Portada | título negro sobre gris | hero tipo flyer: panel cobalto, título blanco con resplandor, descripción a la derecha |
| Footer | gris | azul noche con un halo cobalto |

**Tokens** (`globals.css`), renombrados porque los valores cambiaron de
significado:

| Antes | Ahora | Valor |
|---|---|---|
| `niebla` | `cielo` | `#C9D8F2` |
| `vidrio` | `escarcha` | `#FFFFFF` |
| `hormigon` | `linea` | blanco translúcido |
| `pizarra` | `marino` | `#0B1A3D` |
| `acero` | `humo` | `#445A8A` |
| `agua` | `cobalto` | `#1F45D6` |
| `musgo` | `lavanda` | `#7B6CFF` |
| — | `cian` | `#7FF4FF`, solo para brillos sobre fondo oscuro |

**Piezas nuevas:** `.cartel` (panel cobalto con letra blanca, se usa en el
hero, el bloque de fecha de los eventos, los botones principales, los datos
del evento y la cabecera del artista), `resplandor` (brillo de letra) y
`linea-brillo` (línea degradé debajo de los títulos).

**Tipografías:** salen Archivo; entran Lexend (títulos) y Lexend Zetta (logo
y etiquetas). Quedan Mulish para el texto corrido e IBM Plex Mono para fechas.

### Decisiones
- **Minúscula por CSS, no en el texto.** Los textos siguen escritos igual
  ("Agenda", "Suscribite"); la clase `lowercase` los muestra en minúscula. Si
  se vuelve atrás, no hay que reescribir contenido.
- **El cian solo va sobre fondo oscuro.** Sobre el cielo claro no se lee; ahí
  el acento es el cobalto.
- **El header es pegajoso solo desde tablet.** En celular ocupa dos renglones
  y tapaba un cuarto de la pantalla al bajar.
- **Bug encontrado al verificar:** las fotos se veían grises. La foto tiene
  `transform` (para el zoom al pasar), y eso hacía que se pintara por encima
  del velo azul. Se subió el velo a `z-index: 1` y las etiquetas sobre la foto
  a `z-[2]`.

### Verificado en `localhost:3000`
- Portada, nota, agenda, evento, suscribite y login en 1440px y en 375px. Sin
  scroll horizontal en celular. Sin errores en la consola.
- `npx eslint src` limpio y `npm run build` sin errores.

**Pendiente:** ver el menú desplegable del usuario con una sesión abierta, y
publicarlo (está en la rama `rediseno-gxsc`, no en `main`).

### ⚑ Para charlar

*(Agregado el 2026-10-05, mirando hacia atrás.)*

- **[error]** Las fotos se veían grises en vez de azules: la foto tenía
  `transform` (para el zoom al pasar), y eso la pintaba por encima del velo de
  color. Se detectó al verificar y se corrigió antes de entregar.
- **[error]** El header pegajoso tapaba un cuarto de la pantalla del celular.
  Se dejó pegajoso solo desde tablet.
- **[error]** Al pasar el menú a minúscula se reescribieron los textos
  ("agenda", "suscribite") en vez de usar la clase `lowercase`. Se revirtió en
  el momento.
- **[error]** Al revisar el ancho de varias páginas, un script navegó solo por
  todas ellas en la misma pestaña. No rompió nada, pero no era la intención.
- **[rareza]** La bitácora tiene dos entradas "2026-10-01 (4)": la de OAuth y
  la del cambio a Gen X Soft Club. Se numeraron en sesiones distintas.

---

## 2026-10-01 (4) — Login con Google (OAuth) en lugar de mail y contraseña

### Qué se pidió
Que el perfil se cargue con OAuth. Se acordó: **solo Google**, y que
**reemplace** al registro con mail y contraseña.

### Qué se hizo
- **`/login`** ahora es un único botón "Entrar con Google" (`BotonGoogle.jsx`).
  No hay registro aparte: la primera vez que alguien entra, se le crea la
  cuenta. **`/registro`** redirige a `/login` para que los links viejos no den
  404.
- **`/auth/confirmar`** recibe la vuelta de Google, canjea el código por la
  sesión y lleva a donde el usuario quería ir (`siguiente`). Si canceló en
  Google, vuelve al login con un aviso.
- **Perfil desde Google** (migración `20261001200000_perfil_desde_google.sql`):
  - Columna nueva `perfiles.avatar_url`.
  - El trigger que crea el perfil toma el nombre (`full_name`/`name`) y la
    foto que manda Google.
  - Trigger nuevo `al_vincular_identidad`: si alguien que ya tenía cuenta con
    mail entra con Google con el mismo mail, Supabase une las cuentas. Este
    trigger le completa la foto sin pisarle el nombre.
- **Foto** en el header y en `/perfil` (`Avatar.jsx`, en blanco y negro con
  contraste, como el resto del sitio). `next.config.mjs` habilita el dominio
  de las fotos de Google.
- **Menú del visitante:** "Entrar" volvió a ser un link directo. El
  desplegable con "Iniciar sesión" y "Registrarse" ya no tenía sentido: las dos
  opciones llevaban al mismo lugar.
- **Se borraron** `FormularioAuth.jsx` y `src/app/auth/acciones.js`
  (formularios y acciones de mail y contraseña).
- **`supabase/config.toml`:** Google activado, con las credenciales como
  `env(...)` para que no queden en el repo, y registro por mail desactivado
  (`[auth.email] enable_signup = false`). `supabase/.env.example` muestra qué
  variables completar.

### Decisiones
- **Las credenciales de Google van en `supabase/.env`**, ignorado por git. El
  "client secret" es secreto de verdad: con él cualquiera podría hacerse pasar
  por la revista ante Google.
- **Se desactiva el registro por mail también en Supabase**, no solo en la
  página. Si no, cualquiera podría crear cuentas con contraseña llamando a la
  API directamente.
- **`next/image` para las fotos.** Next las baja de Google, las achica y las
  sirve desde nuestro dominio.

### Verificación
- ESLint sin errores. Build OK, 33 páginas.
- Navegador: `/registro` lleva a `/login`; el botón se ve bien en celular, sin
  scroll horizontal; el header muestra "Entrar" como link.
- Triggers, con usuarios simulados en una transacción que se deshace: una
  cuenta nueva de Google toma nombre y foto; una cuenta vieja que suma Google
  conserva su nombre y gana la foto. No quedaron datos de prueba.
- **No se probó el ingreso real con Google:** falta crear las credenciales.

### Activación
- El usuario creó el cliente OAuth en Google Cloud Console:
  - Orígenes de JavaScript: el sitio publicado y `http://localhost:3000`.
  - URI de redireccionamiento: la de Supabase, `.../auth/v1/callback`.
- El ID de cliente (no es secreto) lo cargó el asistente en `supabase/.env`; el
  secreto lo pegó el usuario.
- `supabase config push` (a pedido del usuario): Google activado, registro por
  mail apagado, `site_url` y URLs permitidas apuntando al sitio publicado.
  Después, `supabase config diff` ya no muestra diferencias de auth.
- Verificado: Supabase redirige a Google con el ID de cliente correcto, y al
  tocar el botón en localhost Google muestra su pantalla de inicio de sesión
  sin error `redirect_uri_mismatch`.
- Se subió a `main` junto con la tanda (3), que estaba sin commitear.

### Pendiente
- Que el usuario entre con su Google para probar el recorrido completo.
- Primer admin.

---

## 2026-10-01 (4) — Cambio de estética: de fanzine grunge a Gen X Soft Club

### Qué se pidió
Cambiar el mood de la revista al concepto **Gen X Soft Club**: la estética de
fines de los 90 y principios de los 2000 catalogada por el CARI. Es una rama
"aterrizada" del futurismo Y2K — fotografía movida y fría, tipografía humanista
de señalética, minimalismo, estaciones y aeropuertos, plantas entre el cemento.

Se eligió la variante **clara y fría** sobre la nocturna.

### Qué se hizo

Es lo contrario del diseño anterior en todos los ejes, así que se rehízo el
sistema completo.

| | Antes (fanzine) | Ahora (GXSC) |
|---|---|---|
| Fondo | negro carbón con ruido | `#EEF1F3`, blanco con tinte frío |
| Texto | papel crudo | `#1B2427`, casi negro azulado |
| Acentos | amarillo ácido, rojo sangre | `#7FA8B8` agua, `#8DA88F` musgo |
| Tipografías | Anton, Rubik Dirt, Permanent Marker, Courier | Archivo, Mulish, IBM Plex Mono |
| Superficies | papel roto, cinta, sombras duras | tarjetas blancas, borde de 1px |
| Composición | todo girado y superpuesto | todo alineado a la grilla |
| Fotos | fotocopia de alto contraste | desaturadas, frías, apenas desenfocadas |

**Tokens nuevos** (`globals.css`): `niebla`, `vidrio`, `hormigon`, `pizarra`,
`acero`, `agua`, `musgo`. Se renombraron en vez de solo cambiarles el valor:
dejar un `--sangre` que en realidad es celeste habría sido una trampa para
quien lea el código después.

**Utilidades reemplazadas:**

| Antes | Ahora |
|---|---|
| `.papel` + `.roto` + `.cinta` | `.tarjeta` |
| `.fotocopia` | `.bruma` |
| `.sello` | `.etiqueta` |
| `.marcado` (resaltador) | `.subrayado` (línea fina que crece) |
| `.corrido` (impresión desfasada) | — eliminada |
| `--ruido` (textura SVG) | — eliminada |

**Componente eliminado:** `Recorte.jsx`, que armaba los títulos con letras
recortadas de revista estilo carta de secuestro. Lo reemplaza `Titular.jsx`:
una sola tipografía, grande, apretada, con volanta monoespaciada opcional y una
línea fina debajo.

**Archivos tocados:** los 11 componentes y las 12 páginas.

### Decisiones

- **Las portadas no se tocaron en la base.** Vienen con gradientes fuertes del
  diseño anterior (fucsias, naranjas, violetas). En vez de migrar los datos, el
  filtro de `.bruma` los lleva a todos a la misma temperatura fría:
  `saturate(0.18)` más un velo celeste encima. Si algún día cambian los datos,
  el tratamiento sigue funcionando igual.
- **La marquesina se quedó, pero cambió de registro.** Era una cinta de "última
  hora" en amarillo ácido; ahora es monoespaciada y gris, y se lee como el
  cartel de salidas de una estación. Es de las piezas más GXSC del sitio.
- **El header pasó a ser pegajoso** (`sticky`) con fondo semitransparente y
  `backdrop-blur`. Encaja con la señalética y gana navegación.
- **Se agregó un estilo de foco visible** (`:focus-visible`) en el color de
  acento. El diseño anterior no tenía ninguno.

### Verificado en `localhost:3000`
- Portada, nota, agenda, evento, artista, categoría, notas, suscribite y login,
  en 1440px y en 375px. Sin scroll horizontal en celular.
- `npx eslint src` limpio y `npm run build` sin errores: `/perfil`,
  `/configuracion` y `/login` siguen siendo dinámicas y el resto estático.

**Pendiente de probar con una sesión abierta:** el desplegable del nombre, el
avatar de Google y las páginas de perfil y configuración con datos reales.

---

## 2026-10-01 (3) — Barra más grande y menús desplegables en el header

### Qué se pidió
- Agrandar la barra de categorías (Fiestas, Música, Quilombo, Entrevistas).
- Que "Entrar" deje elegir entre iniciar sesión y registrarse.
- Que, ya logueado, el nombre despliegue perfil, configuración y cerrar sesión,
  en lugar del botón "Salir" al lado.

### Qué se hizo

**Barra de categorías** (`Header.jsx`): el tamaño pasó de `text-sm` a
`text-lg` (`text-xl` desde `sm`), con más aire entre pastillas y más relleno
adentro. En celular sigue entrando en tres renglones, sin scroll horizontal.

**Menús desplegables** (`MenuUsuario.jsx`): se agregó un componente interno
`Desplegable` que usan los dos estados.

| Estado | Botón | Opciones |
|---|---|---|
| Visitante | Entrar | Iniciar sesión, Registrarse |
| Logueado | su nombre (+ sello Admin) | Perfil, Configuración, Cerrar sesión |

**Páginas nuevas**, porque el menú las necesitaba para no dar 404:

| Ruta | Qué muestra |
|---|---|
| `/perfil` | Nombre, mail, plan, hasta cuándo está paga la suscripción y fecha de alta. |
| `/configuracion` | Formulario para cambiar el nombre. |

Las dos leen la sesión en el servidor y, si no hay, redirigen a
`/login?siguiente=…`, así después del login se vuelve a donde se quería ir.

### Decisiones

- **El panel no usa `role="menu"`.** Ese rol le promete al lector de pantalla
  navegación con flechas, que no implementamos. Con `aria-expanded` sobre el
  botón y una lista de enlaces alcanza, y se recorre con Tab como el resto del
  header.
- **Cierra por clic afuera, Escape y clic en una opción.** Los escuchas de
  `document` se agregan solo mientras está abierto.
- **Sin efecto que cierre al cambiar de ruta.** La primera versión lo hacía con
  un `useEffect` sobre `pathname`, pero el linter de React 19 rechaza llamar a
  `setState` dentro de un efecto (`react-hooks/set-state-in-effect`). Era
  redundante: el clic en el panel y el clic afuera ya cubren todos los casos.
- **De configuración solo se cambia el nombre.** Es lo único que la base le
  permite editar al usuario (`grant update (nombre)` en el esquema). El mail y
  la contraseña los maneja Supabase Auth y piden confirmación por mail: quedan
  para más adelante.
- **El panel se ancla a la izquierda en celular** (`sm:right-0` de ahí para
  arriba). Anclado siempre a la derecha, en 375px arrancaba en −121px y se
  salía de la pantalla.

### Verificado en `localhost:3000`
- Barra más grande en escritorio y en celular (375px), sin scroll horizontal.
- El desplegable de "Entrar" abre, muestra las dos opciones, y cierra con
  Escape y con clic afuera.
- `/perfil` y `/configuracion` sin sesión redirigen a `/login` conservando
  `siguiente`.
- `npx eslint` limpio en los archivos tocados.

**Pendiente de probar con una sesión abierta:** el desplegable del nombre y las
dos páginas con datos reales. Requiere loguearse con una cuenta propia.

---

## 2026-10-01 (2) — Base de datos y login con Supabase

### Qué se pidió
Base de datos para guardar el contenido de la revista y login con distintos
tipos de usuario y permisos. Se acordó:
- **Lector y redactor son el mismo rol (`usuario`):** cualquiera que se
  registra puede leer y escribir sus propias notas.
- **Suscriptor no es un rol:** es el plan del usuario (libre, mensual o
  anual), que se activa cuando pague.
- Se mantiene un rol **`admin`** para moderar y cargar artistas y eventos.
- El panel para escribir y editar notas queda para la próxima tanda.

### Qué se hizo

**Base de datos** (carpeta `supabase/migrations/`, aplicada con `supabase db push`):

| Tabla | Para qué |
|---|---|
| `perfiles` | Datos propios de la revista por usuario: nombre, `rol` (usuario/admin), `plan` y `suscripcion_hasta`. El login en sí (mail y contraseña) lo guarda Supabase en `auth.users`. |
| `categorias` | Fiestas, Música, Quilombo, Entrevistas. |
| `articulos` | Las notas. `estado` borrador/publicada, `autor_id` (vacío en las de la redacción), `firma` visible. |
| `artistas` | Fichas de artistas. |
| `eventos` | Agenda. |
| `articulo_artistas` | Qué artistas se mencionan en cada nota. |
| `evento_artistas` | Line-up de cada evento, con `orden` (1 = cabeza de cartel). |

- Al registrarse alguien, un trigger le crea el perfil automáticamente con rol
  `usuario` y plan `libre`.
- El contenido que estaba escrito a mano en `data.js` se pasó a la base con
  una migración generada por script (`20261001180100_contenido_inicial.sql`),
  para no copiar texto a mano.

**Permisos** (Row Level Security: cada tabla solo deja hacer lo que una regla permite):

| Quién | Puede |
|---|---|
| Visitante sin login | Leer notas publicadas, artistas y eventos. Nada más. |
| `usuario` | Lo anterior. Crear notas, que quedan siempre a su nombre, y editar o borrar **solo las suyas**. Ver sus borradores. Cambiar su nombre. |
| `admin` | Todo: notas de cualquiera, destacar en portada, artistas, eventos, ver todos los perfiles. |

Además:
- Un usuario **no puede cambiarse el rol ni el plan**: solo tiene permiso
  sobre la columna `nombre` de su perfil.
- Un usuario **no puede destacar** su nota en la portada ni pasársela a otro
  autor. Un trigger lo corrige aunque lo intente.

**Sitio:**
- `src/lib/data.js` ahora consulta Supabase. Las funciones mantienen nombre y
  forma de datos, así que **ninguna página cambió su lógica**.
- Las páginas de contenido siguen siendo estáticas, con `revalidate = 60`:
  toman los cambios de la base en, como mucho, un minuto, sin volver a
  desplegar.
- Páginas nuevas **`/login`** y **`/registro`**, y ruta **`/auth/confirmar`**
  para el link del mail de confirmación.
- En el header: "Entrar" para visitantes, o el nombre del usuario (con sello
  "Admin" si corresponde) y "Salir".
- `src/proxy.js` mantiene viva la sesión. Es el antiguo `middleware`, que en
  Next 16 cambió de nombre.
- Mejora de paso: `getArtistas` ahora respeta el orden del line-up (antes
  devolvía el orden de la lista general).

### Decisiones
- **Supabase** como base y como sistema de login: es Postgres de verdad y trae
  la autenticación resuelta (contraseñas, mails, sesiones), así que no hace
  falta escribir esa parte a mano, que es delicada.
- **Los permisos viven en la base y no en el código de Next.** Aunque alguien
  llame a la API de Supabase directamente, sin pasar por el sitio, las reglas
  se cumplen igual.
- **El header lee la sesión en el navegador (`MenuUsuario`).** Si lo hiciera en
  el servidor, todas las páginas pasarían a generarse en cada visita y se
  perdería que sean estáticas.
- **Dos clientes de Supabase en el servidor:** `supabasePublico`, sin cookies,
  para el contenido (permite páginas estáticas), y `crearClienteServidor`, con
  cookies, para el login.
- **Clave `publishable` en el código.** Es pública por diseño; lo que protege
  los datos son las reglas de la base. La clave secreta no se usa en ningún
  lado.
- **Funciones auxiliares en un esquema `privado`.** El chequeo de seguridad de
  Supabase (`supabase db advisors`) marcó que `es_admin()` y las funciones de
  los triggers se podían llamar desde la API pública. Se movieron
  (`20261001180200_ajustes_seguridad.sql`). El chequeo quedó sin avisos.
- **`premium` sigue sin bloquear nada.** Mientras `pagosActivos` sea `false`,
  las notas premium se leen completas. La función `privado.es_suscriptor()`
  queda lista para cuando haya pagos.
- **Descartado:** un rol `suscriptor` separado. Mezclaba "qué puede hacer" con
  "qué pagó", y sin pagos nadie podría llegar a tenerlo.

### Verificación
- ESLint sin errores. Build OK: 31 páginas, el contenido estático con
  revalidación de 1 minuto.
- Navegador: la home, las notas, la agenda y las fichas de artistas muestran
  los mismos datos que antes, incluidos los filtros por artista. Una nota
  inexistente da 404. Login y registro se ven bien en celular, sin scroll
  horizontal.
- **Permisos:** `supabase/pruebas/permisos.sql` simula un visitante, dos
  usuarios y un admin, y verifica 18 casos: escribir notas propias, no tocar
  las ajenas, no verse borradores ajenos, no cambiarse rol ni plan, etc. Corre
  dentro de una transacción que se deshace, así que no deja datos. **18/18 OK.**
- No se probó registrar una cuenta real: queda para hacerla a mano (ver
  pendientes).

### Cómo se usa
- Volver a correr la prueba de permisos:
  `supabase db query --linked -f supabase/pruebas/permisos.sql`
- Hacer admin a alguien (después de que se registre):
  `supabase db query --linked "update perfiles set rol = 'admin' where id = (select id from auth.users where email = 'MAIL')"`
- Cambios futuros a la base: `supabase migration new <nombre>`, escribir el
  SQL y `supabase db push`.

### Publicación
- **Variables en Vercel:** `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` cargadas en production, preview y
  development.
  - Problema encontrado: al pasarlas con `|` desde PowerShell 5 se les coló
    una marca BOM invisible (`ï»¿`) al principio, que rompía la URL. Se
    detectó bajando los valores con `vercel env pull` y comparándolos. Se
    volvieron a cargar desde bash y ahora coinciden exactamente.
  - `vercel link` agregó un `.env*` duplicado al final del `.gitignore` que
    volvía a ignorar `.env.example`. Se sacó.
- **Configuración del login en `supabase/config.toml`:** confirmación por mail
  desactivada (registrarse loguea directo, porque el mail gratis de Supabase
  manda muy pocos por hora), `site_url` apuntando al sitio publicado y URLs
  permitidas para el sitio y para localhost. El resto de los valores se igualó
  a los que ya tenía el proyecto, para que `supabase config push` cambie solo
  esos tres.
  - **Falta aplicarla** (`supabase config push`): el asistente no tiene
    permiso para cambiar la configuración del proyecto, así que lo corre el
    usuario. Hasta entonces, registrarse pide confirmar el mail.

### Pendiente
- Correr `supabase config push`.
- Primer admin.
- Panel para escribir y editar notas (próxima tanda).

---

## 2026-10-01 — Instalación de la CLI de Supabase

### Qué se hizo
- Se instaló **Scoop** (gestor de paquetes de Windows) a nivel usuario, en
  `~\scoop`, y se agregó `~\scoop\shims` al PATH del usuario.
- Con Scoop se instaló la **CLI de Supabase 2.119.0**. El comando `supabase`
  queda disponible en cualquier terminal nueva.
- No se tocó código del proyecto: la CLI es una herramienta de la máquina.

### Decisiones
- **Scoop en vez de npm.** Supabase no soporta `npm install -g supabase`; para
  Windows recomienda Scoop. Winget no tiene el paquete. Otra opción era
  `npx supabase`, pero hay que anteponerlo a cada comando y es más lento.
- **Sin permisos de administrador.** Scoop instala todo dentro de la carpeta
  del usuario.

### Cómo actualizarla
```
scoop update supabase
```

### Problema con `supabase login` en la red de la empresa
- **Síntoma:** al pegar el código de verificación, la CLI tira
  `failed to execute http request: Transport error (GET https://api.supabase.com/platform/cli/login/...)`.
- **Causa probable:** la máquina pasa por **Netskope**, que inspecciona el
  tráfico HTTPS y lo firma con un certificado propio
  (`ca.publicisgroupe.de.goskope.com`). Windows confía en ese certificado. La
  parte de la CLI escrita en Deno trae su propia lista de certificados y lo
  rechaza. Los comandos que corre la parte en Go, como `projects list`, sí
  llegan al servidor.
- **Ajuste aplicado:** variable de entorno de usuario `DENO_TLS_CA_STORE=system`,
  para que la CLI use los certificados de Windows. Se aplica en terminales
  nuevas.
- **Alternativa sin código de verificación:** generar un token en
  https://supabase.com/dashboard/account/tokens y correr
  `supabase login --token <token>`. Ese comando no hace la llamada que falla.
- **Resultado:** se entró con un token (`cli-tp`) y `supabase projects list`
  muestra el proyecto `Santax040's Project` (ref `tsqcqboypfnyqhhyexte`,
  us-east-1). El repo todavía no está vinculado al proyecto (`supabase link`).
- El token no se guarda en el repo ni en este archivo. El `token.txt` que se
  usó para pasarlo se mandó a la Papelera.

### Vinculación del repo con el proyecto
- `supabase init` creó la carpeta `supabase/` con `config.toml` (la
  configuración de la CLI) y su propio `.gitignore`.
- `supabase link --project-ref tsqcqboypfnyqhhyexte` vinculó el repo con el
  proyecto en la nube. No hizo falta la contraseña de la base: alcanza con el
  token de la cuenta.
- La referencia al proyecto vinculado queda en `supabase/.temp/`, que no se
  sube a git. En el repo solo se suben `config.toml` y `.gitignore`, que no
  tienen secretos.

---

## 2026-09-24 (6) — Página de suscripción

Resuelve el desencuentro #1: había contenido marcado "solo suscriptores" sin
ninguna forma de suscribirse.

### Qué se hizo
- Nueva página **`/suscribite`** con tres planes, cada uno como hoja pegada con
  cinta. El anual lleva un sello de "Conviene".
- Enlace **"Suscribite"** en el header.
- En las notas premium, el sello "Solo suscriptores" ahora es un enlace a la
  página de planes, y se agregó un aviso: la nota es exclusiva pero se lee
  gratis mientras no haya pagos.
- Los planes y el interruptor de pagos se definen en `src/lib/site.js`.

### Decisiones
- **Interruptor `pagosActivos` (hoy en `false`).** Centraliza en un solo lugar
  si los pagos funcionan. Mientras esté apagado, la página avisa que todavía no
  se puede pagar y las notas premium se leen completas.
- **Los planes solo prometen lo que existe.** Notas abiertas, agenda, fichas de
  artistas y notas exclusivas. Nada de beneficios inventados como preventas o
  descuentos.
- **Sin botón de pago "para después".** Un botón que no hace nada es un
  callejón sin salida. Se agrega cuando haya pagos reales detrás.
- **Precios ficticios**, aclarados en la página.

### Verificación
- ESLint sin errores. Build OK, 28 páginas.
- Revisado en escritorio y celular: el header acomoda el botón nuevo sin
  desbordar y no hay scroll horizontal.

---

## 2026-09-24 (5) — Registro de desencuentros

### Qué se hizo
- Se creó **`DESENCUENTROS.md`**: registro de los momentos en que el pedido y
  lo que se hizo no coincidieron, con la causa y lo que se cambia para que no
  se repita.
- Primera entrada: se mostraron sellos de **"Solo suscriptores" sin ninguna
  página para suscribirse**.
- Se agregaron tres desencuentros anteriores del mismo día, marcados como
  retroactivos: TypeScript en lugar de JavaScript, las instrucciones de
  `vercel login` y el rediseño que no aparecía en Vercel.

### Decisiones
- **Archivo separado de la bitácora.** La bitácora cuenta qué se construyó y
  por qué; los desencuentros cuentan dónde hubo diferencias entre lo pedido y lo
  hecho. Mezclarlos haría más difícil leer cualquiera de los dos.

---

## 2026-09-24 (4) — Migración a JavaScript y primer deploy en producción

### Qué se hizo
- **El proyecto pasó de TypeScript a JavaScript**, por pedido de la cátedra.
  - `.ts` → `.js` y `.tsx` → `.jsx`. Se renombraron con `git mv`, así git
    conserva el historial de cada archivo.
  - `tsconfig.json` → `jsconfig.json`, que mantiene el alias `@/` para importar
    desde `src/` sin rutas relativas largas.
  - `next.config.ts` → `next.config.mjs`.
  - Se quitaron `typescript` y los paquetes `@types/*` de las dependencias, y la
    regla de TypeScript de ESLint.
  - Se eliminó `src/lib/types.ts`.
- **El rediseño grunge se unió a `main` y está en producción:**
  https://revista-digital-musica.vercel.app

### Decisiones
- **Los tipos pasaron a comentarios JSDoc** en `src/lib/data.js` y en las props
  de los componentes. No afectan la ejecución, pero el editor los usa para
  autocompletar y siguen documentando qué campos tiene cada dato.
- **Qué se pierde al dejar TypeScript:** los errores de tipos ya no se detectan
  al compilar. Por ejemplo, pasar un número donde va un texto ahora solo falla
  cuando se ejecuta. ESLint sigue marcando errores de sintaxis y malas
  prácticas.

### Vercel
- Había **dos proyectos de Vercel** conectados al mismo repo:
  `revista-digital-musica` y `tp-progra-web`. Cada push se construía dos veces.
- `tp-progra-web` **fallaba con todos los commits**, incluso con los que en el
  otro proyecto compilaban bien: el problema es su configuración en Vercel, no
  el código.
- Se decidió **quedarse con `revista-digital-musica`**. Borrar `tp-progra-web`
  queda a cargo del dueño de la cuenta, desde el panel de Vercel. Borrar un
  proyecto de Vercel no afecta al repositorio de GitHub.
- **Producción solo publica `main`.** Las demás ramas generan un *preview* con
  URL propia, protegido por login de Vercel.

### Verificación
- ESLint sin errores.
- Build de producción OK, 27 páginas, igual que antes de la migración.
- Revisado en el navegador: el sitio se ve idéntico.

---

## 2026-09-24 (3) — Rediseño trash / grunge

> **Estado: aprobado y publicado en producción.** Se desarrolló en la rama
> `diseno-grunge` y se unió a `main`.

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
