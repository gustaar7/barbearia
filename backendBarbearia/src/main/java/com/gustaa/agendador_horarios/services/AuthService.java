package com.gustaa.agendador_horarios.services;

import com.gustaa.agendador_horarios.dto.AuthDTOs;
import com.gustaa.agendador_horarios.dto.AuthResponse;
import com.gustaa.agendador_horarios.infrastructure.entity.UsuarioEntity;
import com.gustaa.agendador_horarios.infrastructure.repository.UsuarioRepository;
import com.gustaa.agendador_horarios.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(AuthDTOs.RegisterRequest req) {
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado");
        }

        UsuarioEntity u = new UsuarioEntity();
        u.setNome(req.nome());
        u.setEmail(req.email());
        u.setSenha(passwordEncoder.encode(req.senha()));
        u.setTelefone(req.telefone());

        usuarioRepository.save(u);

        String token = jwtUtil.generateToken(u.getId(), u.getEmail());

        return new AuthResponse(
                token,
                u.getNome(),
                u.getEmail(),
                u.getTelefone(),
                u.getFotoUrl()
        );
    }

    public AuthResponse login(AuthDTOs.LoginRequest req) {
        UsuarioEntity u = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos"));

        if (!passwordEncoder.matches(req.senha(), u.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
        }

        String token = jwtUtil.generateToken(u.getId(), u.getEmail());

        return new AuthResponse(
                token,
                u.getNome(),
                u.getEmail(),
                u.getTelefone(),
                u.getFotoUrl()
        );
    }
}
