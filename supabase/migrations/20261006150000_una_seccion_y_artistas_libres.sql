-- =============================================================================
-- Una sola sección (Música) y artistas escritos a mano en las notas
--
-- 1. El menú del sitio ya solo tenía Música. A pedido del usuario, las notas
--    de Fiestas, Quilombo y Entrevistas pasan a Música y esas secciones se
--    borran. Las URLs viejas redirigen a Música (next.config.mjs).
-- 2. En Redacción, los artistas de una nota ahora se escriben. Si el nombre
--    coincide con un artista de la base, se vincula a su ficha como antes
--    (`articulo_artistas`). Si no, se guarda acá, como texto, y en la nota se
--    muestra sin link.
-- =============================================================================

-- --- 1. Todo a Música --------------------------------------------------------

update public.articulos
set categoria = 'musica'
where categoria in ('fiestas', 'quilombo', 'entrevistas');

-- Las propuestas de lectores guardan la sección dentro de `datos`.
update public.envios
set datos = jsonb_set(datos, '{categoria}', '"musica"')
where datos ->> 'categoria' in ('fiestas', 'quilombo', 'entrevistas');

delete from public.categorias where slug in ('fiestas', 'quilombo', 'entrevistas');


-- --- 2. Artistas sin ficha ---------------------------------------------------

alter table public.articulos
  add column artistas_mencionados text[] not null default '{}'
  check (cardinality(artistas_mencionados) <= 20);

comment on column public.articulos.artistas_mencionados is
  'Artistas que aparecen en la nota pero no tienen ficha en `artistas`. Se muestran sin link.';
