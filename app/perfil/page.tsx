"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Camera, Trash2, Save, ArrowLeft,
  Mail, Phone, Lock, CheckCircle, Loader2, LogOut,
} from "lucide-react";
import { useAuth, useApiFetch } from "@/context/AuthContext";

type Status = "idle" | "saving" | "success" | "error";

export default function PerfilPage() {
  const { user, loading: authLoading, updateUser, logout } = useAuth();
  const apiFetch = useApiFetch();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [nome,     setNome]     = useState("");
  const [telefone, setTelefone] = useState("");
  const [status,   setStatus]   = useState<Status>("idle");
  const [erro,     setErro]     = useState("");

  // Photo state
  const [photoStatus, setPhotoStatus] = useState<Status>("idle");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Populate form when user loads
  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) {
      setNome(user.nome ?? "");
      setTelefone(user.telefone ?? "");
      setPhotoPreview(user.fotoUrl ?? null);
    }
  }, [user, authLoading, router]);

  // ── Save profile ──
  const handleSave = async () => {
    if (!nome.trim()) { setErro("O nome não pode estar vazio."); return; }
    setStatus("saving"); setErro("");
    try {
      const res = await apiFetch("/usuarios/perfil", {
        method: "PUT",
        body: JSON.stringify({ nome: nome.trim(), telefone: telefone.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      updateUser({ nome: data.nome, telefone: data.telefone });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
      setStatus("error");
    }
  };

  // ── Photo preview (before upload) ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErro("A foto deve ter no máximo 5MB."); return; }
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    handleUpload(file);
  };

  // ── Upload photo ──
  const handleUpload = async (file: File) => {
    setPhotoStatus("saving");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiFetch("/usuarios/foto", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      updateUser({ fotoUrl: data.fotoUrl });
      setPhotoPreview(data.fotoUrl);
      setPhotoStatus("success");
      setTimeout(() => setPhotoStatus("idle"), 2500);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao enviar foto.");
      setPhotoStatus("error");
    }
  };

  // ── Delete photo ──
  const handleDeletePhoto = async () => {
    if (!confirm("Remover foto de perfil?")) return;
    setPhotoStatus("saving");
    try {
      await apiFetch("/usuarios/foto", { method: "DELETE" });
      updateUser({ fotoUrl: null });
      setPhotoPreview(null);
      setPhotoStatus("idle");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setPhotoStatus("error");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Meu Perfil</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">

        {/* ── Photo card ── */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Foto de Perfil
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-border">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* Loading overlay */}
              {photoStatus === "saving" && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              {/* Success overlay */}
              {photoStatus === "success" && (
                <div className="absolute inset-0 rounded-full bg-green-500/80 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoStatus === "saving"}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <Camera className="w-4 h-4" />
                {photoPreview ? "Trocar foto" : "Adicionar foto"}
              </button>
              {photoPreview && (
                <button
                  onClick={handleDeletePhoto}
                  disabled={photoStatus === "saving"}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-red-500 text-sm font-medium rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" /> Remover foto
                </button>
              )}
              <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP — máx. 5MB</p>
            </div>
          </div>

          <input
            ref={fileRef} type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ── Personal info card ── */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Informações Pessoais
          </h2>

          {/* Nome */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nome completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text" value={nome} onChange={e => { setNome(e.target.value); setErro(""); }}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email" value={user.email} disabled
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel" value={telefone}
                onChange={e => { setTelefone(e.target.value); setErro(""); }}
                placeholder="(00) 00000-0000"
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Feedback */}
          {erro && (
            <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" /> Perfil atualizado com sucesso!
            </div>
          )}

          <button
            onClick={handleSave} disabled={status === "saving"}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {status === "saving" ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        {/* ── Account actions ── */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Conta
          </h2>
          <p className="text-xs text-muted-foreground">
            Membro desde{" "}
            <span className="text-foreground font-medium">
              {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
          </p>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="w-full py-2.5 border border-red-500/30 text-red-500 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>

      </div>
    </main>
  );
}
