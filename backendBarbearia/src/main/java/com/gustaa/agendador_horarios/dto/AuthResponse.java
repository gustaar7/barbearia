package com.gustaa.agendador_horarios.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String nome;
    private String email;
    private String telefone;
    private String fotoUrl;
}