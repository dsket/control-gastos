"use client";
import React, { useState, useEffect } from "react";
import { addCategory, getCategories, deleteCategory } from "../services/firestore";
import { useAuth } from "../context/AuthContext";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function CategoryManager({ onCategoryAdded }: { onCategoryAdded: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏷️");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para el cartelito flotante
  const [toastMessage, setToastMessage] = useState("");

  const fetchCategories = async () => {
    if (user) {
      const data = await getCategories(user.uid);
      setCategories(data as Category[]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addCategory(user.uid, { name, icon });
      setName("");
      setIcon("🏷️");
      
      setToastMessage("¡Categoría creada con éxito! 🏷️");
      setTimeout(() => setToastMessage(""), 3000);
      
      fetchCategories();
      onCategoryAdded();
    } catch (error) {
      setToastMessage("❌ Error al crear la categoría.");
      setTimeout(() => setToastMessage(""), 3000);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("¿Seguro que querés borrar esta categoría?")) {
      await deleteCategory(user.uid, id);
      
      setToastMessage("🗑️ Categoría eliminada.");
      setTimeout(() => setToastMessage(""), 3000);
      
      fetchCategories();
      onCategoryAdded();
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Crear Categoría</h2>
        <p className="text-slate-500 text-sm mb-4">Añadí etiquetas para organizar tus gastos.</p>
        
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-green-100 mt-2">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            🏷️ Nueva Categoría
          </h2>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="Emoji" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              required
              maxLength={2}
              className="w-16 p-3 text-center rounded-xl border border-green-200 bg-green-50/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input 
              type="text" 
              placeholder="Ej: Transporte..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 p-3 rounded-xl border border-green-200 bg-green-50/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-2">
            {loading ? "Creando..." : "Crear Categoría ✨"}
          </button>
        </form>
      </div>

      {/* COLUMNA DERECHA: LISTA */}
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-2">Tus Categorías</h2>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 mt-[1.35rem]">
          {categories.length === 0 ? (
            <p className="text-sm text-center text-green-600/80 my-4">No hay categorías todavía.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-4 rounded-2xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl bg-green-50 p-2 rounded-xl">{cat.icon}</div>
                    <span className="font-bold text-slate-800 text-lg">{cat.name}</span>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all active:scale-95">
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARTEL FLOTANTE (TOAST) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce z-50 transition-all">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
