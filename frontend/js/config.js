/**
 * Configuración del Cliente de Endpoints, Backend y Sesión
 * Basado estrictamente en las tablas del MER:
 * - usuarios (con email, password, estado, fecha_creacion)
 * - roles
 * - permisos
 * - usuarios_roles
 * - roles_permisos
 * - productos
 * Cero emojis.
 */

(function () {
  const STORAGE_KEY_API_BASE = 'inventario_api_base_url';
  const STORAGE_KEY_API_MODE = 'inventario_api_mode'; // 'mock' | 'live'
  const STORAGE_KEY_AUTH_TOKEN = 'inventario_auth_token';
  const STORAGE_KEY_AUTH_USER = 'inventario_auth_user';

  const defaultBaseUrl = 'http://localhost:8080/api';
  const defaultMode = 'mock'; // Por defecto simulación local reactiva autónoma

  const ENDPOINTS = {
    // Autenticación (Tabla: usuarios)
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      REFRESH: '/auth/refresh'
    },
    // Productos (Tabla: productos)
    PRODUCTOS: {
      BASE: '/productos',
      BY_ID: (id) => `/productos/${id}`,
      ESTADO: (id) => `/productos/${id}/estado`,
      STOCK: (id) => `/productos/${id}/stock`
    },
    // Usuarios (Tabla: usuarios)
    USUARIOS: {
      BASE: '/usuarios',
      BY_ID: (id) => `/usuarios/${id}`,
      ESTADO: (id) => `/usuarios/${id}/estado`,
      ROLES: (id) => `/usuarios/${id}/roles` // Tabla: usuarios_roles
    },
    // Roles (Tabla: roles)
    ROLES: {
      BASE: '/roles',
      BY_ID: (id) => `/roles/${id}`,
      PERMISOS: (id) => `/roles/${id}/permisos` // Tabla: roles_permisos
    },
    // Permisos (Tabla: permisos)
    PERMISOS: {
      BASE: '/permisos',
      BY_ID: (id) => `/permisos/${id}`
    },
    // Dashboard & Métricas analíticas
    DASHBOARD: {
      RESUMEN: '/dashboard/resumen',
      STOCK_CRITICO: '/dashboard/stock-critico'
    }
  };

  window.API_CONFIG = {
    ENDPOINTS: ENDPOINTS,
    getBaseUrl: function () {
      return localStorage.getItem(STORAGE_KEY_API_BASE) || defaultBaseUrl;
    },
    setBaseUrl: function (url) {
      localStorage.setItem(STORAGE_KEY_API_BASE, url.replace(/\/+$/, ''));
    },
    getMode: function () {
      return localStorage.getItem(STORAGE_KEY_API_MODE) || defaultMode;
    },
    setMode: function (mode) {
      localStorage.setItem(STORAGE_KEY_API_MODE, mode);
    },
    getToken: function () {
      return localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || '';
    },
    setToken: function (token) {
      if (token) {
        localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      }
    },
    getCurrentUser: function () {
      try {
        const u = localStorage.getItem(STORAGE_KEY_AUTH_USER);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },
    setCurrentUser: function (user) {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    },
    clearSession: function () {
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  };
})();
