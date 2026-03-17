'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SplashCursor from "@/components/react-bits/backgrounds/SplashCursor";
import BlurText from "@/components/react-bits/text/BlurText";
import { motion } from "framer-motion";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

const PROOF_POINTS = [
    "Sin tarjeta de crédito",
    "Plan gratis para siempre",
    "Para Centroamérica",
];

export function Hero() {
    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100/60 flex flex-col items-center pt-36 md:pt-48 pb-16">

            {/* Fluid background */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40">
                <SplashCursor />
            </div>

            {/* Subtle radial glow */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(0,0,0,0.04) 0%, transparent 100%)",
                }}
            />

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center gap-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-full px-4 py-1.5 text-[12px] font-medium text-gray-500 shadow-sm"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
                    Para freelancers y agencias en Centroamérica
                </motion.div>

                {/* Headline */}
                <div className="space-y-2 max-w-4xl mx-auto">
                    <BlurText
                        text="Tu negocio freelance,"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 leading-[1.0] justify-center flex flex-wrap gap-x-4"
                    />
                    <BlurText
                        text="sin el caos."
                        delay={400}
                        animateBy="words"
                        direction="top"
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-400 leading-[1.0] justify-center flex flex-wrap"
                    />
                </div>

                {/* Subtitle */}
                <motion.p
                    className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.9 }}
                >
                    Crea deals, envía cotizaciones profesionales, gestiona clientes
                    y cobra por hitos — todo desde un solo lugar.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 1.1 }}
                >
                    <Button asChild size="lg" className="rounded-full h-12 px-8 text-[15px] font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <Link href={`${DASHBOARD_URL}/register`}>
                            Empezar gratis
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 text-[15px] font-medium border-gray-200 hover:bg-white/80 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm">
                        <Link href="#funciones">
                            Ver funciones
                        </Link>
                    </Button>
                </motion.div>

                {/* Social proof */}
                <motion.div
                    className="flex flex-wrap justify-center gap-x-6 gap-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 1.3 }}
                >
                    {PROOF_POINTS.map((point) => (
                        <span key={point} className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {point}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Logo visual */}
            <motion.div
                className="relative z-10 mt-16 md:mt-20"
                initial={{ opacity: 0, y: 60, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.1, delay: 1.4, ease: "circOut" }}
            >
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-gray-200/60 to-gray-300/30 blur-2xl scale-110 pointer-events-none" />

                    {/* Card container */}
                    <div className="relative bg-white/70 backdrop-blur-xl border border-gray-200/80 rounded-[2.5rem] shadow-2xl shadow-black/8 p-10 md:p-14">
                        <Image
                            src="/HiKrewLogo.png"
                            alt="Hi Krew"
                            width={140}
                            height={140}
                            className="object-contain mx-auto animate-float"
                            priority
                        />
                    </div>
                </div>
            </motion.div>

        </section>
    );
}
