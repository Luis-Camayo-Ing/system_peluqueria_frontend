# Lista de salida 1.0.0

## Automatización

- Formato, lint y TypeScript sin errores.
- Pruebas unitarias y E2E aprobadas.
- Auditoría de dependencias de producción sin vulnerabilidades altas.
- Build de producción y presupuesto de JavaScript/CSS aprobados.
- Construcción de la imagen Docker aprobada.

## Prueba manual

- Inicio y cierre de sesión; redirección cuando expira el token.
- Navegación completa por teclado, enlace “Ir al contenido principal” y foco visible.
- Títulos de página, idioma español, zoom al 200 % y vista móvil.
- CRUD de clientes, servicios, inventario, caja, compras y administración según permisos.
- Roles de sistema y catálogo global de permisos sin acciones destructivas.
- Errores 401, 403, 404 y validaciones visibles sin perder datos del formulario.
- Agenda, reportes, descarga de comprobantes y endpoints reales del backend.

## Operación

- Variables de producción definidas a partir de los archivos `.env.production.example`.
- Migraciones aplicadas antes de iniciar el backend.
- Copia de seguridad y restauración ensayadas según la guía del backend.
- `/api/v1/health` y `/healthz` responden correctamente.
- HTTPS terminado en el proxy o balanceador de producción.
