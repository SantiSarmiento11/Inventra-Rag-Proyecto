/**
 * Almacén de Estado Local
 * Inicializado en 0 / vacío.
 * La aplicación se alimenta en vivo de la API REST del backend.
 * Cero emojis.
 */

(function () {
  const STORAGE_KEY = 'inventario_mer_database_v1';

  let state = {
    usuarios: [],
    roles: [],
    permisos: [],
    usuarios_roles: [],
    roles_permisos: [],
    productos: []
  };

  const listeners = [];

  function loadState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      state = window.MockData.getInitialData();
    } catch (e) {
      state = {
        usuarios: [],
        roles: [],
        permisos: [],
        usuarios_roles: [],
        roles_permisos: [],
        productos: []
      };
    }
  }

  function saveState() {
    notify();
  }

  function notify() {
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {}
    });
  }

  loadState();

  window.Store = {
    subscribe: function (fn) {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },

    getState: function () {
      return state;
    },

    resetToDefault: function () {
      state = window.MockData.getInitialData();
      saveState();
    },

    getProductos: function () {
      return [...state.productos];
    },

    getProductoById: function (id) {
      return state.productos.find((p) => p.id_producto === Number(id));
    },

    getUsuarios: function () {
      return [...state.usuarios];
    },

    getRoles: function () {
      return [...state.roles];
    },

    getPermisos: function () {
      return [...state.permisos];
    },

    getDashboardMetrics: function () {
      return {
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
    }
  };
})();
