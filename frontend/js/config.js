/**
 * Configuración del Cliente de Endpoints, Backend y Sesión
 * Conectado en vivo (Live API) directamente al Backend Spring Boot.
 * Incluye Endpoint para RAG de Consultas y Webhook n8n.
 * Cero procesos ni datos simulados.
 */

(function () {
  const STORAGE_KEY_API_BASE = 'inventario_api_base_url';
  const STORAGE_KEY_API_MODE = 'inventario_api_mode';
  const STORAGE_KEY_AUTH_TOKEN = 'inventario_auth_token';
  const STORAGE_KEY_AUTH_USER = 'inventario_auth_user';
  const STORAGE_KEY_N8N_WEBHOOK = 'inventario_n8n_rag_webhook';

  const defaultBaseUrl = 'http://localhost:8080/api';
  const defaultN8nWebhook = 'http://localhost:5678/webhook/inventario-rag';

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
      ROLES: (id) => `/usuarios/${id}/roles`
    },
    // Roles (Tabla: roles)
    ROLES: {
      BASE: '/roles',
      BY_ID: (id) => `/roles/${id}`,
      PERMISOS: (id) => `/roles/${id}/permisos`
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
    },
    // Endpoint RAG de Consultas (para integración con n8n)
    RAG: {
      CONSULTA: '/rag/consulta'
    }
  };

  // Banco de ideas de consultas para RAG sobre este inventario
  const RAG_QUERY_TEMPLATES = [
    {
      categoria: 'Inventario & Existencias',
      preguntas: [
        '¿Cuáles son los productos con stock crítico (menor a 5 unidades) o agotados que requieren reposición inmediata?',
        '¿Cuántas unidades disponibles quedan registradas en el catálogo de productos y cuál es su distribución?',
        '¿Cuáles son los productos activos con mayor nivel de inventario para promocionar en el catálogo?'
      ]
    },
    {
      categoria: 'Finanzas & Valorización Económica',
      preguntas: [
        '¿Cuál es la valorización económica total del inventario en almacén (precio × stock) y cuáles son los artículos más valiosos?',
        '¿Cuáles son los 3 productos con el precio unitario más elevado y cuál es su stock actual?',
        '¿Cuánto capital está inmovilizado en productos con existencias superiores a 20 unidades?'
      ]
    },
    {
      categoria: 'Seguridad & Control RBAC',
      preguntas: [
        '¿Qué usuarios tienen asignado el rol de ADMINISTRADOR o ENCARGADO_INVENTARIO y cuál es su correo?',
        '¿Qué permisos específicos tiene el rol CONSULTOR sobre las tablas de productos y stock?',
        '¿Existe algún usuario inactivo en el sistema que aún conserve roles asignados en usuarios_roles?'
      ]
    },
    {
      categoria: 'Toma de Decisiones & Análisis RAG',
      preguntas: [
        'Genera un plan de compra y reabastecimiento prioritario para los productos con menor inventario.',
        'Redacta un informe ejecutivo para gerencia resumiendo el estado del inventario, valor monetario y usuarios activos.',
        '¿Qué usuario con permisos de edición debería ser notificado para realizar un ajuste de inventario manual?'
      ]
    }
  ];

  window.API_CONFIG = {
    ENDPOINTS: ENDPOINTS,
    RAG_TEMPLATES: RAG_QUERY_TEMPLATES,

    getBaseUrl: function () {
      return localStorage.getItem(STORAGE_KEY_API_BASE) || defaultBaseUrl;
    },
    setBaseUrl: function (url) {
      localStorage.setItem(STORAGE_KEY_API_BASE, url.replace(/\/+$/, ''));
    },
    getN8nWebhookUrl: function () {
      return localStorage.getItem(STORAGE_KEY_N8N_WEBHOOK) || defaultN8nWebhook;
    },
    setN8nWebhookUrl: function (url) {
      localStorage.setItem(STORAGE_KEY_N8N_WEBHOOK, (url || defaultN8nWebhook).trim());
    },
    getMode: function () {
      return 'live';
    },
    setMode: function (mode) {
      localStorage.setItem(STORAGE_KEY_API_MODE, 'live');
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
