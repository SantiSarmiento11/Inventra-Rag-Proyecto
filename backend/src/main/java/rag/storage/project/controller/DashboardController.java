package rag.storage.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rag.storage.project.dto.ProductoDTO;
import rag.storage.project.entity.Producto;
import rag.storage.project.repository.ProductoRepository;
import rag.storage.project.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardController(ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> getResumen() {
        List<Producto> productos = productoRepository.findAll();

        long totalProductos = productos.size();
        long activos = productos.stream().filter(p -> Boolean.TRUE.equals(p.getEstado())).count();
        long stockTotal = productos.stream().mapToLong(p -> p.getStock() != null ? p.getStock() : 0).sum();

        BigDecimal valorTotal = productos.stream()
                .filter(p -> Boolean.TRUE.equals(p.getEstado()) && p.getPrecio() != null && p.getStock() != null)
                .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long stockBajo = productos.stream().filter(p -> (p.getStock() == null || p.getStock() <= 5)).count();
        long totalUsuarios = usuarioRepository.count();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalProductos", totalProductos);
        resumen.put("productosActivos", activos);
        resumen.put("stockTotal", stockTotal);
        resumen.put("valorInventario", valorTotal);
        resumen.put("stockCriticoCount", stockBajo);
        resumen.put("totalUsuarios", totalUsuarios);

        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/stock-critico")
    public ResponseEntity<List<ProductoDTO>> getStockCritico(@RequestParam(defaultValue = "5") int threshold) {
        List<ProductoDTO> criticos = productoRepository.findByStockLessThanEqual(threshold).stream()
                .map(p -> ProductoDTO.builder()
                        .idProducto(p.getIdProducto())
                        .nombre(p.getNombre())
                        .descripcion(p.getDescripcion())
                        .precio(p.getPrecio())
                        .stock(p.getStock())
                        .estado(p.getEstado())
                        .fechaCreacion(p.getFechaCreacion())
                        .build())
                .toList();

        return ResponseEntity.ok(criticos);
    }
}
