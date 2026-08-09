package com.estoque.realcar.config;

import com.estoque.realcar.security.CustomUserDetailsService;
import com.estoque.realcar.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(
            JwtFilter jwtFilter,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Desabilita CSRF (essencial em APIs REST stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // Configuração de CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Estado de sessão stateless (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Regras de Autorização de Acesso aos Endpoints
                .authorizeHttpRequests(auth -> auth

                        // 1. Libera requisições OPTIONS (Pre-flight CORS do navegador)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Autenticação (Login, Cadastro, etc.)
                        .requestMatchers("/auth/**", "/api/auth/**").permitAll()

                        // 3. Produtos
                        .requestMatchers("/produtos", "/produtos/**").permitAll()

                        // 4. NOTAS FISCAIS: Libera a rota base E todas as sub-rotas (com IDs)
                        // Isso permite GET, POST, PUT e DELETE em /api/notas-fiscais e /api/notas-fiscais/{id}
                        .requestMatchers("/api/notas-fiscais", "/api/notas-fiscais/**").permitAll()

                        // 5. Qualquer outra rota não mapeada exige Token JWT
                        .anyRequest().authenticated()
                )

                // Insere o filtro JWT antes do filtro padrão do Spring
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Para ambiente de dev local, permitimos a origem explícita do front-end ou wildcard controlado
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false); // Desativado para evitar conflito com origin patterns "*" em chamadas simples

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}