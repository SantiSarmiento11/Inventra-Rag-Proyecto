package rag.storage.project.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rag.storage.project.entity.Usuario;
import rag.storage.project.repository.UsuarioRepository;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        Set<GrantedAuthority> authorities = new HashSet<>();
        if (usuario.getRoles() != null) {
            usuario.getRoles().forEach(rol -> {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNombre()));
                if (rol.getPermisos() != null) {
                    rol.getPermisos().forEach(permiso ->
                            authorities.add(new SimpleGrantedAuthority(permiso.getNombre()))
                    );
                }
            });
        }

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPassword())
                .disabled(!Boolean.TRUE.equals(usuario.getEstado()))
                .authorities(authorities)
                .build();
    }
}
