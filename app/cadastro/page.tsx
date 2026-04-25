"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CadastroPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "", confirmar: "" });
  const [show, setShow] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErro("");
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.senha) { setErro("Preencha os campos obrigatórios."); return; }
    if (form.senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (form.senha !== form.confirmar) { setErro("As senhas não coincidem."); return; }

    setLoading(true); setErro("");
    try {
      await register(form.nome, form.email, form.senha, form.telefone);
      router.push("/");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Barber Studio</h1>
          <p className="text-muted-foreground text-sm mt-1">Crie sua conta</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">

          {/* Nome */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Nome completo <span className="text-destructive-foreground">*</span>
            </label>
            <input
              type="text" value={form.nome} onChange={set("nome")}
              placeholder="Seu nome"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Email <span className="text-destructive-foreground">*</span>
            </label>
            <input
              type="email" value={form.email} onChange={set("email")}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Telefone <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              type="tel" value={form.telefone} onChange={set("telefone")}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Senha <span className="text-destructive-foreground">*</span>
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} value={form.senha} onChange={set("senha")}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 pr-11 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Confirmar senha <span className="text-destructive-foreground">*</span>
            </label>
            <input
              type={show ? "text" : "password"} value={form.confirmar} onChange={set("confirmar")}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Repita a senha"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Erro */}
          {erro && (
            <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
