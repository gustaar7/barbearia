package com.gustaa.agendador_horarios.controller;

import com.gustaa.agendador_horarios.infrastructure.repository.AgendamentoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HorariosController {

    private final AgendamentoRepository agendamentoRepository;

    public HorariosController(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    @GetMapping("/horarios")
    public List<String> getHorariosOcupados(@RequestParam String data) {
        return agendamentoRepository.findByDataHoraAgendamentoAndCliente(data);
    }

}
