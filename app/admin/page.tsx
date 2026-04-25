"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Scissors, Calendar, Clock, User, Phone, Trash2, RefreshCw,
  TrendingUp, Users, DollarSign, CheckCircle, ChevronLeft,
  ChevronRight, Search, Filter, LogOut, BarChart2, List, X,
  Edit2, Save, CalendarDays,
} from "lucide-react";
import { error } from "console";

interface Agendamento {
  id: number;
  servico: string;
  profissional: string;
  dataHoraAgendamento: string;
  cliente: string;
  telefoneCliente: string;
  dataInsercao?: string;
}

const API = "https://barbearia-production-667f.up.railway.app";

const SERVICOS_PRECOS: Record<string, number> = {
  cabelo: 45, barba: 35, combo: 70, sobrancelha: 20,
};

const SERVICOS_NOMES: Record<string, string> = {
  cabelo: "Corte de Cabelo", barba: "Barba",
  combo: "Cabelo + Barba", sobrancelha: "Sobrancelha",
};

const PROFISSIONAIS = ["Barbeiro 1", "Barbeiro 2", "Barbeiro 3"];
const HORARIOS = ["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function getTodayString() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR"),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function dateStrFromYMD(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (senha === "barber2024") { onLogin(); }
      else { setErro(true); setLoading(false); }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#E49E22] flex items-center justify-center mb-4 shadow-lg shadow-[#E49E22]/30">
            <Scissors className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Barber Studio</h1>
          <p className="text-zinc-400 text-sm mt-1">Painel Administrativo</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Senha</label>
            <input
              type="password" value={senha}
              onChange={e => { setSenha(e.target.value); setErro(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all ${
                erro ? "border-red-500 focus:ring-red-500/30" : "border-zinc-700 focus:ring-[#E49E22]/30 focus:border-[#E49E22]"
              }`}
            />
            {erro && <p className="text-red-400 text-xs mt-1">Senha incorreta.</p>}
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3 bg-[#E49E22] hover:bg-[#d08e1a] text-black font-semibold rounded-lg transition-colors disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
        <p className="text-center text-zinc-600 text-xs mt-4">Senha padrão: barber2024</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-zinc-400 text-xs">{label}</p>
        <p className="text-white text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EditModal({ ag, onClose, onSave }: {
  ag: Agendamento; onClose: () => void; onSave: (u: Agendamento) => Promise<void>;
}) {
  const [form, setForm] = useState({ ...ag });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const dt = new Date(ag.dataHoraAgendamento);
  const [date, setDate] = useState(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`);
  const [time, setTime] = useState(`${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`);

  const handleSave = async () => {
    setLoading(true); setErro("");
    try { await onSave({ ...form, dataHoraAgendamento: `${date}T${time}:00` }); onClose(); }
    catch { setErro("Erro ao salvar. Tente novamente."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Editar Agendamento</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {(["cliente","telefoneCliente"] as const).map(key => (
            <div key={key}>
              <label className="text-xs text-zinc-400 mb-1 block capitalize">{key === "cliente" ? "Cliente" : "Telefone"}</label>
              <input value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#E49E22]" />
            </div>
          ))}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Serviço</label>
            <select value={form.servico} onChange={e => setForm({...form, servico: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#E49E22]">
              {Object.entries(SERVICOS_NOMES).map(([id,nome]) => <option key={id} value={id}>{nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Profissional</label>
            <select value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#E49E22]">
              {PROFISSIONAIS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#E49E22]" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Horário</label>
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#E49E22]">
                {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
        {erro && <p className="text-red-400 text-xs mt-3">{erro}</p>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:bg-zinc-800 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 bg-[#E49E22] text-black font-semibold rounded-lg text-sm hover:bg-[#d08e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />{loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MonthlyView({ year, month, onDayClick }: {
  year: number; month: number; onDayClick: (dateStr: string) => void;
}) {
  const [monthData, setMonthData] = useState<Record<string, Agendamento[]>>({});
  const [loading, setLoading] = useState(false);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = getTodayString();

  useEffect(() => {
    setLoading(true);
    setMonthData({});
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    Promise.all(
      days.map(async d => {
        const dateStr = dateStrFromYMD(year, month, d);
        try {
          const res = await fetch(`${API}/agendamentos?data=${dateStr}`);
          if (!res.ok) return { dateStr, ags: [] as Agendamento[] };
          const ags: Agendamento[] = await res.json();
          return { dateStr, ags };
        } catch {
          return { dateStr, ags: [] as Agendamento[] };
        }
      })
    ).then(results => {
      const map: Record<string, Agendamento[]> = {};
      results.forEach(r => { map[r.dateStr] = r.ags; });
      setMonthData(map);
    }).finally(() => setLoading(false));
  }, [year, month, daysInMonth]);

  const allAgs = Object.values(monthData).flat();
  const totalMes = allAgs.length;
  const receitaMes = allAgs.reduce((acc, a) => acc + (SERVICOS_PRECOS[a.servico] ?? 0), 0);
  const diasComAg = Object.values(monthData).filter(d => d.length > 0).length;

  const servicosCounts: Record<string, number> = {};
  allAgs.forEach(a => { servicosCounts[a.servico] = (servicosCounts[a.servico] ?? 0) + 1; });

  const proCounts: Record<string, { count: number; receita: number }> = {};
  PROFISSIONAIS.forEach(p => { proCounts[p] = { count: 0, receita: 0 }; });
  allAgs.forEach(a => {
    if (proCounts[a.profissional]) {
      proCounts[a.profissional].count++;
      proCounts[a.profissional].receita += SERVICOS_PRECOS[a.servico] ?? 0;
    }
  });

  const topDays = Object.entries(monthData)
    .map(([d, ags]) => ({ d, receita: ags.reduce((acc, a) => acc + (SERVICOS_PRECOS[a.servico] ?? 0), 0), count: ags.length }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Clientes no mês" value={totalMes} sub="agendamentos" color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={DollarSign} label="Receita do mês" value={`R$ ${receitaMes}`} color="bg-[#E49E22]/20 text-[#E49E22]" />
        <StatCard icon={Calendar} label="Dias com agenda" value={diasComAg} sub={`de ${daysInMonth} dias`} color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={TrendingUp} label="Média/dia" value={diasComAg > 0 ? `R$ ${Math.round(receitaMes / diasComAg)}` : "—"} color="bg-green-500/20 text-green-400" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#E49E22]" />
            Calendário — {MESES[month]} {year}
          </h2>
          {loading && <span className="text-xs text-zinc-500 animate-pulse">Carregando...</span>}
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekdays.map(wd => (
            <div key={wd} className="text-center text-xs text-zinc-600 font-medium py-1">{wd}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = dateStrFromYMD(year, month, day);
            const ags = monthData[dateStr] ?? [];
            const count = ags.length;
            const receita = ags.reduce((acc, a) => acc + (SERVICOS_PRECOS[a.servico] ?? 0), 0);
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            const intensity = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3;
            const bgColors = ["bg-zinc-800/50","bg-[#E49E22]/20","bg-[#E49E22]/40","bg-[#E49E22]/70"];

            return (
              <button key={day} onClick={() => onDayClick(dateStr)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all group
                  ${bgColors[intensity]} hover:ring-2 hover:ring-[#E49E22]/50
                  ${isToday ? "ring-2 ring-[#E49E22]" : ""}
                  ${isPast && count === 0 ? "opacity-40" : ""}`}>
                <span className={`text-sm font-bold ${isToday ? "text-[#E49E22]" : intensity > 0 ? (intensity === 3 ? "text-black" : "text-[#E49E22]") : "text-zinc-400"}`}>
                  {day}
                </span>
                {count > 0 && (
                  <span className={`text-[10px] font-medium ${intensity === 3 ? "text-black" : "text-[#E49E22]"}`}>{count}</span>
                )}
                {count > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 hidden group-hover:flex flex-col bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl pointer-events-none">
                    <span className="font-semibold">{count} agendamento{count !== 1 ? "s" : ""}</span>
                    <span className="text-[#E49E22]">R$ {receita}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800 flex-wrap">
          <span className="text-xs text-zinc-500">Intensidade:</span>
          {[["Vazio","bg-zinc-800/50"],["1–2","bg-[#E49E22]/20"],["3–5","bg-[#E49E22]/40"],["6+","bg-[#E49E22]/70"]].map(([lbl,cls]) => (
            <div key={lbl} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded ${cls}`} />
              <span className="text-xs text-zinc-500">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#E49E22]" /> Serviços do Mês
          </h3>
          {totalMes === 0 ? (
            <p className="text-zinc-600 text-sm">Nenhum agendamento ainda.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(servicosCounts).sort((a,b) => b[1]-a[1]).map(([svc, cnt]) => {
                const pct = Math.round((cnt / totalMes) * 100);
                const receita = cnt * (SERVICOS_PRECOS[svc] ?? 0);
                return (
                  <div key={svc}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300">{SERVICOS_NOMES[svc] ?? svc}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">{cnt}x</span>
                        <span className="text-xs text-[#E49E22] font-medium">R$ {receita}</span>
                        <span className="text-xs text-zinc-600">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E49E22] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#E49E22]" /> Barbeiros no Mês
          </h3>
          <div className="space-y-3">
            {PROFISSIONAIS.map(pro => {
              const { count, receita } = proCounts[pro] ?? { count: 0, receita: 0 };
              const pct = totalMes > 0 ? Math.round((count / totalMes) * 100) : 0;
              return (
                <div key={pro}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300">{pro}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">{count} clientes</span>
                      <span className="text-xs text-green-400 font-medium">R$ {receita}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {topDays.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E49E22]" /> Top Dias do Mês
          </h3>
          <div className="space-y-2">
            {topDays.map(({ d, receita, count }, idx) => {
              const dt = new Date(d + "T12:00:00");
              const label = dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
              return (
                <button key={d} onClick={() => onDayClick(d)}
                  className="w-full flex items-center gap-4 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors text-left">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0 ? "bg-[#E49E22] text-black" : idx === 1 ? "bg-zinc-600 text-white" : "bg-zinc-700 text-zinc-400"
                  }`}>{idx+1}</span>
                  <span className="text-zinc-300 text-sm capitalize flex-1">{label}</span>
                  <span className="text-zinc-500 text-xs">{count} agend.</span>
                  <span className="text-[#E49E22] font-bold text-sm">R$ {receita}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"dashboard" | "mensal" | "agendamentos">("dashboard");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [search, setSearch] = useState("");
  const [filterProfissional, setFilterProfissional] = useState("");
  const [editando, setEditando] = useState<Agendamento | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const todayObj = new Date();
  const [monthYear, setMonthYear] = useState({ year: todayObj.getFullYear(), month: todayObj.getMonth() });

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/agendamentos?data=${selectedDate}`);
      if (!res.ok) throw new Error();
      const data: Agendamento[] = await res.json();
      data.sort((a, b) => new Date(a.dataHoraAgendamento).getTime() - new Date(b.dataHoraAgendamento).getTime());
      setAgendamentos(data);
    } catch { setAgendamentos([]); }
    finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchAgendamentos(); }, [fetchAgendamentos, refreshKey]);

  const handleDelete = async (ag: Agendamento) => {
    if (!confirm(`Cancelar agendamento de ${ag.cliente}?`)) return;
    setDeletingId(ag.id);
  
    try{

      const token = localStorage.getItem("token");

      const res = await fetch(
      `${API}/agendamentos?cliente=${encodeURIComponent(ag.cliente)}&dataHoraAgendamento=${encodeURIComponent(ag.dataHoraAgendamento)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );
      if(!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setRefreshKey(k=> k +1);
    } catch{
      alert("Erro ao cancelar.");
    }


    finally { setDeletingId(null); }
  };

  const handleSave = async (updated: Agendamento) => {
    const original = agendamentos.find(a => a.id === updated.id)!;
    await fetch(
      `${API}/agendamentos?cliente=${encodeURIComponent(original.cliente)}&dataHoraAgendamento=${encodeURIComponent(original.dataHoraAgendamento)}`,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }
    );
    setRefreshKey(k => k + 1);
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  };

  const shiftMonth = (delta: number) => {
    setMonthYear(prev => {
      let m = prev.month + delta, y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTab("dashboard");
  };

  const filtered = agendamentos.filter(ag => {
    const q = search.toLowerCase();
    return (!q || ag.cliente.toLowerCase().includes(q) || ag.telefoneCliente.includes(q))
      && (!filterProfissional || ag.profissional === filterProfissional);
  });

  const totalHoje = agendamentos.length;
  const receitaHoje = agendamentos.reduce((acc, ag) => acc + (SERVICOS_PRECOS[ag.servico] ?? 0), 0);
  const servicoMaisComum = (() => {
    const c: Record<string,number> = {};
    agendamentos.forEach(a => { c[a.servico] = (c[a.servico]??0)+1; });
    const top = Object.entries(c).sort((a,b)=>b[1]-a[1])[0];
    return top ? SERVICOS_NOMES[top[0]] ?? top[0] : "—";
  })();
  const profMaisOcupado = (() => {
    const c: Record<string,number> = {};
    agendamentos.forEach(a => { c[a.profissional] = (c[a.profissional]??0)+1; });
    const top = Object.entries(c).sort((a,b)=>b[1]-a[1])[0];
    return top ? top[0] : "—";
  })();
  const timeline = HORARIOS.map(h => {
    const ag = agendamentos.find(a => {
      const d = new Date(a.dataHoraAgendamento);
      return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}` === h;
    });
    return { hora: h, ag };
  });

  const isToday = selectedDate === getTodayString();
  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#E49E22] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-black" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">Barber Studio</p>
              <p className="text-zinc-500 text-xs">Admin</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {([
              { id: "dashboard",    icon: BarChart2,    label: "Diário"  },
              { id: "mensal",       icon: CalendarDays, label: "Mensal"  },
              { id: "agendamentos", icon: List,         label: "Lista"   },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === id ? "bg-[#E49E22] text-black" : "text-zinc-400 hover:text-white"
                }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          <button onClick={onLogout} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors shrink-0">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Daily date nav */}
        {(tab === "dashboard" || tab === "agendamentos") && (
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
            <button onClick={() => shiftDate(-1)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-white font-semibold capitalize">{displayDate}</p>
                {isToday && <span className="text-xs text-[#E49E22] font-medium">Hoje</span>}
              </div>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#E49E22]" />
              <button onClick={() => setRefreshKey(k => k+1)}
                className={`p-1.5 hover:bg-zinc-800 rounded-lg transition-colors ${loading ? "animate-spin" : ""}`}>
                <RefreshCw className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <button onClick={() => shiftDate(1)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        )}

        {/* Monthly nav */}
        {tab === "mensal" && (
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <p className="text-white font-semibold">{MESES[monthYear.month]} {monthYear.year}</p>
              <select value={monthYear.month} onChange={e => setMonthYear(p => ({...p, month: Number(e.target.value)}))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#E49E22]">
                {MESES.map((m,i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={monthYear.year} onChange={e => setMonthYear(p => ({...p, year: Number(e.target.value)}))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#E49E22]">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => shiftMonth(1)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        )}

        {/* ═══ DASHBOARD DIÁRIO ═══ */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Clientes hoje" value={totalHoje} sub="agendamentos" color="bg-blue-500/20 text-blue-400" />
              <StatCard icon={DollarSign} label="Receita estimada" value={`R$ ${receitaHoje}`} sub="no dia" color="bg-[#E49E22]/20 text-[#E49E22]" />
              <StatCard icon={TrendingUp} label="Serviço top" value={totalHoje > 0 ? servicoMaisComum : "—"} color="bg-purple-500/20 text-purple-400" />
              <StatCard icon={CheckCircle} label="Mais ocupado" value={totalHoje > 0 ? profMaisOcupado : "—"} color="bg-green-500/20 text-green-400" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E49E22]" /> Agenda do Dia
              </h2>
              {loading ? <div className="text-center py-8 text-zinc-500">Carregando...</div> : (
                <div className="space-y-2">
                  {timeline.map(({ hora, ag }) => (
                    <div key={hora} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${ag ? "bg-[#E49E22]/10 border-[#E49E22]/30" : "bg-zinc-800/40 border-zinc-800"}`}>
                      <span className={`text-sm font-mono font-bold w-12 shrink-0 ${ag ? "text-[#E49E22]" : "text-zinc-600"}`}>{hora}</span>
                      {ag ? (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#E49E22]/20 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[#E49E22]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{ag.cliente}</p>
                            <p className="text-zinc-400 text-xs">{SERVICOS_NOMES[ag.servico] ?? ag.servico} · {ag.profissional}</p>
                          </div>
                          <p className="text-[#E49E22] text-sm font-bold ml-auto shrink-0">R$ {SERVICOS_PRECOS[ag.servico] ?? "?"}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-sm">Disponível</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PROFISSIONAIS.map(pro => {
                const ags = agendamentos.filter(a => a.profissional === pro);
                const receita = ags.reduce((acc, a) => acc + (SERVICOS_PRECOS[a.servico] ?? 0), 0);
                return (
                  <div key={pro} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-300" />
                      </div>
                      <p className="text-white font-medium text-sm">{pro}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-zinc-800 rounded-lg p-2">
                        <p className="text-[#E49E22] font-bold text-lg">{ags.length}</p>
                        <p className="text-zinc-500 text-xs">clientes</p>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-2">
                        <p className="text-green-400 font-bold text-lg">R${receita}</p>
                        <p className="text-zinc-500 text-xs">receita</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ MENSAL ═══ */}
        {tab === "mensal" && (
          <MonthlyView year={monthYear.year} month={monthYear.month} onDayClick={handleDayClick} />
        )}

        {/* ═══ LISTA ═══ */}
        {tab === "agendamentos" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone..."
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#E49E22] transition-colors" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select value={filterProfissional} onChange={e => setFilterProfissional(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#E49E22] appearance-none transition-colors">
                  <option value="">Todos os barbeiros</option>
                  {PROFISSIONAIS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <p className="text-zinc-500 text-sm">{filtered.length} agendamento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
            {loading ? (
              <div className="text-center py-16 text-zinc-500">Carregando agendamentos...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 font-medium">Nenhum agendamento</p>
                <p className="text-zinc-600 text-sm mt-1">Sem agendamentos para este dia.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(ag => {
                  const { date, time } = formatDateTime(ag.dataHoraAgendamento);
                  return (
                    <div key={ag.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#E49E22]/10 border border-[#E49E22]/20 rounded-xl px-3 py-2 text-center shrink-0">
                          <p className="text-[#E49E22] font-bold text-lg leading-none">{time}</p>
                          <p className="text-zinc-500 text-xs mt-0.5">{date}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold">{ag.cliente}</p>
                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{ag.profissional}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-sm text-zinc-300 flex items-center gap-1">
                              <Scissors className="w-3.5 h-3.5 text-[#E49E22]" />{SERVICOS_NOMES[ag.servico] ?? ag.servico}
                            </span>
                            <span className="text-sm text-zinc-300 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-zinc-500" />{ag.telefoneCliente}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[#E49E22] font-bold">R$ {SERVICOS_PRECOS[ag.servico] ?? "?"}</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => setEditando(ag)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5 text-zinc-300" />
                            </button>
                            <button onClick={() => handleDelete(ag)} disabled={deletingId === ag.id}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {editando && <EditModal ag={editando} onClose={() => setEditando(null)} onSave={handleSave} />}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  return authed
    ? <AdminPanel onLogout={() => setAuthed(false)} />
    : <LoginScreen onLogin={() => setAuthed(true)} />;
}