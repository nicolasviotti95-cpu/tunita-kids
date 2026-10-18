# Activar el administrador de Tunita Kids

La página de administración ya está preparada en `admin.html`. Para que guarde productos hace falta conectarla a un proyecto de Supabase de tu propiedad. GitHub Pages seguirá sirviendo la tienda; Supabase guardará los productos, las fotos y la sesión privada de administración.

## Pasos de conexión

1. Creá un proyecto en [Supabase](https://supabase.com/dashboard).
2. En ese proyecto, abrí **SQL Editor**, pegá el contenido de `supabase-setup.sql` y ejecutalo.
3. En **Authentication → Users**, creá el usuario con tu correo y una contraseña. Dejá desactivado el registro público.
4. Copiá el UUID que aparece junto al usuario. En **SQL Editor**, ejecutá esto reemplazando el texto de ejemplo por el UUID:

   ```sql
   insert into public.admin_users (user_id) values ('UUID-DE-TU-USUARIO');
   ```

5. En **Project Settings → API Keys**, copiá la Project URL y la publishable key. Pegalas en `supabase-config.js`, en los campos `url` y `key`.
6. Publicá esos cambios en el repositorio. Después entrá en `https://nicolasviotti95-cpu.github.io/tunita-kids/admin.html` e iniciá sesión.

Desde el administrador podrás subir fotos JPG, PNG o WebP de hasta 5 MB, elegir categoría y público, poner precio, editar prendas, ocultarlas temporalmente o borrarlas. Al guardar, la tienda pública toma el catálogo actualizado.

## Seguridad

- No compartas tu contraseña con nadie.
- Solo la cuenta cuyo UUID figure en `admin_users` puede modificar el catálogo.
- `supabase-config.js` usa la publishable key. Nunca pongas una `service_role` key allí.
- La base y las fotos tienen políticas de acceso para permitir lectura pública de prendas publicadas y cambios solo a la cuenta autorizada.

