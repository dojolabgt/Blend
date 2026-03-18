import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LegalTOC } from "@/components/LegalTOC";

export const metadata = {
    title: "Política de Privacidad — Hi Krew",
    description: "Política de privacidad y tratamiento de datos de la plataforma Hi Krew.",
};

const LAST_UPDATED = "18 de marzo de 2026";

const SECTIONS = [
    { id: "responsable-del-tratamiento", label: "Responsable del tratamiento" },
    { id: "datos-que-recopilamos", label: "Datos que recopilamos" },
    { id: "finalidad-del-tratamiento", label: "Finalidad del tratamiento" },
    { id: "base-legal-del-tratamiento", label: "Base legal del tratamiento" },
    { id: "comparticion-de-datos", label: "Compartición de datos" },
    { id: "servicios-de-google", label: "Servicios de Google" },
    { id: "cookies", label: "Cookies" },
    { id: "retencion-de-datos", label: "Retención de datos" },
    { id: "seguridad", label: "Seguridad" },
    { id: "sus-derechos", label: "Sus derechos" },
    { id: "transferencias-internacionales", label: "Transferencias internacionales" },
    { id: "menores-de-edad", label: "Menores de edad" },
    { id: "cambios-a-esta-politica", label: "Cambios a esta política" },
    { id: "contacto", label: "Contacto" },
];

