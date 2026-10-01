# Desencuentros

Registro de los momentos en que lo que se pidió y lo que se hizo no
coincidieron: errores del asistente, malentendidos y supuestos que salieron mal.

Cada entrada guarda el pedido, la respuesta, dónde estuvo la diferencia, por qué
pasó y qué se cambia para que no se repita. La [bitácora](BITACORA.md) registra
**qué** se construyó; este archivo registra **dónde nos desencontramos**.

Entrada más reciente arriba.

---

## #3 — La primera versión de Gen X Soft Club no se parecía a la onda
**Fecha:** 2026-10-01
**Tipo:** interpretación estética

**Lo que se pidió**
Cambiar la estética de la revista a Gen X Soft Club.

**Lo que se hizo**
Una versión clara y fría: fondo gris casi blanco, tarjetas blancas planas,
acentos celeste apagado y verde musgo, fotos desaturadas. Se armó a partir de
la descripción del concepto (señalética, minimalismo, plantas entre el
cemento), no de imágenes.

**Dónde estuvo la diferencia**
Al usuario no le gustó. Las referencias que dejó después en la carpeta
`Gen X Soft Club` muestran otra cosa: azul cobalto y cian saturados, brillo,
fotos movidas teñidas de azul, vidrio, letra minúscula y ancha. Lo que se hizo
quedó demasiado sobrio, más cerca de un sitio corporativo que de un flyer de
trip-hop del 2000.

**Por qué pasó**
"Gen X Soft Club" es un nombre de nicho y se lo tradujo desde su definición
escrita. La parte "soft" se leyó como "apagado", cuando en las imágenes es
"difuso y luminoso". No se pidieron referencias antes de diseñar.

**Qué se cambia**
- Ante un pedido estético con nombre propio (una "onda", un "mood"), pedir
  imágenes de referencia antes de diseñar, o mostrar una muestra chica antes
  de rehacer todo el sitio.
- Cuando hay referencias, diseñar mirándolas y anotar en la bitácora qué se
  tomó de cada una.

**Cómo se resolvió**
Segunda versión hecha a partir de las seis imágenes (bitácora, entrada (5)).

**Estado:** a confirmar por el usuario.

---

