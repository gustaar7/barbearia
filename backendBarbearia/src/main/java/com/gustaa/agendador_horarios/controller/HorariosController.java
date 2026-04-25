package com.gustaa.agendador_horarios.controller;

import com.gustaa.agendador_horarios.infrastructure.repository.AgendamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/horarios")
@RequiredArgsConstructor
public class HorariosController {

    private final AgendamentoRepository agendamentoRepository;


    @GetMapping
    public ResponseEntity<List<LocalDateTime>> getHorariosOcupados(@RequestParam LocalDate data) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(23, 59, 59);

        return ResponseEntity.ok(agendamentoRepository.findHorariosByDia(inicio, fim));
    }
}
