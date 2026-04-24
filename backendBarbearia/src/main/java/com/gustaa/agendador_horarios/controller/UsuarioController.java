package com.gustaa.agendador_horarios.controller;

import com.gustaa.agendador_horarios.dto.AuthDTOs.*;
import com.gustaa.agendador_horarios.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/perfil")
    public ResponseEntity<PerfilResponse> getPerfil(Authentication auth) {
        return ResponseEntity.ok(usuarioService.getPerfil(userId(auth)));
    }

    @PutMapping("/perfil")
    public ResponseEntity<PerfilResponse> updatePerfil(
            Authentication auth,
            @RequestBody PerfilUpdateRequest req) {
        return ResponseEntity.ok(usuarioService.updatePerfil(userId(auth), req));
    }

    @PostMapping("/foto")
    public ResponseEntity<PerfilResponse> uploadFoto(
            Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(usuarioService.uploadFoto(userId(auth), file));
    }

    @DeleteMapping("/foto")
    public ResponseEntity<PerfilResponse> deleteFoto(Authentication auth) {
        usuarioService.deleteFoto(userId(auth));
        return ResponseEntity.ok(usuarioService.getPerfil(userId(auth)));
    }

    private Long userId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }
}