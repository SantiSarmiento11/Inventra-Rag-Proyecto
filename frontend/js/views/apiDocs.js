/**
 * Vista de Especificación de Endpoints y Diagrama del MER
 * Herramienta para desarrolladores y auditoría de la integración Frontend <-> Backend.
 * Permite probar cada endpoint en vivo, ver esquemas JSON y conmutar el modo de API.
 * Cero emojis.
 */

(function () {
  window.Views = window.Views || {};

  window.Views.ApiDocs = {
    render: async function (container) {
      const icons = window.Icons;
      const apiMode = window.API_CONFIG.getMode();
      const baseUrl = window.API_CONFIG.getBaseUrl();

      // Definición exhaustiva de endpoints derivados del MER
      const endpointsCatalog = [
        // Autenticación (Tabla: usuarios)
        {
          id: 'ep-post-login',
          method: 'POST',
          path: '/auth/login',
          table: 'usuarios',
          desc: 'Autentica al usuario contra email y password, validando estado activo y retornando token Bearer y roles.',
          requestExample: {
            email: "carlos.mendoza@empresa.com",
            password: "password123"
          },
          responseExample: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            tokenType: "Bearer",
            user: {
              id_usuario: 1,
              nombre: "Carlos Andrés Mendoza",
              email: "carlos.mendoza@empresa.com",
              estado: true,
              roles: [{ id_rol: 1, nombre: "ADMINISTRADOR" }]
            }
          }
        },
        {
          id: 'ep-post-logout',
          method: 'POST',
          path: '/auth/logout',
          table: 'usuarios',
          desc: 'Invalida el token de sesión en el backend y limpia credenciales.',
          requestExample: null,
          responseExample: { message: "Sesión finalizada exitosamente" }
        },
        {
          id: 'ep-get-me',
          method: 'GET',
          path: '/auth/me',
          table: 'usuarios',
          desc: 'Retorna el perfil y roles del usuario actualmente autenticado mediante el encabezado Authorization Bearer.',
          requestExample: null,
          responseExample: {
            id_usuario: 1,
            nombre: "Carlos Andrés Mendoza",
            email: "carlos.mendoza@empresa.com",
            estado: true,
            roles: [{ id_rol: 1, nombre: "ADMINISTRADOR" }]
          }
        },

        // Productos
        {
          id: 'ep-get-products',
          method: 'GET',
          path: '/productos',
          table: 'productos',
          desc: 'Obtiene el listado completo de productos registrados con sus existencias y precios.',
          requestExample: null,
          responseExample: [
            {
              id_producto: 1,
              nombre: "Sensor Óptico Industrial Pro",
              descripcion: "Sensor fotoeléctrico 24V NPN",
              precio: 84.50,
              stock: 42,
              estado: true,
              fecha_creacion: "2026-01-20 08:00:00"
            }
          ]
        },
        {
          id: 'ep-post-products',
          method: 'POST',
          path: '/productos',
          table: 'productos',
          desc: 'Registra un nuevo producto en la base de datos.',
          requestExample: {
            nombre: "Relé de Seguridad 2 Canales",
            descripcion: "Módulo de parada de emergencia categoría 4",
            precio: 145.00,
            stock: 12,
            estado: true
          },
          responseExample: {
            id_producto: 8,
            nombre: "Relé de Seguridad 2 Canales",
            descripcion: "Módulo de parada de emergencia categoría 4",
            precio: 145.00,
            stock: 12,
            estado: true,
            fecha_creacion: "2026-11-06 22:25:00"
          }
        },
        {
          id: 'ep-put-products',
          method: 'PUT',
          path: '/productos/1',
          table: 'productos',
          desc: 'Actualiza los atributos de un producto existente.',
          requestExample: {
            nombre: "Sensor Óptico Industrial Pro Actualizado",
            descripcion: "Sensor fotoeléctrico 24V NPN rango calibrado",
            precio: 89.00,
            stock: 40,
            estado: true
          },
          responseExample: {
            id_producto: 1,
            nombre: "Sensor Óptico Industrial Pro Actualizado",
            precio: 89.00,
            stock: 40,
            estado: true
          }
        },
        {
          id: 'ep-patch-product-status',
          method: 'PATCH',
          path: '/productos/1/estado',
          table: 'productos',
          desc: 'Modifica rápidamente el estado activo/inactivo de un producto.',
          requestExample: { estado: false },
          responseExample: { id_producto: 1, estado: false }
        },
        {
          id: 'ep-delete-product',
          method: 'DELETE',
          path: '/productos/1',
          table: 'productos',
          desc: 'Elimina un producto de la tabla.',
          requestExample: null,
          responseExample: { status: 204, message: "Recurso eliminado" }
        },

        // Usuarios
        {
          id: 'ep-get-users',
          method: 'GET',
          path: '/usuarios',
          table: 'usuarios',
          desc: 'Obtiene el listado de usuarios con sus roles asociados (join con usuarios_roles).',
          requestExample: null,
          responseExample: [
            {
              id_usuario: 1,
              nombre: "Carlos Andrés Mendoza",
              email: "carlos.mendoza@empresa.com",
              estado: true,
              fecha_creacion: "2026-01-15 09:30:00",
              roles: [{ id_rol: 1, nombre: "ADMINISTRADOR" }]
            }
          ]
        },
        {
          id: 'ep-post-users',
          method: 'POST',
          path: '/usuarios',
          table: 'usuarios',
          desc: 'Crea un usuario y persiste sus relaciones en la tabla usuarios_roles.',
          requestExample: {
            nombre: "Lucía Paredes",
            email: "lucia.paredes@empresa.com",
            password: "SecurePassword123!",
            estado: true,
            roleIds: [2]
          },
          responseExample: {
            id_usuario: 5,
            nombre: "Lucía Paredes",
            email: "lucia.paredes@empresa.com",
            estado: true,
            fecha_creacion: "2026-11-06 22:25:00",
            roles: [{ id_rol: 2, nombre: "ENCARGADO_INVENTARIO" }]
          }
        },
        {
          id: 'ep-patch-user-status',
          method: 'PATCH',
          path: '/usuarios/1/estado',
          table: 'usuarios',
          desc: 'Habilita o revoca el acceso del usuario.',
          requestExample: { estado: false },
          responseExample: { id_usuario: 1, estado: false }
        },
        {
          id: 'ep-delete-user',
          method: 'DELETE',
          path: '/usuarios/1',
          table: 'usuarios',
          desc: 'Elimina un usuario y borra sus relaciones en usuarios_roles.',
          requestExample: null,
          responseExample: { status: 204, message: "Usuario eliminado" }
        },

        // Roles & Permisos
        {
          id: 'ep-get-roles',
          method: 'GET',
          path: '/roles',
          table: 'roles',
          desc: 'Obtiene todos los roles con su conteo de usuarios y lista de permisos asociados (roles_permisos).',
          requestExample: null,
          responseExample: [
            {
              id_rol: 1,
              nombre: "ADMINISTRADOR",
              descripcion: "Control total de la plataforma",
              userCount: 1,
              permisos: [{ id_permiso: 1, nombre: "PRODUCTOS_VER" }]
            }
          ]
        },
        {
          id: 'ep-post-roles',
          method: 'POST',
          path: '/roles',
          table: 'roles',
          desc: 'Crea un nuevo rol y mapea sus permisos en la tabla roles_permisos.',
          requestExample: {
            nombre: "AUDITOR_CALIDAD",
            descripcion: "Inspección periódica de inventarios",
            permisoIds: [1]
          },
          responseExample: {
            id_rol: 4,
            nombre: "AUDITOR_CALIDAD",
            descripcion: "Inspección periódica de inventarios"
          }
        },
        {
          id: 'ep-get-permisos',
          method: 'GET',
          path: '/permisos',
          table: 'permisos',
          desc: 'Lista el catálogo de permisos disponibles en el sistema.',
          requestExample: null,
          responseExample: [
            {
              id_permiso: 1,
              nombre: "PRODUCTOS_VER",
              descripcion: "Visualizar catálogo general de productos"
            }
          ]
        },
        {
          id: 'ep-get-dashboard',
          method: 'GET',
          path: '/dashboard/resumen',
          table: 'vistas / metricas',
          desc: 'Calcula indicadores agregados de stock, usuarios y roles para el dashboard.',
          requestExample: null,
          responseExample: {
            totalProductos: 7,
            stockTotal: 264,
            valorTotal: 15420.50,
            stockBajo: 2,
            stockAgotado: 1
          }
        }
      ];

      const endpointsCardsHtml = endpointsCatalog.map((ep) => {
        let badgeClass = 'method-get';
        if (ep.method === 'POST') badgeClass = 'method-post';
        if (ep.method === 'PUT') badgeClass = 'method-put';
        if (ep.method === 'PATCH') badgeClass = 'method-patch';
        if (ep.method === 'DELETE') badgeClass = 'method-delete';

        return `
          <div class="endpoint-card" id="${ep.id}">
            <div class="endpoint-header" data-toggle="${ep.id}">
              <div class="endpoint-meta">
                <span class="method-badge ${badgeClass}">${ep.method}</span>
                <span class="endpoint-path">${escapeHtml(ep.path)}</span>
                <span class="badge badge-neutral" style="font-size: 0.65rem;">tabla: ${escapeHtml(ep.table)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="endpoint-desc">${escapeHtml(ep.desc)}</span>
                <button class="btn btn-ghost btn-sm btn-icon-only">
                  ${icons.get('chevronRight')}
                </button>
              </div>
            </div>

            <div class="endpoint-body">
              ${ep.requestExample ? `
                <div class="code-box-header">
                  <span>Cuerpo de la Solicitud (Request Body - JSON)</span>
                </div>
                <pre class="code-box"><code>${escapeHtml(JSON.stringify(ep.requestExample, null, 2))}</code></pre>
              ` : `
                <div class="code-box-header"><span>Sin cuerpo de solicitud requerido</span></div>
              `}

              <div class="code-box-header">
                <span>Respuesta Esperada del Servidor (Response Schema)</span>
              </div>
              <pre class="code-box"><code>${escapeHtml(JSON.stringify(ep.responseExample, null, 2))}</code></pre>

              <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
                <button class="btn btn-primary btn-sm btn-test-endpoint"
                  data-method="${ep.method}"
                  data-path="${ep.path}"
                  data-payload='${ep.requestExample ? JSON.stringify(ep.requestExample) : ""}'>
                  ${icons.get('send')}
                  <span>Ejecutar Prueba de Endpoint</span>
                </button>
                <span class="test-status-label" style="font-size: 0.75rem; color: var(--text-muted);">Listo para emitir llamada</span>
              </div>

              <div class="response-tester-output" style="display: none;"></div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <!-- Banner de Configuración de API -->
        <div class="api-config-banner">
          <div class="api-mode-info">
            <span class="api-mode-title">
              ${icons.get('server')}
              <span>Entorno de Conexión del Backend</span>
            </span>
            <p class="api-mode-desc">
              Define si el Front-end se comunica mediante peticiones HTTP fetch() hacia tu servidor real o a través del motor reactivo local.
            </p>
          </div>

          <div class="api-controls">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="form-label" style="margin-bottom: 0;">URL Base:</span>
              <input type="text" class="form-control" id="backend-base-url-input" value="${escapeHtml(baseUrl)}" style="width: 260px; font-family: var(--font-mono); font-size: 0.8rem;" />
            </div>

            <select class="form-control" id="backend-mode-select" style="width: auto; font-weight: 600;">
              <option value="mock" ${apiMode === 'mock' ? 'selected' : ''}>Modo Simulado (Local)</option>
              <option value="live" ${apiMode === 'live' ? 'selected' : ''}>Modo API Real (Backend)</option>
            </select>

            <button class="btn btn-secondary btn-sm" id="btn-save-api-config">
              ${icons.get('check')}
              <span>Guardar</span>
            </button>
          </div>
        </div>

        <!-- Diagrama del MER (Estructura de Base de Datos) -->
        <div class="mer-container">
          <div class="mer-header-banner">
            <div>
              <h3 class="mer-banner-title">Esquema Físico y Relacional (MER)</h3>
              <p class="mer-banner-desc">Representación 1:1 de las 6 tablas y sus llaves foráneas</p>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-reset-db">
              ${icons.get('refresh')}
              <span>Restablecer Datos de Demostración</span>
            </button>
          </div>

          <div class="mer-tables-grid">
            <!-- Tabla: productos -->
            <div class="mer-table-card">
              <div class="mer-table-header">
                <span class="mer-table-title">${icons.get('products')} productos</span>
                <span class="badge badge-neutral">Catálogo</span>
              </div>
              <div class="mer-columns-list">
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> id_producto</span>
                  <span class="mer-col-type">BIGINT AUTO_INC</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">nombre</span>
                  <span class="mer-col-type">VARCHAR(100) NOT NULL</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">descripcion</span>
                  <span class="mer-col-type">TEXT</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">precio</span>
                  <span class="mer-col-type">DECIMAL(10,2) NOT NULL</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">stock</span>
                  <span class="mer-col-type">INT DEFAULT 0</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">estado</span>
                  <span class="mer-col-type">BOOLEAN DEFAULT TRUE</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">fecha_creacion</span>
                  <span class="mer-col-type">TIMESTAMP CURRENT</span>
                </div>
              </div>
            </div>

            <!-- Tabla: usuarios -->
            <div class="mer-table-card">
              <div class="mer-table-header">
                <span class="mer-table-title">${icons.get('users')} usuarios</span>
                <span class="badge badge-neutral">Cuentas</span>
              </div>
              <div class="mer-columns-list">
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> id_usuario</span>
                  <span class="mer-col-type">BIGINT AUTO_INC</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">nombre</span>
                  <span class="mer-col-type">VARCHAR(100) NOT NULL</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">email</span>
                  <span class="mer-col-type">VARCHAR(150) UNIQUE</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">password</span>
                  <span class="mer-col-type">VARCHAR(255) NOT NULL</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">estado</span>
                  <span class="mer-col-type">BOOLEAN DEFAULT TRUE</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">fecha_creacion</span>
                  <span class="mer-col-type">TIMESTAMP CURRENT</span>
                </div>
              </div>
            </div>

            <!-- Tabla: roles -->
            <div class="mer-table-card">
              <div class="mer-table-header">
                <span class="mer-table-title">${icons.get('roles')} roles</span>
                <span class="badge badge-neutral">Perfiles</span>
              </div>
              <div class="mer-columns-list">
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> id_rol</span>
                  <span class="mer-col-type">BIGINT AUTO_INC</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">nombre</span>
                  <span class="mer-col-type">VARCHAR(50) UNIQUE</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">descripcion</span>
                  <span class="mer-col-type">VARCHAR(255)</span>
                </div>
              </div>
            </div>

            <!-- Tabla: usuarios_roles (N:M) -->
            <div class="mer-table-card" style="border-left: 3px solid var(--primary);">
              <div class="mer-table-header">
                <span class="mer-table-title">${icons.get('link')} usuarios_roles</span>
                <span class="badge badge-primary">Tabla Intermedia N:M</span>
              </div>
              <div class="mer-columns-list">
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> <span class="mer-key-fk">FK</span> id_usuario</span>
                  <span class="mer-col-type">Ref. usuarios(id_usuario)</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> <span class="mer-key-fk">FK</span> id_rol</span>
                  <span class="mer-col-type">Ref. roles(id_rol)</span>
                </div>
              </div>
            </div>

            <!-- Tabla: permisos -->
            <div class="mer-table-card">
              <div class="mer-table-header">
                <span class="mer-table-title">${icons.get('permissions')} permisos</span>
                <span class="badge badge-neutral">Operaciones</span>
              </div>
              <div class="mer-columns-list">
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> id_permiso</span>
                  <span class="mer-col-type">BIGINT AUTO_INC</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">nombre</span>
                  <span class="mer-col-type">VARCHAR(100) UNIQUE</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name">descripcion</span>
                  <span class="mer-col-type">VARCHAR(255)</span>
                </div>
              </div>
            </div>

            <!-- Tabla: roles_permisos (N:M) -->
            <div class="mer-table-card" style="border-left: 3px solid var(--primary);">
              <div class="mer-table-header">
                <span class="mer-table-title">${icons.get('link')} roles_permisos</span>
                <span class="badge badge-primary">Tabla Intermedia N:M</span>
              </div>
              <div class="mer-columns-list">
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> <span class="mer-key-fk">FK</span> id_rol</span>
                  <span class="mer-col-type">Ref. roles(id_rol)</span>
                </div>
                <div class="mer-col-row">
                  <span class="mer-col-name"><span class="mer-key-pk">PK</span> <span class="mer-key-fk">FK</span> id_permiso</span>
                  <span class="mer-col-type">Ref. permisos(id_permiso)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Catálogo de Endpoints REST -->
        <div style="margin-top: 2rem;">
          <div style="margin-bottom: 1rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Catálogo de Endpoints REST del Backend</h3>
            <p style="font-size: 0.775rem; color: var(--text-secondary);">Haz clic en cualquier endpoint para expandir sus contratos y probarlo en tiempo real.</p>
          </div>

          <div class="endpoint-list">
            ${endpointsCardsHtml}
          </div>
        </div>
      `;

      // Evento de Guardar Configuración
      const btnSaveConfig = container.querySelector('#btn-save-api-config');
      if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', () => {
          const newUrl = container.querySelector('#backend-base-url-input').value;
          const newMode = container.querySelector('#backend-mode-select').value;
          window.API_CONFIG.setBaseUrl(newUrl);
          window.API_CONFIG.setMode(newMode);
          window.App.showToast('Configuración del backend actualizada', 'success');
        });
      }

      // Restablecer BD
      const btnReset = container.querySelector('#btn-reset-db');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          const confirmed = confirm('¿Deseas restablecer los datos de demostración a su estado original?');
          if (confirmed) {
            window.Store.resetToDefault();
            window.App.showToast('Base de datos restablecida a valores iniciales', 'info');
            this.render(container);
          }
        });
      }

      // Acordeón de Endpoints
      container.querySelectorAll('.endpoint-header').forEach((header) => {
        header.addEventListener('click', () => {
          const card = header.closest('.endpoint-card');
          card.classList.toggle('expanded');
        });
      });

      // Ejecutar prueba de endpoint
      container.querySelectorAll('.btn-test-endpoint').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const method = btn.getAttribute('data-method');
          const path = btn.getAttribute('data-path');
          const payloadRaw = btn.getAttribute('data-payload');
          const card = btn.closest('.endpoint-card');
          const outputEl = card.querySelector('.response-tester-output');
          const statusLabel = card.querySelector('.test-status-label');

          statusLabel.textContent = 'Enviando petición...';
          outputEl.style.display = 'block';
          outputEl.textContent = 'Procesando...';

          try {
            const payload = payloadRaw ? JSON.parse(payloadRaw) : null;
            const res = await window.ApiService.testEndpointCall(method, path, payload);

            statusLabel.innerHTML = `
              <span class="badge ${res.ok ? 'badge-success' : 'badge-danger'}">
                HTTP ${res.status} (${res.duration})
              </span>
            `;

            outputEl.textContent = JSON.stringify(res.data || res.error, null, 2);
          } catch (err) {
            statusLabel.innerHTML = `<span class="badge badge-danger">Error de Conexión</span>`;
            outputEl.textContent = err.message;
          }
        });
      });
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
