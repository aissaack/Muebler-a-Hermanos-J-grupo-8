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

**Responsable:** Belén

**Fecha y revisión:** 26/11/2026 — elaborado por Belén y revisado por Isaac; implementación y pruebas pendientes.

### Crear pedido

- **Método y ruta:** `POST /api/pedidos`. Router `routes/pedidosRoutes.js`, montado en `server.js` como `/api/pedidos`.

- **Autenticación:** obligatoria con `Authorization: Bearer <token>` mediante el middleware existente `verificarToken`. El `usuario` del pedido se toma de `req.usuario.id`, que sale del token firmado. El cuerpo **no** incluye datos del usuario: si el cliente manda `usuario` o `usuarioId`, se ignora. Sin token, token inválido o vencido → `401`.

- **Clave de intento:** enviar el encabezado obligatorio `Idempotency-Key` con una clave única generada por el frontend para cada confirmación. Un reintento de la misma solicitud reutiliza la clave; una compra nueva o una solicitud modificada usa otra. Una clave ausente o vacía responde `400`.

- **Cuerpo de la solicitud (ejemplo JSON):**

```json
{
  "productos": [
    { "producto": "6712f0a1c3e9a1b2c3d4e5f6", "cantidad": 2, "precioEsperadoCentavos": 4500000 },
    { "producto": "6712f0a1c3e9a1b2c3d4e5f7", "cantidad": 1, "precioEsperadoCentavos": 3200000 }
  ]
}
```

  - `productos`: array obligatorio, con al menos un elemento.
  - `producto`: `_id` del producto como string de ObjectId válido.
  - `cantidad`: entero mayor o igual a 1.
  - `precioEsperadoCentavos`: precio unitario mostrado y confirmado por el cliente, en centavos enteros no negativos. Se usa únicamente para detectar cambios; el backend no confía en él para calcular el pedido.
  - No se envían `nombre` ni `total` como valores autoritativos: el backend los obtiene y calcula con los precios de la base.

- **Respuesta exitosa y código HTTP (ejemplo JSON):** `201 Created`. Un reintento idéntico con la misma clave y usuario devuelve el mismo pedido y `201`, sin volver a descontar stock.

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
| `precioEsperadoCentavos` ausente o inválido | `400` | `El precio esperado no es válido` |
| Uno o más productos no existen | `400` | `Uno o más productos no existen` |
| Stock numérico menor que la cantidad pedida (incluye stock `0`) | `409` | `Stock insuficiente para Silla Nórdica` |
| Producto sin stock informado | `409` | `El producto no tiene stock informado` |
| El precio de uno o más productos cambió | `409` | `Los precios cambiaron. Revisá el carrito antes de confirmar` |
| Misma clave de intento con datos distintos | `409` | `La clave de intento ya se usó con otros datos` |
| Producto con `precio` no numérico, cero o negativo | `400` | `El precio de uno o más productos no es válido` |
| Error inesperado al guardar | `500` | `Ha ocurrido un error en el servidor.` |

  - `stock` ausente, `null` o cadena vacía significa **sin stock informado**: no se puede pedir hasta que un administrador cargue stock. La validación actual de productos admite stock opcional; esta es una regla adicional para pedidos.
  - Los errores previstos tienen mensajes claros y personalizados. Ante un `500` se responde con un mensaje genérico, sin exponer detalles internos, que pueden registrarse en el servidor. El manejador central actual responde con `err.message`; la implementación debe resolverlo para pedidos sin cambiar el formato ni los mensajes de las rutas existentes.
  - Campos extra en el cuerpo se ignoran; los precios esperados no se usan como precios de venta ni se aceptan totales calculados por el cliente.
  - Los conflictos de pedidos incluyen `codigo` además de `error` y `message`: `PRECIO_CAMBIADO`, `STOCK_INSUFICIENTE`, `STOCK_NO_INFORMADO` o `CLAVE_REUTILIZADA`. El frontend usa ese código estable para distinguirlos.
  - Si cambió algún precio, no se crea el pedido ni se descuenta stock. El frontend vuelve a consultar los productos públicos, actualiza el carrito y pide una nueva confirmación. Si vuelve a cambiar, se repite la comparación.
  - Un JSON mal formado lo rechaza `express.json()` y el manejador central responde `400`.

Ejemplo de respuesta `409` por cambio de precio:

