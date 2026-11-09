package rag.storage.project.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import rag.storage.project.entity.Permiso;
import rag.storage.project.entity.Rol;
import rag.storage.project.entity.Usuario;
import rag.storage.project.repository.PermisoRepository;
import rag.storage.project.repository.RolRepository;
import rag.storage.project.repository.UsuarioRepository;

import java.util.*;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            PermisoRepository permisoRepo,
            RolRepository rolRepo,
            UsuarioRepository usuarioRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Inicializar Permisos del MER si no existen
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

            // Inicializar Roles con permisos asociados
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

            // Inicializar Usuario Administrador inicial para autenticación
            if (usuarioRepo.count() == 0) {
                Rol adminRol = rolRepo.findByNombre("ADMINISTRADOR").orElse(null);

                Usuario admin = Usuario.builder()
                        .nombre("Carlos Andrés Mendoza")
                        .email("carlos.mendoza@empresa.com")
                        .password(passwordEncoder.encode("password123"))
                        .estado(true)
                        .roles(adminRol != null ? Set.of(adminRol) : Collections.emptySet())
                        .build();

                usuarioRepo.save(admin);
            }

            // Nota: Productos arrancan en 0 (catálogo vacío para registro en vivo desde frontend)
        };
    }
}
