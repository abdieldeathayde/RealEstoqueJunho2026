package com.estoque.realcar.dto;

import com.estoque.realcar.entities.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import org.mapstruct.Mapping;

public record UserDTO (
        @NotBlank(message = "Campo nome obrigatório")
        String username,
        @NotBlank(message = "Campo senha obrigatório")
        String password,

        String role


){
}
