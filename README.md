# Inventra - Front-end de Gestión de Inventario

Front-end minimalista, profesional y de alto rendimiento construido con **HTML5, CSS3 y JavaScript Vanilla**, diseñado con colores mate, desvanecidos continuos y microinteracciones de color.

La arquitectura de la aplicación y la especificación de sus endpoints se basan **estrictamente en el Modelo Entidad-Relación (MER)**:

- `usuarios`
- `roles`
- `permisos`
- `usuarios_roles` (relación N:M)
- `roles_permisos` (relación N:M)
- `productos`

---

## 1. Análisis de Marca e Identidad: Logo `Inventra.png`

Ubicación del recurso: `assets/Inventra.png`

### 1.1. Atributos Visuales y Semióticos
- **Nombre de Marca:** **Inventra** (acrónimo conceptual de *Inventario*, *Innovación* y *Trazabilidad*).
- **Isotipo Central:**
  - **Caja de Embalaje Isométrica:** Representa el núcleo operativo del inventario, almacén y distribución física de productos.
  - **Portapapeles con Verificación (*Check*):** Superpuesto en el plano frontal derecho, simboliza control de calidad, auditoría, precisión contable y validación de stock en tiempo real.
- **Tipografía:** Tipografía *sans-serif* contemporánea de peso grueso (*bold / grotesque*), con curvas limpias, alta legibilidad a escala reducida y proporciones balanceadas.
- **Estética Cromática:** Esquema monocromático mate de alto contraste (gráficos blanco puro sobre fondo oscuro profundo), lo que transmite solidez, orden y un perfil corporativo sobrio.

### 1.2. Aplicación en la Interfaz
1. **Pantalla de Inicio de Sesión (`Login`):** El logotipo encabeza el formulario de acceso dentro de un contenedor mate oscuro con borde suave y sombra difusa, sirviendo como punto de anclaje visual primario.
2. **Barra Lateral (`Sidebar Header`):** Se adapta el isotipo en formato miniatura nítido junto al identificador de la aplicación en todas las vistas de navegación.
3. **Consola y Documentación del MER:** La identidad se proyecta en el encabezado general como sistema homologado para el Backend.

---

## 2. Página de Inicio de Sesión Separada (`login.html`) y Animación Minimalista

La autenticación está desacoplada de la interfaz operativa principal en un documento independiente ([`login.html`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/login.html)) con layout dividido (*split-screen*) y hoja de estilos dedicada ([`css/login.css`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/css/login.css)).

### 2.1. Animación Vectorial SVG del Isotipo
En el panel izquierdo se integra la animación SVG minimalista secuencial:
1. **Trazo Perimetral de la Caja (`.box-path`):** Dibujo progresivo mediante `stroke-dasharray: 1000` y `stroke-dashoffset` en `1.6s` con curva `cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Relleno Sólido (`.box-fill`):** Desvanecido de opacidad (`fadeInFill`) en `0.6s` con retardo tras el trazado.
3. **Aparición del Portapapeles (`.clipboard-frame`, `.clip`):** Efecto de escala elástica (`popIn` con `cubic-bezier(0.34, 1.56, 0.64, 1)`).
4. **Dibujo del Checkmark (`.checkmark`):** Trazado fluido del vector de verificación en `0.6s`.
5. **Aparición Tipográfica (`.brand-name`):** Desplazamiento vertical y desvanecido de la palabra "Inventra".
6. **Flotación Continua (`.floating-logo`):** Oscilación suave e infinita en el eje Y (`subtleFloat` en ciclo de `4.5s`).

### 2.2. Flujo de Navegación y Sesión
- **Protección de Ruta:** Si un usuario intenta acceder directamente a `index.html` sin una sesión activa en `API_CONFIG`, el orquestador redirige inmediatamente a `login.html`.
- **Transición tras Autenticación:** Al ingresar credenciales válidas, el formulario ejecuta una transición de salida y redirige a `index.html#dashboard`.
- **Cierre de Sesión:** El botón de salida en el panel de control invoca `ApiService.logout()`, revoca el token y transfiere el control de vuelta a `login.html`.
- **Cuentas Demo 1-Clic del MER:** Permite cargar con un toque a Carlos Mendoza (`ADMINISTRADOR`), Elena Ramos (`ENCARGADO_INVENTARIO`), Mauricio Restrepo (`CONSULTOR`) o verificar el bloqueo con Diana Torres (`INACTIVA`).

