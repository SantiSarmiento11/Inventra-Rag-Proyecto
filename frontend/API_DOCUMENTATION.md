# Documentación de la API del Frontend (Inventra)

Esta documentación describe la arquitectura de comunicación, los servicios HTTP y los contratos de datos utilizados por el Frontend de **Inventra**.

---

## 1. Arquitectura de Conexión

El frontend es una aplicación de una sola página (**SPA**) construida en JavaScript Vanilla (`ES6+`) sin dependencias externas, estructurada bajo dos capas principales:

* **Configuración Central (`frontend/js/config.js`):** Gestiona las URLs base del backend, rutas de endpoints, almacenamiento seguro de sesión (`JWT Token`) y configuración del Webhook para el RAG.
* **Capa de Servicios REST (`frontend/js/api.js`):** Cliente HTTP basado en `fetch` con interceptores para inyección de cabeceras `Authorization: Bearer <token>`, manejo unificado de errores y control de expiración de sesión (código `401 Unauthorized`).

---

## 2. Endpoints del Backend Spring Boot (PostgreSQL)

Todas las rutas operan bajo la URL base por defecto: `http://localhost:8080/api`.

### 2.1. Autenticación y Sesión (`usuarios`)
* **`POST /auth/login`**: Inicio de sesión.
  * **Payload:** `{ "email": "usuario@ejemplo.com", "password": "..." }`
  * **Respuesta:** `{ "token": "jwt...", "user": { "id_usuario": 1, "nombre": "...", "email": "...", "roles": [...] } }`
* **`GET /auth/me`**: Validación del token actual y perfil del usuario autenticado.
* **`POST /auth/logout`**: Cierre de sesión e invalidación de token local.

### 2.2. Gestión de Productos (`productos`)
* **`GET /productos`**: Lista completa del catálogo de productos con stock, precio y estado.
* **`GET /productos/{id}`**: Detalle de un producto por ID.
* **`POST /productos`**: Registro de un nuevo producto.
* **`PUT /productos/{id}`**: Actualización completa de datos de un producto.
* **`PATCH /productos/{id}/stock`**: Ajuste incremental o corrección manual de stock.
* **`PATCH /productos/{id}/estado`**: Cambio de estado operativo (Activo / Inactivo).
* **`DELETE /productos/{id}`**: Eliminación lógica o física de un producto.

### 2.3. Métricas y Analítica (`dashboard`)
* **`GET /dashboard/resumen`**: Retorna el conteo total de productos, unidades en stock, valorización económica total del inventario y desglose de stock por categorías.
* **`GET /dashboard/stock-critico`**: Lista de productos cuyas existencias están en o por debajo del umbral mínimo permitido (`stock <= stock_minimo`).

### 2.4. Control de Acceso Basado en Roles (RBAC)
* **`GET /roles`**: Lista de roles definidos (`ADMINISTRADOR`, `SUPERVISOR`, `OPERADOR`).
* **`GET /roles/{id}/permisos`**: Matriz de permisos asociados a un rol específico.
* **`GET /usuarios`**: Lista de usuarios registrados en el sistema.
* **`PATCH /usuarios/{id}/roles`**: Asignación o revocación de roles a un usuario.

---

## 3. Integración RAG (Retrieval-Augmented Generation)

El Frontend incluye una vista interactiva de chat asistido por Inteligencia Artificial conectada al Webhook de n8n.

### 3.1. Método `ApiService.consultarRag(pregunta)`
Ubicación: [`frontend/js/api.js`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/frontend/js/api.js)

* **URL de Destino:** `http://localhost:5678/webhook/inventario-rag`
* **Método:** `POST`
* **Timeout Estricto:** `20 segundos` gestionado mediante `AbortController`. Si n8n no responde en este lapso, el frontend cancela la petición y notifica al usuario.

