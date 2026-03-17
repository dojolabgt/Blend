import Link from "next/link";
import Image from "next/image";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

const LINKS = {
    Producto: [
        { label: "Funciones", href: "#funciones" },
        { label: "Precios", href: "#precios" },
        { label: "Cómo funciona", href: "#funciones" },
    ],
    Cuenta: [
        { label: "Entrar", href: `${DASHBOARD_URL}/login` },
        { label: "Registrarse", href: `${DASHBOARD_URL}/register` },
    ],
    Legal: [
        { label: "Privacidad", href: "#" },
        { label: "Términos", href: "#" },
    ],
};

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 max-w-6xl py-16">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

                    {/* Brand col */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4 hover:opacity-80 transition-opacity">
                            <Image
                                src="/HiKrewLogo.png"
                                alt="Hi Krew"
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                            <span className="font-bold text-[15px] text-gray-900 tracking-tight">Hi Krew</span>
                        </Link>
                        <p className="text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
                            La plataforma de gestión para freelancers y agencias de Centroamérica.
                        </p>
                    </div>

                    {/* Link cols */}
                    {Object.entries(LINKS).map(([group, links]) => (
                        <div key={group}>
                            <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
                                {group}
                            </p>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[12px] text-gray-400">
                        © {new Date().getFullYear()} Hi Krew. Todos los derechos reservados.
                    </p>
                    <p className="text-[12px] text-gray-400">
                        Hecho en Centroamérica 🌎
                    </p>
                </div>

            </div>
        </footer>
    );
}
