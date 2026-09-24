import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";

// --- INGRESOS ---
export const addIncome = async (userId: string, data: any) => await addDoc(collection(db, "users", userId, "incomes"), data);
export const getIncomes = async (userId: string) => {
  const q = query(collection(db, "users", userId, "incomes"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const deleteIncome = async (userId: string, id: string) => await deleteDoc(doc(db, "users", userId, "incomes", id));
export const updateIncome = async (userId: string, id: string, data: any) => await updateDoc(doc(db, "users", userId, "incomes", id), data);

// --- GASTOS ---
export const addExpense = async (userId: string, data: any) => await addDoc(collection(db, "users", userId, "expenses"), data);
export const getExpenses = async (userId: string) => {
  const q = query(collection(db, "users", userId, "expenses"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const deleteExpense = async (userId: string, id: string) => await deleteDoc(doc(db, "users", userId, "expenses", id));
export const updateExpense = async (userId: string, id: string, data: any) => await updateDoc(doc(db, "users", userId, "expenses", id), data);

// --- GASTOS FIJOS ---
export const addFixedExpense = async (userId: string, data: any) => await addDoc(collection(db, "users", userId, "fixedExpenses"), data);
export const getFixedExpenses = async (userId: string) => {
  const q = query(collection(db, "users", userId, "fixedExpenses"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const deleteFixedExpense = async (userId: string, id: string) => await deleteDoc(doc(db, "users", userId, "fixedExpenses", id));
export const updateFixedExpense = async (userId: string, id: string, data: any) => await updateDoc(doc(db, "users", userId, "fixedExpenses", id), data);

// --- TARJETAS ---
export const addCard = async (userId: string, data: any) => await addDoc(collection(db, "users", userId, "cards"), data);
export const getCards = async (userId: string) => {
  const q = query(collection(db, "users", userId, "cards"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const deleteCard = async (userId: string, id: string) => await deleteDoc(doc(db, "users", userId, "cards", id));

// --- CATEGORÍAS ---
export const addCategory = async (userId: string, data: any) => await addDoc(collection(db, "users", userId, "categories"), data);
export const getCategories = async (userId: string) => {
  const q = query(collection(db, "users", userId, "categories"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const deleteCategory = async (userId: string, id: string) => await deleteDoc(doc(db, "users", userId, "categories", id));
