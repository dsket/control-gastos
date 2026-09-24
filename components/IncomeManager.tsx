"use client";
import React, { useState, useEffect } from "react";
import { addIncome, getIncomes, deleteIncome, updateIncome } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function IncomeManager({ onIncomeAdded }: { onIncomeAdded?: () => void }) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Sueldo");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmt, setEditAmt] = useState("");
  const [editDate, setEditDate] = useState("");

  const fetchIncomes = async () => {
    if (user) setIncomes(await getIncomes(user.uid));
  };

  useEffect(() => { fetchIncomes(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addIncome(user.uid, { description, amount: Number(amount), source, date });
    setDescription(""); setAmount(""); fetchIncomes(); if(onIncomeAdded) onIncomeAdded();
  };

  const executeDelete = async () => {
    if (!user || !incomeToDelete) return;
    await deleteIncome(user.uid, incomeToDelete);
    setIncomeToDelete(null); fetchIncomes(); if(onIncomeAdded) onIncomeAdded();
  };

  const startEdit = (inc: any) => {
    setEditId(inc.id); setEditDesc(inc.description); setEditAmt(inc.amount.toString()); setEditDate(inc.date);
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    await updateIncome(user.uid, id, { description: editDesc, amount: Number(editAmt), date: editDate });
    setEditId(null); fetchIncomes(); if(onIncomeAdded) onIncomeAdded();
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Registrar Ingreso</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 flex flex-col gap-3 mt-2">
          <input type="text" placeholder="Ej: Sueldo" value={description} onChange={e => setDescription(e.target.value)} required className="p-3 rounded-xl border bg-green-50/50" />
          <input type="number" placeholder="Monto" value={amount} onChange={e => setAmount(e.target.value)} required className="p-3 rounded-xl border bg-green-50/50" />
          <div className="flex gap-2">
             <select value={source} onChange={e => setSource(e.target.value)} className="w-1/2 p-3 rounded-xl border bg-green-50/50">
               <option value="Sueldo">Sueldo</option><option value="Transferencia">Transferencia</option>
             </select>
             <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-1/2 p-3 rounded-xl border bg-green-50/50 text-sm" />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl mt-2">Guardar 💰</button>
        </form>
      </div>

      <div>
        {/* TÍTULO ACTUALIZADO Y CAJA ALINEADA */}
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Historial de Ingresos</h2>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 mt-2 flex flex-col gap-3">
          {incomes.length === 0 ? <p className="text-slate-500 text-sm text-center my-4">No hay ingresos.</p> : null}
          {incomes.map(inc => {
            if (editId === inc.id) {
              return (
                <div key={inc.id} className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2">
                  <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="p-2 rounded-lg border bg-white" />
                  <div className="flex gap-2">
                    <input type="number" value={editAmt} onChange={e => setEditAmt(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white" />
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white text-sm" />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => saveEdit(inc.id)} className="bg-green-500 text-white font-bold py-2 px-3 rounded-lg w-full">Guardar</button>
                    <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg w-full">Cancelar</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={inc.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{inc.description}</p>
                  <p className="text-xs text-slate-500">{inc.source} • {inc.date}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-extrabold text-green-600 text-lg">+${inc.amount.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(inc)} className="text-xs text-slate-500 bg-slate-200 hover:bg-yellow-200 px-2 py-1 rounded-md">✏️</button>
                    <button onClick={() => setIncomeToDelete(inc.id)} className="text-xs text-slate-500 bg-slate-200 hover:bg-red-200 px-2 py-1 rounded-md">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {incomeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIncomeToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar ingreso?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setIncomeToDelete(null)} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl">Cancelar</button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-xl">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  
