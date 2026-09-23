"use client";
import React, { useState } from "react";
import { addCard } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function CardForm({ onCardAdded }: { onCardAdded?: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCard(user.uid, {
        name,
        closingDay: Number(closingDay),
        dueDay: Number(dueDay)
      });
      setName("");
      setClosingDay("");
      setDueDay("");
      alert("¡Tarjeta guardada con éxito! 🎉");
      if (onCardAdded) onCardAdded();
    } catch (error) {
      alert("Hubo un error al guardar la tarjeta.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-green-100 mt-6 w-full max-w-sm">
      <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
        💳 Nueva Tarjeta
      </h2>
      
      <div className="flex flex-col gap-3">
        <input 
          type="text" 
          placeholder="Ej: Visa Banco..." 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50"
        />
        <div className="flex gap-3">
          <input 
            type="number" 
            placeholder="Cierra (ej: 22)" 
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            required
            min="1" max="31"
            className="w-1/2 p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50"
          />
          <input 
            type="number" 
            placeholder="Vence (ej: 4)" 
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            required
            min="1" max="31"
            className="w-1/2 p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl mt-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Tarjeta ✨"}
        </button>
      </div>
    </form>
  );
}