---

## 3. Catálogo Exhaustivo de Endpoints REST (Front-end <-> Backend)

La capa de comunicación HTTP reside en [`js/api.js`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/js/api.js) y se configura en [`js/config.js`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/js/config.js). Soporta conmutación instantánea entre **Modo Simulado (Local)** y **Modo API Real (Backend Externo)**.

### 3.1. Autenticación y Perfil (Tabla: `usuarios`)

#### `POST /api/auth/login`
Autentica credenciales de usuario y genera el token de sesión.
- **Cabeceras:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "carlos.mendoza@empresa.com",
  "password": "password123"
}
```
- **Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiY2FybG9zLm1lbmRvemFAZW1wcmVzYS5jb20ifQ...",
  "tokenType": "Bearer",
  "user": {
    "id_usuario": 1,
    "nombre": "Carlos Andrés Mendoza",
    "email": "carlos.mendoza@empresa.com",
    "estado": true,
    "fecha_creacion": "2026-01-15 09:30:00",
    "roles": [
      {
        "id_rol": 1,
        "nombre": "ADMINISTRADOR"
      }
    ]
  }
}
```
- **Respuestas de Error:**
  - `404 Not Found`: Si el correo no existe en la base de datos.
  - `403 Forbidden`: Si el usuario está inactivo (`estado: false`).
  - `401 Unauthorized`: Si la contraseña es errónea.

---

#### `POST /api/auth/logout`
Invalida el token activo en el servidor y limpia la sesión.
- **Cabeceras:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "message": "Sesión finalizada exitosamente"
}
```

---

#### `GET /api/auth/me`
Recupera los datos del usuario en sesión a partir de su token.
- **Cabeceras:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "id_usuario": 1,
  "nombre": "Carlos Andrés Mendoza",
  "email": "carlos.mendoza@empresa.com",
  "estado": true,
  "roles": [
    { "id_rol": 1, "nombre": "ADMINISTRADOR" }
  ]
}
```
- **Response `401 Unauthorized`:** Si el token no existe, está alterado o expiró.

---

### 3.2. Catálogo de Productos (Tabla: `productos`)

| Atributo MER | Tipo SQL | Restricción |
|---|---|---|
| `id_producto` | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `descripcion` | TEXT | Nullable |
| `precio` | DECIMAL(10,2) | NOT NULL |
| `stock` | INT | DEFAULT 0 |
| `estado` | BOOLEAN | DEFAULT TRUE |
| `fecha_creacion`| TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### `GET /api/productos`
Obtiene todos los productos registrados.
- **Response `200 OK`:**
```json
[
  {
    "id_producto": 1,
    "nombre": "Sensor Óptico Industrial Pro",
    "descripcion": "Sensor fotoeléctrico reflectivo 24V NPN",
    "precio": 84.50,
    "stock": 42,
    "estado": true,
    "fecha_creacion": "2026-01-20 08:00:00"
  }
]
```

#### `GET /api/productos/{id}`
Obtiene un producto por su clave primaria.
- **Response `200 OK`** o `404 Not Found`.

#### `POST /api/productos`
Registra un nuevo producto en el catálogo.
- **Request Body:**
```json
{
  "nombre": "Relé de Seguridad 2 Canales",
  "descripcion": "Módulo de parada de emergencia categoría 4",
  "precio": 145.00,
  "stock": 12,
  "estado": true
}
```
- **Response `201 Created`:** Retorna el objeto creado con su `id_producto` asignado y `fecha_creacion`.

#### `PUT /api/productos/{id}`
Actualiza campos descriptivos, precio o stock de un producto.
- **Request Body:**
```json
{
  "nombre": "Relé de Seguridad 2 Canales V2",
  "descripcion": "Nueva versión con contactos dorados",
  "precio": 152.00,
  "stock": 20,
  "estado": true
}
```
- **Response `200 OK`**

