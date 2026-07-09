package com.estoque.realcar.mapper;

import com.estoque.realcar.dto.UserDTO;
import com.estoque.realcar.entities.User;
import com.estoque.realcar.entities.UserRole;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-09T17:51:49-0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Ubuntu)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(UserDTO dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        user.setUsername( dto.username() );
        user.setPassword( dto.password() );
        if ( dto.role() != null ) {
            user.setRole( Enum.valueOf( UserRole.class, dto.role() ) );
        }

        return user;
    }

    @Override
    public UserDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        String username = null;
        String password = null;
        String role = null;

        username = user.getUsername();
        password = user.getPassword();
        if ( user.getRole() != null ) {
            role = user.getRole().name();
        }

        UserDTO userDTO = new UserDTO( username, password, role );

        return userDTO;
    }
}
