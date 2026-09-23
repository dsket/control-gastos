"use client";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import CardForm from "../../components/CardForm";
import CardList from "../../components/CardList";
import { useAuth } from "../../context/AuthContext";

export default function CardsPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-green-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-green-800 mb-2">Agregar Tarjeta</h2>
          <p className="text-slate-500 text-sm mb-4">Configura tus tarjetas de crédito y sus días de cierre y vencimiento.</p>
          <CardForm onCardAdded={() => setRefresh(refresh + 1)} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-green-800 mb-2">Mis Tarjetas Guardadas</h2>
          <CardList refreshTrigger={refresh} />
        </div>
      </main>
    </div>
  );
}
