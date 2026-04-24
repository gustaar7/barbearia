package com.gustaa.agendador_horarios.dto;

public class AuthDTOs {

    public record RegisterRequest (
    String nome,
    String email,
    String senha,
    String telefone
    ) {}

    public record LoginRequest(
            String email,
            String senha
    ) {}

    public record AuthResponde(
            String token,
            String nome,
            String email,
            String telefone,
            String fotoUrl
    ){}

    public record PerfilUpdateRequest(
            String nome,
            String telefone
    ){}

    public record PerfilResponse(
            Long id,
            String nome,
            String email,
            String telefone,
            String fotoUrl
    ){}
}
