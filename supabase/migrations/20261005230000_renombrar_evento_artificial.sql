-- La revista pasó a llamarse Artificial (2026-10-05). El primer evento del
-- ciclo llevaba el nombre viejo de la revista.
--
-- Solo cambia el nombre que se muestra. El slug ("subsuelo-presenta-octubre")
-- queda igual para no romper la dirección de la página del evento; los
-- line-ups apuntan al evento por id, así que no se ven afectados.
update public.eventos
set nombre = 'Artificial presenta: octubre'
where slug = 'subsuelo-presenta-octubre';
