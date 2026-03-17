"use client";

import {
    LayoutDashboard,
    Users,
    FileText,
    Briefcase,
    CreditCard,
    Settings,
    CheckCircle2,
    Clock,
    Network,
} from "lucide-react";

const NAV_TOP = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Users, label: "Clientes" },
    { icon: FileText, label: "Deals", active: true },
    { icon: Network, label: "Mi Red" },
];
const NAV_BOTTOM = [
    { icon: Briefcase, label: "Servicios" },
    { icon: CreditCard, label: "Pagos" },
    { icon: Settings, label: "Ajustes" },
];

const ITEMS = [
    { name: "Diseño web (5 páginas)", price: "$1,200" },
    { name: "Dominio + Hosting anual", price: "$300" },
    { name: "SEO On-page inicial", price: "$250" },
];

const MILESTONES = [
    { label: "50% al inicio del proyecto", amount: "$875", done: true },
    { label: "50% al entregar artes finales", amount: "$875", done: false },
];

export function AppMockup() {
    return (
        <div className="w-full rounded-2xl overflow-hidden border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)] select-none">

            {/* Browser chrome */}
            <div className="bg-[#181818] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06] shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-[#111] rounded-md px-4 py-1 text-[11px] text-white/25 font-mono tracking-tight">
                        app.hikrew.com/dashboard/deals/idx
                    </div>
                </div>
                <div className="w-14 hidden sm:block" />
            </div>

            {/* App layout */}
            <div className="flex h-[480px] sm:h-[540px] text-left overflow-hidden bg-gray-50">

                {/* ── Sidebar (pearl, matches real app) ── */}
                <aside className="hidden sm:flex w-[196px] flex-col bg-gradient-to-b from-white to-gray-100/80 border-r border-gray-200/60 shrink-0">

                    {/* Brand */}
                    <div className="h-[52px] flex items-center px-4 gap-2.5 border-b border-gray-200/60 shrink-0">
                        <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center shrink-0">
                            <span className="text-white text-[9px] font-black leading-none">HK</span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900 tracking-tight truncate">Hi Krew</span>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 py-3 px-2.5 overflow-hidden">
                        <p className="px-2.5 mb-1.5 text-[8px] font-semibold tracking-[0.16em] text-gray-400 uppercase">Principal</p>
                        <div className="space-y-0.5">
                            {NAV_TOP.map((item) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] ${item.active
                                        ? "bg-white shadow-sm text-gray-900 font-medium"
                                        : "text-gray-400"
                                        }`}
                                >
                                    <item.icon
                                        className={`h-3.5 w-3.5 shrink-0 ${item.active ? "text-gray-700" : "text-gray-400"}`}
                                        strokeWidth={item.active ? 2 : 1.5}
                                    />
                                    {item.label}
                                </div>
                            ))}
                        </div>

                        <p className="px-2.5 mb-1.5 mt-4 text-[8px] font-semibold tracking-[0.16em] text-gray-400 uppercase">Finanzas</p>
                        <div className="space-y-0.5">
                            {NAV_BOTTOM.map((item) => (
                                <div key={item.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-gray-400">
                                    <item.icon className="h-3.5 w-3.5 shrink-0 text-gray-400" strokeWidth={1.5} />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </nav>

                    {/* User footer */}
                    <div className="p-2.5 border-t border-gray-200/60 shrink-0">
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/60 transition-colors">
                            <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0" />
                            <div className="min-w-0">
                                <div className="text-[10px] font-semibold text-gray-700 truncate">Sofía H.</div>
                                <div className="text-[9px] text-gray-400 truncate">sofía@caferaiz.com</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

                    {/* Page header */}
                    <div className="bg-white/80 border-b border-gray-100 px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
                        <div className="min-w-0">
                            <h1 className="text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight truncate">
                                Rediseño Web — Café Raíz
                            </h1>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                                Sofía Hernández · sofía@caferaiz.com
                            </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/70 rounded-full text-[10px] font-semibold px-2.5 py-1 ml-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Enviado
                        </span>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-3.5">

                        {/* Quotation card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[12px] font-semibold text-gray-900">Opción A — Paquete Completo</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Diseño + hosting + posicionamiento</p>
                                </div>
                                <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5">
                                    <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
                                    Aprobada
                                </span>
                            </div>
                            <div className="px-5 py-4 space-y-2.5">
                                {ITEMS.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between gap-4">
                                        <span className="text-[11px] text-gray-500 min-w-0 truncate">{item.name}</span>
                                        <span className="text-[11px] font-semibold text-gray-900 shrink-0">{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[12px] font-bold text-gray-900">Total del proyecto</span>
                                    <span className="text-[16px] font-black text-gray-900">$1,750</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment plan card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50">
                                <p className="text-[12px] font-semibold text-gray-900">Plan de Pago</p>
                            </div>
                            <div className="px-5 py-4 space-y-3">
                                {MILESTONES.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${m.done ? "bg-gray-900" : "border-2 border-gray-200"}`}>
                                            {m.done && <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-[11px] flex-1 min-w-0 truncate ${m.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>
                                            {m.label}
                                        </span>
                                        <span className={`text-[12px] font-bold shrink-0 ${m.done ? "text-gray-400" : "text-gray-900"}`}>
                                            {m.amount}
                                        </span>
                                        {!m.done && (
                                            <span className="shrink-0 flex items-center gap-1 text-[9px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                                                <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                                                Pendiente
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
