# Guía para definir el contrato de pedidos

## ¿Qué es?

El contrato de pedidos es el acuerdo entre el frontend (React) y el backend (Express) sobre cómo solicitar y consultar pedidos: qué rutas se usan, qué datos viajan, qué responde la API y cómo informa los errores. No es el código ni un acuerdo legal. Definirlo antes de implementar ayuda a que las dos partes coincidan, aunque las desarrolle la misma persona.

## Qué acordar

- **Rutas y métodos:** cómo crear un pedido y cómo obtener los pedidos del usuario autenticado, bajo `/api`.
- **Autenticación:** enviar `Authorization: Bearer <token>`. El backend obtiene la identidad del token verificado; no debe confiar en un ID de usuario enviado por el cliente.
- **Datos de entrada:** acordar los nombres y tipos de los campos, cómo se representan los productos y sus cantidades, y qué datos son obligatorios. Incluir un ejemplo JSON sin datos reales.
- **Validaciones y total:** definir qué pasa si el carrito está vacío, una cantidad es inválida o un producto no existe. El backend consulta los productos y precios vigentes y calcula el total; no confía en importes enviados por el navegador. Acordar cómo tratar el stock, incluidos productos sin stock informado, y los precios que cambian entre mostrar el carrito y enviar el pedido.
- **Persistencia:** definir qué datos se guardan para que un pedido conserve su detalle y precio al momento de la compra, aunque el producto cambie después. Acordar la representación del total y del dinero para evitar errores de redondeo.
- **Respuestas y errores:** acordar códigos HTTP, formato y ejemplos tanto para crear como para consultar pedidos. Usar el formato de errores existente en el proyecto y distinguir datos inválidos, falta de autenticación y errores del servidor.
- **Privacidad:** cada usuario consulta solo sus propios pedidos. Nunca incluir contraseñas, hashes ni tokens en las respuestas o ejemplos.
- **Frontend:** el carrito solo se vacía después de confirmar que el pedido se guardó. Ante un error se conserva y se muestra un mensaje útil.
- **Pruebas:** cubrir pedido válido, validaciones, acceso sin token, aislamiento entre usuarios y errores al guardar. Usar exclusivamente la base de desarrollo y avisar antes de ejecutar pruebas que escriban datos.

## Alcance y límites del curso

Este es un proyecto MERN educativo: React, Express/Node y MongoDB con Mongoose. Usar las rutas, modelos y middleware existentes y mantener el contrato simple y comprensible. Registrar un pedido no equivale a cobrarlo: no se requiere pasarela de pago ni procesar datos de tarjetas. No agregar servicios externos, funcionalidades ni dependencias que no hayan sido acordados para el sprint. Las decisiones sobre envío, stock y estados del pedido deben acordarse con el equipo si se necesitan; no asumir que ya están implementadas.

No usar datos personales reales, secretos ni cadenas de conexión en ejemplos, pruebas o documentación. No apuntar las pruebas a producción ni ejecutar el seed de producción.

## Contrato elegido por el equipo

**Responsable:** [completar]  
**Fecha y revisión:** 26/11/2026 — borrador completo de «Crear pedido», «Consultar mis pedidos» y reglas de negocio; revisión y pruebas pendientes de 4 integrantes

### Crear pedido

- **Método y ruta:** `POST /api/pedidos`. Router `routes/pedidosRoutes.js`, montado en `server.js` como `/api/pedidos`.

- **Autenticación:** obligatoria con `Authorization: Bearer <token>` mediante el middleware existente `verificarToken`. El `usuario` del pedido se toma de `req.usuario.id`, que sale del token firmado. El cuerpo **no** incluye datos del usuario: si el cliente manda `usuario` o `usuarioId`, se ignora. Sin token, token inválido o vencido → `401`.

- **Cuerpo de la solicitud (ejemplo JSON):**

