"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import GlassSurface from "@/components/react-bits/effects/GlassSurface";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

export function Header() {
    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 pt-5 px-4"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="container mx-auto max-w-5xl">
                <GlassSurface
                    width="100%"
                    height="3.5rem"
                    borderRadius={9999}
                    borderWidth={0.5}
                    opacity={0.65}
                    blur={18}
                    className="shadow-lg shadow-black/5"
                >
                    <div className="w-full h-full flex items-center justify-between px-5">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                            <Image
                                src="/HiKrewLogo.png"
                                alt="Hi Krew"
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                            <span className="font-bold text-[15px] text-gray-900 tracking-tight">Hi Krew</span>
                        </Link>

                        {/* Nav */}
                        <nav className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild className="hidden md:flex rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 text-[13px]">
                                <Link href="#funciones">Funciones</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="hidden md:flex rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 text-[13px]">
                                <Link href="#precios">Precios</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="hidden md:flex rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 text-[13px]">
                                <Link href={`${DASHBOARD_URL}/login`}>
                                    <LogIn className="h-3.5 w-3.5 mr-1.5" />
                                    Entrar
                                </Link>
                            </Button>
                            <Button size="sm" className="rounded-full ml-1 bg-gray-900 text-white hover:bg-gray-800 text-[13px] px-4 shadow-sm" asChild>
                                <Link href={`${DASHBOARD_URL}/login`}>
                                    Entrar
                                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                </Link>
                            </Button>
                        </nav>

                    </div>
                </GlassSurface>
            </div>
        </motion.header>
    );
}
