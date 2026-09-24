# Bitácora del TP

Registro de cambios y decisiones del proyecto. Entrada más reciente arriba.

---

## 2026-09-24 — Setup inicial

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
- **App Router en vez de Pages Router.** Es el sistema actual de Next; `pages/` quedó como legado. Implica que los componentes son de servidor por defecto y hay que marcar con `'use client'` los que necesiten interactividad.
- **Carpeta `src/`.** Separa el código de la app de los archivos de configuración de la raíz.
- **Identidad de git solo local al repo.** Se configuró `user.name` y `user.email` con `git config` sin `--global`, para no afectar otros proyectos de la máquina. Se usa el mail `noreply` de GitHub para no exponer el mail real en el historial público.

### Estructura
```
TP/
├── src/app/
│   ├── layout.tsx      # marco común a todas las páginas
│   ├── page.tsx        # home (/)
│   └── globals.css     # estilos globales + Tailwind
├── public/             # imágenes y archivos estáticos
├── next.config.ts
└── package.json
```

### Pendiente
- [ ] Definir de qué se trata la página.
- [ ] Push inicial a GitHub.
- [ ] Conectar el repo a Vercel.
