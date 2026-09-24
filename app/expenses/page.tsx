"use client";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import ExpenseForm from "../../components/ExpenseForm";
import ExpenseList from "../../components/ExpenseList";
import { useAuth } from "../../context/AuthContext";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-green-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-green-800 mb-2">Registrar Movimiento</h2>
          <p className="text-slate-500 text-sm mb-4">Anotá un nuevo gasto especificando cómo lo abonaste.</p>
          <ExpenseForm onExpenseAdded={() => setRefresh(refresh + 1)} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-green-800 mb-2">Historial</h2>
          <ExpenseList refreshTrigger={refresh} />
        </div>
      </main>
    </div>
  );
}