```json
{
  "error": "Los precios cambiaron. Revisá el carrito antes de confirmar",
  "message": "Los precios cambiaron. Revisá el carrito antes de confirmar",
  "codigo": "PRECIO_CAMBIADO"
}
```

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
  - Agregar o mantener productos en el carrito no reserva ni descuenta stock. La disponibilidad se comprueba al confirmar el pedido.
  - `productos` debe ser un array con al menos un elemento; cada `producto` debe ser el ObjectId de un producto existente y cada `cantidad` un entero mayor o igual a 1.
  - No se aceptan productos repetidos en el mismo pedido: el frontend debe agrupar las cantidades antes de enviar.
  - Se considera que un producto tiene stock informado solo si `stock` es un número mayor o igual a 0. En ese caso, `cantidad` no puede superar `stock`; si no alcanza, o si `stock` es `0`, se responde `409`.
  - Si `stock` es `undefined`, `null` o cadena vacía, se rechaza el pedido con `409` hasta que un administrador informe el stock.
  - Al crear el pedido se descuentan las cantidades compradas. La comparación de precios, el descuento de todos los productos y la creación del pedido ocurren en una misma transacción: si cualquiera falla, no queda ningún descuento ni pedido parcial. Si un producto cambia durante la operación, se repite la validación antes de confirmar. Las compras simultáneas no deben permitir stock negativo. La implementación deberá verificar que MongoDB de desarrollo y producción admita transacciones.

- **Precio, total y redondeo:**
  - El backend consulta el `precio` vigente de cada producto, que debe ser numérico y mayor que cero, y usa `precioEsperadoCentavos` solo para compararlo con el precio que vio el cliente. Ignora los nombres y totales enviados por el cliente.
  - El precio del catálogo está expresado en pesos; al crear el pedido se convierte a centavos enteros, redondeando al centavo más cercano y, en un empate exacto, hacia arriba. La conversión debe evitar errores de representación decimal: no se considera suficiente usar `Math.round(precio * 100)` sin verificar los casos problemáticos.
  - Los cálculos posteriores se hacen con enteros: `subtotalCentavos = precioUnitarioCentavos * cantidad` y `totalCentavos` es la suma de los subtotales. Se deben probar importes decimales, incluidos los casos de empate.
  - La moneda es el peso argentino (ARS). El frontend divide los centavos por 100 solo para mostrar.
  - Al abrir o actualizar el carrito, el frontend consulta los productos actuales y muestra los precios y el total actualizados. Al confirmar envía los precios unitarios mostrados; el backend los compara con los vigentes antes de guardar. Si alguno cambió, responde `409`, sin guardar ni descontar stock, y el frontend actualiza los precios y pide otra confirmación. Solo se crea el pedido con precios vigentes que coincidan con los confirmados por el cliente.
  - En este sprint no se aplican impuestos, descuentos, envío ni recargos al total.

- **Datos que conserva cada pedido y comportamiento si un producto cambia:** cada pedido guarda una copia del `nombre` y del `precioUnitarioCentavos` al momento de la compra, además de la referencia `producto`, la `cantidad` y el `subtotalCentavos`. Si después cambia el precio, cambia el nombre o se elimina el producto, el pedido conserva el detalle y el total originales. El pedido también guarda `usuario`, `estado` (`pendiente` por defecto) y `createdAt`/`updatedAt`. La consulta no hace `populate`: lee esa copia y no depende del estado actual del catálogo.

- **Estados del pedido:** todo pedido nuevo queda en `pendiente`. En este sprint no hay transiciones de estado, cancelación, historial de cambios ni motivos de rechazo; cualquier flujo de estados queda pendiente de acordar.

- **Orden de validación y errores:** ante un pedido nuevo se valida en este orden y se responde con el primer error encontrado:
  1. token ausente, inválido o vencido → `401`;
  2. forma del cuerpo (`productos` y `cantidad`) → `400`;
  3. productos existentes y precios válidos → `400`;
  4. precios sin cambios y stock suficiente → `409` si no se cumplen;
  5. error inesperado al guardar → `500`.
  - Un pedido se guarda en una sola operación: si falla una validación no se guarda nada parcial.
  - Todos los errores usan `{ "error": "mensaje en español", "message": "el mismo mensaje" }`; las rutas no traducen errores por su cuenta, lo hace el manejador central.

