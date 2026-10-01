# Bitácora del TP

Registro de cambios y decisiones del proyecto. Entrada más reciente arriba.

Los errores y malentendidos se registran aparte, en
[DESENCUENTROS.md](DESENCUENTROS.md).

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
