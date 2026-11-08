package rag.storage.project.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import rag.storage.project.entity.Permiso;
import rag.storage.project.entity.Producto;
import rag.storage.project.entity.Rol;
import rag.storage.project.entity.Usuario;
import rag.storage.project.repository.PermisoRepository;
import rag.storage.project.repository.ProductoRepository;
import rag.storage.project.repository.RolRepository;
import rag.storage.project.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.util.*;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            PermisoRepository permisoRepo,
            RolRepository rolRepo,
            UsuarioRepository usuarioRepo,
            ProductoRepository productoRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Inicializar Permisos si no existen
            if (permisoRepo.count() == 0) {
                List<Permiso> permisosList = List.of(
                        Permiso.builder().nombre("PRODUCTOS_VER").descripcion("Visualizar catálogo general de productos y existencias").build(),
                        Permiso.builder().nombre("PRODUCTOS_CREAR").descripcion("Crear nuevos registros en la tabla de productos").build(),
                        Permiso.builder().nombre("PRODUCTOS_EDITAR").descripcion("Modificar nombres, precios, descripciones y existencias").build(),
                        Permiso.builder().nombre("PRODUCTOS_ELIMINAR").descripcion("Eliminar registros de productos").build(),
                        Permiso.builder().nombre("USUARIOS_ADMIN").descripcion("Administrar la tabla de usuarios y sus estados de acceso").build(),
                        Permiso.builder().nombre("ROLES_ASIGNAR").descripcion("Asignar roles a usuarios y configurar la matriz de permisos").build(),
                        Permiso.builder().nombre("STOCK_AJUSTAR").descripcion("Realizar ajustes de inventario manuales sobre existencias").build()
                );
                permisoRepo.saveAll(permisosList);
            }

            // Inicializar Roles con permisos
            if (rolRepo.count() == 0) {
                List<Permiso> allPermisos = permisoRepo.findAll();
                Set<Permiso> fullPermisos = new HashSet<>(allPermisos);

                Set<Permiso> encargadoPermisos = new HashSet<>(
                        allPermisos.stream()
                                .filter(p -> p.getNombre().startsWith("PRODUCTOS_") || p.getNombre().equals("STOCK_AJUSTAR"))
                                .toList()
                );

                Set<Permiso> consultorPermisos = new HashSet<>(
                        allPermisos.stream()
                                .filter(p -> p.getNombre().equals("PRODUCTOS_VER"))
                                .toList()
                );

                Rol adminRol = Rol.builder()
                        .nombre("ADMINISTRADOR")
                        .descripcion("Control total de la plataforma, gestión de usuarios, roles y catálogo")
                        .permisos(fullPermisos)
                        .build();

                Rol encargadoRol = Rol.builder()
                        .nombre("ENCARGADO_INVENTARIO")
                        .descripcion("Gestión operativa de productos, altas, bajas y control de stock")
                        .permisos(encargadoPermisos)
                        .build();

                Rol consultorRol = Rol.builder()
                        .nombre("CONSULTOR")
                        .descripcion("Consulta de existencias, precios y reportes en modo solo lectura")
                        .permisos(consultorPermisos)
                        .build();

                rolRepo.saveAll(List.of(adminRol, encargadoRol, consultorRol));
            }

            // Inicializar Usuarios de prueba si no existen
            if (usuarioRepo.count() == 0) {
                Rol adminRol = rolRepo.findByNombre("ADMINISTRADOR").orElse(null);
                Rol encargadoRol = rolRepo.findByNombre("ENCARGADO_INVENTARIO").orElse(null);

                Usuario admin = Usuario.builder()
                        .nombre("Carlos Andrés Mendoza")
                        .email("carlos.mendoza@empresa.com")
                        .password(passwordEncoder.encode("admin123"))
                        .estado(true)
                        .roles(adminRol != null ? Set.of(adminRol) : Collections.emptySet())
                        .build();

                Usuario operador = Usuario.builder()
                        .nombre("Elena Sofía Ramos")
                        .email("elena.ramos@empresa.com")
                        .password(passwordEncoder.encode("elena123"))
                        .estado(true)
                        .roles(encargadoRol != null ? Set.of(encargadoRol) : Collections.emptySet())
                        .build();

                usuarioRepo.saveAll(List.of(admin, operador));
            }

            // Inicializar Productos de prueba si no existen
            if (productoRepo.count() == 0) {
                List<Producto> productos = List.of(
                        Producto.builder()
                                .nombre("Laptop ThinkPad T14 Gen 4")
                                .descripcion("Intel Core i7 13th Gen, 16GB DDR5, 512GB SSD NVMe, Pantalla 14\" WUXGA")
                                .precio(new BigDecimal("1249.99"))
                                .stock(18)
                                .estado(true)
                                .build(),
                        Producto.builder()
                                .nombre("Monitor UltraSharp 27\" 4K")
                                .descripcion("Panel IPS, Resolución 3840x2160, USB-C Hub 90W PD, 99% sRGB")
                                .precio(new BigDecimal("589.50"))
                                .stock(4) // Stock bajo para alerta
                                .estado(true)
                                .build(),
                        Producto.builder()
                                .nombre("Teclado Mecánico Keychron K2")
                                .descripcion("Inalámbrico Bluetooth 5.1 y USB-C, Switches Gateron G Pro Brown, RGB")
                                .precio(new BigDecimal("89.90"))
                                .stock(32)
                                .estado(true)
                                .build(),
                        Producto.builder()
                                .nombre("Mouse Ergonómico MX Master 3S")
                                .descripcion("Sensor 8000 DPI Darkfield, Clics silenciosos, Conectividad Flow")
                                .precio(new BigDecimal("109.00"))
                                .stock(15)
                                .estado(true)
                                .build()
                );
                productoRepo.saveAll(productos);
            }
        };
    }
}