- **Reintentos:** el backend guarda la clave de intento junto al pedido y la vincula al usuario autenticado y a los datos de la solicitud. La combinación de usuario y clave debe ser única, incluso con solicitudes simultáneas. Una solicitud idéntica devuelve el pedido guardado sin crear otro ni descontar nuevamente; usar la misma clave con datos diferentes devuelve `409` y `codigo: "CLAVE_REUTILIZADA"`. La clave de un usuario no permite acceder a pedidos de otro.

- **Qué ocurre con el carrito ante éxito o error:** el frontend envía el pedido con el token y **solo vacía el carrito después de recibir `201`**, incluso si es la respuesta a un reintento. Ante cualquier error (`400`, `401`, `409`, `500` o fallo de red) conserva el carrito y muestra el mensaje recibido. Si se pierde la respuesta, conserva los datos y la clave para reintentar la misma solicitud. Si cambian precios, actualiza el carrito y pide nueva confirmación con una nueva clave. Mientras espera la respuesta, deshabilita el botón de confirmar.

- **Actualización del carrito:** si un producto fue eliminado, se informa cuál ya no está disponible y se conserva el carrito hasta que el cliente lo ajuste. Si falla la consulta, se avisa y se conserva el carrito. En ambos casos se impide confirmar hasta ajustar el carrito o consultar de nuevo correctamente.

- **Consulta de pedidos:** `GET /api/pedidos` devuelve solo los pedidos propios, ordenados por `createdAt` descendente. Sin pedidos responde `200` con `[]`. No hay paginación ni filtros en este sprint; los parámetros de query se ignoran y no se agrega `GET /api/pedidos/:id`.

- **Otros acuerdos y casos pendientes:** quedan pendientes los estados posteriores a `pendiente`, el envío, las cancelaciones y la paginación o filtros de la consulta. Registrar el pedido no cobra: no hay pasarela de pago.

### Revisión y pruebas

**Estado:** elaborado por Belén y verificado por Isaac. La implementación y las pruebas siguen pendientes; el contrato aún no está probado.

#### Revisiones del contrato

| # | Integrante | Fecha | Resultado | Observaciones |
| --- | --- | --- | --- | --- |
| 1 | Isaac | 26/11/2026 | Verificado con observaciones | Stock, errores, redondeo y flujo de cambios de precio actualizados según sus indicaciones. |

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
| 9 | Crear con un producto sin stock informado | `409`; no se crea el pedido ni se descuenta stock | Pendiente | [pendiente] |
| 10 | Cambiar el precio del producto entre mostrar el carrito y confirmar | `409`; no se guarda ni descuenta, se actualiza el carrito y se solicita nueva confirmación | Pendiente | [pendiente] |
| 11 | Consultar los pedidos del usuario autenticado | `200`; solo pedidos propios, ordenados del más reciente al más antiguo | Pendiente | [pendiente] |
| 12 | Consultar sin tener pedidos | `200` con `[]` | Pendiente | [pendiente] |
| 13 | Consultar con dos usuarios distintos | Cada uno recibe solo sus pedidos (aislamiento) | Pendiente | [pendiente] |
| 14 | Simular un error inesperado al guardar | `500` con el formato de errores existente | Pendiente | [pendiente] |
| 15 | Frontend: error al crear y luego éxito | Conserva el carrito ante el error y lo vacía solo después del `201` | Pendiente | [pendiente] |
| 16 | Compra válida con varios productos | Se crea el pedido y se descuentan todas las cantidades | Pendiente | [pendiente] |
| 17 | Un producto del pedido no tiene suficiente stock | No se crea el pedido ni se descuenta ninguno | Pendiente | [pendiente] |
| 18 | Compras simultáneas de la última unidad | Como máximo una compra tiene éxito y el stock no queda negativo | Pendiente | [pendiente] |
| 19 | Convertir precios decimales, incluidos empates | Los centavos cumplen la regla de redondeo acordada | Pendiente | [pendiente] |
| 20 | Conflictos de precio, stock insuficiente y stock no informado | Cada `409` incluye su `codigo` estable y el formato de errores | Pendiente | [pendiente] |
| 21 | Crear con precio de catálogo cero | `400`; no se crea el pedido ni se descuenta stock | Pendiente | [pendiente] |
| 22 | Precio o stock cambia durante la confirmación | Se vuelve a validar; nunca se confirma un precio no aceptado ni stock negativo | Pendiente | [pendiente] |
| 23 | Fallo al descontar o guardar un pedido con varios productos | La transacción no deja descuentos ni pedido parcial | Pendiente | [pendiente] |
| 24 | Reintentar la misma solicitud con la misma clave | Se devuelve el mismo pedido; existe un solo pedido y un solo descuento | Pendiente | [pendiente] |
| 25 | Reutilizar la misma clave con datos diferentes | `409` con `CLAVE_REUTILIZADA`; no se crea otro pedido | Pendiente | [pendiente] |
| 26 | Producto eliminado o falla al actualizar el carrito | Se conserva el carrito, se informa el problema y se impide confirmar | Pendiente | [pendiente] |

