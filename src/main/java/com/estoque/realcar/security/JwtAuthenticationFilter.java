package com.estoque.realcar.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth/")
                || path.startsWith("/swagger-ui/")
                || path.equals("/swagger-ui.html")
                || path.startsWith("/v3/api-docs/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("======================================");
        System.out.println("JWT FILTER");
        System.out.println("Método: " + request.getMethod());
        System.out.println("URI: " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");

        System.out.println(
                "Authorization presente: " +
                        (authHeader != null)
        );

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "JWT não encontrado no Authorization"
            );

            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {

            String username =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "Username extraído: " + username
            );

            if (username != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                System.out.println(
                        "Usuário encontrado: " +
                                userDetails.getUsername()
                );

                System.out.println(
                        "Authorities: " +
                                userDetails.getAuthorities()
                );

                boolean tokenValid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails
                        );

                System.out.println(
                        "Token válido: " +
                                tokenValid
                );

                if (tokenValid) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println(
                            "✅ AUTENTICAÇÃO JWT CONFIGURADA"
                    );
                } else {

                    System.out.println(
                            "❌ TOKEN JWT INVÁLIDO"
                    );
                }
            }

        } catch (Exception e) {

            System.err.println(
                    "❌ ERRO AO PROCESSAR JWT"
            );

            System.err.println(
                    "Mensagem: " + e.getMessage()
            );

            e.printStackTrace();

            SecurityContextHolder.clearContext();
        }

        System.out.println(
                "Authentication atual: " +
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
        );

        System.out.println("======================================");

        filterChain.doFilter(request, response);
    }
}