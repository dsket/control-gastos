import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

interface CardData { name: string; closingDay: number; dueDay: number; }
interface CategoryData { name: string; icon: string; }
interface ExpenseData {
  description: string; amount: number; categoryId: string;
  paymentMethod: "credit" | "debit" | "transfer" | "cash";
  cardId?: string; installments: number; date: string;
}
interface IncomeData {
  description: string; amount: number; source: string; date: string;
}

// --- TARJETAS ---
export const addCard = async (userId: string, cardData: CardData) => {
  const docRef = await addDoc(collection(db, "users", userId, "cards"), cardData); return docRef.id;
};
export const getCards = async (userId: string) => {
  const q = query(collection(db, "users", userId, "cards"), orderBy("name"));
  const snap = await getDocs(q); return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- CATEGORÍAS ---
export const addCategory = async (userId: string, categoryData: CategoryData) => {
  const docRef = await addDoc(collection(db, "users", userId, "categories"), categoryData); return docRef.id;
};
export const getCategories = async (userId: string) => {
  const q = query(collection(db, "users", userId, "categories"), orderBy("name"));
  const snap = await getDocs(q); return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const deleteCategory = async (userId: string, categoryId: string) => {
  await deleteDoc(doc(db, "users", userId, "categories", categoryId));
};

// --- INGRESOS ---
export const addIncome = async (userId: string, incomeData: IncomeData) => {
  const docRef = await addDoc(collection(db, "users", userId, "incomes"), { ...incomeData, createdAt: Timestamp.now() }); return docRef.id;
};
export const getIncomes = async (userId: string) => {
  const q = query(collection(db, "users", userId, "incomes"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q); return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- GASTOS (CON EDICIÓN Y BORRADO) ---
export const addExpense = async (userId: string, expenseData: ExpenseData) => {
  const docRef = await addDoc(collection(db, "users", userId, "expenses"), { ...expenseData, createdAt: Timestamp.now() }); return docRef.id;
};
export const getExpenses = async (userId: string) => {
  const q = query(collection(db, "users", userId, "expenses"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q); return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const deleteExpense = async (userId: string, expenseId: string) => {
  await deleteDoc(doc(db, "users", userId, "expenses", expenseId));
};
export const updateExpense = async (userId: string, expenseId: string, updatedData: any) => {
  await updateDoc(doc(db, "users", userId, "expenses", expenseId), updatedData);
};
// --- GASTOS FIJOS / SUSCRIPCIONES ---
interface FixedExpenseData {
  description: string; amount: number; categoryId: string;
  paymentMethod: "credit" | "debit" | "transfer" | "cash";
  cardId?: string; dayOfMonth: number;
}

export const addFixedExpense = async (userId: string, data: FixedExpenseData) => {
  const docRef = await addDoc(collection(db, "users", userId, "fixedExpenses"), { ...data, createdAt: Timestamp.now() }); 
  return docRef.id;
};
export const getFixedExpenses = async (userId: string) => {
  const q = query(collection(db, "users", userId, "fixedExpenses"), orderBy("dayOfMonth", "asc"));
  const snap = await getDocs(q); 
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const deleteFixedExpense = async (userId: string, id: string) => {
  await deleteDoc(doc(db, "users", userId, "fixedExpenses", id));
};
export const updateFixedExpense = async (userId: string, id: string, updatedData: any) => {
  await updateDoc(doc(db, "users", userId, "fixedExpenses", id), updatedData);
};