#### Criterio de cierre

- Están registrados Belén como autora e Isaac como revisor.
- Todos los casos de prueba se ejecutaron y tienen resultado y evidencia.
- Si un caso falla, se corrige el código y se vuelve a ejecutar; no se modifican las pruebas ni este contrato para hacerlo pasar.

## Avance

Las entradas siguientes son un registro histórico de los borradores y pueden contener decisiones reemplazadas. Prevalecen las reglas actuales del contrato; en particular, el stock se descuenta y no se requieren cuatro revisiones.

### 25/11/2026 — «Crear pedido» documentado

- **Estado:** borrador completo, pendiente de aprobación del equipo.
- **Qué se definió:** ruta `POST /api/pedidos`, autenticación con Bearer token, cuerpo con `productos` y `cantidad`, respuesta `201`, tabla de validaciones con `400`/`401`/`409`/`500`, formato de errores existente, dinero en centavos, stock con y sin dato informado, copia del nombre y precio en cada pedido, y comportamiento del carrito ante éxito o error.
- **Decisiones del borrador a confirmar por el equipo:**
  - dinero en centavos enteros en el pedido, aunque el catálogo use pesos;
  - `409` para stock insuficiente;
  - productos repetidos rechazados con `400` (el frontend agrupa cantidades);
  - no se descuenta stock al crear el pedido. **Reemplazado:** ver reglas actuales de stock.
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
  - stock validado pero no descontado en este sprint; **reemplazado:** ver reglas actuales de stock;
  - sin idempotencia; **reemplazado:** ver reglas actuales de reintentos. Sin estados adicionales y sin envío, impuestos ni descuentos;
  - orden de validación y `409` para stock insuficiente.
- **Pendiente para completar el contrato:** integrantes que revisaron y casos de prueba con resultados.
- **Implementación pendiente:** estas reglas se implementan junto con `models/Pedido.js` y `routes/pedidosRoutes.js`; no se modificó código en esta tarea.
- **Archivos modificados:** `docs/contrato-pedidos.md` (único archivo).

### 26/11/2026 — Revisión y pruebas preparadas (pendientes)

- **Estado histórico reemplazado:** ya no se requieren cuatro revisiones; ver estado y pruebas actuales.
- **Qué se dejó preparado:** tabla con 4 lugares para revisores (integrante, fecha, resultado y observaciones), 15 casos de prueba con estado «Pendiente» y columna de resultado/evidencia vacía, y criterio de cierre.
- **Pendiente:** que los 4 integrantes completen su revisión y que el equipo ejecute las pruebas contra la base de desarrollo, con aviso previo.
- **Pruebas ejecutadas en esta tarea:** ninguna; solo se documentó el plan.
- **Archivos modificados:** `docs/contrato-pedidos.md` (único archivo).

### 26/11/2026 — Decisiones posteriores a la revisión

- **Autoría y revisión:** Belén elaboró el contrato e Isaac lo verificó; no se requieren cuatro revisiones.
- **Stock:** es obligatorio informarlo para poder comprar, y se descuenta junto con la creación atómica del pedido. Si falla algún producto, no se guarda ni descuenta nada.
- **Errores y dinero:** mensajes personalizados para errores previstos y mensaje genérico para `500` en pedidos; importes en centavos con redondeo definido y pruebas de decimales.
- **Cambio de precio:** decisión posterior: actualizar precios al mostrar el carrito y pedir nueva confirmación si cambian al enviar. Ningún caso de prueba se ha ejecutado para estas decisiones.

### 26/11/2026 — Inconsistencias del contrato resueltas

- Se definieron códigos estables de conflicto, transacciones para precio y stock, clave de idempotencia y tratamiento de productos no disponibles o consultas fallidas.
- Se actualizaron los casos de prueba; todos continúan pendientes de ejecución. No se modificó código.
