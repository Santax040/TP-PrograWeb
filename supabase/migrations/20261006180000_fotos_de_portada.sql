-- =============================================================================
-- Fotos de portada para las notas
--
-- En Redacción se puede subir una foto: el navegador la recorta a 16:9, la
-- achica a 1600×900 y la comprime antes de subirla (EditorNota → RecorteFoto).
-- Se guarda en Supabase Storage, en el bucket `portadas`, y la nota guarda su
-- dirección en `portada_url`. Sin foto, la nota sigue usando el gradiente.
--
-- El tinte menta del sitio NO se aplica a la foto: lo pone `.bruma` en
-- pantalla, así la foto guardada queda limpia y la estética puede cambiar.
-- =============================================================================

-- Bucket público: cualquiera puede VER las fotos (son portadas de la revista).
-- Hasta 1 MB y solo WebP o JPEG: lo que sube el editor pesa unos 200 KB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portadas', 'portadas', true, 1048576, array['image/webp', 'image/jpeg']);

-- Subir: admins y publicadores, y siempre dentro de una carpeta con su id
-- (`<id del usuario>/<archivo>`), así se sabe de quién es cada foto.
create policy "publicadores suben portadas"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portadas'
    and (select privado.es_publicador())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Borrar: cada uno las suyas; el admin, cualquiera.
create policy "borrar portadas propias"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portadas'
    and (
      ((storage.foldername(name))[1] = (select auth.uid())::text and (select privado.es_publicador()))
      or (select privado.es_admin())
    )
  );

-- Columna en las notas. Solo acepta fotos de nuestro bucket.
alter table public.articulos
  add column portada_url text
  check (portada_url is null or portada_url like 'https://%/storage/v1/object/public/portadas/%');

comment on column public.articulos.portada_url is
  'Foto de portada (bucket portadas, 16:9). Si es null, se usa el gradiente de `portada`.';
