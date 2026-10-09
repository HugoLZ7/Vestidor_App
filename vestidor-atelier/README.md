# Vestidor Digital Atelier

Armario digital privado: sube tu ropa, combina parte superior + inferior + calzado y guarda outfits.
React + Vite · Tailwind · Supabase (Auth, Postgres, Storage) · Vercel.

## Funciones
- **Outfit de hoy**: las 3 categorías visibles a la vez (pensado para móvil), flechas/deslizar, aleatorio por categoría, «Combinar», favorito y «Guardar outfit».
- **Mi armario**: agrupado por categoría, filtros, búsqueda, orden por fecha, editar y eliminar con confirmación.
- **Agregar prenda**: varias fotos a la vez, vista previa, quitar antes de subir, progreso, validación (JPG/PNG/WebP, 5 MB). Cada foto = una prenda. Se convierten a WebP (máx. 1600 px) antes de subir.
- **Mis outfits**: favoritos, recargar en el seleccionador para editar, eliminar. Si una prenda ya no existe se muestra «Prenda no disponible».
- Login con correo y contraseña (sin registro público), sesión persistente, modo oscuro/claro, toasts en español.

## 1. Crear el proyecto en Supabase
1. Entra a https://supabase.com → **New project** (plan Free). Guarda la contraseña de la base de datos (no se usa en la app).
2. **SQL Editor → New query**, pega todo `supabase/schema.sql` y pulsa **Run**. Crea tablas, índices, RLS y el bucket privado `garments` con sus políticas.
3. Verifica en **Storage** que existe el bucket `garments` (privado).

## 2. Crear la cuenta de tu novia
**Authentication → Users → Add user → Create new user**: correo + contraseña, marca **Auto Confirm User**.
Luego **Authentication → Sign In / Providers → Email**: desactiva **Allow new users to sign up** para que nadie más pueda registrarse.

## 3. Variables de entorno
En Supabase: **Project Settings → API** (o *API Keys*). Copia la **Project URL** y la clave **publishable** (o `anon`).
```bash
cp .env.example .env.local
# edita .env.local con tus dos valores
```
No uses nunca la clave `service_role` en el frontend.

## 4. Ejecutar localmente
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # compilación de producción en /dist
npm run preview    # probar la compilación
```

## 5. Publicar en Vercel
1. Sube el proyecto a GitHub (`.env.local` está ignorado por `.gitignore`).
2. https://vercel.com → **Add New → Project** → importa el repositorio. Vercel detecta Vite (Build `npm run build`, Output `dist`).
3. **Environment Variables**: añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. **Deploy**.
4. En Supabase: **Authentication → URL Configuration**: *Site URL* = `https://tu-app.vercel.app`; en *Redirect URLs* añade `https://tu-app.vercel.app/**` (y `http://localhost:5173/**` para desarrollo).
5. Comprueba que las rutas funcionan al refrescar: abre `https://tu-app.vercel.app/armario` y pulsa F5. `vercel.json` ya reescribe todo a `index.html`.
6. Envía el enlace a tu novia; en el móvil puede usar «Añadir a pantalla de inicio».

## Límites del plan gratuito (revisa los valores vigentes en cada servicio)
- **Supabase Free**: ~1 GB de Storage, ~500 MB de base de datos; los proyectos sin actividad durante ~1 semana se pausan (se reactivan desde el panel).
- **Vercel Hobby**: uso personal/no comercial, con límites de ancho de banda y despliegues.
- Con fotos comprimidas a WebP caben cientos de prendas.

## Estructura
```
src/components  Sidebar, MobileNavigation, GarmentCarousel, GarmentCard, ImageUploader, ConfirmDialog, Toast...
src/pages       TodayOutfit, Wardrobe, AddGarment, SavedOutfits, Login
src/hooks       useGarments, useOutfits
src/services    garmentService, outfitService (único lugar con llamadas a Supabase)
src/contexts    AuthContext, ThemeContext
supabase/schema.sql
```

## Cambios respecto al modelo propuesto
- `user_id` tiene `default auth.uid()` y las políticas RLS de `outfits` verifican que las prendas referenciadas pertenezcan al mismo usuario.
- FKs de outfits con `ON DELETE SET NULL` para no dejar referencias inválidas ni borrar otros datos.
- `image_path` debe empezar por el `user_id` (validado en RLS) y el bucket limita tipo y tamaño.