```json
{
  "productos": [
    { "producto": "6712f0a1c3e9a1b2c3d4e5f6", "cantidad": 2 },
    { "producto": "6712f0a1c3e9a1b2c3d4e5f7", "cantidad": 1 }
  ]
}
```

  - `productos`: array obligatorio, con al menos un elemento.
  - `producto`: `_id` del producto como string de ObjectId válido.
  - `cantidad`: entero mayor o igual a 1.
  - No se envían `precio`, `nombre` ni `total`: el backend los obtiene y calcula.

- **Respuesta exitosa y código HTTP (ejemplo JSON):** `201 Created`

```json
{
  "_id": "6720b1c2d3e4f5a6b7c8d9e0",
  "usuario": "6711a2b3c4d5e6f7a8b9c0d1",
  "productos": [
    {
      "producto": "6712f0a1c3e9a1b2c3d4e5f6",
      "nombre": "Silla Nórdica",
      "precioUnitarioCentavos": 4500000,
      "cantidad": 2,
      "subtotalCentavos": 9000000
    },
    {
      "producto": "6712f0a1c3e9a1b2c3d4e5f7",
      "nombre": "Mesa Ratona",
      "precioUnitarioCentavos": 3200000,
      "cantidad": 1,
      "subtotalCentavos": 3200000
    }
  ],
  "totalCentavos": 12200000,
  "estado": "pendiente",
  "createdAt": "2026-11-25T12:00:00.000Z",
  "updatedAt": "2026-11-25T12:00:00.000Z"
}
```

- **Validaciones y errores (códigos y formato):** todos los errores usan el formato existente del proyecto, `{ "error": "mensaje en español", "message": "el mismo mensaje" }`. Las rutas no repiten la traducción: lanzan o pasan el error con `status` y el manejador central de `server.js` arma la respuesta.

| Caso | Código | Mensaje de ejemplo |
| --- | --- | --- |
| Sin `Authorization` o token inválido/vencido | `401` | `Token inválido o ausente` / `Token inválido o vencido` |
| `productos` ausente, no es array o está vacío | `400` | `El pedido debe incluir al menos un producto` |
| `producto` ausente o con ObjectId inválido | `400` | `El producto indicado no es válido` |
| `cantidad` no es entero o es menor a 1 | `400` | `La cantidad debe ser un número entero mayor o igual a 1` |
| El mismo `producto` aparece dos veces | `400` | `No se puede repetir el mismo producto en el pedido` |
| Uno o más productos no existen | `400` | `Uno o más productos no existen` |
| Stock numérico menor que la cantidad pedida (incluye stock `0`) | `409` | `Stock insuficiente para Silla Nórdica` |
| Producto con `precio` no numérico o negativo | `400` | `El precio de uno o más productos no es válido` |
| Error inesperado al guardar | `500` | `Ha ocurrido un error en el servidor.` |

  - `stock` ausente, `null` o cadena vacía se interpreta como **sin stock informado**: el producto se considera disponible y no se limita la cantidad. Es el mismo criterio que ya usa `stockEsInvalido` en `productosRoutes.js`.
  - Para `500` el contrato pide un mensaje genérico y no exponer detalles internos. El manejador central actual responde con `err.message`; al implementar hay que revisar ese punto sin cambiar el formato `{ error, message }` ni el de las respuestas existentes.
  - Campos extra en el cuerpo se ignoran; no se aceptan precios ni totales enviados por el cliente.
  - Un JSON mal formado lo rechaza `express.json()` y el manejador central responde `400`.

### Consultar mis pedidos

- **Método y ruta:** `GET /api/pedidos`. Mismo router `routes/pedidosRoutes.js`, montado en `server.js` como `/api/pedidos`.

