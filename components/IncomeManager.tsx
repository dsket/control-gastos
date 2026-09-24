"use client";
import React, { useState, useEffect } from "react";
import { addIncome, getIncomes, deleteIncome, updateIncome } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

interface Income {
  id: string;
  description: string;
  amount: number;
  source: string;
  date: string;
}

export default function IncomeManager({ onIncomeAdded }: { onIncomeAdded: () => void }) {
  const { user } = useAuth();
  
  // Estados del formulario principal
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Sueldo");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Estados para el modo edición
  const [editId, setEditId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editDate, setEditDate] = useState("");

  // Estado para el cartel de confirmación de borrado
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  const fetchIncomes = async () => {
    if (user) {
      const data = await getIncomes(user.uid);
      setIncomes(data as Income[]);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addIncome(user.uid, { description, amount: Number(amount), source, date });
      setDescription("");
      setAmount("");
      
      setToastMessage("¡Ingreso registrado con éxito! 💰");
      setTimeout(() => setToastMessage(""), 3000);
      
      fetchIncomes();
      onIncomeAdded();
    } catch (error) {
      setToastMessage("❌ Hubo un error al registrar.");
      setTimeout(() => setToastMessage(""), 3000);
    }
    setLoading(false);
  };

  // NUEVA FUNCIÓN PARA BORRAR SIN EL CARTEL FEO
  const executeDelete = async () => {
    if (!user || !incomeToDelete) return;
    
    await deleteIncome(user.uid, incomeToDelete);
    setToastMessage("🗑️ Ingreso eliminado.");
    setTimeout(() => setToastMessage(""), 3000);
    
    setIncomeToDelete(null); // Cerramos el cartel
    fetchIncomes();
    onIncomeAdded();
  };

  const startEdit = (inc: Income) => {
    setEditId(inc.id);
    setEditDescription(inc.description);
    setEditAmount(inc.amount.toString());
    setEditSource(inc.source);
    setEditDate(inc.date);
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    await updateIncome(user.uid, id, {
      description: editDescription,
      amount: Number(editAmount),
      source: editSource,
      date: editDate
    });
    setEditId(null);
    setToastMessage("✅ Ingreso actualizado.");
    setTimeout(() => setToastMessage(""), 3000);
    fetchIncomes();
    onIncomeAdded();
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Registrar Ingreso</h2>
        <p className="text-slate-500 text-sm mb-4">Anotá tu sueldo, transferencias a favor o regalos.</p>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-green-100 w-full mt-2">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">💰 Nuevo Ingreso</h2>
          
          <div className="flex flex-col gap-3">
            <input 
              type="text" placeholder="Descripción (Ej: Sueldo, regalo...)" 
              value={description} onChange={(e) => setDescription(e.target.value)} required
              className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input 
              type="number" placeholder="Monto ($)" 
              value={amount} onChange={(e) => setAmount(e.target.value)} required min="1"
              className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-green-800 ml-1">Tipo de ingreso</label>
              <select 
                value={source} onChange={(e) => setSource(e.target.value)}
                className="p-3 rounded-xl border border-green-200 bg-green-50/50 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="Sueldo">💼 Sueldo</option>
                <option value="Transferencia">📱 Transferencia</option>
                <option value="Regalo">🎁 Regalo / Extra</option>
                <option value="Otro">📦 Otro</option>
              </select>
            </div>
            <input 
              type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="p-3 rounded-xl border border-green-200 bg-green-50/50 text-slate-600"
            />
            <button 
              type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
            >
              {loading ? "Guardando..." : "Guardar Ingreso ✨"}
            </button>
          </div>
        </form>
      </div>

      {/* COLUMNA DERECHA: HISTORIAL */}
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Historial Completo</h2>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 mt-[1.35rem]">
          {incomes.length === 0 ? (
            <p className="text-sm text-center text-green-600/80 my-4">No hay ingresos registrados todavía.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {incomes.map(inc => {
                
                // --- MODO EDICIÓN ---
                if (editId === inc.id) {
                  return (
                    <div key={inc.id} className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col gap-3 shadow-sm">
                      <p className="font-bold text-slate-800 text-sm">Editando ingreso...</p>
                      <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="p-2 rounded-xl border border-yellow-300 bg-white" placeholder="Descripción" />
                      <div className="flex gap-2">
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-1/2 p-2 rounded-xl border border-yellow-300 bg-white" placeholder="Monto" />
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-1/2 p-2 rounded-xl border border-yellow-300 bg-white text-sm" />
                      </div>
                      <select value={editSource} onChange={(e) => setEditSource(e.target.value)} className="p-2 rounded-xl border border-yellow-300 bg-white">
                        <option value="Sueldo">💼 Sueldo</option>
                        <option value="Transferencia">📱 Transferencia</option>
                        <option value="Regalo">🎁 Regalo</option>
                        <option value="Otro">📦 Otro</option>
                      </select>
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => saveEdit(inc.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-bold w-full transition-all">Guardar</button>
                        <button onClick={() => setEditId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-2 rounded-xl text-sm font-bold w-full transition-all">Cancelar</button>
                      </div>
                    </div>
                  );
                }

                // --- MODO NORMAL ---
                return (
                  <div key={inc.id} className="flex justify-between items-center p-4 rounded-2xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl bg-green-50 p-2 rounded-xl">
                        {inc.source === "Sueldo" ? "💼" : inc.source === "Transferencia" ? "📱" : inc.source === "Regalo" ? "🎁" : "📦"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{inc.description}</p>
                        <p className="text-xs text-slate-500 font-medium">{inc.source} • {inc.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-extrabold text-green-600 text-lg">+${inc.amount.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(inc)} className="text-xs text-slate-500 bg-slate-100 hover:bg-yellow-100 px-2 py-1.5 rounded-md transition-colors" title="Editar">✏️</button>
                        
                        {/* EN LUGAR DE BORRAR DIRECTO, ABRIMOS NUESTRO CARTEL LINDO */}
                        <button onClick={() => setIncomeToDelete(inc.id)} className="text-xs text-slate-500 bg-slate-100 hover:bg-red-100 px-2 py-1.5 rounded-md transition-colors" title="Borrar">🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CARTEL FLOTANTE (TOAST) DE ÉXITO */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce z-50 transition-all">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NUEVO CARTEL DE CONFIRMACIÓN DE BORRADO LINDÍSIMO */}
      {incomeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIncomeToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar ingreso?</h3>
            <p className="text-slate-500 text-sm">Esta acción no se puede deshacer y el monto se restará de tu plata disponible.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setIncomeToDelete(null)} className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">
                Cancelar
              </button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
