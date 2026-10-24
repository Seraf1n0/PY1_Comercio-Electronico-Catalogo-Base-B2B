import { Link } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/outline";

const sectionClass = "scroll-mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200";
const subsectionClass = "mt-6 text-lg font-semibold text-slate-800";
const listClass = "mt-2 list-disc space-y-2 pl-6 text-slate-600";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          aria-label="Volver a la página principal"
          className="inline-flex items-center gap-2 text-blue-800 hover:underline"
        >
          <HomeIcon aria-hidden="true" className="h-5 w-5" />
          <span>Volver</span>
        </Link>

        <header className="py-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Información comercial de Bombocars
          </h1>
          <p className="mt-3 text-slate-600">
            Consulta nuestras condiciones de compra, políticas y respuestas a
            preguntas frecuentes.
          </p>
        </header>

        <nav
          aria-label="Secciones de información comercial"
          className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <h2 className="font-semibold">En esta página</h2>
          <ul className="mt-3 grid gap-2 text-blue-800 sm:grid-cols-2">
            <li><Link className="hover:underline" to="/terminos-y-condiciones#terminos">Términos y condiciones</Link></li>
            <li><Link className="hover:underline" to="/terminos-y-condiciones#devoluciones">Devoluciones y garantía</Link></li>
            <li><Link className="hover:underline" to="/terminos-y-condiciones#envios">Política de envíos</Link></li>
            <li><Link className="hover:underline" to="/terminos-y-condiciones#privacidad">Política de privacidad</Link></li>
            <li><Link className="hover:underline" to="/terminos-y-condiciones#faq">Preguntas frecuentes</Link></li>
          </ul>
        </nav>

        <div className="space-y-6">
          <section id="terminos" className={sectionClass}>
            <h2 className="text-2xl font-bold">Términos y Condiciones</h2>

            <h3 className={subsectionClass}>Condiciones de uso del sitio</h3>
            <p className="mt-2 text-slate-600">
              Al utilizar el sitio web de Bombocars, el usuario acepta hacer un
              uso adecuado de los servicios, herramientas y contenidos ofrecidos.
              Queda prohibida cualquier actividad que comprometa la seguridad,
              disponibilidad o correcto funcionamiento de la plataforma.
            </p>
            <p className="mt-2 text-slate-600">
              Asimismo, el usuario se compromete a proporcionar información
              veraz, actualizada y completa al momento de registrarse o realizar
              una compra. Bombocars se reserva el derecho de suspender temporal
              o permanentemente el acceso a usuarios que incumplan estas
              condiciones.
            </p>

            <h3 className={subsectionClass}>Condiciones generales de compra</h3>
            <ul className={listClass}>
              <li>Las órdenes de compra se procesarán únicamente después de que el sistema valide correctamente el pago.</li>
              <li>Los pagos únicamente podrán realizarse mediante tarjetas de crédito o débito Visa, Mastercard y American Express.</li>
              <li>El tiempo estimado de entrega es de 3 a 7 días hábiles, dependiendo de la ubicación del cliente.</li>
              <li>Los reembolsos o gestiones relacionadas con pagos deberán ser aprobados por el gerente de la sucursal correspondiente.</li>
              <li>Bombocars se reserva el derecho de cancelar una compra si existe un problema con la validación del pago o falta de inventario.</li>
            </ul>

            <h3 className={subsectionClass}>Responsabilidades del cliente</h3>
            <ul className={listClass}>
              <li>Respetar los términos y condiciones establecidos por Bombocars.</li>
              <li>No utilizar errores, fallos técnicos o vulnerabilidades del sistema para obtener beneficios indebidos.</li>
              <li>No transmitir, almacenar o distribuir contenido ilegal, ofensivo o no autorizado mediante el sitio web.</li>
              <li>No reproducir, copiar o distribuir el contenido, las imágenes o el material publicado en el sitio sin autorización previa de Bombocars.</li>
              <li>Proporcionar información verídica durante el proceso de compra.</li>
            </ul>

            <h3 className={subsectionClass}>Responsabilidades de la tienda</h3>
            <p className="mt-2 text-slate-600">
              Bombocars se compromete a brindar información precisa sobre los
              vehículos publicados en el sitio web y a gestionar adecuadamente
              las compras realizadas por los clientes. La empresa realizará
              esfuerzos razonables para mantener la disponibilidad y seguridad
              de la plataforma; sin embargo, no garantiza que el sitio esté
              libre de interrupciones ocasionadas por causas externas o de
              fuerza mayor.
            </p>
            <p className="mt-2 text-slate-600">
              Salvo disposición legal expresa, Bombocars no será responsable por
              daños indirectos ocasionados por el uso del sitio web por parte
              del usuario o de terceros.
            </p>
            <ul className={listClass}>
              <li>Gerente de Limón: 506 8865-0321</li>
              <li>Gerente de Guanacaste: 506 7864-3248</li>
              <li>Gerente de San José: 506 8743-6975</li>
            </ul>
          </section>

          <section id="devoluciones" className={sectionClass}>
            <h2 className="text-2xl font-bold">Política de Devoluciones y Garantía</h2>
            <h3 className={subsectionClass}>Plazo y cobertura de la garantía</h3>
            <p className="mt-2 text-slate-600">
              Debido a la naturaleza del producto, Bombocars no ofrece
              devoluciones por cambios de opinión o preferencias personales.
              Todos los vehículos cuentan con una garantía de un año a partir de
              la fecha de entrega para cubrir defectos de fabricación y
              desperfectos mecánicos sujetos a las condiciones establecidas por
              la empresa.
            </p>

            <h3 className={subsectionClass}>Condiciones para aprobar una garantía</h3>
            <ul className={listClass}>
              <li>El vehículo debe haber recibido los mantenimientos periódicos indicados por Bombocars.</li>
              <li>Las revisiones deben realizarse cada 5 000 km o 10 000 km, según el modelo adquirido.</li>
              <li>El vehículo debe utilizarse de acuerdo con las recomendaciones del fabricante.</li>
              <li>No deben existir modificaciones mecánicas realizadas por terceros sin autorización.</li>
            </ul>

            <h3 className={subsectionClass}>Casos no cubiertos</h3>
            <ul className={listClass}>
              <li>Daños ocasionados por accidentes de tránsito, mal uso o negligencia del propietario.</li>
              <li>Modificaciones mecánicas no autorizadas o incumplimiento de los mantenimientos obligatorios.</li>
              <li>Daños ocasionados por desastres naturales o actos vandálicos.</li>
              <li>Desgaste normal de llantas, frenos, batería y otros componentes consumibles.</li>
              <li>Inconformidad con aspectos estéticos, como el color, los accesorios o el diseño del vehículo.</li>
            </ul>

            <h3 className={subsectionClass}>Procedimiento para gestionar una solicitud</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-6 text-slate-600">
              <li>Comunícate con la sucursal donde adquiriste el vehículo.</li>
              <li>Solicita el formulario de reporte por correo electrónico o de manera presencial.</li>
              <li>Un gerente autorizado revisará la solicitud y, si corresponde, coordinará una inspección del vehículo.</li>
              <li>Al finalizar la revisión, se te notificará si la garantía aplica.</li>
            </ol>
            <h3 className={subsectionClass}>Teléfonos de las sucursales</h3>
            <ul className={listClass}>
              <li>Limón: 2345-5357</li>
              <li>Guanacaste: 2354-7537</li>
              <li>San José: 2104-3276</li>
            </ul>
          </section>

          <section id="envios" className={sectionClass}>
            <h2 className="text-2xl font-bold">Política de Envíos</h2>
            <h3 className={subsectionClass}>Cobertura de entrega</h3>
            <p className="mt-2 text-slate-600">
              Bombocars ofrece cobertura de entrega en todo el territorio
              nacional de Costa Rica. El cliente deberá proporcionar una
              dirección precisa para garantizar una entrega exitosa.
            </p>

            <h3 className={subsectionClass}>Tiempos estimados de envío</h3>
            <p className="mt-2 text-slate-600">
              El tiempo estimado de entrega es de 3 a 5 días hábiles y puede
              extenderse hasta un máximo de 7 días hábiles. Si ocurre un retraso
              atribuible a Bombocars que supere ese plazo, la empresa podrá
              otorgar una compensación económica al cliente.
            </p>

            <h3 className={subsectionClass}>Costos de envío</h3>
            <p className="mt-2 text-slate-600">
              El costo simulado de envío es de ₡161 666 por vehículo. Para
              compras de varios vehículos, el costo total se calcula según la
              cantidad solicitada y la fórmula de envío utilizada en el
              checkout.
            </p>

            <h3 className={subsectionClass}>Restricciones y condiciones especiales</h3>
            <p className="mt-2 text-slate-600">
              Algunas zonas de difícil acceso pueden requerir que un agente de
              Bombocars conduzca el vehículo hasta el destino final. Los tiempos
              de entrega pueden verse afectados por fenómenos naturales,
              cierres de carreteras, huelgas, inundaciones u otras situaciones
              de fuerza mayor. En esos casos, la entrega se reanudará cuando las
              condiciones permitan realizarla de forma segura.
            </p>
          </section>

          <section id="privacidad" className={sectionClass}>
            <h2 className="text-2xl font-bold">Política de Privacidad</h2>
            <h3 className={subsectionClass}>Información que recopilamos</h3>
            <ul className={listClass}>
              <li>Nombre completo</li>
              <li>Dirección de entrega, correo electrónico y número telefónico.</li>
              <li>Información relacionada con las compras realizadas.</li>
            </ul>

            <h3 className={subsectionClass}>Uso de la información</h3>
            <p className="mt-2 text-slate-600">La información recopilada se utilizará para:</p>
            <ul className={listClass}>
              <li>Procesar pagos y pedidos.</li>
              <li>Coordinar entregas y brindar soporte al cliente.</li>
              <li>Gestionar garantías y reclamos.</li>
              <li>Cumplir obligaciones legales y administrativas.</li>
            </ul>
            <p className="mt-2 text-slate-600">
              Bombocars no venderá ni compartirá información personal con
              terceros no autorizados.
            </p>

            <h3 className={subsectionClass}>Medidas básicas de protección</h3>
            <ul className={listClass}>
              <li>Acceso restringido a la información personal.</li>
              <li>Uso de contraseñas seguras.</li>
              <li>Protección de bases de datos contra accesos no autorizados.</li>
              <li>Actualización periódica de los sistemas utilizados por la empresa.</li>
            </ul>
            <p className="mt-2 text-slate-600">
              Es importante aclarar que Bombocars sigue la ley de protección de datos de Costa Rica.
                Ley 8968, Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales, y su reglamento. 
            </p>
          </section>

          <section id="faq" className={sectionClass}>
            <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
            <div className="mt-4 divide-y divide-slate-200">
              <details className="py-4">
                <summary className="cursor-pointer font-semibold">¿Puedo pagar mediante transferencia bancaria, PayPal o criptomonedas?</summary>
                <p className="mt-2 text-slate-600">No. Actualmente solo se aceptan tarjetas Visa, Mastercard y American Express.</p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer font-semibold">¿Realizan envíos fuera de Costa Rica?</summary>
                <p className="mt-2 text-slate-600">No. Bombocars únicamente realiza entregas dentro del territorio nacional.</p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer font-semibold">¿Puedo devolver el vehículo si no me gusta el color o algún accesorio?</summary>
                <p className="mt-2 text-slate-600">No. Las devoluciones no aplican por preferencias estéticas o cambios de opinión.</p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer font-semibold">¿Cómo puedo solicitar una garantía?</summary>
                <p className="mt-2 text-slate-600">Comunícate con la sucursal donde realizaste la compra y completa el procedimiento de revisión establecido.</p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer font-semibold">¿Puedo comprar más de un vehículo?</summary>
                <p className="mt-2 text-slate-600">Sí, siempre que haya disponibilidad en el inventario. El costo de envío se calcula según la cantidad de vehículos.</p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer font-semibold">¿Cómo puedo contactar al servicio al cliente?</summary>
                <ul className="mt-2 list-disc pl-6 text-slate-600">
                  <li>Limón: 2345-5357</li>
                  <li>Guanacaste: 2354-7537</li>
                  <li>San José: 2104-3276</li>
                </ul>
              </details>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}