- **Autenticación y alcance de la consulta:** obligatoria con `Authorization: Bearer <token>` mediante el middleware `verificarToken`. El backend filtra siempre por `usuario: req.usuario.id`, que sale del token firmado; no acepta `usuario`, `usuarioId` ni ningún identificador de usuario por query o por cuerpo. Cada usuario ve únicamente sus propios pedidos. La lista se devuelve ordenada por `createdAt` descendente (el más reciente primero). En este sprint no hay paginación ni filtros: los parámetros de query se ignoran. No se agrega `GET /api/pedidos/:id`.

- **Respuesta exitosa y código HTTP (ejemplo JSON, incluyendo lista vacía):** `200 OK` con un array de pedidos. Cada elemento tiene la misma forma que la respuesta de creación; sin pedidos se responde `200` con `[]`, nunca `404`.

```json
[
  {
    "_id": "6720b1c2d3e4f5a6b7c8d9e0",
    "usuario": "6711a2b3c4d5e6f7a8b9c0d1",
    "productos": [
      {
        "producto": "6712f0a1c3e9a1b2c3d4e5f6",
        "nombre": "Silla Nórdica",
        "precioUnitarioCentavos": 4500000,
        "cantidad": 2,
        "subtotalCentavos": 9000000
      },
      {
        "producto": "6712f0a1c3e9a1b2c3d4e5f7",
        "nombre": "Mesa Ratona",
        "precioUnitarioCentavos": 3200000,
        "cantidad": 1,
        "subtotalCentavos": 3200000
      }
    ],
    "totalCentavos": 12200000,
    "estado": "pendiente",
    "createdAt": "2026-11-25T12:00:00.000Z",
    "updatedAt": "2026-11-25T12:00:00.000Z"
  }
]
```

```json
[]
```

  - No se hace `populate` de productos: se devuelve la copia guardada en el pedido (`nombre`, `precioUnitarioCentavos`, `subtotalCentavos`), así el detalle y el total no cambian si el producto se modifica o se elimina.
  - No se incluyen contraseñas, hashes ni tokens. El campo `usuario` es el `_id` del propio usuario autenticado.

- **Errores (códigos y formato):** mismo formato del proyecto, `{ "error": "mensaje en español", "message": "el mismo mensaje" }`.

| Caso | Código | Mensaje de ejemplo |
| --- | --- | --- |
| Sin `Authorization` o token inválido/vencido | `401` | `Token inválido o ausente` / `Token inválido o vencido` |
| Error inesperado al consultar | `500` | `Ha ocurrido un error en el servidor.` |

  - Una lista vacía es una respuesta válida: `200` con `[]`. No se usa `404` para «no tenés pedidos».
  - Al igual que en la creación, para `500` se busca un mensaje genérico sin exponer detalles internos; el manejador central actual responde `err.message`.

### Reglas de negocio acordadas

Las reglas siguientes aplican a `POST /api/pedidos` y `GET /api/pedidos` y complementan los ejemplos anteriores. Son un borrador para aprobación del equipo.

- **Alcance y propiedad de los pedidos:** un pedido pertenece al usuario identificado por el token (`req.usuario.id`). `POST /api/pedidos` crea siempre a nombre de ese usuario y `GET /api/pedidos` devuelve únicamente los pedidos de ese usuario, incluso si su rol es `admin`. No se acepta `usuario` ni `usuarioId` desde el cliente, y en este sprint no existe consulta de pedidos de terceros. Las respuestas no incluyen contraseñas, hashes ni tokens.

- **Productos, cantidades y stock:**
  - `productos` debe ser un array con al menos un elemento; cada `producto` debe ser el ObjectId de un producto existente y cada `cantidad` un entero mayor o igual a 1.
  - No se aceptan productos repetidos en el mismo pedido: el frontend debe agrupar las cantidades antes de enviar.
  - Se considera que un producto tiene stock informado solo si `stock` es un número mayor o igual a 0. En ese caso, `cantidad` no puede superar `stock`; si no alcanza, o si `stock` es `0`, se responde `409`.
  - Si `stock` es `undefined`, `null` o cadena vacía, el producto se considera disponible sin límite de cantidad.
  - En este sprint **no se descuenta stock** al crear el pedido. Validar y descontar en una sola operación atómica queda como caso pendiente de acordar.

