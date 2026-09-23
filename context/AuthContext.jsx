"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha automáticamente si alguien inicia o cierra sesión
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // ACÁ DEFINIMOS QUIÉN PUEDE ENTRAR (cambiá este email por el tuyo de Google)
      const allowedEmails = ["delfinasket@gmail.com",
        "micalopez1310@gmail.com", "sketdelfina@gmail.com"
      ]; 

      if (currentUser && allowedEmails.includes(currentUser.email)) {
        setUser(currentUser);
      } else if (currentUser) {
        // Si inicia sesión alguien que no está en la lista, lo pateamos
        alert("¡Acceso denegado! Fifi no te autorizó😡.");
        signOut(auth);
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
