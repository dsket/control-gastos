"use client";
import React, { useState, useEffect } from "react";
import { getExpenses, deleteExpense } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpenseList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  
  // Estado para el cartel de confirmación
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const fetchExpenses = async () => {
    if (user) {
      const data = await getExpenses(user.uid);
      setExpenses(data as Expense[]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user, refreshTrigger]);

  const executeDelete = async () => {
    if (!user || !expenseToDelete) return;
    await deleteExpense(user.uid, expenseToDelete);
    setToastMessage("🗑️ Gasto eliminado.");
    setTimeout(() => setToastMessage(""), 3000);
    setExpenseToDelete(null); 
    fetchExpenses(); 
  };

  return (
    <div className="w-full relative">
      {/* 
        ELIMINAMOS EL TÍTULO H2 REPETIDO ACÁ.
        Ahora la página padre (page.tsx) es la única que pone el título,
        y usamos mt-[1.35rem] para que la caja blanca quede perfectamente 
        alineada con la caja del formulario de la izquierda.
      */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mt-[1.35rem]">
        {expenses.length === 0 ? (
          <p className="text-sm text-center text-slate-500 my-4">No hay gastos registrados todavía.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.map(exp => (
              <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div>
                  <p className="font-bold text-slate-800">{exp.description}</p>
                  <p className="text-xs text-slate-500">{exp.category} • {exp.date}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-extrabold text-slate-800 text-lg">-${exp.amount.toLocaleString()}</span>
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
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar gasto?</h3>
            <p className="text-slate-500 text-sm">Esta acción no se puede deshacer y el monto se restaurará en tu historial.</p>
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