- **Precio, total y redondeo:**
  - El backend ignora cualquier `precio`, `nombre` o `total` enviado por el cliente y consulta el `precio` vigente de cada producto en la base.
  - El precio del catálogo está expresado en pesos; al crear el pedido se convierte a centavos con `Math.round(precio * 100)`.
  - Los cálculos se hacen con enteros: `subtotalCentavos = precioUnitarioCentavos * cantidad` y `totalCentavos` es la suma de los subtotales. No se usan decimales para el dinero, así se evitan errores de redondeo.
  - La moneda es el peso argentino (ARS). El frontend divide los centavos por 100 solo para mostrar.
  - Si el precio cambió entre mostrar el carrito y confirmar el pedido, gana el precio vigente al momento de crear. El frontend compara el `totalCentavos` devuelto con el que mostraba y avisa si cambió.
  - En este sprint no se aplican impuestos, descuentos, envío ni recargos al total.

- **Datos que conserva cada pedido y comportamiento si un producto cambia:** cada pedido guarda una copia del `nombre` y del `precioUnitarioCentavos` al momento de la compra, además de la referencia `producto`, la `cantidad` y el `subtotalCentavos`. Si después cambia el precio, cambia el nombre o se elimina el producto, el pedido conserva el detalle y el total originales. El pedido también guarda `usuario`, `estado` (`pendiente` por defecto) y `createdAt`/`updatedAt`. La consulta no hace `populate`: lee esa copia y no depende del estado actual del catálogo.

- **Estados del pedido:** todo pedido nuevo queda en `pendiente`. En este sprint no hay transiciones de estado, cancelación, historial de cambios ni motivos de rechazo; cualquier flujo de estados queda pendiente de acordar.

- **Orden de validación y errores:** ante un pedido nuevo se valida en este orden y se responde con el primer error encontrado:
  1. token ausente, inválido o vencido → `401`;
  2. forma del cuerpo (`productos` y `cantidad`) → `400`;
  3. productos existentes y precios válidos → `400`;
  4. stock suficiente → `409`;
  5. error inesperado al guardar → `500`.
  - Un pedido se guarda en una sola operación: si falla una validación no se guarda nada parcial.
  - Todos los errores usan `{ "error": "mensaje en español", "message": "el mismo mensaje" }`; las rutas no traducen errores por su cuenta, lo hace el manejador central.

- **Qué ocurre con el carrito ante éxito o error:** el frontend envía el pedido con el token y **solo vacía el carrito después de recibir `201`**. Ante cualquier error (`400`, `401`, `409`, `500` o fallo de red) conserva el carrito y muestra el mensaje recibido. Si el `totalCentavos` devuelto no coincide con el total que mostraba el carrito, muestra el total actualizado del backend antes de confirmar y no vacía el carrito hasta que el usuario acepte. Mientras espera la respuesta, deshabilita el botón de confirmar para evitar pedidos duplicados; el backend no implementa idempotencia en este sprint.

- **Consulta de pedidos:** `GET /api/pedidos` devuelve solo los pedidos propios, ordenados por `createdAt` descendente. Sin pedidos responde `200` con `[]`. No hay paginación ni filtros en este sprint; los parámetros de query se ignoran y no se agrega `GET /api/pedidos/:id`.

- **Otros acuerdos y casos pendientes:** quedan pendientes de acordar el descuento de stock, los estados posteriores a `pendiente`, el envío, las cancelaciones, la idempotencia de la creación y la paginación o filtros de la consulta. Registrar el pedido no cobra: no hay pasarela de pago.

### Revisión y pruebas

**Estado:** pendiente. Faltan las revisiones de 4 integrantes y la ejecución de los casos de prueba antes de aprobar el contrato.

