package com.estoque.realcar.mapper;

import com.estoque.realcar.dto.UserDTO;
import com.estoque.realcar.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {


    User toEntity(UserDTO dto);

    UserDTO toDTO(User user);
}