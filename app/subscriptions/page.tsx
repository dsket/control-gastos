"use client";
import React from "react";
import Navbar from "../../components/Navbar";
import FixedExpenseManager from "../../components/FixedExpenseManager";
import { useAuth } from "../../context/AuthContext";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-green-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <FixedExpenseManager />
      </main>
    </div>
  );
}
