# Tunita Kids

Sitio estático para **Tunita Kids**, tienda de ropa infantil de Mercedes, Soriano. La portada usa la imagen oficial de la marca y el personaje cactus cuenta con una versión redibujada en alta resolución, integrada como una pieza completa con bordes limpios.

## Vista local

Abrí `index.html` en un navegador para recorrer la página.

## Publicar con GitHub Pages

1. Subí el contenido de esta carpeta a un repositorio de GitHub.
2. En el repositorio, abrí **Settings → Pages**.
3. En **Build and deployment**, elegí **Deploy from a branch**.
4. Seleccioná la rama principal y la carpeta `/ (root)` y guardá.

El sitio usa rutas relativas para que funcione en GitHub Pages. La gestión de productos vive en `admin.html`; una vez conectado Supabase, las prendas y sus fotos se mantienen desde esa pantalla.

## Conectar la administración

1. Creá un proyecto de Supabase desde tu cuenta.
2. En **SQL Editor**, ejecutá el contenido de `supabase-setup.sql`.
3. En **Authentication → Users**, creá el usuario privado que vas a usar para iniciar sesión. No habilites el registro público de usuarios.
4. Copiá el UUID de ese usuario y agregalo en SQL Editor con la instrucción comentada al final de `supabase-setup.sql`.
5. En **Project Settings → API Keys**, copiá la URL del proyecto y la publishable key en `supabase-config.js`.
6. Publicá los cambios. Entrá a `/tunita-kids/admin.html` para administrar el catálogo.

La publishable key puede estar en la web porque las políticas RLS limitan quién puede escribir. Nunca copies una `service_role` key en `supabase-config.js`.

