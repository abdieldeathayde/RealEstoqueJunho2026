package com.estoque.realcar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // Sua chave base64
    private static final String SECRET_KEY =
            "YWJkaWVsZXN0b3F1ZXNlY3JldGtleTEyMzQ1Njc4OTA=";

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // =============================
    // GERAR TOKEN (Sintaxe atualizada para jjwt 0.12.x)
    // =============================
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSignKey()) // O algoritmo agora é inferido automaticamente pelo tipo da chave!
                .compact();
    }

    // =============================
    // VALIDAR TOKEN
    // =============================
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // =============================
    // VERIFICA EXPIRAÇÃO
    // =============================
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    // =============================
    // EXTRAIR CLAIMS (Sintaxe atualizada para jjwt 0.12.x)
    // =============================
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey()) // Substitui o antigo setSigningKey()
                .build()
                .parseSignedClaims(token)  // Substitui o antigo parseClaimsJws()
                .getPayload();             // Substitui o antigo getBody()
    }

    // =============================
    // CHAVE SECRETA
    // =============================
    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes); // Retorna SecretKey perfeitamente
    }
}