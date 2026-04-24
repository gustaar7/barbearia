"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/app/login/Authcontent";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email,  setEmail]  = useState("");
  const [senha,  setSenha]  = useState("");
  const [show,   setShow]   = useState(false);
  const [erro,   setErro]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !senha) { setErro("Preencha todos os campos."); return; }
    setLoading(true); setErro("");
    try {
      await login(email, senha);
      router.push("/");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Barber Studio</h1>
          <p className="text-muted-foreground text-sm mt-1">Entre na sua conta</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); setErro(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} value={senha}
                onChange={e => { setSenha(e.target.value); setErro(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {erro && <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{erro}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline font-medium">
            Criar conta
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Continuar sem login →
          </Link>
        </p>
      </div>
    </div>
  );
}