/**
 * Datos Iniciales del Modelo Entidad-Relación (MER)
 * Tablas: usuarios, roles, permisos, usuarios_roles, roles_permisos, productos.
 * Cero emojis.
 */

(function () {
  const INITIAL_DATA = {
    usuarios: [
      {
        id_usuario: 1,
        nombre: 'Carlos Andrés Mendoza',
        email: 'carlos.mendoza@empresa.com',
        password: '••••••••',
        estado: true,
        fecha_creacion: '2026-01-15 09:30:00'
      },
      {
        id_usuario: 2,
        nombre: 'Elena Sofía Ramos',
        email: 'elena.ramos@empresa.com',
        password: '••••••••',
        estado: true,
        fecha_creacion: '2026-02-10 11:20:00'
      },
      {
        id_usuario: 3,
        nombre: 'Mauricio Restrepo',
        email: 'm.restrepo@empresa.com',
        password: '••••••••',
        estado: true,
        fecha_creacion: '2026-03-05 14:45:00'
      },
      {
        id_usuario: 4,
        nombre: 'Diana Marcela Torres',
        email: 'diana.torres@empresa.com',
        password: '••••••••',
        estado: false,
        fecha_creacion: '2026-03-12 16:10:00'
      }
    ],

    roles: [
      {
        id_rol: 1,
        nombre: 'ADMINISTRADOR',
        descripcion: 'Control total de la plataforma, gestión de usuarios, roles y catálogo'
      },
      {
        id_rol: 2,
        nombre: 'ENCARGADO_INVENTARIO',
        descripcion: 'Gestión operativa de productos, altas, bajas y control de stock'
      },
      {
        id_rol: 3,
        nombre: 'CONSULTOR',
        descripcion: 'Consulta de existencias, precios y reportes en modo solo lectura'
      }
    ],

    permisos: [
      {
        id_permiso: 1,
        nombre: 'PRODUCTOS_VER',
        descripcion: 'Visualizar catálogo general de productos y existencias disponibles'
      },
      {
        id_permiso: 2,
        nombre: 'PRODUCTOS_CREAR',
        descripcion: 'Crear nuevos registros en la tabla de productos'
      },
      {
        id_permiso: 3,
        nombre: 'PRODUCTOS_EDITAR',
        descripcion: 'Modificar nombres, precios, descripciones y existencias'
      },
      {
        id_permiso: 4,
        nombre: 'PRODUCTOS_ELIMINAR',
        descripcion: 'Eliminar físicamente o dar de baja registros de productos'
      },
      {
        id_permiso: 5,
        nombre: 'USUARIOS_ADMIN',
        descripcion: 'Administrar la tabla de usuarios y sus estados de acceso'
      },
      {
        id_permiso: 6,
        nombre: 'ROLES_ASIGNAR',
        descripcion: 'Asignar roles a usuarios y configurar la matriz de permisos'
      },
      {
        id_permiso: 7,
        nombre: 'STOCK_AJUSTAR',
        descripcion: 'Realizar ajustes de inventario manuales sobre existencias'
      }
    ],

    usuarios_roles: [
      { id_usuario: 1, id_rol: 1 },
      { id_usuario: 2, id_rol: 2 },
      { id_usuario: 3, id_rol: 3 },
      { id_usuario: 4, id_rol: 2 }
    ],

    roles_permisos: [
      { id_rol: 1, id_permiso: 1 },
      { id_rol: 1, id_permiso: 2 },
      { id_rol: 1, id_permiso: 3 },
      { id_rol: 1, id_permiso: 4 },
      { id_rol: 1, id_permiso: 5 },
      { id_rol: 1, id_permiso: 6 },
      { id_rol: 1, id_permiso: 7 },
      { id_rol: 2, id_permiso: 1 },
      { id_rol: 2, id_permiso: 2 },
      { id_rol: 2, id_permiso: 3 },
      { id_rol: 2, id_permiso: 7 },
      { id_rol: 3, id_permiso: 1 }
    ],

    productos: [
      {
        id_producto: 1,
        nombre: 'Sensor Óptico Industrial Pro',
        descripcion: 'Sensor fotoeléctrico reflectivo de rango extendido con salida transistorizada NPN 24V.',
        precio: 84.50,
        stock: 42,
        estado: true,
        fecha_creacion: '2026-01-20 08:00:00'
      },
      {
        id_producto: 2,
        nombre: 'Módulo Relé Cuádruple 10A',
        descripcion: 'Módulo de conmutación aislada ópticamente para tableros y armarios eléctricos.',
        precio: 26.00,
        stock: 8,
        estado: true,
        fecha_creacion: '2026-01-25 10:15:00'
      },
      {
        id_producto: 3,
        nombre: 'Fuente Conmutada 24V 5A',
        descripcion: 'Alimentador industrial regulado para montaje en riel DIN, eficiencia superior a 91%.',
        precio: 54.00,
        stock: 15,
        estado: true,
        fecha_creacion: '2026-02-01 14:30:00'
      },
      {
        id_producto: 4,
        nombre: 'Terminal de Conexión Rápida',
        descripcion: 'Bloque terminal pasante 2.5mm² con fijación a resorte color gris paquete por 50 unidades.',
        precio: 18.75,
        stock: 120,
        estado: true,
        fecha_creacion: '2026-02-14 09:00:00'
      },
      {
        id_producto: 5,
        nombre: 'Cable Par Trenzado Blindado',
        descripcion: 'Bobina de 100m con apantallamiento para señales analógicas e instrumentación.',
        precio: 112.00,
        stock: 0,
        estado: false,
        fecha_creacion: '2026-02-20 17:00:00'
      },
      {
        id_producto: 6,
        nombre: 'Controlador Lógico Micro 14-E/S',
        descripcion: 'Autómata programable compacto con interfaz Ethernet y reloj en tiempo real integrado.',
        precio: 295.00,
        stock: 5,
        estado: true,
        fecha_creacion: '2026-03-01 11:45:00'
      },
      {
        id_producto: 7,
        nombre: 'Pulsador Industrial Rasante 22mm',
        descripcion: 'Actuador metálico verde con contacto normalmente abierto 1NA y protección IP65.',
        precio: 12.30,
        stock: 64,
        estado: true,
        fecha_creacion: '2026-03-10 13:20:00'
      }
    ]
  };

  window.MockData = {
    getInitialData: function () {
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  };
})();
