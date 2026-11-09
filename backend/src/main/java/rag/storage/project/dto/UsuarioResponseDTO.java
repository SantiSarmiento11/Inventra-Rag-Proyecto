package rag.storage.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {

    @JsonProperty("id_usuario")
    private Long idUsuario;

    private String nombre;

    private String email;

    private Boolean estado;

    @JsonProperty("fecha_creacion")
    private LocalDateTime fechaCreacion;

    private List<String> roles;

    @JsonProperty("roleIds")
    private List<Long> roleIds;

    @JsonProperty("roles_detail")
    private List<RolDTO> rolesDetail;
}
