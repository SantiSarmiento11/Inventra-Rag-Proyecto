/**
 * Almacén de Estado Local Reactivo
 * Mantiene la persistencia de las 6 tablas del MER en LocalStorage.
 * Permite que el frontend funcione de forma totalmente autónoma y fluida,
 * y se sincronice con el backend cuando se active el modo API real.
 * Cero emojis.
 */

(function () {
  const STORAGE_KEY = 'inventario_mer_database_v1';

  let state = null;
  const listeners = [];

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state = JSON.parse(stored);
      } else {
        state = window.MockData.getInitialData();
        saveState();
      }
    } catch (e) {
      console.warn('Error cargando estado, restaurando inicial:', e);
      state = window.MockData.getInitialData();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      notify();
    } catch (e) {
      console.error('Error guardando en LocalStorage:', e);
    }
  }

  function notify() {
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error('Error en listener de store:', err);
      }
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

    // ------------------------------------------------------------------------
    // Operaciones: Productos
    // ------------------------------------------------------------------------
    getProductos: function () {
      return [...state.productos];
    },

    getProductoById: function (id) {
      return state.productos.find((p) => p.id_producto === Number(id));
    },

    addProducto: function (producto) {
      const nextId = state.productos.length > 0
        ? Math.max(...state.productos.map((p) => p.id_producto)) + 1
        : 1;

      const newProduct = {
        id_producto: nextId,
        nombre: producto.nombre.trim(),
        descripcion: (producto.descripcion || '').trim(),
        precio: parseFloat(producto.precio) || 0,
        stock: parseInt(producto.stock, 10) || 0,
        estado: producto.estado !== undefined ? Boolean(producto.estado) : true,
        fecha_creacion: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      state.productos.unshift(newProduct);
      saveState();
      return newProduct;
    },

    updateProducto: function (id, updates) {
      const index = state.productos.findIndex((p) => p.id_producto === Number(id));
      if (index === -1) return null;

      state.productos[index] = {
        ...state.productos[index],
        ...updates,
        precio: updates.precio !== undefined ? parseFloat(updates.precio) : state.productos[index].precio,
        stock: updates.stock !== undefined ? parseInt(updates.stock, 10) : state.productos[index].stock
      };

      saveState();
      return state.productos[index];
    },

    deleteProducto: function (id) {
      const prevLength = state.productos.length;
      state.productos = state.productos.filter((p) => p.id_producto !== Number(id));
      const changed = state.productos.length !== prevLength;
      if (changed) saveState();
      return changed;
    },

    toggleProductoEstado: function (id) {
      const prod = this.getProductoById(id);
      if (prod) {
        return this.updateProducto(id, { estado: !prod.estado });
      }
      return null;
    },

    // ------------------------------------------------------------------------
    // Operaciones: Usuarios & usuarios_roles
    // ------------------------------------------------------------------------
    getUsuarios: function () {
      return state.usuarios.map((u) => {
        const roleIds = state.usuarios_roles
          .filter((ur) => ur.id_usuario === u.id_usuario)
          .map((ur) => ur.id_rol);
        const roles = state.roles.filter((r) => roleIds.includes(r.id_rol));
        return { ...u, roles };
      });
    },

    getUsuarioById: function (id) {
      const user = state.usuarios.find((u) => u.id_usuario === Number(id));
      if (!user) return null;
      const roleIds = state.usuarios_roles
        .filter((ur) => ur.id_usuario === user.id_usuario)
        .map((ur) => ur.id_rol);
      const roles = state.roles.filter((r) => roleIds.includes(r.id_rol));
      return { ...user, roles };
    },

    addUsuario: function (user, roleIds = []) {
      const nextId = state.usuarios.length > 0
        ? Math.max(...state.usuarios.map((u) => u.id_usuario)) + 1
        : 1;

      const newUser = {
        id_usuario: nextId,
        nombre: user.nombre.trim(),
        email: user.email.trim(),
        password: user.password || '••••••••',
        estado: user.estado !== undefined ? Boolean(user.estado) : true,
        fecha_creacion: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      state.usuarios.unshift(newUser);

      // Asignar roles (tabla usuarios_roles)
      if (Array.isArray(roleIds)) {
        roleIds.forEach((rId) => {
          state.usuarios_roles.push({
            id_usuario: nextId,
            id_rol: Number(rId)
          });
        });
      }

      saveState();
      return this.getUsuarioById(nextId);
    },

    updateUsuario: function (id, updates, roleIds = null) {
      const index = state.usuarios.findIndex((u) => u.id_usuario === Number(id));
      if (index === -1) return null;

      state.usuarios[index] = {
        ...state.usuarios[index],
        ...updates
      };

      if (Array.isArray(roleIds)) {
        // Reemplazar roles en usuarios_roles
        state.usuarios_roles = state.usuarios_roles.filter(
          (ur) => ur.id_usuario !== Number(id)
        );
        roleIds.forEach((rId) => {
          state.usuarios_roles.push({
            id_usuario: Number(id),
            id_rol: Number(rId)
          });
        });
      }

      saveState();
      return this.getUsuarioById(id);
    },

    deleteUsuario: function (id) {
      state.usuarios = state.usuarios.filter((u) => u.id_usuario !== Number(id));
      state.usuarios_roles = state.usuarios_roles.filter(
        (ur) => ur.id_usuario !== Number(id)
      );
      saveState();
      return true;
    },

    toggleUsuarioEstado: function (id) {
      const user = state.usuarios.find((u) => u.id_usuario === Number(id));
      if (user) {
        user.estado = !user.estado;
        saveState();
        return user;
      }
      return null;
    },

    // ------------------------------------------------------------------------
    // Operaciones: Roles & roles_permisos
    // ------------------------------------------------------------------------
    getRoles: function () {
      return state.roles.map((r) => {
        const permIds = state.roles_permisos
          .filter((rp) => rp.id_rol === r.id_rol)
          .map((rp) => rp.id_permiso);
        const permisos = state.permisos.filter((p) => permIds.includes(p.id_permiso));
        const userCount = state.usuarios_roles.filter((ur) => ur.id_rol === r.id_rol).length;
        return { ...r, permisos, userCount };
      });
    },

    getRolById: function (id) {
      const rol = state.roles.find((r) => r.id_rol === Number(id));
      if (!rol) return null;
      const permIds = state.roles_permisos
        .filter((rp) => rp.id_rol === rol.id_rol)
        .map((rp) => rp.id_permiso);
      const permisos = state.permisos.filter((p) => permIds.includes(p.id_permiso));
      return { ...rol, permisos };
    },

    addRol: function (rol, permisoIds = []) {
      const nextId = state.roles.length > 0
        ? Math.max(...state.roles.map((r) => r.id_rol)) + 1
        : 1;

      const newRol = {
        id_rol: nextId,
        nombre: rol.nombre.trim().toUpperCase(),
        descripcion: (rol.descripcion || '').trim()
      };

      state.roles.push(newRol);

      if (Array.isArray(permisoIds)) {
        permisoIds.forEach((pId) => {
          state.roles_permisos.push({
            id_rol: nextId,
            id_permiso: Number(pId)
          });
        });
      }

      saveState();
      return this.getRolById(nextId);
    },

    updateRol: function (id, updates, permisoIds = null) {
      const index = state.roles.findIndex((r) => r.id_rol === Number(id));
      if (index === -1) return null;

      state.roles[index] = {
        ...state.roles[index],
        ...updates,
        nombre: updates.nombre ? updates.nombre.trim().toUpperCase() : state.roles[index].nombre
      };

      if (Array.isArray(permisoIds)) {
        state.roles_permisos = state.roles_permisos.filter(
          (rp) => rp.id_rol !== Number(id)
        );
        permisoIds.forEach((pId) => {
          state.roles_permisos.push({
            id_rol: Number(id),
            id_permiso: Number(pId)
          });
        });
      }

      saveState();
      return this.getRolById(id);
    },

    toggleRolPermiso: function (id_rol, id_permiso) {
      const exists = state.roles_permisos.some(
        (rp) => rp.id_rol === Number(id_rol) && rp.id_permiso === Number(id_permiso)
      );

      if (exists) {
        state.roles_permisos = state.roles_permisos.filter(
          (rp) => !(rp.id_rol === Number(id_rol) && rp.id_permiso === Number(id_permiso))
        );
      } else {
        state.roles_permisos.push({
          id_rol: Number(id_rol),
          id_permiso: Number(id_permiso)
        });
      }

      saveState();
      return !exists;
    },

    deleteRol: function (id) {
      state.roles = state.roles.filter((r) => r.id_rol !== Number(id));
      state.roles_permisos = state.roles_permisos.filter(
        (rp) => rp.id_rol !== Number(id)
      );
      state.usuarios_roles = state.usuarios_roles.filter(
        (ur) => ur.id_rol !== Number(id)
      );
      saveState();
      return true;
    },

    // ------------------------------------------------------------------------
    // Operaciones: Permisos
    // ------------------------------------------------------------------------
    getPermisos: function () {
      return [...state.permisos];
    },

    addPermiso: function (permiso) {
      const nextId = state.permisos.length > 0
        ? Math.max(...state.permisos.map((p) => p.id_permiso)) + 1
        : 1;

      const newPermiso = {
        id_permiso: nextId,
        nombre: permiso.nombre.trim().toUpperCase(),
        descripcion: (permiso.descripcion || '').trim()
      };

      state.permisos.push(newPermiso);
      saveState();
      return newPermiso;
    },

    deletePermiso: function (id) {
      state.permisos = state.permisos.filter((p) => p.id_permiso !== Number(id));
      state.roles_permisos = state.roles_permisos.filter(
        (rp) => rp.id_permiso !== Number(id)
      );
      saveState();
      return true;
    },

    // ------------------------------------------------------------------------
    // Métricas del Dashboard (derivadas del MER)
    // ------------------------------------------------------------------------
    getDashboardMetrics: function () {
      const prods = state.productos;
      const usrs = state.usuarios;

      const totalProductos = prods.length;
      const stockTotal = prods.reduce((sum, p) => sum + p.stock, 0);
      const valorTotal = prods.reduce((sum, p) => sum + (p.precio * p.stock), 0);
      const stockBajo = prods.filter((p) => p.stock > 0 && p.stock <= 10).length;
      const stockAgotado = prods.filter((p) => p.stock === 0).length;
      const productosActivos = prods.filter((p) => p.estado).length;

      const totalUsuarios = usrs.length;
      const usuariosActivos = usrs.filter((u) => u.estado).length;
      const totalRoles = state.roles.length;
      const totalPermisos = state.permisos.length;

      const criticalProducts = prods
        .filter((p) => p.stock <= 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      const topProductsByStock = [...prods]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5);

      return {
        totalProductos,
        stockTotal,
        valorTotal,
        stockBajo,
        stockAgotado,
        productosActivos,
        totalUsuarios,
        usuariosActivos,
        totalRoles,
        totalPermisos,
        criticalProducts,
        topProductsByStock
      };
    }
  };
})();
