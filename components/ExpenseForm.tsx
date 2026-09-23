"use client";
import React, { useState, useEffect } from "react";
import { addExpense, getCards, getCategories } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

interface Card { id: string; name: string; closingDay: number; dueDay: number; }
interface Category { id: string; name: string; icon: string; }

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded: () => void }) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "transfer" | "cash">("debit");
  const [cardId, setCardId] = useState("");
  const [installments, setInstallments] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Nuevo estado para el cartelito
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const fetchedCards = await getCards(user.uid);
          const fetchedCategories = await getCategories(user.uid);
          setCards(fetchedCards as Card[]);
          setCategories(fetchedCategories as Category[]);
          if (fetchedCategories.length > 0) setCategoryId(fetchedCategories[0].id);
        } catch (error) {
          console.error("Error cargando datos", error);
        }
      }
    };
    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const expenseData: any = {
        description, amount: Number(amount), categoryId, paymentMethod,
        installments: paymentMethod === "credit" ? Number(installments) : 1, date
      };

      if (paymentMethod === "credit" && cardId) {
        expenseData.cardId = cardId;
      }

      await addExpense(user.uid, expenseData);
      setDescription(""); setAmount(""); setInstallments("1");
      
      // Mostramos el cartel amigable
      setToastMessage("¡Gasto registrado con éxito! 💸");
      setTimeout(() => setToastMessage(""), 3000);
      
      onExpenseAdded();
    } catch (error) {
      setToastMessage("❌ Hubo un error al guardar el gasto.");
      setTimeout(() => setToastMessage(""), 3000);
    }
    setLoading(false);
  };

  let previewText = "";
  if (paymentMethod === "credit" && cardId && amount && date) {
    const card = cards.find(c => c.id === cardId);
    if (card && card.closingDay) {
      const cuotas = Number(installments) || 1;
      const valorCuota = (Number(amount) / cuotas).toLocaleString("es-AR", { maximumFractionDigits: 2 });
      
      const [y, m, d] = date.split("-").map(Number);
      const firstPaymentMonth = (d <= card.closingDay) ? m + 1 : m + 2;
      const lastPaymentMonth = firstPaymentMonth + cuotas - 1;
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      
      const startM = meses[(firstPaymentMonth - 1) % 12];
      const startY = y + Math.floor((firstPaymentMonth - 1) / 12);
      const endM = meses[(lastPaymentMonth - 1) % 12];
      const endY = y + Math.floor((lastPaymentMonth - 1) / 12);

      if (cuotas === 1) {
        previewText = `💡 Pagarás $${valorCuota} en el resumen de ${startM} ${startY}.`;
      } else {
        previewText = `💡 Pagarás ${cuotas} cuotas de $${valorCuota}. (Desde ${startM} ${startY} hasta ${endM} ${endY}).`;
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-green-100 mt-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">💸 Nuevo Gasto</h2>
        
        <div className="flex flex-col gap-3">
          <input type="text" placeholder="¿En qué gastaste?" value={description} onChange={(e) => setDescription(e.target.value)} required className="p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50" />
          <input type="number" placeholder="Monto Total ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50" />
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-green-800 ml-1">Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50">
              {categories.length === 0 ? <option value="">Creá una categoría primero</option> : categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-green-800 ml-1">Medio de Pago</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50">
              <option value="debit">💳 Débito</option>
              <option value="credit">💳 Tarjeta de Crédito</option>
              <option value="transfer">📱 Transferencia</option>
              <option value="cash">💵 Efectivo</option>
            </select>
          </div>

          {paymentMethod === "credit" && (
            <div className="flex flex-col gap-3 p-3 bg-green-50/80 rounded-2xl border border-green-100">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-green-800 ml-1">Seleccionar Tarjeta</label>
                <select value={cardId} onChange={(e) => setCardId(e.target.value)} required className="p-2.5 rounded-xl border border-green-200 bg-white">
                  <option value="">Elegí una tarjeta...</option>
                  {cards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-green-800 ml-1">Cuotas</label>
                <input type="number" placeholder="Cuotas" value={installments} onChange={(e) => setInstallments(e.target.value)} min="1" max="36" required className="p-2.5 rounded-xl border border-green-200 bg-white" />
              </div>
              {previewText && (
                <div className="bg-white border border-green-200 p-2 rounded-xl">
                  <p className="text-xs font-semibold text-green-700">{previewText}</p>
                </div>
              )}
            </div>
          )}

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="p-3 rounded-xl border border-green-200 bg-green-50/50 text-slate-600" />

          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl mt-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm">
            {loading ? "Guardando..." : "Registrar Gasto ✨"}
          </button>
        </div>
      </form>

      {/* CARTEL FLOTANTE (TOAST) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce z-50 transition-all">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
