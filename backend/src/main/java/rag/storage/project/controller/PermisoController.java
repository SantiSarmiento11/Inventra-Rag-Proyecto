package rag.storage.project.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rag.storage.project.dto.PermisoDTO;
import rag.storage.project.entity.Permiso;
import rag.storage.project.repository.PermisoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/permisos")
public class PermisoController {

    private final PermisoRepository permisoRepository;

    public PermisoController(PermisoRepository permisoRepository) {
        this.permisoRepository = permisoRepository;
    }

    @GetMapping
    public ResponseEntity<List<PermisoDTO>> getAll() {
        List<PermisoDTO> list = permisoRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermisoDTO> getById(@PathVariable Long id) {
        Permiso permiso = permisoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permiso no encontrado"));
        return ResponseEntity.ok(toDTO(permiso));
    }

    private PermisoDTO toDTO(Permiso p) {
        return PermisoDTO.builder()
                .idPermiso(p.getIdPermiso())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .build();
    }
}
