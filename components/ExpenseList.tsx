"use client";
import React, { useState, useEffect } from "react";
import { getExpenses, deleteExpense, updateExpense, getCards } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useAuth();
  
  // Estados para datos de Firebase
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]); // <-- Nuevo: para cargar tus tarjetas
  
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  
  // Estados para el modo edición
  const [editId, setEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmt, setEditAmt] = useState("");
  const [editDate, setEditDate] = useState("");
  
  // Nuevos estados para medio de pago
  const [editPaymentMethod, setEditPaymentMethod] = useState("debit");
  const [editCardId, setEditCardId] = useState("");
  const [editInstallments, setEditInstallments] = useState("1");

  // Traemos los gastos Y las tarjetas
  const fetchData = async () => {
    if (user) {
      setExpenses(await getExpenses(user.uid));
      setCards(await getCards(user.uid));
    }
  };

  useEffect(() => { fetchData(); }, [user, refreshTrigger]);

  const executeDelete = async () => {
    if (!user || !expenseToDelete) return;
    await deleteExpense(user.uid, expenseToDelete);
    setExpenseToDelete(null); 
    fetchData(); 
  };

  // Al tocar "Editar", cargamos todos los datos previos
  const startEdit = (exp: any) => {
    setEditId(exp.id); 
    setEditDesc(exp.description); 
    setEditAmt(exp.amount.toString()); 
    setEditDate(exp.date);
    
    // Si no tenía método guardado, por defecto es débito
    setEditPaymentMethod(exp.paymentMethod || "debit");
    setEditCardId(exp.cardId || "");
    setEditInstallments(exp.installments ? exp.installments.toString() : "1");
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    try {
      // Preparamos los datos básicos a guardar
      const updatedData: any = { 
        description: editDesc, 
        amount: Number(editAmt), 
        date: editDate,
        paymentMethod: editPaymentMethod
      };

      // Si es crédito, sumamos la tarjeta y cuotas. Si no, las limpiamos.
      if (editPaymentMethod === "credit") {
        updatedData.cardId = editCardId;
        updatedData.installments = Number(editInstallments);
      } else {
        updatedData.cardId = "";
        updatedData.installments = 1;
      }

      await updateExpense(user.uid, id, updatedData);
      setEditId(null); 
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // Función cortita para mostrar el método de pago en el historial de forma linda
  const getPaymentLabel = (exp: any) => {
    if (exp.paymentMethod === "credit") return `Crédito (${exp.installments} cuotas)`;
    if (exp.paymentMethod === "transfer") return "Transferencia";
    if (exp.paymentMethod === "cash") return "Efectivo";
    return "Débito";
  };

  return (
    <div className="w-full relative">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mt-[1.35rem] flex flex-col gap-3">
        {expenses.length === 0 ? <p className="text-slate-500 text-sm text-center my-4">No hay gastos registrados todavía.</p> : null}
        
        {expenses.map(exp => {
          
          // --- MODO EDICIÓN ---
          if (editId === exp.id) {
            return (
              <div key={exp.id} className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2">
                <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="p-2 rounded-lg border bg-white" placeholder="Descripción" />
                
                <div className="flex gap-2">
                  <input type="number" value={editAmt} onChange={e => setEditAmt(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white" placeholder="Monto" />
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-1/2 p-2 rounded-lg border bg-white text-sm" />
                </div>

                {/* Selección de Método de Pago */}
                <select value={editPaymentMethod} onChange={e => setEditPaymentMethod(e.target.value)} className="p-2 rounded-lg border bg-white text-sm w-full">
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="transfer">Transferencia</option>
                  <option value="cash">Efectivo</option>
                </select>

                {/* Si elige Crédito, se abren las opciones de Tarjeta y Cuotas */}
                {editPaymentMethod === "credit" && (
                  <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                    <select value={editCardId} onChange={e => setEditCardId(e.target.value)} className="w-2/3 p-2 rounded-lg border bg-white text-sm">
                      <option value="">Seleccionar tarjeta...</option>
                      {cards.map(card => (
                        <option key={card.id} value={card.id}>{card.name}</option>
                      ))}
                    </select>
                    <input type="number" value={editInstallments} onChange={e => setEditInstallments(e.target.value)} placeholder="Cuotas" min="1" className="w-1/3 p-2 rounded-lg border bg-white text-sm" />
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <button onClick={() => saveEdit(exp.id)} className="bg-green-500 text-white font-bold py-2 px-3 rounded-lg w-full hover:bg-green-600 transition-colors">Guardar</button>
                  <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg w-full hover:bg-slate-300 transition-colors">Cancelar</button>
                </div>
              </div>
            );
          }

          // --- MODO NORMAL ---
          return (
            <div key={exp.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{exp.description}</p>
                {/* Ahora el texto gris de abajo te avisa con qué pagaste y cuántas cuotas */}
                <p className="text-xs text-slate-500">
                  {exp.category} • {exp.date} • {getPaymentLabel(exp)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-extrabold text-slate-800 text-lg">-${exp.amount.toLocaleString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(exp)} className="text-xs text-slate-500 bg-slate-200 hover:bg-yellow-200 px-2 py-1 rounded-md transition-colors">✏️</button>
                  <button onClick={() => setExpenseToDelete(exp.id)} className="text-xs text-slate-500 bg-slate-200 hover:bg-red-200 px-2 py-1 rounded-md transition-colors">🗑️</button>
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
              <button onClick={() => setExpenseToDelete(null)} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-md">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
