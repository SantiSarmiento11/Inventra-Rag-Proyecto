/**
 * Capa de Servicios HTTP / Endpoints de Backend
 * Gestiona la comunicación REST con el servidor basándose en el MER.
 * Soporta dos modos:
 * 1. Modo Simulado (Local): Interacción directa reactiva y ultra-rápida.
 * 2. Modo Real (Live API): Envío de peticiones fetch() a la URL configurada (ej: Spring Boot).
 * Cero emojis.
 */

(function () {
  async function simulateLatency(ms = 140) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function request(endpoint, options = {}) {
    const mode = window.API_CONFIG.getMode();
    const baseUrl = window.API_CONFIG.getBaseUrl();
    const token = window.API_CONFIG.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    if (mode === 'live') {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers
        });

        const contentType = response.headers.get('content-type');
        let data = null;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          throw new Error((data && data.message) || (data && data.error) || `Error HTTP: ${response.status} ${response.statusText}`);
        }

        return {
          status: response.status,
          ok: true,
          data
        };
      } catch (err) {
        console.error(`Fallo de conexión al backend en ${endpoint}:`, err);
        throw err;
      }
    }

    // Modo Mock Simulado: se resuelve utilizando el Store local
    await simulateLatency();
    return handleMockRequest(endpoint, options);
  }

  function handleMockRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;
    const store = window.Store;

    // ------------------------------------------------------------------------
    // Autenticación (Tabla: usuarios)
    // ------------------------------------------------------------------------
    if (endpoint === '/auth/login' && method === 'POST') {
      const email = (body && body.email || '').trim().toLowerCase();
      const password = (body && body.password || '').trim();

      const allUsers = store.getUsuarios();
      const user = allUsers.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        return {
          status: 404,
          ok: false,
          error: 'No existe ninguna cuenta asociada al correo proporcionado'
        };
      }

      if (!user.estado) {
        return {
          status: 403,
          ok: false,
          error: 'Acceso denegado: El usuario se encuentra en estado inactivo en la base de datos'
        };
      }

      // Generar token JWT simulado
      const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: user.id_usuario, email: user.email, roles: user.roles }))}.signature`;
      const authData = {
        token: fakeJwt,
        tokenType: 'Bearer',
        user: {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          email: user.email,
          estado: user.estado,
          fecha_creacion: user.fecha_creacion,
          roles: user.roles
        }
      };

      return { status: 200, ok: true, data: authData };
    }

    if (endpoint === '/auth/logout' && method === 'POST') {
      return { status: 200, ok: true, data: { message: 'Sesión finalizada exitosamente' } };
    }

    if (endpoint === '/auth/me' && method === 'GET') {
      const currentUser = window.API_CONFIG.getCurrentUser();
      if (!currentUser) {
        return { status: 401, ok: false, error: 'No autorizado / Token no provisto o expirado' };
      }
      return { status: 200, ok: true, data: currentUser };
    }

    // ------------------------------------------------------------------------
    // Productos (Tabla: productos)
    // ------------------------------------------------------------------------
    if (endpoint === '/productos' && method === 'GET') {
      return { status: 200, ok: true, data: store.getProductos() };
    }
    if (endpoint.startsWith('/productos/') && method === 'GET') {
      const id = endpoint.split('/')[2];
      const prod = store.getProductoById(id);
      if (!prod) return { status: 404, ok: false, error: 'Producto no encontrado' };
      return { status: 200, ok: true, data: prod };
    }
    if (endpoint === '/productos' && method === 'POST') {
      const created = store.addProducto(body);
      return { status: 201, ok: true, data: created };
    }
    if (endpoint.startsWith('/productos/') && method === 'PUT') {
      const id = endpoint.split('/')[2];
      const updated = store.updateProducto(id, body);
      return { status: 200, ok: true, data: updated };
    }
    if (endpoint.startsWith('/productos/') && endpoint.endsWith('/estado') && method === 'PATCH') {
      const id = endpoint.split('/')[2];
      const updated = store.toggleProductoEstado(id);
      return { status: 200, ok: true, data: updated };
    }
    if (endpoint.startsWith('/productos/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      store.deleteProducto(id);
      return { status: 204, ok: true, data: null };
    }

    // ------------------------------------------------------------------------
    // Usuarios (Tabla: usuarios y usuarios_roles)
    // ------------------------------------------------------------------------
    if (endpoint === '/usuarios' && method === 'GET') {
      return { status: 200, ok: true, data: store.getUsuarios() };
    }
    if (endpoint.startsWith('/usuarios/') && method === 'GET') {
      const id = endpoint.split('/')[2];
      const user = store.getUsuarioById(id);
      if (!user) return { status: 404, ok: false, error: 'Usuario no encontrado' };
      return { status: 200, ok: true, data: user };
    }
    if (endpoint === '/usuarios' && method === 'POST') {
      const created = store.addUsuario(body, body.roleIds || []);
      return { status: 201, ok: true, data: created };
    }
    if (endpoint.startsWith('/usuarios/') && method === 'PUT') {
      const id = endpoint.split('/')[2];
      const updated = store.updateUsuario(id, body, body.roleIds);
      return { status: 200, ok: true, data: updated };
    }
    if (endpoint.startsWith('/usuarios/') && endpoint.endsWith('/estado') && method === 'PATCH') {
      const id = endpoint.split('/')[2];
      const updated = store.toggleUsuarioEstado(id);
      return { status: 200, ok: true, data: updated };
    }
    if (endpoint.startsWith('/usuarios/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      store.deleteUsuario(id);
      return { status: 204, ok: true, data: null };
    }

    // ------------------------------------------------------------------------
    // Roles (Tabla: roles y roles_permisos)
    // ------------------------------------------------------------------------
    if (endpoint === '/roles' && method === 'GET') {
      return { status: 200, ok: true, data: store.getRoles() };
    }
    if (endpoint === '/roles' && method === 'POST') {
      const created = store.addRol(body, body.permisoIds || []);
      return { status: 201, ok: true, data: created };
    }
    if (endpoint.startsWith('/roles/') && method === 'PUT') {
      const id = endpoint.split('/')[2];
      const updated = store.updateRol(id, body, body.permisoIds);
      return { status: 200, ok: true, data: updated };
    }
    if (endpoint.startsWith('/roles/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      store.deleteRol(id);
      return { status: 204, ok: true, data: null };
    }

    // ------------------------------------------------------------------------
    // Permisos (Tabla: permisos)
    // ------------------------------------------------------------------------
    if (endpoint === '/permisos' && method === 'GET') {
      return { status: 200, ok: true, data: store.getPermisos() };
    }
    if (endpoint === '/permisos' && method === 'POST') {
      const created = store.addPermiso(body);
      return { status: 201, ok: true, data: created };
    }
    if (endpoint.startsWith('/permisos/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      store.deletePermiso(id);
      return { status: 204, ok: true, data: null };
    }

    // ------------------------------------------------------------------------
    // Dashboard & Métricas
    // ------------------------------------------------------------------------
    if (endpoint === '/dashboard/resumen' && method === 'GET') {
      return { status: 200, ok: true, data: store.getDashboardMetrics() };
    }

    return { status: 200, ok: true, data: { message: 'Operación ejecutada con éxito' } };
  }

  window.ApiService = {
    // ------------------------------------------------------------------------
    // Endpoints: Autenticación
    // ------------------------------------------------------------------------
    login: async function (email, password) {
      const res = await request(window.API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password })
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
        console.warn('Error durante logout:', err);
      } finally {
        window.API_CONFIG.clearSession();
      }
      return true;
    },

    getMe: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.AUTH.ME, { method: 'GET' });
      return res.data;
    },

    // ------------------------------------------------------------------------
    // Endpoints: Productos
    // ------------------------------------------------------------------------
    getProductos: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.BASE, { method: 'GET' });
      return res.data;
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

    updateProductoEstado: async function (id, nuevoEstado) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PRODUCTOS.ESTADO(id), {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
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
    // Endpoints: Usuarios
    // ------------------------------------------------------------------------
    getUsuarios: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BASE, { method: 'GET' });
      return res.data;
    },

    getUsuario: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id), { method: 'GET' });
      return res.data;
    },

    createUsuario: async function (userData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BASE, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return res.data;
    },

    updateUsuario: async function (id, userData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      return res.data;
    },

    updateUsuarioEstado: async function (id, nuevoEstado) {
      const res = await request(window.API_CONFIG.ENDPOINTS.USUARIOS.ESTADO(id), {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
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
    // Endpoints: Roles & Permisos
    // ------------------------------------------------------------------------
    getRoles: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.ROLES.BASE, { method: 'GET' });
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

    getPermisos: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.PERMISOS.BASE, { method: 'GET' });
      return res.data;
    },

    createPermiso: async function (permisoData) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PERMISOS.BASE, {
        method: 'POST',
        body: JSON.stringify(permisoData)
      });
      return res.data;
    },

    deletePermiso: async function (id) {
      const res = await request(window.API_CONFIG.ENDPOINTS.PERMISOS.BY_ID(id), {
        method: 'DELETE'
      });
      return res.ok;
    },

    // ------------------------------------------------------------------------
    // Endpoints: Dashboard & Métricas
    // ------------------------------------------------------------------------
    getDashboardResumen: async function () {
      const res = await request(window.API_CONFIG.ENDPOINTS.DASHBOARD.RESUMEN, { method: 'GET' });
      return res.data;
    },

    // ------------------------------------------------------------------------
    // Probador dinámico de Endpoint (Consola)
    // ------------------------------------------------------------------------
    testEndpointCall: async function (method, endpoint, payload) {
      const startTime = performance.now();
      try {
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