#### Revisiones del contrato

| # | Integrante | Fecha | Resultado | Observaciones |
| --- | --- | --- | --- | --- |
| 1 | [pendiente] | [pendiente] | [pendiente] | [pendiente] |
| 2 | [pendiente] | [pendiente] | [pendiente] | [pendiente] |
| 3 | [pendiente] | [pendiente] | [pendiente] | [pendiente] |
| 4 | [pendiente] | [pendiente] | [pendiente] | [pendiente] |

Resultado posible: aprobado, aprobado con observaciones o rechazado. Las observaciones se registran en la última columna.

#### Casos de prueba

Se ejecutan **solo contra la base de desarrollo** y avisando antes, porque escriben datos. No se apunta a producción ni se ejecuta el seed de producción.

| # | Caso | Resultado esperado | Estado | Resultado / evidencia |
| --- | --- | --- | --- | --- |
| 1 | Crear un pedido válido con token | `201`; total en centavos correcto; guarda nombre y precio de cada producto | Pendiente | [pendiente] |
| 2 | Crear sin `Authorization` | `401` con `{ error, message }` | Pendiente | [pendiente] |
| 3 | Crear con token inválido o vencido | `401` con `{ error, message }` | Pendiente | [pendiente] |
| 4 | Crear con `productos` ausente, vacío o que no sea array | `400` | Pendiente | [pendiente] |
| 5 | Crear con `cantidad` `0`, negativa, decimal o texto | `400` | Pendiente | [pendiente] |
| 6 | Crear con un producto repetido | `400` | Pendiente | [pendiente] |
| 7 | Crear con un producto inexistente o un ID mal formado | `400` | Pendiente | [pendiente] |
| 8 | Crear con cantidad mayor al stock, o con stock `0` | `409` | Pendiente | [pendiente] |
| 9 | Crear con un producto sin stock informado | `201`; no se limita la cantidad | Pendiente | [pendiente] |
| 10 | Cambiar el precio del producto entre el carrito y la confirmación | El pedido usa el precio vigente y el frontend avisa del cambio | Pendiente | [pendiente] |
| 11 | Consultar los pedidos del usuario autenticado | `200`; solo pedidos propios, ordenados del más reciente al más antiguo | Pendiente | [pendiente] |
| 12 | Consultar sin tener pedidos | `200` con `[]` | Pendiente | [pendiente] |
| 13 | Consultar con dos usuarios distintos | Cada uno recibe solo sus pedidos (aislamiento) | Pendiente | [pendiente] |
| 14 | Simular un error inesperado al guardar | `500` con el formato de errores existente | Pendiente | [pendiente] |
| 15 | Frontend: error al crear y luego éxito | Conserva el carrito ante el error y lo vacía solo después del `201` | Pendiente | [pendiente] |

#### Criterio de cierre

- Las 4 revisiones están registradas.
- Todos los casos de prueba se ejecutaron y tienen resultado y evidencia.
- Si un caso falla, se corrige el código y se vuelve a ejecutar; no se modifican las pruebas ni este contrato para hacerlo pasar.

## Avance

### 25/11/2026 — «Crear pedido» documentado

- **Estado:** borrador completo, pendiente de aprobación del equipo.
- **Qué se definió:** ruta `POST /api/pedidos`, autenticación con Bearer token, cuerpo con `productos` y `cantidad`, respuesta `201`, tabla de validaciones con `400`/`401`/`409`/`500`, formato de errores existente, dinero en centavos, stock con y sin dato informado, copia del nombre y precio en cada pedido, y comportamiento del carrito ante éxito o error.
- **Decisiones del borrador a confirmar por el equipo:**
  - dinero en centavos enteros en el pedido, aunque el catálogo use pesos;
  - `409` para stock insuficiente;
  - productos repetidos rechazados con `400` (el frontend agrupa cantidades);
  - no se descuenta stock al crear el pedido.
