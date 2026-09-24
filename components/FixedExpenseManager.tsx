"use client";
import React, { useState, useEffect } from "react";
import { addFixedExpense, getFixedExpenses, deleteFixedExpense, updateFixedExpense } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function FixedExpenseManager() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("debit");
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmt, setEditAmt] = useState("");
  const [editDay, setEditDay] = useState("");

  const fetchFixedExpenses = async () => {
    if (user) setFixedExpenses(await getFixedExpenses(user.uid));
  };

  useEffect(() => { fetchFixedExpenses(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addFixedExpense(user.uid, { description, amount: Number(amount), dayOfMonth: Number(dayOfMonth), paymentMethod } as any);
    setDescription(""); setAmount(""); setDayOfMonth("1");
    fetchFixedExpenses();
  };

  const executeDelete = async () => {
    if (!user || !expenseToDelete) return;
    await deleteFixedExpense(user.uid, expenseToDelete);
    setExpenseToDelete(null); fetchFixedExpenses();
  };

  const startEdit = (exp: any) => {
    setEditId(exp.id); setEditDesc(exp.description); setEditAmt(exp.amount.toString()); setEditDay(exp.dayOfMonth.toString());
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    await updateFixedExpense(user.uid, id, { description: editDesc, amount: Number(editAmt), dayOfMonth: Number(editDay) } as any);
    setEditId(null); fetchFixedExpenses();
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-blue-800 mb-2">Nuevo Fijo</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 mt-2 flex flex-col gap-3">
          <input type="text" placeholder="Ej: Gimnasio" value={description} onChange={e => setDescription(e.target.value)} required className="p-3 rounded-xl border bg-blue-50/50" />
          <input type="number" placeholder="Monto" value={amount} onChange={e => setAmount(e.target.value)} required className="p-3 rounded-xl border bg-blue-50/50" />
          <div className="flex gap-2">
            <input type="number" placeholder="Día" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} required className="w-1/2 p-3 rounded-xl border bg-blue-50/50" />
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-1/2 p-3 rounded-xl border bg-blue-50/50">
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-2">Guardar 🔄</button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-blue-800 mb-2">Mis Fijos</h2>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 mt-2 flex flex-col gap-3">
          {fixedExpenses.map(exp => {
            if (editId === exp.id) {
              return (
                <div key={exp.id} className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2">
                  <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="p-2 rounded-lg border bg-white" />
                  <div className="flex gap-2">
                    <input type="number" value={editAmt} onChange={e => setEditAmt(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white" />
                    <input type="number" value={editDay} onChange={e => setEditDay(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white" />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => saveEdit(exp.id)} className="bg-blue-500 text-white font-bold py-2 px-3 rounded-lg w-full">Guardar</button>
                    <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg w-full">Cancelar</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{exp.description}</p>
                  <p className="text-xs text-slate-500">Día {exp.dayOfMonth} • {exp.paymentMethod}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-extrabold text-blue-600 text-lg">-${exp.amount.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(exp)} className="text-xs text-slate-500 bg-slate-200 hover:bg-yellow-200 px-2 py-1 rounded-md">✏️</button>
                    <button onClick={() => setExpenseToDelete(exp.id)} className="text-xs text-slate-500 bg-slate-200 hover:bg-red-200 px-2 py-1 rounded-md">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setExpenseToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar fijo?</h3>
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
