package com.gustaa.agendador_horarios.services;

import com.gustaa.agendador_horarios.infrastructure.entity.Agendamento;
import com.gustaa.agendador_horarios.infrastructure.repository.AgendamentoRepository;
import com.gustaa.agendador_horarios.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Salva agendamento. userId é opcional (null para guests).
     */
    public Agendamento salvarAgendamento(Agendamento agendamento) {
        return salvarAgendamento(agendamento, null);
    }

    public Agendamento salvarAgendamento(Agendamento agendamento, Long userId) {
        LocalDateTime hora    = agendamento.getDataHoraAgendamento();
        LocalDateTime horaFim = hora.plusMinutes(1);

        Agendamento existente = agendamentoRepository
                .findByServicoAndDataHoraAgendamentoBetween(agendamento.getServico(), hora, horaFim);

        if (Objects.nonNull(existente)) {
            throw new RuntimeException("Horário já está preenchido");
        }

        // Vincula usuário logado se houver
        if (userId != null) {
            usuarioRepository.findById(userId).ifPresent(agendamento::setUsuario);
        }

        return agendamentoRepository.save(agendamento);
    }

    public void deletarAgendamento(LocalDateTime dataHora, String cliente) {
        agendamentoRepository.deleteByDataHoraAgendamentoAndCliente(dataHora, cliente);
    }

    public List<Agendamento> buscarAgendamentosDia(LocalDate data) {
        return agendamentoRepository.findByDataHoraAgendamentoBetween(
                data.atStartOfDay(), data.atTime(23, 59, 59));
    }

    public Agendamento alterarAgendamento(Agendamento agendamento, String cliente, LocalDateTime dataHora) {
        Agendamento existing = agendamentoRepository.findByDataHoraAgendamentoAndCliente(dataHora, cliente);
        if (Objects.isNull(existing)) throw new RuntimeException("Horário não encontrado");
        agendamento.setId(existing.getId());
        agendamento.setUsuario(existing.getUsuario()); // preserve user link
        return agendamentoRepository.save(agendamento);
    }

    public List<Agendamento> buscarMeusAgendamentos(Long userId) {
        return agendamentoRepository.findByUsuarioIdOrderByDataHoraAgendamentoAsc(userId);
    }
}
