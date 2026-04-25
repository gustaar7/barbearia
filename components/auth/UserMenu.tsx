"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, CalendarDays, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
        {user.fotoUrl ? (
          <img src={user.fotoUrl} alt={user.nome}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
          {user.nome.split(" ")[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Info do usuário */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{user.nome}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          {/* Links */}
          <div className="p-1">
            <Link href="/meus-agendamentos" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <CalendarDays className="w-4 h-4 text-primary" /> Meus Agendamentos
            </Link>
            <Link href="/perfil" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <User className="w-4 h-4 text-primary" /> Meu Perfil
            </Link>
          </div>

          {/* Toggle de tema */}
          <div className="p-1 border-t border-border">
            <button onClick={toggle}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              {theme === "dark"
                ? <><Sun className="w-4 h-4 text-amber-400" /> Modo Claro</>
                : <><Moon className="w-4 h-4 text-indigo-500" /> Modo Escuro</>}
            </button>
          </div>

          {/* Sair */}
          <div className="p-1 border-t border-border">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
