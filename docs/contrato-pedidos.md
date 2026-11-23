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
**Fecha y revisión:** [completar]

### Crear pedido

- Método y ruta: [completar]
- Autenticación: [completar]
- Cuerpo de la solicitud (ejemplo JSON): [completar]
- Respuesta exitosa y código HTTP (ejemplo JSON): [completar]
- Validaciones y errores (códigos y formato): [completar]

### Consultar mis pedidos

- Método y ruta: [completar]
- Autenticación y alcance de la consulta: [completar]
- Respuesta exitosa y código HTTP (ejemplo JSON, incluyendo lista vacía): [completar]
- Errores (códigos y formato): [completar]

### Reglas de negocio acordadas

- Productos, cantidades y stock: [completar]
- Precio, total y redondeo: [completar]
- Datos que conserva cada pedido y comportamiento si un producto cambia: [completar]
- Qué ocurre con el carrito ante éxito o error: [completar]
- Otros acuerdos y casos pendientes: [completar]

### Revisión y pruebas

- Integrantes que revisaron el contrato: [completar]
- Casos de prueba y resultados: [completar]
