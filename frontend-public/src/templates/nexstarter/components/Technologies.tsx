"use client";

import { motion } from "framer-motion";

const STEPS = [
    {
        number: "01",
        title: "Crea un Deal",
        description:
            "Agrupa todo el contexto del proyecto: cliente, brief de requerimientos y opciones de cotización en un solo flujo.",
    },
    {
        number: "02",
        title: "Tu cliente lo aprueba en línea",
        description:
            "Envía un link público. Tu cliente revisa la propuesta, elige la opción y la aprueba con un clic. Sin correos, sin PDFs.",
    },
    {
        number: "03",
        title: "Cobra por hitos con Recurrente",
        description:
            "Define los hitos de pago y cobra directamente desde Hi Krew. Seguimiento automático del estado de cada cobro.",
    },
];

export function Technologies() {
    return (
        <section className="py-28 bg-gradient-to-b from-gray-50/60 to-white">
            <div className="container mx-auto px-4 max-w-5xl">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
                        Cómo funciona
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                        De la idea al cobro,<br />en tres pasos.
                    </h2>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Desktop connecting line */}
                    <div className="hidden md:block absolute top-[2.4rem] left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-px bg-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                        {STEPS.map((step, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col items-center text-center gap-5"
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.5, delay: index * 0.12 }}
                            >
                                <div className="w-[4.75rem] h-[4.75rem] rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 z-10">
                                    <span className="text-xl font-black text-gray-900 tabular-nums">
                                        {step.number}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
