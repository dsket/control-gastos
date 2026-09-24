"use client";
import React, { useState, useEffect } from "react";
import { getCards, deleteCard } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function CardList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const fetchCards = async () => {
    if (user) setCards(await getCards(user.uid));
  };

  useEffect(() => { fetchCards(); }, [user, refreshTrigger]);

  const executeDelete = async () => {
    if (!user || !cardToDelete) return;
    await deleteCard(user.uid, cardToDelete);
    setCardToDelete(null);
    fetchCards();
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-extrabold text-green-800 mb-2">Mis Tarjetas</h2>
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 flex flex-col gap-3 mt-[1.35rem]">
        {cards.length === 0 ? <p className="text-slate-500 text-sm text-center">No hay tarjetas guardadas.</p> : null}
        {cards.map(card => (
          <div key={card.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">{card.name}</p>
              <p className="text-xs text-slate-500">Cierra el {card.closingDate} • Vence el {card.dueDate}</p>
            </div>
            <button onClick={() => setCardToDelete(card.id)} className="text-xs text-slate-500 hover:bg-red-100 px-2 py-1.5 rounded-md">🗑️</button>
          </div>
        ))}
      </div>

      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCardToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">💳</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar tarjeta?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setCardToDelete(null)} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl">Cancelar</button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-xl">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
