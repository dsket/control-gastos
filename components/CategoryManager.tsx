"use client";
import React, { useState, useEffect } from "react";
import { addCategory, getCategories, deleteCategory } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

export default function CategoryManager({ onCategoryAdded }: { onCategoryAdded?: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏷️");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (user) setCategories(await getCategories(user.uid));
  };

  useEffect(() => { fetchCategories(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addCategory(user.uid, { name, icon });
    setName(""); setIcon("🏷️");
    fetchCategories();
    if (onCategoryAdded) onCategoryAdded();
  };

  const executeDelete = async () => {
    if (!user || !categoryToDelete) return;
    await deleteCategory(user.uid, categoryToDelete);
    setCategoryToDelete(null);
    fetchCategories();
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Crear Categoría</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100">
          <div className="flex gap-2 mb-3">
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 p-3 rounded-xl border border-green-200 text-center text-xl bg-green-50" />
            <input type="text" placeholder="Ej: Transporte..." value={name} onChange={(e) => setName(e.target.value)} required className="flex-1 p-3 rounded-xl border border-green-200 bg-green-50" />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Crear Categoría ✨</button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Mis Categorías</h2>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 flex flex-col gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 font-bold text-slate-700">
                <span className="text-xl">{cat.icon}</span> {cat.name}
              </div>
              <button onClick={() => setCategoryToDelete(cat.id)} className="text-xs text-red-500 font-bold hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Borrar</button>
            </div>
          ))}
        </div>
      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCategoryToDelete(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-extrabold text-slate-800">¿Borrar categoría?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setCategoryToDelete(null)} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl">Cancelar</button>
              <button onClick={executeDelete} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-xl">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
