package rag.storage.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoDTO {

    @JsonProperty("id_permiso")
    private Long idPermiso;

    private String nombre;

    private String descripcion;
}