export default function PrivacidadPage() {
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
                                Política de Privacidad
                            </h1>
                            <p className="text-[13px] text-white/30">Última actualización: {LAST_UPDATED}</p>
                        </div>

                        <div className="space-y-10 text-white/60 leading-relaxed">

                            <Section id="responsable-del-tratamiento" title="1. Responsable del tratamiento">
                                <p>
                                    Dojo Lab, operador de Hi Krew, es el responsable del tratamiento de sus datos personales recopilados a través de la Plataforma. Si tiene alguna consulta relacionada con el tratamiento de sus datos, puede contactarnos en <a href="mailto:hola@hikrew.com">hola@hikrew.com</a>.
                                </p>
                            </Section>

                            <Section id="datos-que-recopilamos" title="2. Datos que recopilamos">
                                <p>Recopilamos distintos tipos de información según cómo interactúe con la Plataforma:</p>
                                <p><strong className="text-white/60">Datos de registro y perfil:</strong></p>
                                <ul>
                                    <li>Nombre y apellido</li>
                                    <li>Correo electrónico</li>
                                    <li>Nombre de la empresa o estudio (opcional)</li>
                                    <li>Contraseña (almacenada de forma encriptada), cuando aplique</li>
                                </ul>
                                <p><strong className="text-white/60">Datos obtenidos a través de Google (cuando usa Google para registrarse o iniciar sesión):</strong></p>
                                <ul>
                                    <li>Nombre completo y apellido, tal como aparecen en su cuenta de Google</li>
                                    <li>Dirección de correo electrónico de Google</li>
                                    <li>Identificador único de cuenta de Google (Google ID), almacenado internamente para vincular su cuenta</li>
                                    <li>No accedemos a su contraseña de Google ni a ningún otro dato de su cuenta fuera de lo indicado</li>
                                </ul>
                                <p><strong className="text-white/60">Datos de Google Drive (si activa la integración voluntaria de Google Drive):</strong></p>
                                <ul>
                                    <li>Correo electrónico de la cuenta de Google Drive conectada</li>
                                    <li>Acceso exclusivamente a los archivos creados o cargados por Hi Krew en su Drive (permiso <code>drive.file</code>). No podemos ver, leer ni modificar archivos preexistentes ni ningún otro contenido de su cuenta de Drive</li>
                                    <li>Nombre e identificadores de las carpetas de proyecto creadas por Hi Krew en su Drive</li>
                                    <li>Los tokens de acceso y actualización de Google Drive se almacenan de forma segura y encriptada en nuestros servidores para mantener la conexión activa</li>
                                </ul>
                                <p><strong className="text-white/60">Datos de uso:</strong></p>
                                <ul>
                                    <li>Deals, propuestas y cotizaciones creadas en la Plataforma</li>
                                    <li>Información de clientes que usted ingrese</li>
                                    <li>Proyectos, tareas y entregables</li>
                                    <li>Historial de pagos y hitos</li>
                                </ul>
                                <p><strong className="text-white/60">Datos técnicos:</strong></p>
                                <ul>
                                    <li>Dirección IP y datos del dispositivo</li>
                                    <li>Tipo y versión del navegador</li>
                                    <li>Páginas visitadas y tiempo de sesión</li>
                                    <li>Cookies y tecnologías similares</li>
                                </ul>
                            </Section>

                            <Section id="finalidad-del-tratamiento" title="3. Finalidad del tratamiento">
                                <p>Utilizamos sus datos para los siguientes propósitos:</p>
                                <ul>
                                    <li><strong className="text-white/60">Prestación del servicio:</strong> crear y gestionar su cuenta, procesar pagos y habilitar todas las funciones de la Plataforma</li>
                                    <li><strong className="text-white/60">Autenticación con Google:</strong> cuando elige iniciar sesión o registrarse con Google, utilizamos su nombre y correo electrónico de Google exclusivamente para crear o identificar su cuenta en Hi Krew. No utilizamos estos datos para ningún otro fin</li>
                                    <li><strong className="text-white/60">Google Drive:</strong> cuando activa voluntariamente la integración, usamos el acceso otorgado únicamente para crear carpetas de proyecto y gestionar archivos que usted suba directamente a través de Hi Krew. El uso de los datos de Google se limita estrictamente a proveer y mejorar las funciones de almacenamiento dentro de la Plataforma</li>
                                    <li><strong className="text-white/60">Comunicaciones:</strong> enviar notificaciones del servicio, confirmaciones de pago y actualizaciones importantes</li>
                                    <li><strong className="text-white/60">Mejora del producto:</strong> analizar patrones de uso para mejorar funciones y experiencia</li>
                                    <li><strong className="text-white/60">Soporte:</strong> responder solicitudes de asistencia técnica</li>
                                    <li><strong className="text-white/60">Cumplimiento legal:</strong> cumplir con obligaciones legales y reglamentarias aplicables</li>
                                </ul>
                                <p>Los datos obtenidos de las APIs de Google no se utilizan para publicidad, no se transfieren a terceros para su uso independiente y no se emplean con fines que no estén directamente relacionados con la prestación del servicio descrito en esta política.</p>
                            </Section>

                            <Section id="base-legal-del-tratamiento" title="4. Base legal del tratamiento">
                                <p>El tratamiento de sus datos se basa en:</p>
                                <ul>
                                    <li><strong className="text-white/60">Ejecución del contrato:</strong> el tratamiento es necesario para prestar el servicio que usted ha solicitado</li>
                                    <li><strong className="text-white/60">Consentimiento:</strong> para comunicaciones de marketing, el cual puede retirar en cualquier momento</li>
                                    <li><strong className="text-white/60">Interés legítimo:</strong> para mejorar la Plataforma, prevenir fraudes y mantener la seguridad</li>
                                    <li><strong className="text-white/60">Obligación legal:</strong> cuando la ley nos exija conservar o revelar información</li>
                                </ul>
                            </Section>

                            <Section id="comparticion-de-datos" title="5. Compartición de datos con terceros">
                                <p>
                                    No vendemos ni alquilamos sus datos personales a terceros. Podemos compartir información con:
                                </p>
                                <ul>
                                    <li><strong className="text-white/60">Google (OAuth y Drive):</strong> cuando usa Google Sign-In o la integración de Google Drive, Hi Krew interactúa con las APIs de Google bajo sus propias condiciones de servicio y política de privacidad. Consulte la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad de Google</a> para más información</li>
                                    <li><strong className="text-white/60">Integraciones opcionales:</strong> Hi Krew permite conectar pasarelas de pago u otros servicios externos de forma opcional. Cuando el usuario activa una integración, los datos necesarios para su funcionamiento se comparten con ese servicio bajo sus propias políticas de privacidad. Dojo Lab no controla ni es responsable del tratamiento de datos por parte de dichos servicios</li>
                                    <li><strong className="text-white/60">Proveedores de infraestructura:</strong> servicios de hosting y base de datos (bajo acuerdos de confidencialidad)</li>
                                    <li><strong className="text-white/60">Herramientas de analítica:</strong> datos agregados y anonimizados para análisis de uso</li>
                                    <li><strong className="text-white/60">Autoridades competentes:</strong> cuando sea requerido por ley o proceso judicial</li>
                                </ul>
                            </Section>

                            <Section id="servicios-de-google" title="6. Servicios de Google (OAuth y Drive)">
                                <p>
                                    Hi Krew utiliza servicios de Google LLC a través de sus APIs. El uso de estos servicios está sujeto a la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad de Google</a> y a las <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Políticas de Datos de Usuario de los Servicios de API de Google</a>.
                                </p>
                                <p><strong className="text-white/60">Google Sign-In (inicio de sesión con Google):</strong></p>
                                <ul>
                                    <li>Hi Krew utiliza Google OAuth 2.0 como método de autenticación opcional</li>
                                    <li>Solo solicitamos acceso a su nombre, apellido y correo electrónico de Google</li>
                                    <li>Estos datos se usan exclusivamente para crear y gestionar su cuenta en Hi Krew</li>
                                    <li>No solicitamos acceso a sus contactos, calendario, correos ni ningún otro dato de su cuenta de Google</li>
                                    <li>Puede desvincular su cuenta de Google desde Configuración → Seguridad, o revocar el acceso directamente desde su <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">cuenta de Google</a></li>
                                </ul>
                                <p><strong className="text-white/60">Google Drive (integración voluntaria de almacenamiento):</strong></p>
                                <ul>
                                    <li>La integración de Google Drive es completamente opcional y debe ser activada explícitamente por el usuario</li>
                                    <li>Hi Krew solicita únicamente el permiso <code>drive.file</code>, que permite acceder solo a los archivos que Hi Krew crea o con los que el usuario interactúa directamente a través de la Plataforma</li>
                                    <li>No podemos ver, leer, modificar ni eliminar archivos preexistentes en su Google Drive ni ningún archivo que no haya sido creado o subido a través de Hi Krew</li>
                                    <li>Los tokens de acceso se almacenan de forma segura y encriptada, y se usan solo para mantener la conexión activa</li>
                                    <li>Puede desconectar Google Drive en cualquier momento desde Configuración → Integraciones, o revocar el acceso desde su <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">cuenta de Google</a></li>
                                    <li>Al desconectar la integración, eliminamos los tokens almacenados de nuestros servidores de forma inmediata</li>
                                </ul>
                                <p>
                                    El uso que Hi Krew hace de la información recibida de las APIs de Google se adhiere a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política de Datos de Usuario de los Servicios de API de Google</a>, incluyendo los requisitos de Uso Limitado.
                                </p>
                            </Section>

                            <Section id="cookies" title="7. Cookies">
                                <p>
                                    Utilizamos cookies y tecnologías similares para mantener su sesión activa, recordar sus preferencias y analizar el uso de la Plataforma. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del servicio.
                                </p>
                                <p>Tipos de cookies que utilizamos:</p>
                                <ul>
                                    <li><strong className="text-white/60">Esenciales:</strong> necesarias para el funcionamiento básico de la Plataforma</li>
                                    <li><strong className="text-white/60">De sesión:</strong> mantienen su sesión activa mientras navega</li>
                                    <li><strong className="text-white/60">Analíticas:</strong> nos ayudan a entender cómo se usa la Plataforma</li>
                                </ul>
                            </Section>

                            <Section id="retencion-de-datos" title="8. Retención de datos">
                                <p>
                                    Conservamos sus datos personales mientras su cuenta esté activa o sea necesario para prestar el servicio. Si cancela su cuenta, eliminaremos o anonimizaremos sus datos dentro de los 90 días siguientes, salvo que la ley exija su conservación por un período mayor.
                                </p>
                                <p>
                                    Los datos de facturación se conservan por el período exigido por la legislación fiscal aplicable (generalmente 5 años).
                                </p>
                            </Section>

                            <Section id="seguridad" title="9. Seguridad">
                                <p>
                                    Implementamos medidas técnicas y organizativas adecuadas para proteger sus datos frente a acceso no autorizado, pérdida, destrucción o divulgación. Esto incluye encriptación en tránsito (TLS), almacenamiento seguro de contraseñas y controles de acceso internos.
                                </p>
                                <p>
                                    Sin embargo, ningún sistema de seguridad es infalible. En caso de una brecha de seguridad que afecte sus datos, le notificaremos en los plazos que establezca la ley aplicable.
                                </p>
                            </Section>

                            <Section id="sus-derechos" title="10. Sus derechos">
                                <p>Usted tiene derecho a:</p>
                                <ul>
                                    <li><strong className="text-white/60">Acceso:</strong> solicitar una copia de los datos personales que tenemos sobre usted</li>
                                    <li><strong className="text-white/60">Rectificación:</strong> corregir datos inexactos o incompletos</li>
                                    <li><strong className="text-white/60">Eliminación:</strong> solicitar la eliminación de sus datos ("derecho al olvido")</li>
                                    <li><strong className="text-white/60">Portabilidad:</strong> recibir sus datos en un formato estructurado y legible por máquina</li>
                                    <li><strong className="text-white/60">Oposición:</strong> oponerse al tratamiento para determinadas finalidades</li>
                                    <li><strong className="text-white/60">Retirar el consentimiento:</strong> en cualquier momento, para los tratamientos basados en consentimiento</li>
                                </ul>
                                <p>
                                    Para ejercer cualquiera de estos derechos, escríbanos a <a href="mailto:hola@hikrew.com">hola@hikrew.com</a> con el asunto "Derechos de privacidad". Responderemos en un plazo máximo de 30 días.
                                </p>
                            </Section>

                            <Section id="transferencias-internacionales" title="11. Transferencias internacionales">
                                <p>
                                    Sus datos pueden ser procesados en servidores ubicados fuera de su país de residencia. En esos casos, nos aseguramos de que se apliquen garantías adecuadas, como cláusulas contractuales estándar, para proteger su información conforme a los estándares aplicables.
                                </p>
                            </Section>

                            <Section id="menores-de-edad" title="12. Menores de edad">
                                <p>
                                    Hi Krew no está dirigido a personas menores de 18 años. No recopilamos intencionalmente datos de menores. Si tiene conocimiento de que un menor ha proporcionado datos personales a través de la Plataforma, comuníquese con nosotros para eliminar dicha información.
                                </p>
                            </Section>

                            <Section id="cambios-a-esta-politica" title="13. Cambios a esta política">
                                <p>
                                    Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos los cambios relevantes mediante correo electrónico o un aviso en la Plataforma. El uso continuado del servicio tras la notificación constituye su aceptación de los cambios.
                                </p>
                            </Section>

                            <Section id="contacto" title="14. Contacto">
                                <p>
                                    Para cualquier consulta relacionada con esta Política de Privacidad o el tratamiento de sus datos:
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
                        <Link href="/privacidad" className="text-[11px] text-white/60">Política de Privacidad</Link>
                        <Link href="/terminos" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Términos de Uso</Link>
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