#### `PATCH /api/productos/{id}/estado`
Alterna rápidamente la disponibilidad operativa del producto.
- **Request Body:** `{"estado": false}`
- **Response `200 OK`**

#### `DELETE /api/productos/{id}`
Elimina físicamente el registro de la tabla `productos`.
- **Response `204 No Content`**

---

### 3.3. Gestión de Usuarios y Roles (Tablas: `usuarios` y `usuarios_roles`)

#### `GET /api/usuarios`
Lista todos los usuarios del sistema junto con el arreglo de roles asociados mediante la tabla intermedia `usuarios_roles`.
- **Response `200 OK`:**
```json
[
  {
    "id_usuario": 1,
    "nombre": "Carlos Andrés Mendoza",
    "email": "carlos.mendoza@empresa.com",
    "estado": true,
    "fecha_creacion": "2026-01-15 09:30:00",
    "roles": [
      { "id_rol": 1, "nombre": "ADMINISTRADOR", "descripcion": "Control total de la plataforma" }
    ]
  }
]
```

#### `POST /api/usuarios`
Crea un nuevo usuario e inserta sus relaciones en la tabla `usuarios_roles`.
- **Request Body:**
```json
{
  "nombre": "Lucía Paredes",
  "email": "lucia.paredes@empresa.com",
  "password": "SecurePassword2026!",
  "estado": true,
  "roleIds": [2]
}
```
- **Response `201 Created`**

#### `PUT /api/usuarios/{id}`
Modifica los datos del usuario y sincroniza sus roles en `usuarios_roles`.
- **Request Body:**
```json
{
  "nombre": "Lucía Paredes Gómez",
  "email": "lucia.paredes@empresa.com",
  "estado": true,
  "roleIds": [2, 3]
}
```
- **Response `200 OK`**

#### `PATCH /api/usuarios/{id}/estado`
Suspende o reactiva la cuenta de un usuario.
- **Request Body:** `{"estado": false}`
- **Response `200 OK`**

#### `DELETE /api/usuarios/{id}`
Elimina el registro de la tabla `usuarios` y borra en cascada sus asignaciones en `usuarios_roles`.
- **Response `204 No Content`**

---

### 3.4. Control de Acceso RBAC (Tablas: `roles`, `permisos` y `roles_permisos`)

#### `GET /api/roles`
Obtiene los roles registrados, el número de usuarios que lo poseen y su lista de permisos habilitados en `roles_permisos`.
- **Response `200 OK`:**
```json
[
  {
    "id_rol": 2,
    "nombre": "ENCARGADO_INVENTARIO",
    "descripcion": "Gestión operativa de productos, altas, bajas y control de stock",
    "userCount": 2,
    "permisos": [
      { "id_permiso": 1, "nombre": "PRODUCTOS_VER" },
      { "id_permiso": 2, "nombre": "PRODUCTOS_CREAR" },
      { "id_permiso": 3, "nombre": "PRODUCTOS_EDITAR" },
      { "id_permiso": 7, "nombre": "STOCK_AJUSTAR" }
    ]
  }
]
```

#### `POST /api/roles`
Registra un nuevo rol y mapea sus permisos iniciales en `roles_permisos`.
- **Request Body:**
```json
{
  "nombre": "SUPERVISOR_CALIDAD",
  "descripcion": "Auditoría de almacenes y aprobación de stock",
  "permisoIds": [1, 7]
}
```
- **Response `201 Created`**

#### `PUT /api/roles/{id}`
Actualiza nombre, descripción y conjunto de permisos del rol.
- **Response `200 OK`**

#### `DELETE /api/roles/{id}`
Elimina el rol, retirándolo de `roles_permisos` y `usuarios_roles`.
- **Response `204 No Content`**

#### `GET /api/permisos`
Lista el catálogo de operaciones atómicas autorizables.
- **Response `200 OK`**

#### `POST /api/permisos`
Registra un nuevo permiso en la tabla `permisos`.
- **Request Body:**
```json
{
  "nombre": "REPORTES_EXPORTAR",
  "descripcion": "Permite descargar balances en formatos externos"
}
```
- **Response `201 Created`**

