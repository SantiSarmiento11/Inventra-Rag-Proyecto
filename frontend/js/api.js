/**
 * Capa de Servicios HTTP / API REST
 * Comunicación directa y en tiempo real con el backend de Spring Boot.
 * Autenticación mediante Tokens JWT (Bearer).
 * Cero simulación ni datos mockeados.
 */

(function () {
  async function request(endpoint, options = {}) {
    const baseUrl = window.API_CONFIG.getBaseUrl();
    const token = window.API_CONFIG.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      // Si el token expiró o las credenciales no son válidas
      if (response.status === 401) {
        window.API_CONFIG.clearSession();
        if (!window.location.pathname.endsWith('login.html')) {
          window.location.replace('login.html');
        }
      }

      if (response.status === 204) {
        return { status: 204, ok: true, data: null };
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = (data && data.message) || (data && data.error) || `Error HTTP: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return {
        status: response.status,
        ok: true,
        data
      };
    } catch (err) {
      console.error(`Error en petición al backend en ${endpoint}:`, err);
      throw err;
    }
  }

  window.ApiService = {
    // ------------------------------------------------------------------------
    // Autenticación (Tabla: usuarios)
    // ------------------------------------------------------------------------
    login: async function (email, password) {
      const res = await request(window.API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (res.ok && res.data) {
        window.API_CONFIG.setToken(res.data.token);
        window.API_CONFIG.setCurrentUser(res.data.user);
      }
      return res;
    },

    logout: async function () {
      try {
        await request(window.API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      } catch (err) {
        console.warn('Logout:', err);
      } finally {
        window.API_CONFIG.clearSession();
      }
      return true;
    },

    getMe: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.AUTH.ME, { method: 'GET' });
      if (res.ok && res.data) {
        window.API_CONFIG.setCurrentUser(res.data);
      }
      return res.data;
    },

    // ------------------------------------------------------------------------
    // Productos (Tabla: productos)
    // ------------------------------------------------------------------------
    getProductos: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.BASE, { method: 'GET' });
      return res.data || [];
    },

    getProducto: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.BY_ID(id), { method: 'GET' });
      return res.data;
    },

    createProducto: async function (productoData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.BASE, {
        method: 'POST',
        body: JSON.stringify(productoData)
      });
      return res.data;
    },

    updateProducto: async function (id, productoData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(productoData)
      });
      return res.data;
    },

    updateProductoEstado: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.ESTADO(id), {
        method: 'PATCH'
      });
      return res.data;
    },

    deleteProducto: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.BY_ID(id), {
        method: 'DELETE'
      });
      return res.ok;
    },

    // ------------------------------------------------------------------------
    // Usuarios (Tabla: usuarios y usuarios_roles)
    // ------------------------------------------------------------------------
    getUsuarios: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BASE, { method: 'GET' });
      return res.data || [];
    },

    getUsuario: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id), { method: 'GET' });
      return res.data;
    },

    createUsuario: async function (usuarioData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BASE, {
        method: 'POST',
        body: JSON.stringify(usuarioData)
      });
      return res.data;
    },

    updateUsuario: async function (id, usuarioData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(usuarioData)
      });
      return res.data;
    },

    updateUsuarioEstado: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.ESTADO(id), {
        method: 'PATCH'
      });
      return res.data;
    },

    updateUsuarioRoles: async function (id, roleIds) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.ROLES(id), {
        method: 'PUT',
        body: JSON.stringify(roleIds)
      });
      return res.data;
    },

    deleteUsuario: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id), {
        method: 'DELETE'
      });
      return res.ok;
    },

    // ------------------------------------------------------------------------
    // Roles (Tabla: roles y roles_permisos)
    // ------------------------------------------------------------------------
    getRoles: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.ROLES.BASE, { method: 'GET' });
      return res.data || [];
    },

    getRol: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.ROLES.BY_ID(id), { method: 'GET' });
      return res.data;
    },

    createRol: async function (rolData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.ROLES.BASE, {
        method: 'POST',
        body: JSON.stringify(rolData)
      });
      return res.data;
    },

    updateRol: async function (id, rolData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.ROLES.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(rolData)
      });
      return res.data;
    },

    deleteRol: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.ROLES.BY_ID(id), {
        method: 'DELETE'
      });
      return res.ok;
    },

    // ------------------------------------------------------------------------
    // Permisos (Tabla: permisos)
    // ------------------------------------------------------------------------
    getPermisos: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.PERMISOS.BASE, { method: 'GET' });
      return res.data || [];
    },

    // ------------------------------------------------------------------------
    // Dashboard & Métricas
    // ------------------------------------------------------------------------
    getDashboardResumen: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.DASHBOARD.RESUMEN, { method: 'GET' });
      return res.data || {
        totalProductos: 0,
        stockTotal: 0,
        valorTotal: 0,
        stockBajo: 0,
        stockAgotado: 0,
        productosActivos: 0,
        totalUsuarios: 0,
        usuariosActivos: 0,
        totalRoles: 0,
        totalPermisos: 0,
        criticalProducts: [],
        topProductsByStock: []
      };
    },

    getStockCritico: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.DASHBOARD.STOCK_CRITICO, { method: 'GET' });
      return res.data || [];
    },

    // ------------------------------------------------------------------------
    // Endpoint RAG de Consultas (Integración Directa con n8n)
    // Cero simulación: espera respuesta real de n8n o aborta a los 20 segundos
    // ------------------------------------------------------------------------
    consultarRag: async function (pregunta, options = {}) {
      const currentUser = window.API_CONFIG.getCurrentUser();
      const n8nWebhookUrl = window.API_CONFIG.getN8nWebhookUrl();

      // Recopilar contexto en vivo del inventario (Augmented Context para el RAG)
      let productos = [];
      let metricas = null;
      let roles = [];
      try {
        [productos, metricas, roles] = await Promise.all([
          this.getProductos(),
          this.getDashboardResumen(),
          this.getRoles()
        ]);
      } catch (e) {
        console.warn('Advertencia cargando contexto para RAG:', e);
      }

      const payload = {
        consulta: pregunta.trim(),
        endpoint: window.API_CONFIG.ENDPOINTS.RAG.CONSULTA,
        timestamp: new Date().toISOString(),
        origen: 'Inventra Frontend RAG Client',
        usuario: currentUser ? {
          id_usuario: currentUser.id_usuario,
          nombre: currentUser.nombre,
          email: currentUser.email,
          roles: currentUser.roles
        } : null,
        contexto_inventario: {
          total_productos: metricas ? metricas.totalProductos : productos.length,
          stock_total: metricas ? metricas.stockTotal : 0,
          valor_monetario_total: metricas ? metricas.valorTotal : 0,
          productos_activos: metricas ? metricas.productosActivos : 0,
          productos_stock_critico: metricas ? metricas.criticalProducts : [],
          catalogo: (productos || []).map((p) => ({
            id: p.id_producto,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            stock: p.stock,
            estado: p.estado ? 'Activo' : 'Inactivo'
          })),
          roles_definidos: (roles || []).map((r) => r.nombre)
        }
      };

      // Timeout estricto de 20 segundos
      const TIMEOUT_MS = 20000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const startTime = performance.now();

      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorDetail = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData && (errData.message || errData.error)) {
              errorDetail = errData.message || errData.error;
            }
          } catch (_) {}
          throw new Error(`El flujo de n8n respondió con error (${errorDetail}).`);
        }

        const n8nData = await response.json();
        const respuestaTexto = n8nData.respuesta || n8nData.output || n8nData.text || n8nData.message;

        if (!respuestaTexto) {
          throw new Error('El flujo de n8n respondió pero el cuerpo JSON no contiene el campo "respuesta".');
        }

        return {
          ok: true,
          duracion: `${duration}ms`,
          pregunta: pregunta,
          respuesta: respuestaTexto,
          payloadEnviado: payload,
          fuente: n8nData.fuente || `Workflow n8n (${n8nWebhookUrl})`,
          timestamp: n8nData.timestamp || new Date().toISOString()
        };
      } catch (err) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
          throw new Error(`Tiempo de espera agotado (20 segundos): El flujo de n8n en ${n8nWebhookUrl} no respondió a tiempo. Verifica que el workflow esté activo en n8n y que DeepSeek / Qdrant no estén bloqueados.`);
        }

        throw new Error(`Error de conexión con n8n (${n8nWebhookUrl}): ${err.message}. Asegúrate de que n8n esté corriendo y el webhook esté en modo activo.`);
      }
    },

    // Probador de Endpoint en vivo
    testEndpointCall: async function (method, endpoint, payload) {
      const startTime = performance.now();
      try {
        if (endpoint === '/rag/consulta' || endpoint === window.API_CONFIG.ENDPOINTS.RAG.CONSULTA) {
          const bodyObj = typeof payload === 'string' && payload ? JSON.parse(payload) : (payload || {});
          const ragRes = await this.consultarRag(bodyObj.consulta || '¿Cuáles son los productos con menor stock?');
          const duration = Math.round(performance.now() - startTime);
          return {
            status: 200,
            ok: true,
            duration: `${duration}ms`,
            data: ragRes
          };
        }

        const options = {
          method: method.toUpperCase(),
          ...(payload ? { body: typeof payload === 'string' ? payload : JSON.stringify(payload) } : {})
        };
        const res = await request(endpoint, options);
        const duration = Math.round(performance.now() - startTime);
        return {
          status: res.status,
          ok: res.ok,
          duration: `${duration}ms`,
          data: res.data || res.error
        };
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        return {
          status: 500,
          ok: false,
          duration: `${duration}ms`,
          error: err.message
        };
      }
    }
  };
})();
