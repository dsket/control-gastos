"use client";
import React, { useEffect, useState } from "react";
import { getExpenses, getCategories, getCards, deleteExpense, updateExpense } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

interface Expense {
  id: string; description: string; amount: number; categoryId: string;
  paymentMethod: "credit" | "debit" | "transfer" | "cash";
  cardId?: string; installments: number; date: string;
}

interface Category { id: string; name: string; icon: string; }
interface Card { id: string; name: string; closingDay: number; dueDay: number; }

export default function ExpenseList({ refreshTrigger }: { refreshTrigger: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [loading, setLoading] = useState(true);
  
  const [localRefresh, setLocalRefresh] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const fetchedExpenses = await getExpenses(user.uid);
          const fetchedCategories = await getCategories(user.uid);
          const fetchedCards = await getCards(user.uid);

          const catMap: Record<string, Category> = {};
          (fetchedCategories as any[]).forEach((c) => { catMap[c.id] = { id: c.id, name: c.name, icon: c.icon }; });
          
          const cardMap: Record<string, Card> = {};
          (fetchedCards as any[]).forEach((card) => { cardMap[card.id] = { id: card.id, name: card.name, closingDay: card.closingDay, dueDay: card.dueDay }; });

          setExpenses(fetchedExpenses as Expense[]);
          setCategories(catMap);
          setCards(cardMap);
        } catch (error) {
          console.error("Error al cargar datos", error);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [user, refreshTrigger, localRefresh]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("¿Seguro que querés borrar este gasto de forma permanente?")) {
      await deleteExpense(user.uid, id);
      setLocalRefresh(prev => prev + 1);
    }
  };

  const startEdit = (exp: Expense) => {
    setEditId(exp.id); setEditDesc(exp.description); setEditAmount(exp.amount.toString());
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    await updateExpense(user.uid, id, { description: editDesc, amount: Number(editAmount) });
    setEditId(null); setLocalRefresh(prev => prev + 1);
  };

  const getMethodLabel = (exp: Expense) => {
    switch (exp.paymentMethod) {
      case "debit": return "💳 Débito";
      case "transfer": return "📱 Transferencia";
      case "cash": return "💵 Efectivo";
      case "credit": {
        const card = exp.cardId ? cards[exp.cardId] : null;
        const cardName = card ? card.name : "Tarjeta";
        const cuotas = exp.installments || 1;
        const valorCuota = (exp.amount / cuotas).toLocaleString("es-AR", { maximumFractionDigits: 2 });

        if (!card || !card.closingDay || !exp.date) {
           return `💳 ${cardName} (${cuotas} ${cuotas === 1 ? "pago" : "cuotas de $" + valorCuota})`;
        }

        const [y, m, d] = exp.date.split("-").map(Number);
        const firstPaymentMonth = (d <= card.closingDay) ? m + 1 : m + 2;
        const lastPaymentMonth = firstPaymentMonth + cuotas - 1;
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        
        const startMonthName = meses[(firstPaymentMonth - 1) % 12];
        const startYear = y + Math.floor((firstPaymentMonth - 1) / 12);
        const endMonthName = meses[(lastPaymentMonth - 1) % 12];
        const endYear = y + Math.floor((lastPaymentMonth - 1) / 12);

        if (cuotas === 1) {
          return `💳 ${cardName} (1 pago de $${valorCuota}) • Resumen ${startMonthName} ${startYear}`;
        } else {
          const yearText = startYear === endYear ? startYear : `${startYear}-${endYear}`;
          return `💳 ${cardName} (${cuotas} cuotas de $${valorCuota}) • ${startMonthName} a ${endMonthName} ${yearText}`;
        }
      }
      default: return exp.paymentMethod;
    }
  };

  if (loading) return <p className="text-center text-green-600 mt-6 animate-pulse">Cargando tus movimientos...</p>;
  if (expenses.length === 0) return <p className="text-center text-green-600/80 mt-6">Todavía no registraste ningún gasto.</p>;

  return (
    <div className="w-full max-w-md mt-6 flex flex-col gap-3">
      {expenses.map(exp => {
        const cat = categories[exp.categoryId];
        
        if (editId === exp.id) {
          return (
            <div key={exp.id} className="bg-green-100 p-4 rounded-2xl shadow-sm border border-green-300 flex flex-col gap-2">
              <label className="text-xs font-bold text-green-800">Editar Descripción</label>
              <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="p-2 rounded-xl border border-green-300 bg-white" />
              <label className="text-xs font-bold text-green-800 mt-1">Editar Monto ($)</label>
              <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="p-2 rounded-xl border border-green-300 bg-white" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => saveEdit(exp.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold w-full transition-all">Guardar</button>
                <button onClick={() => setEditId(null)} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-bold w-full transition-all">Cancelar</button>
              </div>
            </div>
          );
        }

        return (
          <div key={exp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex justify-between items-center hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="text-3xl bg-green-50 p-2 rounded-xl">{cat ? cat.icon : "📦"}</div>
              <div>
                <h3 className="font-bold text-slate-800">{exp.description}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {cat ? cat.name : "Sin categoría"} • {exp.date}
                </p>
                <p className="text-xs text-indigo-600 font-bold mt-0.5 tracking-tight">
                  {getMethodLabel(exp)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className="font-extrabold text-slate-700 text-lg">
                ${exp.amount.toLocaleString()}
              </span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(exp)} className="text-sm bg-slate-100 hover:bg-yellow-100 p-2 rounded-lg transition-all" title="Editar">✏️</button>
                <button onClick={() => handleDelete(exp.id)} className="text-sm bg-slate-100 hover:bg-red-100 p-2 rounded-lg transition-all" title="Borrar">🗑️</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
