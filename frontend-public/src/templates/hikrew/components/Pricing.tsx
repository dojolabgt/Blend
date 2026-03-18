"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const APP_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';
const PRO_PRICE = process.env.NEXT_PUBLIC_PRO_PRICE || '19';
const PREMIUM_PRICE = process.env.NEXT_PUBLIC_PREMIUM_PRICE || '39';

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "para siempre",
        description: "Para empezar a ordenar tu negocio freelance.",
        features: [
            "Hasta 3 deals activos",
            "Gestión de clientes",
            "Brief digital",
            "1 usuario",
        ],
        cta: "Empezar gratis",
        href: `${APP_URL}/register`,
        featured: false,
    },
    {
        name: "Pro",
        price: `$${PRO_PRICE}`,
        period: "/ mes",
        description: "Para freelancers que quieren cobrar como profesionales.",
        features: [
            "Deals ilimitados",
            "Cotizaciones A/B",
            "Branding personalizado",
            "Planes de pago con hitos",
            "Integración Recurrente",
            "Gestión de proyectos y tareas",
        ],
        cta: "Empezar con Pro",
        href: `${APP_URL}/register?plan=pro`,
        featured: true,
    },
    {
        name: "Premium",
        price: `$${PREMIUM_PRICE}`,
        period: "/ mes",
        description: "Para agencias y equipos que trabajan en conjunto.",
        features: [
            "Todo lo de Pro",
            "Colaboradores ilimitados",
            "Red de workspaces",
            "Splits de ingresos",
            "Soporte prioritario",
        ],
        cta: "Empezar con Premium",
        href: `${APP_URL}/register?plan=premium`,
        featured: false,
    },
];

export function Pricing() {
    return (
        <section id="precios" className="bg-[#0d0d0d] pb-28 overflow-hidden">

            {/* Separator from HowItWorks */}
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
                    className="text-center max-w-lg mx-auto mb-14"
                >
                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/55 uppercase mb-3">
                        Precios
                    </p>
                    <h2 className="text-4xl md:text-[44px] font-black tracking-tight text-white leading-[1.07] mb-4">
                        Elige tu plan.
                    </h2>
                    <p className="text-[15px] text-white/60 font-normal leading-relaxed">
                        Empieza gratis. Sube de plan cuando tu negocio lo necesite.
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.45, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                            className={`relative flex flex-col rounded-2xl p-7 ${
                                plan.featured
                                    ? "bg-white text-gray-900 md:-mt-4 md:mb-4 shadow-2xl shadow-black/40"
                                    : "bg-white/[0.04] border border-white/[0.08]"
                            }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-white/[0.12]">
                                        <Zap aria-hidden="true" className="h-2.5 w-2.5 fill-white" strokeWidth={0} />
                                        Popular
                                    </span>
                                </div>
                            )}

                            {/* Plan name */}
                            <p className={`text-[10px] font-bold tracking-widest uppercase mb-4 ${plan.featured ? "text-gray-400" : "text-white/55"}`}>
                                {plan.name}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-1.5 mb-2">
                                <span className={`text-[44px] font-black leading-none tracking-tight ${plan.featured ? "text-gray-900" : "text-white"}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-[13px] ${plan.featured ? "text-gray-400" : "text-white/55"}`}>
                                    {plan.period}
                                </span>
                            </div>

                            <p className={`text-[12px] leading-snug mb-7 ${plan.featured ? "text-gray-500" : "text-white/60"}`}>
                                {plan.description}
                            </p>

                            {/* Divider */}
                            <div className={`h-px mb-6 ${plan.featured ? "bg-gray-100" : "bg-white/[0.06]"}`} />

                            {/* Features */}
                            <ul className="space-y-2.5 mb-8 flex-1">
                                {plan.features.map((feat, j) => (
                                    <li key={j} className="flex items-center gap-2.5 text-[13px]">
                                        <div aria-hidden="true" className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.featured ? "bg-gray-100" : "bg-white/[0.07]"}`}>
                                            <Check
                                                className={`h-2.5 w-2.5 shrink-0 ${plan.featured ? "text-gray-600" : "text-white/50"}`}
                                                strokeWidth={3}
                                            />
                                        </div>
                                        <span className={plan.featured ? "text-gray-700" : "text-white/65"}>
                                            {feat}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                className={`w-full rounded-xl h-10 text-[13px] font-semibold shadow-none border-0 ${
                                    plan.featured
                                        ? "bg-gray-900 text-white hover:bg-gray-800"
                                        : "bg-white/[0.07] text-white/80 hover:bg-white/[0.12] hover:text-white"
                                }`}
                            >
                                <Link href={plan.href}>
                                    {plan.cta}
                                    <ArrowRight aria-hidden="true" className="ml-2 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Fine print */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center text-[11px] text-white/50 mt-8"
                >
                    Precios en USD · Sin contratos · Cancela cuando quieras
                </motion.p>

            </div>
        </section>
    );
}