## #2 — La base y el login "no cambiaron nada" en la página
**Fecha:** 2026-10-01
**Tipo:** comunicación (repetición de #0.3)

**Lo que se pidió**
> Crear la base de datos de la revista y permitir hacer login con distintos
> tipos de usuarios.

**Lo que se hizo**
Se armó todo y se verificó en `localhost`. Al entregar se listó al final, como
uno de tres pasos pendientes, que faltaba cargar las variables en Vercel y
subir a `main`.

**Dónde estuvo la diferencia**
El usuario miró el sitio publicado y lo vio igual que antes.

**Por qué pasó**
- Es el mismo error que #0.3. La lección ("decir dónde se puede ver") se
  aplicó a medias: el dato estaba, pero enterrado al final de un resumen largo
  y sin decir **"todavía no lo vas a ver en la página"**.
- Además, el cambio es mayormente invisible: el contenido es el mismo, solo
  cambió de dónde sale. No se avisó qué iba a cambiar a la vista.

**Qué se cambia**
- La primera línea de la entrega dice dónde se puede ver el cambio. Si no
  está publicado, se dice ahí: "todavía no está en la página".
- Si el cambio casi no se ve, decir qué es lo visible ("aparece 'Entrar' en el
  header") para que el usuario sepa qué buscar.

**Cómo se resolvió**
El usuario autorizó publicar. Se cargaron las variables en Vercel, se subió a
`main` (`fdaeb75`) y se verificó en revista-digital-musica.vercel.app que
aparecen "Entrar", `/login` y `/registro`.

**Estado:** resuelto.

---

## #1 — Contenido "solo para suscriptores" sin forma de suscribirse
**Fecha:** 2026-09-24
**Tipo:** error de diseño

**Lo que se pidió**
> "Por ahora la suscripción dejala en stand by"

**Lo que se hizo**
Se armó la revista con dos notas marcadas como premium, con un sello rojo de
"Solo suscriptores" en la tarjeta y en la nota. No se agregó ninguna página,
botón ni enlace para suscribirse.

**Dónde estuvo la diferencia**
"Stand by" significaba no implementar todavía los pagos. No significaba mostrar
contenido bloqueado sin salida. El resultado fue una promesa sin camino: el
usuario ve que hay algo exclusivo y no tiene forma de acceder.

**Por qué pasó**
El campo `premium` se dejó preparado para no tener que migrar datos después, y
eso era correcto. El error fue **mostrarlo en la interfaz** sin la otra mitad
del flujo, y no avisar del hueco al entregar.

**Qué se cambia**
- No mostrar en la interfaz funcionalidades que todavía no tienen su recorrido
  completo. Si algo se deja preparado, queda en los datos y no en pantalla.
- Al entregar, recorrer el sitio como un usuario y buscar callejones sin
  salida: botones que no llevan a ningún lado, estados sin salida, promesas sin
  página.

**Cómo se resolvió**
Se eligió una página de suscripción, sin implementar pagos:
- Nueva página **`/suscribite`** con tres planes (Libre, Mensual, Anual) y un
  aviso claro de que todavía no se puede pagar.
- Enlace **"Suscribite"** en el header, visible en todo el sitio.
- En las notas premium, el sello lleva a `/suscribite` y hay un aviso que
  explica que por ahora se leen gratis.
- Los planes listan **solo beneficios que el sitio tiene de verdad**, para no
  repetir el mismo error en la página nueva.
- Se descartó un botón "Suscribirme" preparado para cuando haya pagos: hoy no
  haría nada, así que habría sido otro callejón sin salida.

**Estado:** resuelto.

---

## Registradas retroactivamente

Desencuentros anteriores a la creación de este archivo, del mismo día.

### #0.3 — El rediseño no aparecía en Vercel
**Tipo:** comunicación

**Lo que se pidió:** ver la propuesta de diseño grunge.
**Lo que se hizo:** se hizo el commit en una rama local, sin subirla. Se mostró
en el navegador local.
**Dónde estuvo la diferencia:** el usuario lo buscó en Vercel y no estaba. Al
subir la rama, el preview quedó protegido por login y tampoco lo pudo ver.
**Por qué pasó:** no se aclaró que el cambio **solo existía en la compu** y que
Vercel no lo iba a mostrar. Tampoco se anticipó que los previews piden login.
**Qué se cambia:** al entregar algo, decir explícitamente **dónde se puede ver**:
local, preview o producción. Si el usuario no puede ver los previews, llevar
los cambios a `main` para mostrarlos.

### #0.2 — Instrucciones para `vercel login` que no funcionaban
**Tipo:** diagnóstico

**Lo que se pidió:** instalar y usar el CLI de Vercel desde la terminal.
**Lo que se hizo:** se instaló y se pasaron comandos para loguearse. Hicieron
falta varios intercambios con arreglos distintos: reabrir la terminal, refrescar
el PATH, usar la ruta completa.
**Dónde estuvo la diferencia:** el usuario siguió las instrucciones y seguía
recibiendo el mismo error.
**Por qué pasó:** se verificó que el comando funcionaba **desde el lado del
asistente**, pero no en la terminal del usuario, que tenía el PATH desactualizado.
Se dieron soluciones por suposición en lugar de leer el error real primero.
**Qué se cambia:** ante un error del usuario, leer primero el mensaje exacto (o
la terminal del panel) antes de proponer arreglos.

### #0.1 — El proyecto se armó en TypeScript y la cátedra pedía JavaScript
**Tipo:** supuesto no verificado

**Lo que se pidió:** armar la base del proyecto con React, Next y Vercel.
**Lo que se hizo:** se recomendó TypeScript y se generó el proyecto con
TypeScript sin preguntar.
**Dónde estuvo la diferencia:** la cátedra pedía JavaScript. Hubo que migrar
todo el proyecto.
**Por qué pasó:** se eligió el lenguaje por preferencia técnica y no se preguntó
si la materia tenía requisitos sobre eso.
**Qué se cambia:** antes de decisiones difíciles de revertir (lenguaje,
framework, base de datos), preguntar si la cátedra impone algo.
