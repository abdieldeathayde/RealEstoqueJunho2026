package com.estoque.realcar.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public abstract class UserDetailsService {
    public abstract UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException;
}
