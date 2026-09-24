"use client";
import React, { useState, useEffect } from "react";
import { addFixedExpense, getFixedExpenses, deleteFixedExpense } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function FixedExpenseManager() {
  const { user } = useAuth();
  
  // Estados originales de tu formulario
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("debit");
  
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Estado para el cartel de confirmación
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const fetchFixedExpenses = async () => {
    if (user) {
      const data = await getFixedExpenses(user.uid);
      setFixedExpenses(data);
    }
  };

  useEffect(() => {
    fetchFixedExpenses();
  }, [user]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;
  setLoading(true);
  try {
    // Agregamos "as any" para apagar el bloqueo estricto de TypeScript
    await addFixedExpense(user.uid, { 
      description, 
      amount: Number(amount), 
      dayOfMonth: Number(dayOfMonth), 
      paymentMethod 
    } as any);
    
    setDescription(""); setAmount(""); setDayOfMonth("1");
    setToastMessage("¡Gasto fijo guardado! 🔄");
    setTimeout(() => setToastMessage(""), 3000);
    fetchFixedExpenses();
  } catch (error) {
    setToastMessage("❌ Error al guardar.");
    setTimeout(() => setToastMessage(""), 3000);
  }
  setLoading(false);
};


  // Función de borrado con el modal lindo
  const executeDelete = async () => {
    if (!user || !expenseToDelete) return;
    await deleteFixedExpense(user.uid, expenseToDelete);
    setToastMessage("🗑️ Gasto fijo eliminado.");
    setTimeout(() => setToastMessage(""), 3000);
    setExpenseToDelete(null); // Cierra el cartel
    fetchFixedExpenses(); // Recarga la lista
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
      {/* FORMULARIO */}
      <div>
        <h2 className="text-2xl font-extrabold text-blue-800 mb-2">Nuevo Gasto Fijo</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-blue-100 w-full mt-2">
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Descripción (Ej: Netflix, Gimnasio)" value={description} onChange={(e) => setDescription(e.target.value)} required className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="number" placeholder="Monto ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="flex gap-2">
              <div className="w-1/2 flex flex-col gap-1">
                <label className="text-xs font-bold text-blue-800 ml-1">Día de cobro</label>
                <input type="number" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} required min="1" max="31" className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="w-1/2 flex flex-col gap-1">
                <label className="text-xs font-bold text-blue-800 ml-1">Método</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all mt-2 shadow-sm">
              {loading ? "Guardando..." : "Guardar Fijo 🔄"}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA DE GASTOS FIJOS */}
      <div>
        <h2 className="text-2xl font-extrabold text-blue-800 mb-2">Mis Gastos Fijos</h2>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 mt-2">
          {fixedExpenses.length === 0 ? (
            <p className="text-sm text-center text-blue-600/80 my-4">No tenés gastos fijos todavía.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {fixedExpenses.map(exp => (
                <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-white shadow-sm border border-blue-100 hover:shadow-md transition-all">
                  <div>
                    <p className="font-bold text-slate-800">{exp.description}</p>
                    <p className="text-xs text-slate-500">Día {exp.dayOfMonth} • {exp.paymentMethod}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-extrabold text-blue-600 text-lg">-${exp.amount.toLocaleString()}</span>
                    
                    {/* BOTÓN DE BORRAR QUE ABRE EL CARTEL */}
                    <button 
                      onClick={() => setExpenseToDelete(exp.id)} 
                      className="text-xs text-slate-500 bg-slate-100 hover:bg-red-100 px-2 py-1.5 rounded-md transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOAST DE ÉXITO */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce z-50">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CARTEL DE CONFIRMACIÓN ELEGANTE */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setExpenseToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar gasto fijo?</h3>
            <p className="text-slate-500 text-sm">Vas a dejar de verlo todos los meses en tu resumen.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setExpenseToDelete(null)} className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">Cancelar</button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-md">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
