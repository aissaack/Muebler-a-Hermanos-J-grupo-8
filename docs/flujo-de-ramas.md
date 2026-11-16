# Flujo de ramas

## Ramas permanentes

Las ramas `main` y `develop` son permanentes y deben existir durante todo el proyecto. Está prohibido eliminarlas, tanto localmente como en el repositorio remoto.

## Trabajo e integración

- `main` contiene el código de producción, que ya se encuentra desplegado. Solo se incorpora código probado y funcional.
- `develop` se utiliza para integrar el trabajo de las ramas creadas a partir de la última versión de `develop`.
- Los cambios se integran primero en `develop`, donde se resuelven los conflictos y se comprueba que el código funcione. Después, el código funcional se pasa de `develop` a `main`.

## Cierre de sprint

Al final de cada sprint, `main` y `develop` no deben tener diferencias en su código. Para lograrlo, primero se completa y verifica la integración en `develop` y luego se pasa ese código a `main`.

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
