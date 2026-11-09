/**
 * Datos Iniciales del Modelo Entidad-Relación (MER)
 * Datos simulados establecidos en 0 / vacíos.
 * La aplicación se alimenta en vivo de la base de datos PostgreSQL mediante la API REST.
 * Cero emojis.
 */

(function () {
  const INITIAL_DATA = {
    usuarios: [],
    roles: [],
    permisos: [],
    usuarios_roles: [],
    roles_permisos: [],
    productos: []
  };

  window.MockData = {
    getInitialData: function () {
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  };
})();
