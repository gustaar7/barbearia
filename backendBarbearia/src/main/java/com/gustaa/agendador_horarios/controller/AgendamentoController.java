package com.gustaa.agendador_horarios.controller;

import com.gustaa.agendador_horarios.infrastructure.entity.Agendamento;
import com.gustaa.agendador_horarios.services.AgendamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    /** Criar agendamento — funciona com ou sem login */
    @PostMapping
    public ResponseEntity<Agendamento> salvar(
            @RequestBody Agendamento agendamento,
            Authentication auth) {

        Long userId = (auth != null && auth.isAuthenticated())
                ? (Long) auth.getPrincipal()
                : null;

        return ResponseEntity.accepted()
                .body(agendamentoService.salvarAgendamento(agendamento, userId));
    }

    @DeleteMapping
    public ResponseEntity<Void> deletar(
            @RequestParam String cliente,
            @RequestParam LocalDateTime dataHoraAgendamento) {
        agendamentoService.deletarAgendamento(dataHoraAgendamento, cliente);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Agendamento>> buscarDia(@RequestParam LocalDate data) {
        return ResponseEntity.ok(agendamentoService.buscarAgendamentosDia(data));
    }

    @PutMapping
    public ResponseEntity<Agendamento> alterar(
            @RequestBody Agendamento agendamento,
            @RequestParam String cliente,
            @RequestParam LocalDateTime dataHoraAgendamento) {
        return ResponseEntity.accepted()
                .body(agendamentoService.alterarAgendamento(agendamento, cliente, dataHoraAgendamento));
    }

    /** Meus agendamentos — requer JWT */
    @GetMapping("/meus")
    public ResponseEntity<List<Agendamento>> meus(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(agendamentoService.buscarMeusAgendamentos(userId));
    }
}