package com.estoque.realcar.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@AllArgsConstructor
public enum UserRole {

    USER("user"),
    ADMIN("admin");

    private String role;
}