#### `DELETE /api/permisos/{id}`
Elimina un permiso y lo desvincula de todos los roles.
- **Response `204 No Content`**

---

### 3.5. Dashboard y Métricas de Rendimiento

#### `GET /api/dashboard/resumen`
Calcula en una sola llamada los indicadores agregados del MER para renderizar el panel principal.
- **Response `200 OK`:**
```json
{
  "totalProductos": 7,
  "stockTotal": 264,
  "valorTotal": 15420.50,
  "stockBajo": 2,
  "stockAgotado": 1,
  "productosActivos": 6,
  "totalUsuarios": 4,
  "usuariosActivos": 3,
  "totalRoles": 3,
  "totalPermisos": 7,
  "criticalProducts": [
    { "id_producto": 5, "nombre": "Cable Par Trenzado", "stock": 0 },
    { "id_producto": 6, "nombre": "Controlador Lógico", "stock": 5 }
  ],
  "topProductsByStock": [
    { "id_producto": 4, "nombre": "Terminal de Conexión Rápida", "stock": 120 },
    { "id_producto": 7, "nombre": "Pulsador Industrial", "stock": 64 }
  ]
}
```

---

## 4. Estructura de Archivos del Proyecto

```text
RAG (Inventario)/
├── assets/
│   └── Inventra.png            # Logotipo original analizado de alta resolución
├── index.html                  # Shell SPA modular con dashboard, productos, usuarios, roles y MER
├── login.html                  # Página de Login desacoplada con animación SVG de Inventra
├── README.md                   # Documentación técnica y especificación de endpoints
├── css/
│   ├── variables.css           # Sistema de diseño mate, paleta sobria y transiciones
│   ├── base.css                # Resets, tipografía, scrollbars y animaciones
│   ├── components.css          # Botones, tablas, badges, inputs y modales
│   ├── views.css               # Estilos de Dashboard, Catálogo, RBAC y MER
│   └── login.css               # Estilos desacoplados y animación de la marca Inventra
└── js/
    ├── icons.js                # Biblioteca centralizada de iconos SVG (cero emojis)
    ├── config.js               # Parámetros de backend, endpoints y gestión de sesión
    ├── mockData.js             # Datos iniciales realistas basados en el MER
    ├── store.js                # Almacén de base de datos local reactiva con LocalStorage
    ├── api.js                  # Servicio cliente HTTP con llamadas REST y emulación
    ├── views/
    │   ├── login.js            # Módulo de vista de autenticación
    │   ├── dashboard.js        # Métricas, alertas de reposición y gráficos de barras SVG
    │   ├── products.js         # CRUD de productos, filtros de stock y estado
    │   ├── users.js            # Directorio de usuarios y asignación en usuarios_roles
    │   ├── roles.js            # Matriz interactiva de permisos (roles_permisos)
    │   └── apiDocs.js          # Visor relacional del MER y consola de prueba de endpoints
    └── app.js                  # Router SPA, control de sesión y redirección
```

---

## 5. Instrucciones de Uso

1. **Abrir la Aplicación:** Haz doble clic sobre [`index.html`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/index.html) en tu navegador web.
2. **Inicio de Sesión:**
   - La pantalla de login de **Inventra** te recibirá automáticamente.
   - Puedes hacer clic en cualquiera de las píldoras de demostración (*Carlos Mendoza*, *Elena Ramos*, *Mauricio Restrepo*) para autocompletar credenciales de inmediato.
   - También puedes pulsar en *Diana Torres (Inactiva)* para verificar la respuesta del sistema ante cuentas deshabilitadas.
3. **Consola Interactiva de Endpoints:**
   - Ve a la sección **Diagrama MER & API** en el menú lateral.
   - Podrás probar cada uno de los endpoints documentados en este archivo con un solo clic, inspeccionar los payloads JSON y consultar los tiempos de respuesta.
   - Si levantas tu Backend (por ejemplo Spring Boot en el puerto `8080`), puedes ingresar la URL base `http://localhost:8080/api` y conmutar a **Modo API Real**.
