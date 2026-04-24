package com.gustaa.agendador_horarios.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gustaa.agendador_horarios.dto.AuthDTOs.*;
import com.gustaa.agendador_horarios.infrastructure.entity.UsuarioEntity;
import com.gustaa.agendador_horarios.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final Cloudinary cloudinary;

    public PerfilResponse getPerfil(Long userId) {
        UsuarioEntity u = find(userId);
        return toResponse(u);
    }

    public PerfilResponse updatePerfil(Long userId, PerfilUpdateRequest req) {
        UsuarioEntity u = find(userId);
        if (req.nome()     != null) u.setNome(req.nome());
        if (req.telefone() != null) u.setTelefone(req.telefone());
        usuarioRepository.save(u);
        return toResponse(u);
    }

    public PerfilResponse uploadFoto(Long userId, MultipartFile file) throws IOException {
        UsuarioEntity u = find(userId);

        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder",          "barber_studio/fotos",
                        "public_id",       "usuario_" + userId,
                        "overwrite",       true,
                        "transformation",  "w_300,h_300,c_fill,g_face,r_max"
                )
        );

        u.setFotoUrl((String) result.get("secure_url"));
        usuarioRepository.save(u);
        return toResponse(u);
    }

    public void deleteFoto(Long userId) {
        UsuarioEntity u = find(userId);
        try {
            cloudinary.uploader().destroy("barber_studio/fotos/usuario_" + userId, ObjectUtils.emptyMap());
        } catch (IOException ignored) {}
        u.setFotoUrl(null);
        usuarioRepository.save(u);
    }

    // ─────────────────────────────────────────────
    private UsuarioEntity find(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    private PerfilResponse toResponse(UsuarioEntity u) {
        return new PerfilResponse(u.getId(), u.getNome(), u.getEmail(), u.getTelefone(), u.getFotoUrl());
    }
}