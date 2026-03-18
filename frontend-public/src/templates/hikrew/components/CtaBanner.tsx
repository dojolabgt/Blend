"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

export function CtaBanner() {
    return (
        <section className="bg-[#0d0d0d] py-28 overflow-hidden relative">

            {/* Separator from Pricing */}
            <div className="absolute top-0 left-0 right-0 container mx-auto px-5 md:px-8 max-w-5xl">
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            </div>

            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
                style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.028) 0%, transparent 65%)" }}
            />

            <div className="relative container mx-auto px-5 md:px-8 max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-8"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <Image src="/HiKrewLogo.png" alt="Hi Krew" width={28} height={28} className="object-contain opacity-90" />
                    </div>

                    <div className="space-y-4 max-w-xl">
                        <h2 className="text-4xl md:text-[48px] font-black tracking-tight text-white leading-[1.05]">
                            Tu primer deal,<br />sin complicaciones.
                        </h2>
                        <p className="text-[15px] text-white/60 font-normal leading-relaxed">
                            Crea tu cuenta gratis en segundos. Sin tarjeta de crédito.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button asChild size="lg" className="rounded-full h-11 px-7 text-[14px] font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-none border-0">
                            <Link href={`${APP_URL}/register`}>
                                Empezar gratis
                                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg" className="rounded-full h-11 px-7 text-[14px] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/[0.08]">
                            <Link href="#precios">Ver planes</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
