package rag.storage.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolDTO {

    @JsonProperty("id_rol")
    private Long idRol;

    private String nombre;

    private String descripcion;

    private List<PermisoDTO> permisos;

    @JsonProperty("permisoIds")
    private List<Long> permisoIds;
}
