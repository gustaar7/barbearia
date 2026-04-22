"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Scissors, Clock, Phone, User, Calendar, ChevronDown, MapPin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Sucesso from "@/components/ui/sucesso";

const servicos = [
  { id: "cabelo", nome: "Corte de Cabelo", preco: "R$ 45" },
  { id: "barba", nome: "Barba", preco: "R$ 35" },
  { id: "combo", nome: "Cabelo + Barba", preco: "R$ 70" },
  { id: "sobrancelha", nome: "Sobrancelha", preco: "R$ 20" },
];

const profissionais = [
  { id: "Barbeiro 1", nome: "Barbeiro 1" },
  { id: "Barbeiro 2", nome: "Barbeiro 2" },
  { id: "Barbeiro 3", nome: "Barbeiro 3" },
];

const horarios = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

// Returns today's date in YYYY-MM-DD format (local time)
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PageCliente() {
  const [servico, setServico] = useState("");
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [cliente, setCliente] = useState("");
  const [cllCliente, setCllCliente] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [erro, setErro] = useState("");

  const agendar = async () => {
    if (!servico || !profissional || !data || !hora || !cliente || !cllCliente) {
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("https://barbearia-production-667f.up.railway.app/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          servico,
          profissional,
          dataHoraAgendamento: `${data}T${hora}:00`,
          cliente,
          telefoneCliente: cllCliente,
        }),
      });

      if (res.ok) {
        setServico("");
        setProfissional("");
        setData("");
        setHora("");
        setCliente("");
        setCllCliente("");
        setHorariosOcupados([]);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 4000);
      } else {
        setErro("Erro ao agendar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no agendamento:", error);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Busca horários ocupados ao trocar a data
  useEffect(() => {
    if (!data) return;

    setLoadingHorarios(true);
    setHora(""); // reset hora ao mudar data

    fetch(`https://barbearia-production-667f.up.railway.app/api/horarios?data=${data}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar horários");
        return res.json();
      })
      .then((result: unknown[]) => {
        const formatados = result
          .map((h) => {
            try {
              const dataStr = typeof h === "string" ? h : (h as { dataHoraAgendamento: string }).dataHoraAgendamento;
              return new Date(dataStr).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch {
              return undefined;
            }
          })
          .filter(Boolean) as string[];
        setHorariosOcupados(formatados);
      })
      .catch((err) => {
        console.error("Erro ao buscar horários:", err);
        setHorariosOcupados([]);
      })
      .finally(() => setLoadingHorarios(false));
  }, [data]);

  const today = getTodayString();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Barber Studio</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4 mr-2" />
              Meu Perfil
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-8 relative">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src="/images/banner.jpg"
              alt="Interior da barbearia"
              width={1200}
              height={400}
              className="w-full h-64 md:h-80 object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2 text-balance">
                Estilo e Tradição
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                A melhor experiência em barbearia da cidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Horários de funcionamento */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Seg-Sex</span>
                  <span className="text-foreground font-medium">07h - 18h</span>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sábado</span>
                  <span className="text-foreground font-medium">09h - 18h</span>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Domingo</span>
                  <span className="text-foreground font-medium">09h - 16h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Nossos Serviços
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {servicos.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  servico === s.id ? "border-primary bg-primary/10" : "bg-card border-border"
                }`}
                onClick={() => setServico(s.id)}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-foreground">{s.nome}</p>
                  <p className="text-primary text-lg font-bold mt-1">{s.preco}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Agendamento */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4 max-w-lg">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agendar Horário
          </h3>

          <div className="space-y-4">
            {/* Profissional */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Profissional</label>
              <div className="relative">
                <select
                  value={profissional}
                  onChange={(e) => setProfissional(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data</label>
              <input
                type="date"
                value={data}
                min={today}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Horário
                {loadingHorarios && (
                  <span className="ml-2 text-xs text-muted-foreground">Carregando...</span>
                )}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {horarios.map((h) => {
                  const isOcupado = horariosOcupados.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        if (isOcupado) return;
                        setHora(h);
                      }}
                      disabled={isOcupado || loadingHorarios}
                      title={isOcupado ? "Horário ocupado" : ""}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        isOcupado
                          ? "bg-red-500 text-white cursor-not-allowed opacity-60"
                          : hora === h
                          ? "bg-primary text-primary-foreground"
                          : "bg-input border border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Seu nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={cllCliente}
                  onChange={(e) => setCllCliente(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <p className="text-sm text-red-500 text-center">{erro}</p>
            )}

            {/* Botão Agendar */}
            <Button
              onClick={agendar}
              disabled={loading || !servico || !profissional || !data || !hora || !cliente || !cllCliente}
              className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>

            {sucesso && (
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                <Sucesso />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Seu endereço, 123</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span>(11) 99999-9999</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
