import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reserva tu cita | Barbería",
  description: "Reserva tu cita en la barbería en menos de 1 minuto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-stone-50 to-stone-100`}>
        {children}
      </body>
    </html>
  );
}
