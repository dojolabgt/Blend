import Link from "next/link";
import Image from "next/image";

const APP_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

const LINKS = {
    Producto: [
        { label: "Funciones", href: "#funciones" },
        { label: "Precios", href: "#precios" },
        { label: "Cómo funciona", href: "#funciones" },
    ],
    Cuenta: [
        { label: "Entrar", href: `${APP_URL}/login` },
        { label: "Registrarse", href: `${APP_URL}/register` },
    ],
    Legal: [
        { label: "Privacidad", href: "/privacidad" },
        { label: "Términos de uso", href: "/terminos" },
    ],
};

export function Footer() {
    return (
        <footer className="bg-[#0d0d0d] border-t border-white/[0.06]">
            <div className="container mx-auto px-5 md:px-8 max-w-5xl py-14">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-70 transition-opacity">
                            <Image src="/HiKrewLogo.png" alt="Hi Krew" width={24} height={24} className="object-contain opacity-80" />
                            <span className="font-bold text-[15px] text-white/80 tracking-tight">Hi Krew</span>
                        </Link>
                        <p className="text-[12px] text-white/30 leading-relaxed max-w-[190px]">
                            La plataforma de gestión para freelancers y agencias en Guatemala.
                        </p>
                    </div>

                    {Object.entries(LINKS).map(([group, links]) => (
                        <div key={group}>
                            <p className="text-[10px] font-bold tracking-[0.18em] text-white/25 uppercase mb-4">
                                {group}
                            </p>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[13px] text-white/40 hover:text-white/80 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/[0.06] pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-white/25">
                        © {new Date().getFullYear()} Hi Krew · Todos los derechos reservados
                    </p>
                    <p className="text-[11px] text-white/25">
                        Hecho en Guatemala 🇬🇹
                    </p>
                </div>

            </div>
        </footer>
    );
}
