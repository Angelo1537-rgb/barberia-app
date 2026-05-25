# 🚀 Fase 3 — Panel Admin + Deploy a Vercel

Ahora vamos a instalar el panel admin en tu proyecto y desplegarlo a internet para que tu hermano pueda acceder desde cualquier sitio.

---

## Paso 1 — Copiar archivos del panel admin

Te he generado **6 archivos nuevos** que tienes que añadir a tu proyecto.

Descarga el ZIP `admin-panel.zip` y descomprímelo. Verás esta estructura:

```
admin-panel/
├── app/
│   ├── admin/page.tsx          ← Panel principal
│   └── login/page.tsx          ← Página de login
├── components/admin/
│   ├── CalendarioCitas.tsx     ← Calendario y citas
│   ├── GestionServicios.tsx    ← Crear/editar servicios
│   └── GestionHorario.tsx      ← Configurar horario
├── lib/auth/
│   └── servidor.ts             ← Cliente Supabase para servidor
└── middleware.ts               ← Protección de rutas /admin
```

**En VS Code:**

1. Abre tu proyecto `barberia-app`
2. Copia estos archivos a tu proyecto en las mismas rutas
3. Especialmente importante: **`middleware.ts` va en la raíz** del proyecto, no dentro de `app/`

### Copiar archivos uno a uno (recomendado para no equivocarse):

- `admin-panel/middleware.ts` → `barberia-app/middleware.ts` (RAÍZ)
- `admin-panel/app/admin/page.tsx` → `barberia-app/app/admin/page.tsx`
- `admin-panel/app/login/page.tsx` → `barberia-app/app/login/page.tsx`
- `admin-panel/lib/auth/servidor.ts` → `barberia-app/lib/auth/servidor.ts`
- `admin-panel/components/admin/*.tsx` → `barberia-app/components/admin/*.tsx`

---

## Paso 2 — Probar en local (localhost)

En la terminal de VS Code:

```bash
npm run dev
```

Ahora prueba estas URLs:

- 👉 [http://localhost:3000](http://localhost:3000) — Landing (sin cambios)
- 👉 [http://localhost:3000/admin](http://localhost:3000/admin) — **Debería redirigirte a `/login`**
- 👉 [http://localhost:3000/login](http://localhost:3000/login) — Pantalla de login

### Fazer login:

- **Email:** `adiantarzan@gmail.com` (el que creaste en Supabase)
- **Password:** `TempPass2024!` (la temporal que pusiste)

Si funciona:
- ✅ Ves el panel admin con las 3 opciones (Calendario, Servicios, Horario)
- ✅ Puedes ver las citas que creaste antes
- ✅ Puedes crear nuevos servicios

---

## Paso 3 — Desplegar a Vercel (el paso más importante)

Ahora subes todo a Vercel para que sea accesible desde internet.

### 3.1 — Push de cambios a GitHub

En la terminal:

```bash
git add .
git commit -m "Añadir panel admin"
git push
```

Espera a que termine (verás "100% done").

### 3.2 — Ir a Vercel y desplegar

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Pulsa **+ Add New** → **Project**
3. Selecciona tu repositorio `barberia-app` (debería aparecer)
4. **Import**
5. En "Environment Variables", añade tus claves de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
6. **Deploy**

Espera 2-3 minutos a que termine. Verás algo como:

```
✓ Production Deployment Complete
Domain: barberia-app-kj4z.vercel.app
```

### 3.3 — Verificar que funciona en producción

Ahora tu app está en internet. Prueba:

- 👉 `https://barberia-app-XXXX.vercel.app` — Tu landing pública
- 👉 `https://barberia-app-XXXX.vercel.app/admin` → redirige a `/login`
- 👉 `https://barberia-app-XXXX.vercel.app/login` — Login panel admin

**Login con:**
- Email: `adiantarzan@gmail.com`
- Password: `TempPass2024!`

---

## Paso 4 — Dar acceso a tu hermano

Ahora tu hermano puede empezar a usar la app:

### ✅ Clientes (PÚBLICO):

Todos pueden reservar en:
```
https://barberia-app-XXXX.vercel.app
```

### ✅ Tu hermano (ADMIN):

1. Le envías el link del panel:
   ```
   https://barberia-app-XXXX.vercel.app/login
   ```

2. Credenciales:
   - Email: `adiantarzan@gmail.com`
   - Password: `TempPass2024!` ← **Debe cambiarla en la primera entrada**

   > ⚠️ Para cambiar la contraseña: En Supabase → Authentication → Users → click en su usuario → cambiar password

3. Luego puede:
   - ✅ Ver todas las citas en el calendario
   - ✅ Crear/editar/eliminar servicios
   - ✅ Configurar el horario semanal (días, horas de apertura, pausa)

---

## 🎯 Resumen final

| Funcionalidad | Dónde | Acceso |
|---|---|---|
| **Reservar cita** | Landing público | Cualquiera |
| **Ver citas** | Panel admin | Tu hermano (email + password) |
| **Gestionar servicios** | Panel admin | Tu hermano |
| **Configurar horario** | Panel admin | Tu hermano |
| **Cambiar contraseña** | Supabase (admin) | Solo tú |

---

## 🔗 Links importantes

- **App pública:** `https://barberia-app-XXXX.vercel.app`
- **Panel admin:** `https://barberia-app-XXXX.vercel.app/login`
- **Supabase (base de datos):** `https://supabase.com/dashboard`
- **Vercel (hosting):** `https://vercel.com/dashboard`

---

## ❓ Próximos pasos (opcionales)

Cuando esto funcione:

1. **Añadir dominio propio** (barberia-mibarrio.com) — cuesta ~10€/año
2. **Integrar WhatsApp** para confirmaciones automáticas
3. **Mejorar el diseño** según feedback de tu hermano

¿Preguntas? Cuéntame qué tal te va con la instalación. 💪
