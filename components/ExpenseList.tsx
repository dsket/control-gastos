"use client";
import React, { useState, useEffect } from "react";
import { getExpenses, deleteExpense, updateExpense } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmt, setEditAmt] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editDate, setEditDate] = useState("");

  const fetchExpenses = async () => {
    if (user) setExpenses(await getExpenses(user.uid));
  };

  useEffect(() => { fetchExpenses(); }, [user, refreshTrigger]);

  const executeDelete = async () => {
    if (!user || !expenseToDelete) return;
    await deleteExpense(user.uid, expenseToDelete);
    setExpenseToDelete(null); fetchExpenses(); 
  };

  const startEdit = (exp: any) => {
    setEditId(exp.id); setEditDesc(exp.description); setEditAmt(exp.amount.toString()); setEditCat(exp.category); setEditDate(exp.date);
  };

    const saveEdit = async (id: string) => {
    if (!user) return;
    
    // Solo enviamos a Firebase los datos que realmente editamos en este panel
    // (quitamos la categoría para que no genere conflicto con tu base de datos)
    try {
      await updateExpense(user.uid, id, { 
        description: editDesc, 
        amount: Number(editAmt), 
        date: editDate 
      });
      setEditId(null); 
      fetchExpenses();
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
    }
  };


  return (
    <div className="w-full relative">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mt-[1.35rem] flex flex-col gap-3">
        {expenses.length === 0 ? <p className="text-slate-500 text-sm text-center">No hay gastos.</p> : null}
        {expenses.map(exp => {
          if (editId === exp.id) {
            return (
              <div key={exp.id} className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2">
                <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="p-2 rounded-lg border bg-white" />
                <div className="flex gap-2">
                  <input type="number" value={editAmt} onChange={e => setEditAmt(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white" />
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white text-sm" />
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => saveEdit(exp.id)} className="bg-green-500 text-white font-bold py-2 px-3 rounded-lg w-full">Guardar</button>
                  <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg w-full">Cancelar</button>
                </div>
              </div>
            );
          }
          return (
            <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{exp.description}</p>
                <p className="text-xs text-slate-500">{exp.category} • {exp.date}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-extrabold text-slate-800 text-lg">-${exp.amount.toLocaleString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(exp)} className="text-xs text-slate-500 bg-slate-200 hover:bg-yellow-200 px-2 py-1 rounded-md">✏️</button>
                  <button onClick={() => setExpenseToDelete(exp.id)} className="text-xs text-slate-500 bg-slate-200 hover:bg-red-200 px-2 py-1 rounded-md">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setExpenseToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar gasto?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setExpenseToDelete(null)} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl">Cancelar</button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-xl">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
