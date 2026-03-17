"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "para siempre",
        description: "Para empezar a organizar tu negocio freelance.",
        features: [
            "Hasta 3 deals activos",
            "1 usuario",
            "Gestión de clientes",
            "Brief digital",
        ],
        cta: "Empezar gratis",
        href: `${DASHBOARD_URL}/register`,
        featured: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "/ mes",
        description: "Para freelancers que quieren escalar y verse profesionales.",
        features: [
            "Deals ilimitados",
            "Branding personalizado",
            "Cotizaciones A/B",
            "Integración Recurrente",
            "Planes de pago con hitos",
        ],
        cta: "Empezar con Pro",
        href: `${DASHBOARD_URL}/register?plan=pro`,
        featured: true,
    },
    {
        name: "Premium",
        price: "$39",
        period: "/ mes",
        description: "Para agencias y equipos que colaboran en proyectos.",
        features: [
            "Todo lo de Pro",
            "Colaboradores ilimitados",
            "Red de workspaces",
            "Splits de ingresos",
            "Soporte prioritario",
        ],
        cta: "Empezar con Premium",
        href: `${DASHBOARD_URL}/register?plan=premium`,
        featured: false,
    },
];

export function DashboardPreview() {
    return (
        <section id="precios" className="py-28 bg-gray-50/60">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
                        Precios
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight mb-4">
                        Elige tu plan.
                    </h2>
                    <p className="text-lg text-gray-500 font-light">
                        Empieza gratis. Sube de plan cuando tu negocio lo necesite.
                    </p>
                </div>

                {/* Plans grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                    {PLANS.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.45, delay: index * 0.1 }}
                            className={`relative flex flex-col rounded-3xl p-7 ${
                                plan.featured
                                    ? "bg-gray-900 text-white shadow-2xl shadow-black/15 scale-[1.02]"
                                    : "bg-white border border-gray-100 shadow-sm"
                            }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="bg-white text-gray-900 text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                                        Más popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <p className={`text-[11px] font-semibold tracking-widest uppercase mb-3 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                                    {plan.name}
                                </p>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className={`text-4xl font-black ${plan.featured ? "text-white" : "text-gray-900"}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-sm ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className={`text-[13px] leading-snug ${plan.featured ? "text-gray-400" : "text-gray-500"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-2.5 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-[13px]">
                                        <Check className={`h-4 w-4 shrink-0 ${plan.featured ? "text-gray-400" : "text-gray-400"}`} strokeWidth={2.5} />
                                        <span className={plan.featured ? "text-gray-200" : "text-gray-600"}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                className={`w-full rounded-xl h-11 text-[14px] font-semibold transition-all duration-200 ${
                                    plan.featured
                                        ? "bg-white text-gray-900 hover:bg-gray-100 shadow-none"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                }`}
                            >
                                <Link href={plan.href}>
                                    {plan.cta}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-[12px] text-gray-400 mt-8">
                    Precios en USD. Sin contratos. Cancela cuando quieras.
                </p>

            </div>
        </section>
    );
}
