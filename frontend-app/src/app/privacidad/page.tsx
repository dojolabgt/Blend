import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Política de Privacidad — Hi Krew",
    description: "Política de privacidad y tratamiento de datos de la plataforma Hi Krew.",
};

const LAST_UPDATED = "16 de marzo de 2026";

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">

            {/* Header */}
            <header className="border-b border-white/[0.06]">
                <div className="container mx-auto px-5 md:px-8 max-w-4xl h-14 flex items-center justify-between">
                    <Link href="/login" className="inline-flex items-center gap-2.5 hover:opacity-70 transition-opacity">
                        <Image src="/HiKrewLogo.png" alt="Hi Krew" width={24} height={24} className="object-contain opacity-80" />
                        <span className="font-bold text-[15px] text-white/80 tracking-tight">Hi Krew</span>
                    </Link>
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Volver
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-5 md:px-8 max-w-3xl py-16 md:py-24">

                <div className="mb-12">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase mb-3">Legal</p>
                    <h1 className="text-4xl md:text-[44px] font-black tracking-tight text-white leading-[1.07] mb-4">
                        Política de Privacidad
                    </h1>
                    <p className="text-[13px] text-white/30">Última actualización: {LAST_UPDATED}</p>
                </div>

                <div className="space-y-10 text-white/60 leading-relaxed">

                    <Section title="1. Responsable del tratamiento">
                        <p>
                            Dojo Lab, operador de Hi Krew, es el responsable del tratamiento de sus datos personales recopilados a través de la Plataforma. Si tiene alguna consulta relacionada con el tratamiento de sus datos, puede contactarnos en <a href="mailto:hola@hikrew.com">hola@hikrew.com</a>.
                        </p>
                    </Section>

                    <Section title="2. Datos que recopilamos">
                        <p>Recopilamos distintos tipos de información según cómo interactúe con la Plataforma:</p>
                        <p><strong className="text-white/60">Datos de registro y perfil:</strong></p>
                        <ul>
                            <li>Nombre y apellido</li>
                            <li>Correo electrónico</li>
                            <li>Nombre de la empresa o estudio (opcional)</li>
                            <li>Contraseña (almacenada de forma encriptada)</li>
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

                    <Section title="3. Finalidad del tratamiento">
                        <p>Utilizamos sus datos para los siguientes propósitos:</p>
                        <ul>
                            <li><strong className="text-white/60">Prestación del servicio:</strong> crear y gestionar su cuenta, procesar pagos y habilitar todas las funciones de la Plataforma</li>
                            <li><strong className="text-white/60">Comunicaciones:</strong> enviar notificaciones del servicio, confirmaciones de pago y actualizaciones importantes</li>
                            <li><strong className="text-white/60">Mejora del producto:</strong> analizar patrones de uso para mejorar funciones y experiencia</li>
                            <li><strong className="text-white/60">Soporte:</strong> responder solicitudes de asistencia técnica</li>
                            <li><strong className="text-white/60">Cumplimiento legal:</strong> cumplir con obligaciones legales y reglamentarias aplicables</li>
                        </ul>
                    </Section>

                    <Section title="4. Base legal del tratamiento">
                        <p>El tratamiento de sus datos se basa en:</p>
                        <ul>
                            <li><strong className="text-white/60">Ejecución del contrato:</strong> el tratamiento es necesario para prestar el servicio que usted ha solicitado</li>
                            <li><strong className="text-white/60">Consentimiento:</strong> para comunicaciones de marketing, el cual puede retirar en cualquier momento</li>
                            <li><strong className="text-white/60">Interés legítimo:</strong> para mejorar la Plataforma, prevenir fraudes y mantener la seguridad</li>
                            <li><strong className="text-white/60">Obligación legal:</strong> cuando la ley nos exija conservar o revelar información</li>
                        </ul>
                    </Section>

                    <Section title="5. Compartición de datos con terceros">
                        <p>
                            No vendemos ni alquilamos sus datos personales a terceros. Podemos compartir información con:
                        </p>
                        <ul>
                            <li><strong className="text-white/60">Integraciones opcionales:</strong> Hi Krew permite conectar pasarelas de pago u otros servicios externos de forma opcional. Cuando el usuario activa una integración, los datos necesarios para su funcionamiento se comparten con ese servicio bajo sus propias políticas de privacidad. Dojo Lab no controla ni es responsable del tratamiento de datos por parte de dichos servicios</li>
                            <li><strong className="text-white/60">Proveedores de infraestructura:</strong> servicios de hosting y base de datos (bajo acuerdos de confidencialidad)</li>
                            <li><strong className="text-white/60">Herramientas de analítica:</strong> datos agregados y anonimizados para análisis de uso</li>
                            <li><strong className="text-white/60">Autoridades competentes:</strong> cuando sea requerido por ley o proceso judicial</li>
                        </ul>
                    </Section>

                    <Section title="6. Cookies">
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

                    <Section title="7. Retención de datos">
                        <p>
                            Conservamos sus datos personales mientras su cuenta esté activa o sea necesario para prestar el servicio. Si cancela su cuenta, eliminaremos o anonimizaremos sus datos dentro de los 90 días siguientes, salvo que la ley exija su conservación por un período mayor.
                        </p>
                        <p>
                            Los datos de facturación se conservan por el período exigido por la legislación fiscal aplicable (generalmente 5 años).
                        </p>
                    </Section>

                    <Section title="8. Seguridad">
                        <p>
                            Implementamos medidas técnicas y organizativas adecuadas para proteger sus datos frente a acceso no autorizado, pérdida, destrucción o divulgación. Esto incluye encriptación en tránsito (TLS), almacenamiento seguro de contraseñas y controles de acceso internos.
                        </p>
                        <p>
                            Sin embargo, ningún sistema de seguridad es infalible. En caso de una brecha de seguridad que afecte sus datos, le notificaremos en los plazos que establezca la ley aplicable.
                        </p>
                    </Section>

                    <Section title="9. Sus derechos">
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

                    <Section title="10. Transferencias internacionales">
                        <p>
                            Sus datos pueden ser procesados en servidores ubicados fuera de su país de residencia. En esos casos, nos aseguramos de que se apliquen garantías adecuadas, como cláusulas contractuales estándar, para proteger su información conforme a los estándares aplicables.
                        </p>
                    </Section>

                    <Section title="11. Menores de edad">
                        <p>
                            Hi Krew no está dirigido a personas menores de 18 años. No recopilamos intencionalmente datos de menores. Si tiene conocimiento de que un menor ha proporcionado datos personales a través de la Plataforma, comuníquese con nosotros para eliminar dicha información.
                        </p>
                    </Section>

                    <Section title="12. Cambios a esta política">
                        <p>
                            Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos los cambios relevantes mediante correo electrónico o un aviso en la Plataforma. El uso continuado del servicio tras la notificación constituye su aceptación de los cambios.
                        </p>
                    </Section>

                    <Section title="13. Contacto">
                        <p>
                            Para cualquier consulta relacionada con esta Política de Privacidad o el tratamiento de sus datos:
                        </p>
                        <p>
                            <strong className="text-white/70">Hi Krew / Dojo Lab</strong><br />
                            Correo: <a href="mailto:hola@hikrew.com">hola@hikrew.com</a>
                        </p>
                    </Section>

                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] mt-8">
                <div className="container mx-auto px-5 md:px-8 max-w-4xl py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h2 className="text-[17px] font-bold text-white/80 tracking-tight">{title}</h2>
            <div className="space-y-3 text-[14px] text-white/50 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-white/60 [&_a:hover]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors">
                {children}
            </div>
        </div>
    );
}
