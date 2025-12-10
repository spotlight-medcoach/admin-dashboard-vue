# Dashboard Admin Spotlight

Este es el dashboard para administradores de Spotlight y Spotlighters.

## 📋 Descripción

Dashboard administrativo construido con Nuxt.js para la gestión de usuarios, contenido y configuraciones de la plataforma Spotlight.

## 🛠️ Stack Tecnológico

- **Framework**: Nuxt.js 2.15.8
- **Vue**: 2.6.14 (mantenido en versión 2 por compatibilidad)
- **UI Framework**: Bootstrap Vue 2.21.2
- **HTTP Client**: @nuxtjs/axios 5.13.3
- **Editor de Texto**: TinyMCE 5.10.9
- **Gráficos**: Chart.js 2.9.4 + vue-chartjs 3.5.1

## 📦 Instalación

```bash
# Instalar dependencias
yarn install
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo con hot reload en localhost:3000
yarn dev

# Build para producción
yarn build

# Iniciar servidor de producción
yarn start

# Generar proyecto estático
yarn generate
```

## 🎨 Herramientas de Desarrollo

Este proyecto utiliza las siguientes herramientas para mantener la calidad del código:

### Prettier

Configuración de formato de código ubicada en `.prettierrc`:

- Trailing commas: ES5
- Tab width: 2 espacios
- Semicolons: habilitados
- Single quotes: habilitados
- Print width: 80 caracteres

### ESLint

Configuración de linting con:

- `eslint-plugin-vue@^9.28.0` (compatible con Vue 2)
- `vue-eslint-parser@^9.4.3` (compatible con Vue 2)
- `@typescript-eslint/eslint-plugin@^8.48.0`
- `@typescript-eslint/parser@^8.48.0`
- `eslint-config-prettier@^10.1.8`
- `eslint-plugin-prettier@^5.5.4`

**Nota importante**: Las versiones de `eslint-plugin-vue` y `vue-eslint-parser` están fijadas en la versión 9.x para mantener compatibilidad con Vue 2. No actualizar a la versión 10.x ya que requiere Vue 3.

## 📁 Estructura del Proyecto

```
dashboard-admin/
├── assets/          # Recursos estáticos (CSS, imágenes, iconos)
├── components/      # Componentes Vue reutilizables
│   ├── buttons/     # Componentes de botones
│   ├── cards/       # Componentes de tarjetas
│   ├── chart/       # Componentes de gráficos
│   ├── inputs/      # Componentes de entrada
│   ├── modals/      # Componentes modales
│   ├── navs/        # Componentes de navegación
│   └── toasts/      # Componentes de notificaciones
├── layouts/         # Layouts de la aplicación
├── middleware/      # Middleware de Nuxt
├── pages/           # Páginas de la aplicación
│   ├──   # Páginas de administradores
│   └── spotlightersPages/    # Páginas de spotlighters
├── plugins/         # Plugins de Nuxt
├── store/           # Store de Vuex
└── static/          # Archivos estáticos
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las variables necesarias. Consulta `example.env` si está disponible.

## 🔧 Desarrollo

### Formateo de Código

El proyecto utiliza Prettier para el formateo automático. Asegúrate de configurar tu editor para formatear al guardar.

### Linting

ESLint está configurado para mantener la calidad del código. Ejecuta el linter antes de hacer commit:

```bash
# Verificar errores de linting
yarn eslint .
```

## 📚 Documentación Adicional

- [Nuxt.js Documentation](https://nuxtjs.org)
- [Vue.js 2 Documentation](https://v2.vuejs.org/)
- [Bootstrap Vue Documentation](https://bootstrap-vue.org/)

## ⚠️ Notas Importantes

- **Vue 2.6.14**: Este proyecto utiliza Vue 2.6.14 con vue-server-renderer 2.6.14. Ambas versiones están fijadas para evitar conflictos de compatibilidad. No actualizar a Vue 3 sin realizar una migración completa, ya que sería un breaking change.
- **Nuxt 2**: Compatible con Nuxt.js 2.x. La migración a Nuxt 3 requeriría cambios significativos.
- **Gestor de paquetes**: Este proyecto utiliza Yarn como gestor de paquetes. Usa `yarn` en lugar de `npm` para todos los comandos.

## 📝 Licencia

Proyecto privado - Todos los derechos reservados
