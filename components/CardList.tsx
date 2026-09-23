"use client";
import React, { useEffect, useState } from "react";
import { getCards } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

interface Card {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
}

export default function CardList({ refreshTrigger }: { refreshTrigger: number }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      if (user) {
        try {
          const data = await getCards(user.uid);
          setCards(data as Card[]);
        } catch (error) {
          console.error("Error al traer las tarjetas", error);
        }
        setLoading(false);
      }
    };
    fetchCards();
  }, [user, refreshTrigger]);

  if (loading) return <p className="text-center text-green-600 mt-6 animate-pulse">Cargando tus tarjetas...</p>;

  if (cards.length === 0) return <p className="text-center text-green-600/80 mt-6">Todavía no tenés tarjetas guardadas.</p>;

  return (
    <div className="w-full max-w-sm mt-6 flex flex-col gap-3">
      <h2 className="text-lg font-bold text-green-800 ml-2">Mis Tarjetas</h2>
      {cards.map(card => (
        <div key={card.id} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex justify-between items-center hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💳</div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{card.name}</h3>
              <p className="text-sm text-slate-500 font-medium">
                Cierra el {card.closingDay} • Vence el {card.dueDay}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
