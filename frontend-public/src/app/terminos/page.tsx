import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LegalTOC } from "@/components/LegalTOC";

export const metadata = {
    title: "Términos de Uso — Hi Krew",
    description: "Términos y condiciones de uso de la plataforma Hi Krew.",
};

const LAST_UPDATED = "18 de marzo de 2026";

const SECTIONS = [
    { id: "aceptacion-de-los-terminos", label: "Aceptación de los términos" },
    { id: "descripcion-del-servicio", label: "Descripción del servicio" },
    { id: "cuentas-de-usuario", label: "Cuentas de usuario" },
    { id: "planes-y-pagos", label: "Planes y pagos" },
    { id: "uso-aceptable", label: "Uso aceptable" },
    { id: "propiedad-intelectual", label: "Propiedad intelectual" },
    { id: "integraciones-de-terceros", label: "Integraciones de terceros" },
    { id: "modulo-de-impuestos", label: "Módulo de impuestos" },
    { id: "version-beta", label: "Versión Beta" },
    { id: "limitacion-de-responsabilidad", label: "Limitación de responsabilidad" },
    { id: "indemnizacion", label: "Indemnización" },
    { id: "terminacion", label: "Terminación" },
    { id: "ley-aplicable", label: "Ley aplicable" },
    { id: "contacto", label: "Contacto" },
];

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">

            {/* Header */}
            <header className="border-b border-white/[0.06]">
                <div className="container mx-auto px-5 md:px-8 max-w-5xl h-14 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-70 transition-opacity">
                        <Image src="/HiKrewLogo.png" alt="Hi Krew" width={24} height={24} className="object-contain opacity-80" />
                        <span className="font-bold text-[15px] text-white/80 tracking-tight">Hi Krew</span>
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Volver
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-5 md:px-8 max-w-5xl py-16 md:py-24">
                <div className="flex gap-12 xl:gap-16 items-start">

                    {/* Sidebar TOC */}
                    <aside className="hidden lg:block w-44 shrink-0 sticky top-16">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-white/20 uppercase mb-3 px-2">Contenido</p>
                        <LegalTOC items={SECTIONS} />
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-12">
                            <p className="text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase mb-3">Legal</p>
                            <h1 className="text-4xl md:text-[44px] font-black tracking-tight text-white leading-[1.07] mb-4">
                                Términos de Uso
                            </h1>
                            <p className="text-[13px] text-white/30">Última actualización: {LAST_UPDATED}</p>
                        </div>

                        <div className="space-y-10 text-white/60 leading-relaxed">

                            <Section id="aceptacion-de-los-terminos" title="1. Aceptación de los términos">
                                <p>
                                    Al acceder o utilizar la plataforma Hi Krew ("la Plataforma"), ya sea a través de nuestro sitio web o cualquier aplicación relacionada, usted acepta quedar vinculado por estos Términos de Uso. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
                                </p>
                                <p>
                                    Hi Krew es operado por Dojo Lab ("nosotros", "nos" o "nuestro"), con sede en Centroamérica. Nos reservamos el derecho de actualizar estos términos en cualquier momento. Le notificaremos los cambios significativos mediante correo electrónico o mediante un aviso destacado en la Plataforma.
                                </p>
                            </Section>

                            <Section id="descripcion-del-servicio" title="2. Descripción del servicio">
                                <p>
                                    Hi Krew es una plataforma de gestión de negocios diseñada para freelancers y agencias creativas en Centroamérica. La Plataforma ofrece herramientas para:
                                </p>
                                <ul>
                                    <li>Creación y gestión de deals y propuestas comerciales</li>
                                    <li>Generación de cotizaciones con múltiples opciones (A/B)</li>
                                    <li>Gestión de clientes y proyectos</li>
                                    <li>Administración de briefs digitales</li>
                                    <li>Seguimiento de tareas y entregables</li>
                                    <li>Gestión de cobros por hitos</li>
                                    <li>Colaboración entre workspaces y equipos</li>
                                </ul>
                                <p>
                                    Hi Krew puede conectarse con pasarelas de pago y servicios de terceros a través de integraciones opcionales. El uso de dichas integraciones es decisión exclusiva del usuario y está sujeto a los términos de cada servicio externo.
                                </p>
                            </Section>

                            <Section id="cuentas-de-usuario" title="3. Cuentas de usuario">
                                <p>
                                    Para acceder a las funciones de la Plataforma, debe registrar una cuenta. Puede hacerlo mediante correo electrónico y contraseña, o a través de Google Sign-In. Al crear una cuenta, usted se compromete a:
                                </p>
                                <ul>
                                    <li>Proporcionar información veraz, completa y actualizada</li>
                                    <li>Mantener la confidencialidad de su contraseña (cuando aplique)</li>
                                    <li>Notificarnos de inmediato cualquier uso no autorizado de su cuenta</li>
                                    <li>Ser responsable de todas las actividades realizadas bajo su cuenta</li>
                                </ul>
                                <p>
                                    Si elige registrarse o iniciar sesión con Google, acepta que Hi Krew acceda a su nombre y correo electrónico de Google con el único propósito de crear y gestionar su cuenta en la Plataforma. Puede vincular o desvincular su cuenta de Google desde Configuración → Seguridad.
                                </p>
                                <p>
                                    Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos, de forma reiterada o cuando sea necesario para proteger la integridad de la Plataforma.
                                </p>
                            </Section>

                            <Section id="planes-y-pagos" title="4. Planes y pagos">
                                <p>
                                    Hi Krew ofrece distintos planes de suscripción: Free, Pro y Premium. Los planes de pago se facturan mensualmente en dólares estadounidenses (USD). Al suscribirte a un plan de pago:
                                </p>
                                <ul>
                                    <li>Autorizas el cargo recurrente mensual en el método de pago registrado</li>
                                    <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración</li>
                                    <li>La cancelación surte efecto al final del período de facturación vigente</li>
                                    <li>No se realizan reembolsos por períodos parciales salvo que la ley lo requiera</li>
                                </ul>
                                <p>
                                    Nos reservamos el derecho de modificar los precios con al menos 30 días de aviso previo.
                                </p>
                            </Section>

                            <Section id="uso-aceptable" title="5. Uso aceptable">
                                <p>Usted acepta no utilizar la Plataforma para:</p>
                                <ul>
                                    <li>Actividades ilegales o fraudulentas</li>
                                    <li>Transmitir contenido dañino, obsceno, difamatorio o que infrinja derechos de terceros</li>
                                    <li>Intentar acceder sin autorización a sistemas o datos de otros usuarios</li>
                                    <li>Interferir con el funcionamiento normal de la Plataforma</li>
                                    <li>Realizar ingeniería inversa, descompilar o desensamblar cualquier parte del software</li>
                                    <li>Revender o sublicenciar el acceso a la Plataforma sin autorización expresa</li>
                                </ul>
                            </Section>

                            <Section id="propiedad-intelectual" title="6. Propiedad intelectual">
                                <p>
                                    Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo su diseño, código fuente, logotipos y contenido editorial, son propiedad de Dojo Lab. Estos términos no le otorgan ninguna licencia sobre dicho contenido salvo el uso limitado necesario para utilizar el servicio.
                                </p>
                                <p>
                                    Usted conserva todos los derechos sobre el contenido que cargue en la Plataforma (propuestas, datos de clientes, etc.) y nos otorga una licencia limitada para procesarlo con el único fin de prestar el servicio.
                                </p>
                            </Section>

                            <Section id="integraciones-de-terceros" title="7. Integraciones de terceros y servicios de Google">
                                <p>
                                    Hi Krew permite conectar servicios de terceros de forma opcional (pasarelas de pago, herramientas externas, etc.). Estas integraciones son configuradas por el propio usuario y no son obligatorias para el uso de la Plataforma. Dojo Lab no es responsable de las acciones, disponibilidad, contenido o políticas de los servicios externos que el usuario elija conectar.
                                </p>
                                <p><strong className="text-white/60">Google Drive (integración opcional):</strong></p>
                                <p>
                                    Hi Krew ofrece integración opcional con Google Drive para almacenamiento de archivos de proyectos. Al activar esta integración, usted:
                                </p>
                                <ul>
                                    <li>Autoriza a Hi Krew a acceder a su cuenta de Google Drive con el permiso limitado <code>drive.file</code>, que permite únicamente gestionar archivos creados o subidos a través de Hi Krew</li>
                                    <li>Comprende que Hi Krew no puede acceder a archivos preexistentes ni a ningún otro contenido de su Drive fuera del permiso explícitamente otorgado</li>
                                    <li>Puede revocar este acceso en cualquier momento desde Configuración → Integraciones o directamente desde su cuenta de Google</li>
                                </ul>
                                <p>
                                    El uso de Google Drive está sujeto a los <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Términos de Servicio de Google</a>. Hi Krew no se responsabiliza por interrupciones, cambios o discontinuación del servicio de Google Drive.
                                </p>
                            </Section>

                            <Section id="modulo-de-impuestos" title="8. Módulo de impuestos y facturación">
                                <p>
                                    Hi Krew incluye un módulo de gestión de impuestos y facturación completamente configurable. Los porcentajes de impuestos, categorías fiscales, datos de emisor y cualquier otro parámetro relacionado son ingresados y administrados exclusivamente por el usuario.
                                </p>
                                <p>
                                    Dojo Lab no se hace responsable por errores, omisiones o inexactitudes en la información fiscal ingresada por el usuario, ni por las consecuencias legales, tributarias o financieras que puedan derivarse de un uso incorrecto de este módulo. Es responsabilidad del usuario verificar que los datos y porcentajes configurados cumplan con la normativa fiscal vigente en su país.
                                </p>
                            </Section>

                            <Section id="version-beta" title="9. Versión Beta y reporte de errores">
                                <p>
                                    Hi Krew se encuentra actualmente en fase Beta. Esto significa que la Plataforma está en desarrollo activo y puede contener errores, comportamientos inesperados o funciones incompletas. Al usar Hi Krew en esta etapa, el usuario acepta estas condiciones.
                                </p>
                                <p>
                                    Si encuentras un error, comportamiento anómalo o vulnerabilidad, te pedimos que lo reportes a <a href="mailto:hola@hikrew.com">hola@hikrew.com</a> a la brevedad. El reporte responsable de errores ayuda a mejorar la experiencia para toda la comunidad.
                                </p>
                                <p>
                                    Cualquier usuario que aproveche deliberadamente un error, vulnerabilidad o falla de la Plataforma en beneficio propio o en perjuicio de terceros será suspendido de forma inmediata y podrá estar sujeto a acciones legales según corresponda.
                                </p>
                            </Section>

                            <Section id="limitacion-de-responsabilidad" title="10. Limitación de responsabilidad">
                                <p>
                                    En la máxima medida permitida por la ley aplicable, Hi Krew y Dojo Lab no serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de ganancias o datos, derivados del uso o la imposibilidad de uso de la Plataforma.
                                </p>
                                <p>
                                    La responsabilidad total de Hi Krew hacia usted por cualquier reclamación relacionada con el servicio no excederá el monto pagado por usted durante los 12 meses anteriores a la reclamación.
                                </p>
                            </Section>

                            <Section id="indemnizacion" title="11. Indemnización">
                                <p>
                                    Usted acepta indemnizar y mantener indemne a Hi Krew, sus directores, empleados y agentes, frente a cualquier reclamación, daño, pérdida o gasto (incluyendo honorarios legales razonables) derivados del incumplimiento de estos términos o del uso indebido de la Plataforma.
                                </p>
                            </Section>

                            <Section id="terminacion" title="12. Terminación">
                                <p>
                                    Podemos suspender o terminar su acceso a la Plataforma en cualquier momento, con o sin causa y con o sin previo aviso. Usted puede cancelar su cuenta en cualquier momento desde la configuración de su perfil. Tras la terminación, su derecho de uso cesa de inmediato.
                                </p>
                            </Section>

                            <Section id="ley-aplicable" title="13. Ley aplicable">
                                <p>
                                    Estos términos se rigen e interpretan de conformidad con las leyes de la República de Guatemala. Cualquier disputa que surja en relación con estos términos se someterá a la jurisdicción de los tribunales competentes de dicho país.
                                </p>
                            </Section>

                            <Section id="contacto" title="14. Contacto">
                                <p>
                                    Si tiene preguntas sobre estos Términos de Uso, puede contactarnos en:
                                </p>
                                <p>
                                    <strong className="text-white/70">Hi Krew / Dojo Lab</strong><br />
                                    Correo: <a href="mailto:hola@hikrew.com">hola@hikrew.com</a>
                                </p>
                            </Section>

                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] mt-8">
                <div className="container mx-auto px-5 md:px-8 max-w-5xl py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-white/25">© {new Date().getFullYear()} Hi Krew · Todos los derechos reservados</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacidad" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Política de Privacidad</Link>
                        <Link href="/terminos" className="text-[11px] text-white/60">Términos de Uso</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <div id={id} className="scroll-mt-24 space-y-3">
            <h2 className="text-[17px] font-bold text-white/80 tracking-tight">{title}</h2>
            <div className="space-y-3 text-[14px] text-white/50 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-white/60 [&_a:hover]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors">
                {children}
            </div>
        </div>
    );
}
