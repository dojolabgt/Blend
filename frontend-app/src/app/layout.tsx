import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { ServiceWorkerProvider } from "@/components/layout/ServiceWorkerProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";

export const metadata: Metadata = {
    title: 'Hi Krew',
    description: 'Plataforma de gestión para freelancers',
    applicationName: 'Hi Krew',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Hi Krew',
    },
    icons: {
        icon: '/HiKrewLogo.png',
        apple: '/HiKrewLogo.png',
        shortcut: '/HiKrewLogo.png',
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
        { media: '(prefers-color-scheme: dark)', color: '#18181b' },
    ],
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className="antialiased font-sans">
                <ThemeProvider>
                    <AuthProvider>
                        <ServiceWorkerProvider />
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
