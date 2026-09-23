"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Acá agregamos la solapa de Ingresos para que la veas
  const links = [
    { href: "/", label: "📊 Resumen" },
    { href: "/incomes", label: "💰 Ingresos" },
    { href: "/expenses", label: "💸 Gastos" },
    { href: "/subscriptions", label: "💸 Gastos Fijos" }, // <--- AGREGAMOS ESTA LÍNEA
    { href: "/cards", label: "💳 Tarjetas" },
    { href: "/categories", label: "🏷️ Categorías" },
  ];

  return (
    <header className="w-full bg-white shadow-sm border-b border-green-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥑</span>
          <div>
            <h1 className="font-extrabold text-green-700 text-base">Mis Gastos</h1>
            <p className="text-xs text-slate-500 font-medium">¡Hola, Fifi!</p>
          </div>
        </div>
        
        <nav className="flex flex-wrap items-center justify-center gap-1 bg-green-50/80 p-1.5 rounded-2xl border border-green-100">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 md:px-4 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-green-700 hover:bg-green-100/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100 transition-all active:scale-95"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
