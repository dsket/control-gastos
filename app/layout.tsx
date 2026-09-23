import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Gastos",
  description: "Llevá el control de tus tarjetas y cuotas",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mis Gastos",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-green-50 text-slate-800">
        {/* Envolvemos todo con el proveedor de autenticación */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
