# Flujo de ramas

## Ramas permanentes

Las ramas `main` y `develop` son permanentes y deben existir durante todo el proyecto. Está prohibido eliminarlas, tanto localmente como en el repositorio remoto.

## Trabajo e integración

- `main` contiene el código de producción, que ya se encuentra desplegado. Solo se incorpora código probado y funcional.
- Al iniciar un sprint, todas las ramas para resolver tareas se crean a partir de la última versión de `develop`, nunca de `main`.
- Al terminar una tarea, se prueba el código, se sube la rama al repositorio remoto y se comprueba que la rama local y la remota coincidan. Luego se espera permiso para integrarla en `develop`.
- Ninguna rama de tarea se integra directamente en `main`. Los cambios se integran primero en `develop`, donde se resuelven los conflictos y se comprueba que el código funcione.

Flujo: `develop` → rama creada desde `develop` → implementación y pruebas → publicación y comprobación de la rama → espera de permiso para integrar en `develop`.

## Nombres de ramas

| Prefijo | Uso principal | Ejemplo |
| --- | --- | --- |
| `feature/` | Nuevas funcionalidades para el usuario. | `feature/login-con-google` |
| `fix/` | Corrección de errores en desarrollo o staging. | `fix/error-calculo-iva` |
| `hotfix/` | Corrección urgente de un problema de producción. | `hotfix/caida-pasarela-pagos` |
| `chore/` | Mantenimiento, configuración o dependencias. | `chore/actualizar-dependencias` |
| `refactor/` | Reestructuración sin cambiar el comportamiento. | `refactor/optimizar-consultas-sql` |
| `docs/` | Cambios exclusivos en documentación. | `docs/agregar-guia-instalacion` |
| `test/` | Agregar o corregir pruebas. | `test/pruebas-unitarias-carrito` |
| `style/` | Cambios de formato visual o de código sin lógica. | `style/ajustar-margenes-header` |
| `ci/` o `build/` | Configuración de integración continua, despliegue o compilación. | `ci/configurar-github-actions` |

Las ramas `hotfix/` también se crean desde `develop` y se integran primero en `develop`; no son una excepción al flujo.

## Cierre de sprint

Al final de cada sprint, `main` y `develop` no deben tener diferencias en su código. El código pasa de `develop` a `main` solo después de que todas las ramas utilizadas en el sprint estén integradas y probadas en `develop`.

## Registro de ramas eliminadas

Las siguientes ramas estaban integradas en el historial de `develop` y fueron eliminadas de las ubicaciones donde existían:

- `docs/readme` (remota)
- `feature/backend-api` (local)
- `feature/backend-core` (local y remota)
- `feature/catalogo-dinamico` (remota)
- `feature/formulario` (remota)
- `feature/frontend` (remota)
- `feature/html` (remota)
- `feature/react-layout` (local)
- `feature/react-products` (local y remota)
- `feature/react-state` (local)

- `feature/css-responsive` fue eliminada localmente y en el remoto. Sus commits no estaban integrados en el historial de `develop`; su último commit era `fb5e2c6`.

- `codex/seguridad-dependencias` fue integrada en `feat/ai-agents` y eliminada localmente y en el remoto. Ambas ramas coincidían en el commit `d41d9bb` antes de la eliminación.
- `feat/ai-agents` fue integrada en `develop` y eliminada localmente y en el remoto. Ambas ramas coincidían en el commit `51df949` antes de la eliminación.
