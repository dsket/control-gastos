"use client";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import IncomeManager from "../../components/IncomeManager";
import { useAuth } from "../../context/AuthContext";

export default function IncomesPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-green-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <IncomeManager onIncomeAdded={() => setRefresh(refresh + 1)} />
      </main>
    </div>
  );
}

