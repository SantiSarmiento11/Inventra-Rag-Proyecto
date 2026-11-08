package rag.storage.project.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rag.storage.project.dto.UsuarioRequestDTO;
import rag.storage.project.dto.UsuarioResponseDTO;
import rag.storage.project.entity.Rol;
import rag.storage.project.entity.Usuario;
import rag.storage.project.repository.RolRepository;
import rag.storage.project.repository.UsuarioRepository;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> getAll() {
        List<UsuarioResponseDTO> list = usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> getById(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return ResponseEntity.ok(toDTO(usuario));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> create(@Valid @RequestBody UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un usuario con este correo electrónico");
        }

        String rawPassword = (dto.getPassword() != null && !dto.getPassword().isBlank())
                ? dto.getPassword()
                : "password123";

        Set<Rol> roles = resolveRoles(dto.getRoleIds());

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(rawPassword))
                .estado(dto.getEstado() != null ? dto.getEstado() : true)
                .roles(roles)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String newEmail = dto.getEmail().trim().toLowerCase();
        if (!usuario.getEmail().equalsIgnoreCase(newEmail) && usuarioRepository.existsByEmail(newEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe otro usuario con este correo electrónico");
        }

        usuario.setNombre(dto.getNombre());
        usuario.setEmail(newEmail);
        if (dto.getEstado() != null) {
            usuario.setEstado(dto.getEstado());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank() && !dto.getPassword().contains("•")) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getRoleIds() != null) {
            usuario.setRoles(resolveRoles(dto.getRoleIds()));
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toDTO(actualizado));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<UsuarioResponseDTO> toggleEstado(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        usuario.setEstado(!Boolean.TRUE.equals(usuario.getEstado()));
        Usuario actualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toDTO(actualizado));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<UsuarioResponseDTO> updateRoles(@PathVariable Long id, @RequestBody List<Long> roleIds) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        usuario.setRoles(resolveRoles(roleIds));
        Usuario actualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toDTO(actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Rol> resolveRoles(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(rolRepository.findAllById(roleIds));
    }

    private UsuarioResponseDTO toDTO(Usuario u) {
        List<String> roleNames = u.getRoles() != null
                ? u.getRoles().stream().map(Rol::getNombre).toList()
                : Collections.emptyList();

        return UsuarioResponseDTO.builder()
                .idUsuario(u.getIdUsuario())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .estado(u.getEstado())
                .fechaCreacion(u.getFechaCreacion())
                .roles(roleNames)
                .build();
    }
}
