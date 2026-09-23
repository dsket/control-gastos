"use client";
import React, { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ExpenseList from "../components/ExpenseList";
import { getExpenses, getIncomes, getCards } from "../services/firestore";

export default function Home() {
  const { user, loading } = useAuth();
  
  // Filtro de fecha (Por defecto: mes y año actual)
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1 a 12
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Totales
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalDailyExpense, setTotalDailyExpense] = useState(0);
  const [totalCreditMonth, setTotalCreditMonth] = useState(0);

  // Listas para los modales
  const [incomesList, setIncomesList] = useState<any[]>([]);
  const [dailyExpensesList, setDailyExpensesList] = useState<any[]>([]);
  const [creditMonthList, setCreditMonthList] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<"ingresos" | "disponible" | "tarjetas" | null>(null);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else { setSelectedMonth(m => m - 1); }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else { setSelectedMonth(m => m + 1); }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const expenses = (await getExpenses(user.uid)) as any[];
          const incomes = (await getIncomes(user.uid)) as any[];
          const cards = (await getCards(user.uid)) as any[];

          // 1. INGRESOS (Filtrados por mes/año seleccionado)
          const filteredIncomes = incomes.filter(inc => {
            const [y, m] = inc.date.split("-").map(Number);
            return y === selectedYear && m === selectedMonth;
          });
          setTotalIncome(filteredIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0));
          setIncomesList(filteredIncomes);

          // 2. GASTOS DIARIOS (Filtrados por mes/año seleccionado)
          const daily = expenses.filter(exp => exp.paymentMethod !== "credit");
          const filteredDaily = daily.filter(exp => {
            const [y, m] = exp.date.split("-").map(Number);
            return y === selectedYear && m === selectedMonth;
          });
          setTotalDailyExpense(filteredDaily.reduce((acc, curr) => acc + (curr.amount || 0), 0));
          setDailyExpensesList(filteredDaily);

          // 3. TARJETAS (Cuotas que caen específicamente en el mes seleccionado)
          let monthCreditTotal = 0;
          const monthCreditItems: any[] = [];

          expenses.forEach(exp => {
            if (exp.paymentMethod === "credit" && exp.cardId) {
              const card = cards.find(c => c.id === exp.cardId);
              if (card && card.closingDay && exp.date) {
                const [y, m, d] = exp.date.split("-").map(Number);
                
                // Calculamos en qué mes y año cae la PRIMERA cuota según el cierre
                let firstM = (d <= card.closingDay) ? m + 1 : m + 2;
                let firstY = y;
                
                // Ajuste por si el mes se pasa de Diciembre (12)
                while (firstM > 12) {
                   firstM -= 12;
                   firstY += 1;
                }

                // Diferencia en meses entre la primera cuota y el mes que estamos mirando en pantalla
                const monthsDiff = (selectedYear - firstY) * 12 + (selectedMonth - firstM);
                const cuotas = exp.installments || 1;

                // Si la diferencia está entre 0 y el total de cuotas, entonces este gasto se paga este mes
                if (monthsDiff >= 0 && monthsDiff < cuotas) {
                  const currentInst = monthsDiff + 1;
                  const valorCuota = exp.amount / cuotas;
                  monthCreditTotal += valorCuota;
                  
                  monthCreditItems.push({
                    ...exp,
                    cardName: card.name,
                    currentInst,
                    valorCuota,
                  });
                }
              }
            }
          });

          setTotalCreditMonth(monthCreditTotal);
          setCreditMonthList(monthCreditItems);

        } catch (error) {
          console.error("Error calculando balance", error);
        }
      }
    };
    fetchData();
  }, [user, selectedMonth, selectedYear]); // Se vuelve a ejecutar cada vez que cambiás el mes

  const balance = totalIncome - totalDailyExpense;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { console.error("Error:", error); }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-green-50"><p className="text-green-600 font-bold animate-pulse">Cargando...</p></main>;

  if (user) {
    return (
      <div className="min-h-screen bg-green-50/50 flex flex-col relative">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
          
          {/* SELECTOR DE MES */}
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-green-100 w-full max-w-md mx-auto">
            <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-full font-bold transition-all active:scale-95">
              ←
            </button>
            <h2 className="text-xl font-extrabold text-green-800 uppercase tracking-widest">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </h2>
            <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-full font-bold transition-all active:scale-95">
              →
            </button>
          </div>

          {/* TARJETAS CLICKEABLES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <button onClick={() => setActiveModal("ingresos")} className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-100 flex flex-col justify-between text-left hover:scale-105 hover:shadow-md transition-all active:scale-95 group">
              <p className="text-xs text-slate-500 font-bold uppercase group-hover:text-green-600 transition-colors">Plata Ingresada</p>
              <h3 className="text-2xl font-extrabold text-slate-700 mt-1">+${totalIncome.toLocaleString()}</h3>
            </button>
            
            <button onClick={() => setActiveModal("disponible")} className={`p-6 rounded-[2rem] shadow-md text-white flex flex-col justify-between text-left hover:scale-105 hover:shadow-lg transition-all active:scale-95 ${balance >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
              <p className="text-xs text-green-100 font-bold uppercase">Dinero Disponible</p>
              <div>
                <h3 className="text-3xl font-extrabold mt-1">${balance.toLocaleString()}</h3>
                <p className="text-xs text-green-100/80 mt-1">(Descuenta débito/efectivo)</p>
              </div>
            </button>

            <button onClick={() => setActiveModal("tarjetas")} className="bg-white p-6 rounded-[2rem] shadow-sm border border-red-100 flex flex-col justify-between text-left hover:scale-105 hover:shadow-md transition-all active:scale-95 group">
              <p className="text-xs text-red-400 font-bold uppercase group-hover:text-red-500 transition-colors">Consumos en Tarjeta</p>
              <h3 className="text-2xl font-extrabold text-red-500 mt-1">-${totalCreditMonth.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</h3>
              <p className="text-xs text-slate-400 mt-1">A pagar este mes</p>
            </button>

          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-green-100">
            <h3 className="text-xl font-extrabold text-green-800 mb-4">📜 Historial General</h3>
            <ExpenseList refreshTrigger={0} />
          </div>
        </main>

        {/* MODALES DE DETALLE */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-extrabold text-slate-800">
                  {activeModal === "ingresos" && `💰 Ingresos de ${monthNames[selectedMonth - 1]}`}
                  {activeModal === "disponible" && `💸 Gastos de ${monthNames[selectedMonth - 1]}`}
                  {activeModal === "tarjetas" && `💳 Resumen de ${monthNames[selectedMonth - 1]}`}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition-all">✕</button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {activeModal === "ingresos" && (
                  <div className="flex flex-col gap-3">
                    {incomesList.length === 0 ? <p className="text-slate-500 text-center">No hay ingresos registrados este mes.</p> : incomesList.map(inc => (
                      <div key={inc.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <div>
                          <p className="font-bold text-slate-700">{inc.description}</p>
                          <p className="text-xs text-slate-400">{inc.date} • {inc.source}</p>
                        </div>
                        <span className="font-bold text-green-600">+${inc.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === "disponible" && (
                  <div className="flex flex-col gap-3">
                    {dailyExpensesList.length === 0 ? <p className="text-slate-500 text-center">No hay gastos diarios este mes.</p> : dailyExpensesList.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <div>
                          <p className="font-bold text-slate-700">{exp.description}</p>
                          <p className="text-xs text-slate-400">{exp.date} • {exp.paymentMethod}</p>
                        </div>
                        <span className="font-bold text-slate-700">-${exp.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === "tarjetas" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-500 mb-2 border-b pb-2">Estas son las cuotas exactas que vas a pagar en el cierre de este mes específico.</p>
                    {creditMonthList.length === 0 ? <p className="text-slate-500 text-center">¡Estás al día! No hay cuotas para este resumen.</p> : creditMonthList.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center border-b border-slate-50 pb-2 bg-red-50/30 p-2 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">{exp.description}</p>
                          <p className="text-xs text-red-500 font-bold">{exp.cardName} • Cuota {exp.currentInst} de {exp.installments}</p>
                          <p className="text-xs text-slate-400">Total original: ${exp.amount.toLocaleString()}</p>
                        </div>
                        <span className="font-extrabold text-red-600 text-lg">
                          -${exp.valorCuota.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ... (el return de la pantalla de login queda igual)
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-sm w-full border-4 border-green-100">
        <div className="text-6xl mb-4 animate-bounce">💸</div>
        <h1 className="text-4xl font-extrabold text-green-700 mb-3">Mis Gastos</h1>
        <p className="text-green-600/80 mb-8 font-medium">Llevá el control de tus finanzas sin estrés.</p>
        <button onClick={handleLogin} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 px-4 rounded-2xl shadow-lg transition-all active:scale-95">
          Entrar con Google ✨
        </button>
      </div>
    </main>
  );
}
