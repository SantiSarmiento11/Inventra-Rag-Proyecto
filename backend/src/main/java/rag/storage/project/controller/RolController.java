package rag.storage.project.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rag.storage.project.dto.PermisoDTO;
import rag.storage.project.dto.RolDTO;
import rag.storage.project.entity.Permiso;
import rag.storage.project.entity.Rol;
import rag.storage.project.repository.PermisoRepository;
import rag.storage.project.repository.RolRepository;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    public RolController(RolRepository rolRepository, PermisoRepository permisoRepository) {
        this.rolRepository = rolRepository;
        this.permisoRepository = permisoRepository;
    }

    @GetMapping
    public ResponseEntity<List<RolDTO>> getAll() {
        List<RolDTO> list = rolRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolDTO> getById(@PathVariable Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));
        return ResponseEntity.ok(toDTO(rol));
    }

    @PostMapping
    public ResponseEntity<RolDTO> create(@RequestBody RolDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del rol es requerido");
        }

        String nombreNorm = dto.getNombre().trim().toUpperCase();
        if (rolRepository.existsByNombre(nombreNorm)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un rol con este nombre");
        }

        Set<Permiso> permisos = resolvePermisos(dto.getPermisoIds());

        Rol rol = Rol.builder()
                .nombre(nombreNorm)
                .descripcion(dto.getDescripcion())
                .permisos(permisos)
                .build();

        Rol guardado = rolRepository.save(rol);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolDTO> update(@PathVariable Long id, @RequestBody RolDTO dto) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            String nuevoNombre = dto.getNombre().trim().toUpperCase();
            if (!rol.getNombre().equalsIgnoreCase(nuevoNombre) && rolRepository.existsByNombre(nuevoNombre)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un rol con ese nombre");
            }
            rol.setNombre(nuevoNombre);
        }

        if (dto.getDescripcion() != null) {
            rol.setDescripcion(dto.getDescripcion());
        }

        if (dto.getPermisoIds() != null) {
            rol.setPermisos(resolvePermisos(dto.getPermisoIds()));
        }

        Rol actualizado = rolRepository.save(rol);
        return ResponseEntity.ok(toDTO(actualizado));
    }

    @PutMapping("/{id}/permisos")
    public ResponseEntity<RolDTO> updatePermisos(@PathVariable Long id, @RequestBody List<Long> permisoIds) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));

        rol.setPermisos(resolvePermisos(permisoIds));
        Rol actualizado = rolRepository.save(rol);
        return ResponseEntity.ok(toDTO(actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!rolRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado");
        }
        rolRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Permiso> resolvePermisos(List<Long> permisoIds) {
        if (permisoIds == null || permisoIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(permisoRepository.findAllById(permisoIds));
    }

    private RolDTO toDTO(Rol r) {
        List<PermisoDTO> permisoDTOs = r.getPermisos() != null
                ? r.getPermisos().stream()
                .map(p -> PermisoDTO.builder()
                        .idPermiso(p.getIdPermiso())
                        .nombre(p.getNombre())
                        .descripcion(p.getDescripcion())
                        .build())
                .toList()
                : Collections.emptyList();

        List<Long> ids = permisoDTOs.stream().map(PermisoDTO::getIdPermiso).toList();

        return RolDTO.builder()
                .idRol(r.getIdRol())
                .nombre(r.getNombre())
                .descripcion(r.getDescripcion())
                .permisos(permisoDTOs)
                .permisoIds(ids)
                .build();
    }
}
