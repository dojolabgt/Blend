"use client";

import {
    FileText,
    ClipboardList,
    CreditCard,
    Users,
    Network,
    Layers,
} from "lucide-react";

const FEATURES = [
    {
        icon: FileText,
        title: "Deals y Propuestas",
        description:
            "Agrupa cliente, brief y cotización en un solo flujo. Envía propuestas profesionales con opciones A/B y términos y condiciones.",
    },
    {
        icon: ClipboardList,
        title: "Brief Digital",
        description:
            "Crea cuestionarios dinámicos y envíalos a tus clientes con un link público. Sin correos de ida y vuelta.",
    },
    {
        icon: CreditCard,
        title: "Planes de Pago",
        description:
            "Define hitos de cobro con fechas y porcentajes. Tu cliente ve exactamente cuándo y cuánto paga.",
    },
    {
        icon: Users,
        title: "Gestión de Clientes",
        description:
            "CRM liviano con historial completo: proyectos, deals y datos de facturación de cada cliente en un solo lugar.",
    },
    {
        icon: Network,
        title: "Red de Colaboración",
        description:
            "Conecta con otras agencias y freelancers. Comparte ingresos en proyectos conjuntos directamente desde la plataforma.",
    },
    {
        icon: Layers,
        title: "Cobros con Recurrente",
        description:
            "Integración nativa con Recurrente, el procesador de pagos de Centroamérica. Cobra sin salir de Hi Krew.",
    },
];

export function Features() {
    return (
        <section id="funciones" className="py-28 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
                        Funciones
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
                        Todo lo que necesitas<br />para trabajar en serio.
                    </h2>
                    <p className="text-lg text-gray-500 font-light leading-relaxed">
                        Sin herramientas dispersas. Hi Krew centraliza el flujo completo
                        desde el primer contacto hasta el cobro final.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group p-7 bg-gray-50/80 hover:bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                                    <Icon size={18} strokeWidth={1.75} />
                                </div>
                                <h3 className="text-[16px] font-bold text-gray-900 mb-2.5 leading-snug">
                                    {feature.title}
                                </h3>
                                <p className="text-[14px] text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