### 3.2. Estructura del Payload Enviado al RAG
```json
{
  "consulta": "¿Cuáles son los productos con stock crítico?",
  "endpoint": "/rag/consulta",
  "timestamp": "2026-11-09T04:30:00.000Z",
  "origen": "Inventra Frontend RAG Client",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Administrador General",
    "email": "admin@inventra.local",
    "roles": ["ADMINISTRADOR"]
  },
  "contexto_inventario": {
    "total_productos": 8,
    "stock_total": 116,
    "valor_monetario_total": 7305.00,
    "productos_activos": 8,
    "productos_stock_critico": ["PROD-002", "PROD-008"]
  }
}
```

### 3.3. Estructura de Respuesta Esperada de n8n
```json
{
  "respuesta": "Actualmente existen **2 productos** en estado de alerta por stock crítico: ...",
  "fuente": "n8n RAG (DeepSeek + Qdrant + NVIDIA Nemotron)",
  "timestamp": "2026-11-09T04:30:02.150Z"
}
```

---

## 4. Énfasis: Carga de Datos Simulada a la Base de Datos Vectorial (Qdrant)

Una base de datos vectorial no lee directamente tablas relacionales SQL. Para que el RAG pueda realizar **búsqueda semántica**, los datos deben someterse a un proceso de ingesta donde el texto se traduce a vectores matemáticos de alta dimensión.

### 4.1. El Generador de Ingesta: `poblar_qdrant.py`
Se dispone del script [`poblar_qdrant.py`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/poblar_qdrant.py) que realiza una carga simulada y enriquecida del catálogo hacia Qdrant.

1. **Datos Simulados Inyectados:**
   * 8 registros de productos de tecnología corporativa (Laptops ThinkPad, Servidores Rack Dell PowerEdge, Switches Cisco Catalyst, Monitores 4K UHD, SSDs NVMe Samsung, Periféricos Logitech).
   * Dos de ellos configurados intencionalmente con **Stock Crítico** (Monitor Dell con 2 unidades y Cámara Web con 1 unidad) para probar las capacidades de alerta del modelo.

2. **Modelo de Embeddings (NVIDIA Nemotron):**
   * **Modelo:** `nvidia/nemotron-3.5-embed-1b`
   * **Dimensiones vectoriales:** `2048 dimensiones flotantes`.
   * **Modo de inferencia:** Requiere estrictamente `"input_type": "passage"` durante la indexación.
   * **Estrategia de llamada:** Peticiones individuales secuenciales con pausa de 150 ms para evitar el error de saturación en la nube de NVIDIA (`500 service inference failed`).

3. **Estructura Crítica del Payload en Qdrant para Compatibilidad Total:**
   Para que n8n y LangChain puedan leer el texto recuperado de cada punto vectorial sin devolver arrays vacíos ni textos en blanco, el script almacena el texto bajo todas las claves estándar reconocidas:
   ```json
   {
     "id": 1,
     "vector": [0.0749, 0.0339, -0.0424, "... (2048 valores)"],
     "payload": {
       "content": "PRODUCTO: Laptop Lenovo ThinkPad T14 Gen 4\nCÓDIGO: PROD-001\nCATEGORÍA: Computación...",
       "text": "PRODUCTO: Laptop Lenovo ThinkPad T14 Gen 4...",
       "document": "PRODUCTO: Laptop Lenovo ThinkPad T14 Gen 4...",
       "pageContent": "PRODUCTO: Laptop Lenovo ThinkPad T14 Gen 4...",
       "metadata": {
         "id": 1,
         "codigo": "PROD-001",
         "nombre": "Laptop Lenovo ThinkPad T14 Gen 4",
         "categoria": "Computación / Portátiles",
         "precio": 1250.00,
         "stock": 15,
         "stock_minimo": 5,
         "ubicacion": "Estante A-12"
       }
     }
   }
   ```
   > **Nota Técnica:** n8n busca prioritariamente la clave `payload.content`. Al incluirla explícitamente, la herramienta de LangChain en n8n extrae el contenido sin problemas y se lo suministra a DeepSeek para formular la respuesta.