- **Pendiente para completar el contrato:** integrantes que revisaron y casos de prueba con resultados («Consultar mis pedidos» se completó el 26/11/2026).
- **Implementación pendiente (fuera de esta tarea de documentación):**
  - `models/Pedido.js` con `usuario`, `productos`, `totalCentavos` y `estado`;
  - `routes/pedidosRoutes.js` con `verificarToken`, `POST /` y `GET /`;
  - montar el router en `server.js` como `/api/pedidos`;
  - conectar el botón de confirmar del carrito con la API y vaciarlo solo tras `201`;
  - vista de «Mis pedidos» en el frontend, con estado vacío y mensaje ante `401`;
  - pruebas del contrato para pedido válido, validaciones, sin token y aislamiento entre usuarios, usando solo la base de desarrollo.
- **Archivos modificados:** `docs/contrato-pedidos.md` (único archivo).

### 26/11/2026 — «Consultar mis pedidos» documentado

- **Estado:** borrador completo, pendiente de aprobación del equipo.
- **Qué se definió:** `GET /api/pedidos`; autenticación obligatoria; filtro por `usuario: req.usuario.id`; solo pedidos propios; orden por `createdAt` descendente; `200` con array, incluido `[]`; sin paginación ni filtros; misma forma de pedido que en la creación; sin `populate`; errores `401` y `500` con el formato existente.
- **Decisiones del borrador a confirmar por el equipo:**
  - ruta única de lista, sin `GET /api/pedidos/:id`;
  - sin paginación ni filtros en este sprint;
  - orden del más reciente al más antiguo.
- **Pendiente para completar el contrato:** integrantes que revisaron y casos de prueba con resultados.
- **Implementación pendiente:** `GET /` en `routes/pedidosRoutes.js` con `verificarToken`, filtro `{ usuario: req.usuario.id }` y `.sort({ createdAt: -1 })`; vista de «Mis pedidos» en el frontend con estado vacío; pruebas de aislamiento entre usuarios.
- **Archivos modificados:** `docs/contrato-pedidos.md` (único archivo).

### 26/11/2026 — Reglas de negocio consolidadas

- **Estado:** borrador completo, pendiente de aprobación del equipo.
- **Qué se definió:** propiedad de los pedidos; validación de productos, cantidades y stock; precio vigente y cálculo en centavos; copia del pedido ante cambios del catálogo; estado inicial `pendiente`; orden de validación `401 → 400 → 409 → 500`; comportamiento del carrito ante éxito o error; alcance de la consulta; casos pendientes.
- **Decisiones del borrador a confirmar por el equipo:**
  - precio del pedido en centavos enteros y moneda ARS;
  - stock validado pero no descontado en este sprint;
  - sin idempotencia, sin estados adicionales y sin envío, impuestos ni descuentos;
  - orden de validación y `409` para stock insuficiente.
- **Pendiente para completar el contrato:** integrantes que revisaron y casos de prueba con resultados.
- **Implementación pendiente:** estas reglas se implementan junto con `models/Pedido.js` y `routes/pedidosRoutes.js`; no se modificó código en esta tarea.
- **Archivos modificados:** `docs/contrato-pedidos.md` (único archivo).

### 26/11/2026 — Revisión y pruebas preparadas (pendientes)

- **Estado:** pendiente de 4 revisiones y de ejecutar los 15 casos de prueba.
- **Qué se dejó preparado:** tabla con 4 lugares para revisores (integrante, fecha, resultado y observaciones), 15 casos de prueba con estado «Pendiente» y columna de resultado/evidencia vacía, y criterio de cierre.
- **Pendiente:** que los 4 integrantes completen su revisión y que el equipo ejecute las pruebas contra la base de desarrollo, con aviso previo.
- **Pruebas ejecutadas en esta tarea:** ninguna; solo se documentó el plan.
- **Archivos modificados:** `docs/contrato-pedidos.md` (único archivo).
