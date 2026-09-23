"use client";
import React, { useState, useEffect } from "react";
import { addFixedExpense, getFixedExpenses, getCards, getCategories, deleteFixedExpense, updateFixedExpense } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function FixedExpenseManager() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "transfer" | "cash">("debit");
  const [cardId, setCardId] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Estados para la edición rápida del monto
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const fetchData = async () => {
    if (user) {
      setFixedExpenses(await getFixedExpenses(user.uid));
      const fetchedCats = await getCategories(user.uid);
      setCategories(fetchedCats);
      if (fetchedCats.length > 0 && !categoryId) setCategoryId(fetchedCats[0].id);
      setCards(await getCards(user.uid));
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data: any = { description, amount: Number(amount), categoryId, paymentMethod, dayOfMonth: Number(dayOfMonth) };
      if (paymentMethod === "credit" && cardId) data.cardId = cardId;

      await addFixedExpense(user.uid, data);
      setDescription(""); setAmount(""); setDayOfMonth("1");
      setToastMessage("¡Gasto fijo guardado! 🔄");
      setTimeout(() => setToastMessage(""), 3000);
      fetchData();
    } catch (error) {
      setToastMessage("❌ Error al guardar.");
      setTimeout(() => setToastMessage(""), 3000);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("¿Seguro que querés dejar de registrar esta suscripción?")) {
      await deleteFixedExpense(user.uid, id);
      fetchData();
    }
  };

  // Funciones para editar
  const startEdit = (id: string, currentAmount: number) => {
    setEditId(id);
    setEditAmount(currentAmount.toString());
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    await updateFixedExpense(user.uid, id, { amount: Number(editAmount) });
    setEditId(null);
    setToastMessage("✅ Monto actualizado");
    setTimeout(() => setToastMessage(""), 3000);
    fetchData();
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
      
      {/* FORMULARIO */}
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Nueva Suscripción</h2>
        <p className="text-slate-500 text-sm mb-4">Se sumará automáticamente todos los meses.</p>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-green-100 mt-2 flex flex-col gap-3">
          <input type="text" placeholder="Ej: Netflix, Gimnasio..." value={description} onChange={(e) => setDescription(e.target.value)} required className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:ring-2 focus:ring-green-400 focus:outline-none" />
          <input type="number" placeholder="Monto original ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:ring-2 focus:ring-green-400 focus:outline-none" />
          
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 w-1/2">
              <label className="text-xs font-bold text-green-800 ml-1">Día de cobro</label>
              <input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} required className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:ring-2 focus:ring-green-400 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1 w-1/2">
              <label className="text-xs font-bold text-green-800 ml-1">Categoría</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:ring-2 focus:ring-green-400 focus:outline-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>

          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:ring-2 focus:ring-green-400 focus:outline-none">
            <option value="debit">💳 Débito Automático</option>
            <option value="credit">💳 Tarjeta de Crédito</option>
            <option value="transfer">📱 Transferencia</option>
          </select>

          {paymentMethod === "credit" && (
            <select value={cardId} onChange={(e) => setCardId(e.target.value)} required className="p-3 rounded-xl border border-green-200 bg-white focus:ring-2 focus:ring-green-400 focus:outline-none">
              <option value="">Elegí la tarjeta...</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}

          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl mt-2 active:scale-95 transition-all shadow-sm">
            {loading ? "Guardando..." : "Guardar Fijo 🔄"}
          </button>
        </form>
      </div>

      {/* LISTADO DE SUSCRIPCIONES */}
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Tus Gastos Fijos</h2>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 mt-[1.35rem]">
          {fixedExpenses.length === 0 ? <p className="text-slate-500 text-center text-sm">No tenés suscripciones fijas.</p> : (
            <div className="flex flex-col gap-3">
              {fixedExpenses.map(exp => {
                const cat = categories.find(c => c.id === exp.categoryId);
                
                // MODO EDICIÓN
                if (editId === exp.id) {
                  return (
                    <div key={exp.id} className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2">
                      <p className="font-bold text-slate-800 text-sm">Actualizar monto de {exp.description}</p>
                      <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="p-2 rounded-xl border border-yellow-300 bg-white focus:outline-none" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(exp.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold w-full">Guardar</button>
                        <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold w-full">Cancelar</button>
                      </div>
                    </div>
                  );
                }

                // MODO NORMAL
                return (
                  <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-green-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl bg-green-50 p-2 rounded-xl text-center min-w-[3.5rem]">
                        <p className="text-xs font-bold text-green-600 uppercase">Día</p>
                        <p className="text-xl font-black text-green-700 leading-none">{exp.dayOfMonth}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{exp.description}</p>
                        <p className="text-xs text-slate-500">{cat ? cat.name : "Varios"} • {exp.paymentMethod === "credit" ? "Crédito" : "Débito"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-extrabold text-slate-700">${exp.amount.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(exp.id, exp.amount)} className="text-xs text-slate-500 bg-slate-100 hover:bg-yellow-100 px-2 py-1.5 rounded-md transition-colors" title="Actualizar Monto">✏️</button>
                        <button onClick={() => handleDelete(exp.id)} className="text-xs text-slate-500 bg-slate-100 hover:bg-red-100 px-2 py-1.5 rounded-md transition-colors" title="Borrar">🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce z-50">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
