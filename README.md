# ERP Beauty Pro — Frontend

Aplicación administrativa en Vue 3, TypeScript, Pinia y Vuetify. El Sprint 30 prepara la versión 1.0.0 para producción con CI, pruebas automatizadas, accesibilidad, límites de rendimiento y una imagen Nginx endurecida.

## Requisitos

- Node.js 24.18 o posterior compatible con `package.json`.
- npm 11 o posterior.
- Backend disponible en `http://127.0.0.1:8000` durante el desarrollo.

## Desarrollo

```bash
npm ci
npm run dev
```

La aplicación queda en `http://localhost:5173`. Copia `.env.example` a `.env` solo si necesitas cambiar la API o el tiempo de espera.

## Validación local

```bash
npm run format:check
npm run lint:check
npm run type-check
npm run test:unit:run
npm run build
npm run test:performance
npm run test:e2e:ci
```

Antes de la primera prueba E2E instala Chromium:

```bash
npx playwright install chromium
```

## Producción con contenedor

La imagen compila los recursos con Node y los sirve con Nginx sin privilegios en el puerto `8080`. Nginx añade cabeceras de seguridad, compresión, caché para recursos versionados, límite de solicitudes al inicio de sesión y proxy de `/api` hacia `backend:8000`.

```bash
docker build -t erp-beauty-pro-frontend:1.0.0 .
docker run --rm -p 8080:8080 erp-beauty-pro-frontend:1.0.0
```

Para levantar todo el sistema utiliza `compose.yaml` del repositorio backend. Consulta [docs/QA_RELEASE.md](docs/QA_RELEASE.md) para la lista de salida.
