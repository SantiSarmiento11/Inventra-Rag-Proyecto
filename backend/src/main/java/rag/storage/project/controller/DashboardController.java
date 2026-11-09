package rag.storage.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rag.storage.project.dto.ProductoDTO;
import rag.storage.project.entity.Producto;
import rag.storage.project.entity.Usuario;
import rag.storage.project.repository.PermisoRepository;
import rag.storage.project.repository.ProductoRepository;
import rag.storage.project.repository.RolRepository;
import rag.storage.project.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    public DashboardController(
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PermisoRepository permisoRepository
    ) {
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.permisoRepository = permisoRepository;
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> getResumen() {
        List<Producto> prods = productoRepository.findAll();
        List<Usuario> usrs = usuarioRepository.findAll();

        long totalProductos = prods.size();
        long stockTotal = prods.stream().mapToLong(p -> p.getStock() != null ? p.getStock() : 0).sum();

        BigDecimal valorTotal = prods.stream()
                .filter(p -> p.getPrecio() != null && p.getStock() != null)
                .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long stockBajo = prods.stream().filter(p -> p.getStock() != null && p.getStock() > 0 && p.getStock() <= 10).count();
        long stockAgotado = prods.stream().filter(p -> p.getStock() == null || p.getStock() == 0).count();
        long productosActivos = prods.stream().filter(p -> Boolean.TRUE.equals(p.getEstado())).count();

        long totalUsuarios = usrs.size();
        long usuariosActivos = usrs.stream().filter(u -> Boolean.TRUE.equals(u.getEstado())).count();
        long totalRoles = rolRepository.count();
        long totalPermisos = permisoRepository.count();

        List<ProductoDTO> criticalProducts = prods.stream()
                .filter(p -> p.getStock() == null || p.getStock() <= 10)
                .sorted(Comparator.comparing(p -> p.getStock() != null ? p.getStock() : 0))
                .limit(5)
                .map(this::toDTO)
                .toList();

        List<ProductoDTO> topProductsByStock = prods.stream()
                .sorted((a, b) -> Integer.compare(
                        b.getStock() != null ? b.getStock() : 0,
                        a.getStock() != null ? a.getStock() : 0
                ))
                .limit(5)
                .map(this::toDTO)
                .toList();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalProductos", totalProductos);
        resumen.put("stockTotal", stockTotal);
        resumen.put("valorTotal", valorTotal);
        resumen.put("stockBajo", stockBajo);
        resumen.put("stockAgotado", stockAgotado);
        resumen.put("productosActivos", productosActivos);
        resumen.put("totalUsuarios", totalUsuarios);
        resumen.put("usuariosActivos", usuariosActivos);
        resumen.put("totalRoles", totalRoles);
        resumen.put("totalPermisos", totalPermisos);
        resumen.put("criticalProducts", criticalProducts);
        resumen.put("topProductsByStock", topProductsByStock);

        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/stock-critico")
    public ResponseEntity<List<ProductoDTO>> getStockCritico(@RequestParam(defaultValue = "10") int threshold) {
        List<ProductoDTO> criticos = productoRepository.findByStockLessThanEqual(threshold).stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(criticos);
    }

    private ProductoDTO toDTO(Producto p) {
        return ProductoDTO.builder()
                .idProducto(p.getIdProducto())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .stock(p.getStock() != null ? p.getStock() : 0)
                .estado(p.getEstado() != null ? p.getEstado() : true)
                .fechaCreacion(p.getFechaCreacion())
                .build();
    }
}
