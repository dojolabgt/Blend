"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Lock,
    DollarSign,
    Network,
    CalendarCheck,
    FileText,
    CheckCircle2,
    Check,
    Users,
    Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppMockup } from "./AppMockup";

const APP_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

/* ── Floating chip component ── */
function Chip({
    icon: Icon,
    label,
    className = "",
    entranceDelay = 0,
    floatDuration = 4.5,
    floatDelay = 0,
    amplitude = 8,
}: {
    icon: React.ElementType;
    label: string;
    className?: string;
    entranceDelay?: number;
    floatDuration?: number;
    floatDelay?: number;
    amplitude?: number;
}) {
    return (
        <motion.div
            className={`absolute pointer-events-none ${className}`}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: entranceDelay, ease: "easeOut" }}
        >
            <motion.div
                animate={{ y: [0, -amplitude, 0] }}
                transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floatDelay,
                }}
                className="flex items-center gap-2 bg-white/[0.07] backdrop-blur-md border border-white/[0.09] rounded-2xl px-3.5 py-2.5"
            >
                <div className="w-[26px] h-[26px] rounded-lg bg-white/[0.09] flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-white/55" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] text-white/40 font-medium whitespace-nowrap">{label}</span>
            </motion.div>
        </motion.div>
    );
}

/* ── Word stagger animation ── */
function AnimatedHeadline({
    text,
    dim = false,
    baseDelay = 0,
}: {
    text: string;
    dim?: boolean;
    baseDelay?: number;
}) {
    const words = text.split(" ");
    return (
        <span className={`block ${dim ? "text-white/25" : "text-white"}`}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.22em] last:mr-0"
                    initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                        duration: 0.5,
                        delay: baseDelay + i * 0.08,
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

/* ── Mobile chips row ── */
const MOBILE_CHIPS = [
    { icon: Lock, label: "Seguro" },
    { icon: DollarSign, label: "Cobros" },
    { icon: Network, label: "Colaboración" },
    { icon: FileText, label: "Deals" },
    { icon: CalendarCheck, label: "Hitos de pago" },
    { icon: CheckCircle2, label: "Aprobación online" },
];

export function Hero() {
    return (
        <section className="relative bg-[#0d0d0d] overflow-hidden">

            {/* ── Ambient glows ── */}
            {/* Top-center: principal light source */}
            <div className="absolute pointer-events-none" style={{ top: "-10%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "600px", background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.055) 0%, transparent 65%)", borderRadius: "50%" }} />
            {/* Bottom-left warm */}
            <div className="absolute pointer-events-none" style={{ bottom: "0%", left: "-5%", width: "600px", height: "500px", background: "radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.02) 0%, transparent 60%)", borderRadius: "50%" }} />
            {/* Bottom-right cool */}
            <div className="absolute pointer-events-none" style={{ bottom: "5%", right: "-8%", width: "550px", height: "450px", background: "radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.018) 0%, transparent 60%)", borderRadius: "50%" }} />

            {/* ── Floating chips — desktop only ── */}
            <Chip icon={Lock}        label="Seguro"            className="hidden xl:flex top-[28%] left-[7%]"   entranceDelay={0.9}  floatDuration={5.2} floatDelay={0}    amplitude={9} />
            <Chip icon={DollarSign}  label="Cobros"            className="hidden xl:flex top-[22%] right-[6%]"  entranceDelay={1.0}  floatDuration={4.8} floatDelay={1.2}  amplitude={7} />
            <Chip icon={Network}     label="Colaboración"      className="hidden xl:flex top-[50%] left-[4.5%]" entranceDelay={1.1}  floatDuration={6.0} floatDelay={0.6}  amplitude={10} />
            <Chip icon={CalendarCheck} label="Hitos de pago"  className="hidden xl:flex top-[46%] right-[4%]"  entranceDelay={1.2}  floatDuration={5.5} floatDelay={2.0}  amplitude={8} />
            <Chip icon={Users}       label="Clientes"          className="hidden xl:flex top-[68%] left-[8%]"   entranceDelay={1.3}  floatDuration={4.6} floatDelay={0.9}  amplitude={6} />
            <Chip icon={Layers}      label="Multi-plan"        className="hidden xl:flex top-[66%] right-[7%]"  entranceDelay={1.4}  floatDuration={5.8} floatDelay={1.7}  amplitude={9} />
            {/* lg (1024–1279px) — fewer chips */}
            <Chip icon={DollarSign}  label="Cobros"            className="hidden lg:flex xl:hidden top-[25%] right-[3%]"  entranceDelay={1.0}  floatDuration={4.8} floatDelay={1.2} amplitude={7} />
            <Chip icon={Network}     label="Colaboración"      className="hidden lg:flex xl:hidden top-[52%] left-[2%]"   entranceDelay={1.1}  floatDuration={6.0} floatDelay={0.6} amplitude={10} />

            {/* ── Main content ── */}
            <div className="relative flex flex-col items-center text-center pt-32 pb-20 px-5 max-w-3xl mx-auto">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 border border-white/[0.1] rounded-full px-4 py-1.5 text-[11px] font-medium text-white/40">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        Para freelancers en Guatemala · <span className="text-white/25">Próximamente Centroamérica</span>
                    </span>
                </motion.div>

                {/* Headline */}
                <h1 className="text-[56px] sm:text-[68px] md:text-[80px] font-black tracking-tighter leading-[0.97] mb-7">
                    <AnimatedHeadline text="Cotiza mejor." baseDelay={0.35} />
                    <AnimatedHeadline text="Cobra más rápido." dim baseDelay={0.55} />
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.85 }}
                    className="text-[16px] md:text-[17px] text-white/40 leading-relaxed max-w-lg font-light mb-8"
                >
                    Hi Krew centraliza el flujo completo de tu negocio freelance:
                    clientes, deals, cotizaciones y cobros, en un solo lugar.
                </motion.p>

                {/* Mobile chips grid */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.95 }}
                    className="xl:hidden flex flex-wrap justify-center gap-2 mb-8"
                >
                    {MOBILE_CHIPS.map(({ icon: Icon, label }) => (
                        <span
                            key={label}
                            className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2"
                        >
                            <Icon className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                            <span className="text-[11px] text-white/35 font-medium">{label}</span>
                        </span>
                    ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.05 }}
                    className="flex flex-wrap gap-3 justify-center mb-6"
                >
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full h-11 px-7 text-[14px] font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-none border-0"
                    >
                        <Link href={`${APP_URL}/register`}>
                            Empezar gratis
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="rounded-full h-11 px-7 text-[14px] text-white/45 hover:text-white hover:bg-white/[0.07] border border-white/[0.08]"
                    >
                        <Link href="#funciones">Ver funciones</Link>
                    </Button>
                </motion.div>

                {/* Proof points */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="flex flex-wrap justify-center gap-x-5 gap-y-1"
                >
                    {["Plan gratis para siempre", "Sin tarjeta de crédito", "Sin contratos"].map((t) => (
                        <span key={t} className="flex items-center gap-1.5 text-[11px] text-white/35 font-medium">
                            <Check className="h-3 w-3 text-emerald-400/80 shrink-0" strokeWidth={2.5} />
                            {t}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* ── App Mockup ── */}
            <motion.div
                initial={{ opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative max-w-5xl mx-auto px-5 pb-20"
            >
                {/* Glow above mockup */}
                <div className="absolute -inset-x-20 -top-16 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(255,255,255,0.035) 0%, transparent 100%)" }} />
                <AppMockup />
            </motion.div>

        </section>
    );
}
