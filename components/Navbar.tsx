"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Obtenemos solo el primer nombre de la cuenta de Google
  const primerNombre = user?.displayName ? user.displayName.split(" ")[0] : "Amiga";

  const links = [
    { href: "/", label: "📊 Resumen" },
    { href: "/incomes", label: "💰 Ingresos" },
    { href: "/expenses", label: "💸 Gastos" },
    { href: "/subscriptions", label: "🔄 Fijos" },
    { href: "/cards", label: "💳 Tarjetas" },
    { href: "/categories", label: "🏷️ Categorías" },
  ];

  return (
    <nav className="bg-white p-4 shadow-sm border-b border-green-100 flex flex-col md:flex-row justify-between items-center px-6 gap-4">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="text-3xl">🥑</span>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-green-700 leading-tight">Mis Gastos</h1>
          {/* ACÁ ESTÁ LA MAGIA: Saluda con el nombre dinámico */}
          <p className="text-sm text-slate-500 font-medium leading-tight">¡Hola, {primerNombre}!</p>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
        {links.map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              pathname === link.href 
                ? "bg-green-100 text-green-800" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button 
          onClick={() => signOut(auth)}
          className="px-4 py-2 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all whitespace-nowrap ml-auto md:ml-0"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
