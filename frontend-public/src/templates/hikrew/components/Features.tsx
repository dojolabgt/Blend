"use client";

import { motion } from "framer-motion";
import {
    Network,
    FileText,
    ClipboardList,
    CreditCard,
    FileCheck,
} from "lucide-react";

const FEATURES = [
    {
        icon: Network,
        tag: "Exclusivo",
        title: "Conexión Freelancer",
        description: "Conecta tu workspace con otros freelancers y agencias. Comparte proyectos, reparte ingresos y amplía tu capacidad sin contratar — la red que ninguna otra app te da.",
        featured: true,
    },
    {
        icon: ClipboardList,
        tag: null,
        title: "Brief Digital",
        description: "Cuestionario por link. El cliente llena solo, tú recibes todo listo antes de cotizar.",
        featured: false,
    },
    {
        icon: FileText,
        tag: null,
        title: "Deals y Propuestas A/B",
        description: "Dos opciones de precio en un mismo deal. Tu cliente compara y aprueba en línea.",
        featured: false,
    },
    {
        icon: CreditCard,
        tag: null,
        title: "Hitos de cobro",
        description: "Anticipo, avance, cierre. Define cuándo cobras desde el inicio y documenta cada pago.",
        featured: false,
    },
    {
        icon: FileCheck,
        tag: null,
        title: "Aprobación online",
        description: "Tu cliente ve la propuesta y aprueba con un clic. Sin apps, sin registro.",
        featured: false,
    },
];

export function Features() {
    return (
        <section className="bg-[#0d0d0d] pb-24 overflow-hidden">

            {/* Separator from Hero */}
            <div className="container mx-auto px-5 md:px-8 max-w-5xl">
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent mb-24" />
            </div>

            <div className="container mx-auto px-5 md:px-8 max-w-5xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-3">
                        Funciones
                    </p>
                    <h2 className="text-4xl md:text-[44px] font-black tracking-tight text-white leading-[1.07] mb-4 max-w-lg">
                        Todo lo que necesitas, en un solo lugar.
                    </h2>
                    <p className="text-[15px] text-white/55 font-light leading-relaxed max-w-md">
                        Desde el brief hasta el cobro final — y una red de colaboradores que ninguna otra app te da.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {FEATURES.map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                            className={`rounded-2xl border p-6 flex flex-col gap-3 ${
                                feat.featured
                                    ? "md:col-span-2 bg-white/[0.05] border-white/[0.12]"
                                    : "bg-white/[0.03] border-white/[0.07]"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    feat.featured ? "bg-white/[0.12]" : "bg-white/[0.07]"
                                }`}>
                                    <feat.icon className="h-4 w-4 text-white/70" strokeWidth={1.75} />
                                </div>
                                {feat.tag && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-white/[0.08] text-white/50 border border-white/[0.08]">
                                        {feat.tag}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className={`font-bold tracking-tight mb-1.5 ${feat.featured ? "text-[18px] text-white" : "text-[15px] text-white"}`}>
                                    {feat.title}
                                </h3>
                                <p className={`leading-relaxed ${feat.featured ? "text-[14px] text-white/60 max-w-sm" : "text-[13px] text-white/55"}`}>
                                    {feat.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
