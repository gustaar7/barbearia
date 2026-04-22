💈 Sistema de Agendamento para Barbearia

Sistema web completo para agendamento online de horários em barbearias. Permite que clientes escolham serviços, profissionais e horários disponíveis de forma simples, enquanto o backend gerencia os dados de forma centralizada.

🚀 Demo

🔗 Backend em produção:
https://barbearia-production-667f.up.railway.app

📌 Funcionalidades
📋 Listagem de serviços com preços
👨‍🔧 Seleção de profissional
📅 Escolha de data e horário
📝 Formulário com nome e telefone
✅ Confirmação de agendamento
🔗 Integração frontend ↔ backend via API REST
🧱 Tecnologias
Frontend
Next.js (React + TypeScript)
Tailwind CSS
shadcn/ui
Backend
Spring Boot (Java)
Maven
JPA / Hibernate
Banco de Dados
Configurado via JPA (PostgreSQL / MySQL / H2)
Deploy
Railway (backend)
🏗️ Arquitetura

O projeto segue uma arquitetura clássica:

Frontend
Página principal com interface responsiva
Gerenciamento de estado com React Hooks
Comunicação com API via fetch
Backend (MVC)
Controller: endpoints REST (/agendamentos)
Service: regras de negócio
Repository: acesso ao banco
Entity: modelagem dos dados
🔄 Fluxo da Aplicação
Usuário acessa o sistema
Seleciona serviço, profissional, data e horário
Preenche nome e telefone
Frontend envia requisição POST /agendamentos
Backend valida e salva no banco
Sistema retorna sucesso
Interface exibe confirmação
⚙️ Como Executar
Pré-requisitos
Node.js
Java 17+
Maven
▶️ Rodando o Frontend
npm install
npm run dev

Acesse:
http://localhost:3000

▶️ Rodando o Backend
./mvnw spring-boot:run

A API estará disponível em:
http://localhost:8080

⚠️ Limitações Atuais
Sem autenticação
Não impede conflitos de horário
Sem painel administrativo
Sem notificações (email/SMS)
Tratamento de erro básico
📈 Melhorias Futuras
🔐 Autenticação com JWT
📅 Validação de horários disponíveis
📊 Dashboard para administradores
📩 Notificações automáticas
🧪 Testes automatizados
🐳 Docker para deploy
📄 Licença

Este projeto é de uso livre para fins de estudo e melhoria.