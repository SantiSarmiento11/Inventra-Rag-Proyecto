package rag.storage.project.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rag.storage.project.dto.AuthResponse;
import rag.storage.project.dto.LoginRequest;
import rag.storage.project.dto.RolDTO;
import rag.storage.project.dto.UsuarioResponseDTO;
import rag.storage.project.entity.Rol;
import rag.storage.project.entity.Usuario;
import rag.storage.project.repository.UsuarioRepository;
import rag.storage.project.security.JwtService;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UsuarioRepository usuarioRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe ninguna cuenta asociada al correo proporcionado"));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Acceso denegado: El usuario se encuentra en estado inactivo en la base de datos"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<String> roleNames = usuario.getRoles() != null
                    ? usuario.getRoles().stream().map(Rol::getNombre).toList()
                    : Collections.emptyList();

            String token = jwtService.generateToken(userDetails, usuario.getIdUsuario(), roleNames);

            UsuarioResponseDTO userDto = toDTO(usuario);

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .user(userDto)
                    .build());
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciales incorrectas"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token no provisto o expirado");
        }

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return ResponseEntity.ok(toDTO(usuario));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Sesión finalizada exitosamente"));
    }

    private UsuarioResponseDTO toDTO(Usuario usuario) {
        List<String> roleNames = usuario.getRoles() != null
                ? usuario.getRoles().stream().map(Rol::getNombre).toList()
                : Collections.emptyList();

        List<Long> roleIds = usuario.getRoles() != null
                ? usuario.getRoles().stream().map(Rol::getIdRol).toList()
                : Collections.emptyList();

        List<RolDTO> roleDetails = usuario.getRoles() != null
                ? usuario.getRoles().stream().map(r -> RolDTO.builder()
                .idRol(r.getIdRol())
                .nombre(r.getNombre())
                .descripcion(r.getDescripcion())
                .build()).toList()
                : Collections.emptyList();

        return UsuarioResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .estado(usuario.getEstado())
                .fechaCreacion(usuario.getFechaCreacion())
                .roles(roleNames)
                .roleIds(roleIds)
                .rolesDetail(roleDetails)
                .build();
    }
}
