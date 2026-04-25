"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors, Eye, EyeOff, Sun, Moon,
  LogIn, UserPlus, Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

type Tab = "login" | "cadastro";

export default function WelcomePage() {
  const { user, loading: authLoading, login, register } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("login");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // Cadastro
  const [cadNome,      setCadNome]      = useState("");
  const [cadEmail,     setCadEmail]     = useState("");
  const [cadTelefone,  setCadTelefone]  = useState("");
  const [cadSenha,     setCadSenha]     = useState("");
  const [cadConfirmar, setCadConfirmar] = useState("");

  // Se já logado, vai direto pro agendamento
  useEffect(() => {
    if (!authLoading && user) router.replace("/agendamento");
  }, [user, authLoading, router]);

  const switchTab = (t: Tab) => { setTab(t); setErro(""); setShowSenha(false); };

  const handleLogin = async () => {
    if (!loginEmail || !loginSenha) { setErro("Preencha email e senha."); return; }
    setLoading(true); setErro("");
    try {
      await login(loginEmail, loginSenha);
      router.push("/agendamento");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Email ou senha inválidos.");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!cadNome || !cadEmail || !cadSenha) { setErro("Preencha os campos obrigatórios."); return; }
    if (cadSenha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (cadSenha !== cadConfirmar) { setErro("As senhas não coincidem."); return; }
    setLoading(true); setErro("");
    try {
      await register(cadNome, cadEmail, cadSenha, cadTelefone);
      router.push("/agendamento");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao criar conta.");
    } finally { setLoading(false); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Toggle de tema — canto superior direito */}
      <div className="flex justify-end p-4">
        <button
          onClick={toggle}
          aria-label="Alternar tema"
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-secondary transition-all text-sm font-medium text-foreground"
        >
          {theme === "dark" ? (
            <><Sun className="w-4 h-4 text-amber-400" /><span className="hidden sm:inline text-foreground">Modo Claro</span></>
          ) : (
            <><Moon className="w-4 h-4 text-indigo-500" /><span className="hidden sm:inline text-foreground">Modo Escuro</span></>
          )}
        </button>
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl">
                <Scissors className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Barber Studio</h1>
            <p className="text-muted-foreground text-sm mt-1">Estilo e tradição em cada corte</p>

            {/* Stats */}
            <div className="flex items-center gap-5 mt-5 text-xs text-muted-foreground">
              <div className="text-center">
                <p className="text-foreground font-bold text-base">500+</p>
                <p>clientes</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-foreground font-bold text-base">3</p>
                <p>barbeiros</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-foreground font-bold text-base">5★</p>
                <p>avaliação</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">

            {/* Abas */}
            <div className="flex border-b border-border">
              {(["login", "cadastro"] as Tab[]).map(t => (
                <button key={t} onClick={() => switchTab(t)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    tab === t
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {t === "login" ? <><LogIn className="w-4 h-4" /> Entrar</> : <><UserPlus className="w-4 h-4" /> Criar conta</>}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-3">

              {/* ── LOGIN ── */}
              {tab === "login" && (
                <>
                  <Field label="Email" type="email" placeholder="seu@email.com"
                    value={loginEmail} onChange={v => { setLoginEmail(v); setErro(""); }} />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Senha</label>
                    <div className="relative">
                      <input type={showSenha ? "text" : "password"} value={loginSenha}
                        onChange={e => { setLoginSenha(e.target.value); setErro(""); }}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-11 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      <button type="button" onClick={() => setShowSenha(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {erro && <ErrMsg msg={erro} />}

                  <button onClick={handleLogin} disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                </>
              )}

              {/* ── CADASTRO ── */}
              {tab === "cadastro" && (
                <>
                  <Field label="Nome completo *" type="text" placeholder="Seu nome"
                    value={cadNome} onChange={v => { setCadNome(v); setErro(""); }} />

                  <Field label="Email *" type="email" placeholder="seu@email.com"
                    value={cadEmail} onChange={v => { setCadEmail(v); setErro(""); }} />

                  <Field label="Telefone" type="tel" placeholder="(00) 00000-0000"
                    value={cadTelefone} onChange={v => { setCadTelefone(v); setErro(""); }} />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Senha *</label>
                    <div className="relative">
                      <input type={showSenha ? "text" : "password"} value={cadSenha}
                        onChange={e => { setCadSenha(e.target.value); setErro(""); }}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-4 py-3 pr-11 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      <button type="button" onClick={() => setShowSenha(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Field label="Confirmar senha *" type={showSenha ? "text" : "password"}
                    placeholder="Repita a senha" value={cadConfirmar}
                    onChange={v => { setCadConfirmar(v); setErro(""); }}
                    onEnter={handleRegister} />

                  {erro && <ErrMsg msg={erro} />}

                  <button onClick={handleRegister} disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {loading ? "Criando conta..." : "Criar conta"}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, onEnter }: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; onEnter?: () => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter?.()}
        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
    </div>
  );
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{msg}</p>
  );
}
