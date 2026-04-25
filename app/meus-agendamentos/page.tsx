"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Scissors, User, Phone, Loader2, Trash2 } from "lucide-react";
import { useAuth, useApiFetch } from "@/context/AuthContext";

interface Agendamento {
  id: number;
  servico: string;
  profissional: string;
  dataHoraAgendamento: string;
  cliente: string;
  telefoneCliente: string;
}

const SERVICOS_NOMES: Record<string, string> = {
  cabelo: "Corte de Cabelo", barba: "Barba",
  combo: "Cabelo + Barba", sobrancelha: "Sobrancelha",
};
const SERVICOS_PRECOS: Record<string, number> = {
  cabelo: 45, barba: 35, combo: 70, sobrancelha: 20,
};

export default function MeusAgendamentosPage() {
  const { user, loading: authLoading } = useAuth();
  const apiFetch = useApiFetch();
  const router = useRouter();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) fetchAgendamentos();
  }, [user, authLoading]);

  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/agendamentos/meus");
      if (!res.ok) throw new Error();
      const data: Agendamento[] = await res.json();
      setAgendamentos(data);
    } catch {
      setErro("Não foi possível carregar seus agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (ag: Agendamento) => {
    if (!confirm(`Cancelar agendamento de ${new Date(ag.dataHoraAgendamento).toLocaleDateString("pt-BR")}?`)) return;
    setDeletingId(ag.id);
    try {
      await apiFetch(`/agendamentos?cliente=${encodeURIComponent(ag.cliente)}&dataHoraAgendamento=${encodeURIComponent(ag.dataHoraAgendamento)}`, { method: "DELETE" });
      setAgendamentos(prev => prev.filter(a => a.id !== ag.id));
    } catch {
      alert("Erro ao cancelar agendamento.");
    } finally {
      setDeletingId(null);
    }
  };

  const agora = new Date();
  const futuros = agendamentos.filter(a => new Date(a.dataHoraAgendamento) >= agora);
  const passados = agendamentos.filter(a => new Date(a.dataHoraAgendamento) < agora);

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const AgCard = ({ ag, past }: { ag: Agendamento; past?: boolean }) => {
    const dt = new Date(ag.dataHoraAgendamento);
    const date = dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
      <div className={`bg-card border rounded-2xl p-4 transition-all ${past ? "opacity-60 border-border" : "border-border hover:border-primary/40"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${past ? "bg-secondary border-border" : "bg-primary/10 border-primary/20"}`}>
              <span className={`text-sm font-bold leading-none ${past ? "text-muted-foreground" : "text-primary"}`}>
                {dt.getDate().toString().padStart(2, "0")}
              </span>
              <span className={`text-[10px] ${past ? "text-muted-foreground" : "text-primary"}`}>
                {dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-foreground font-semibold">{SERVICOS_NOMES[ag.servico] ?? ag.servico}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> {ag.profissional}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{date}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`font-bold text-sm ${past ? "text-muted-foreground" : "text-primary"}`}>
              R$ {SERVICOS_PRECOS[ag.servico] ?? "?"}
            </span>
            {!past && (
              <button onClick={() => handleCancelar(ag)} disabled={deletingId === ag.id}
                className="p-1.5 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-50">
                {deletingId === ag.id
                  ? <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Meus Agendamentos</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : erro ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-destructive-foreground">{erro}</p>
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-semibold">Nenhum agendamento</p>
            <p className="text-muted-foreground text-sm mt-1">Você ainda não fez nenhum agendamento.</p>
            <button onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Agendar agora
            </button>
          </div>
        ) : (
          <>
            {futuros.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  Próximos ({futuros.length})
                </h2>
                {futuros.map(ag => <AgCard key={ag.id} ag={ag} />)}
              </div>
            )}
            {passados.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Histórico ({passados.length})
                </h2>
                {passados.map(ag => <AgCard key={ag.id} ag={ag} past />)}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
