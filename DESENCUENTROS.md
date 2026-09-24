# Desencuentros

Registro de los momentos en que lo que se pidió y lo que se hizo no
coincidieron: errores del asistente, malentendidos y supuestos que salieron mal.

Cada entrada guarda el pedido, la respuesta, dónde estuvo la diferencia, por qué
pasó y qué se cambia para que no se repita. La [bitácora](BITACORA.md) registra
**qué** se construyó; este archivo registra **dónde nos desencontramos**.

Entrada más reciente arriba.

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

**Estado:** pendiente de decidir cómo resolverlo.

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
