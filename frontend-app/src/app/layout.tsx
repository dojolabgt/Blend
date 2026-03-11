import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nodally",
  description: "Plataforma de gestión para freelancers",
  icons: {
    icon: "/NodallyLogo.png",
  },
};

import { AuthProvider } from "@/features/auth/context/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
