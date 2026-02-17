import { Metadata } from 'next'
import s from './propuesta.module.css'

export const metadata: Metadata = {
  title: 'Propuesta de Gestión Integral — 48 Apartamentos Santa Pola',
  description: 'Propuesta comercial para la gestión integral de 48 apartamentos turísticos en Santa Pola, Alicante.',
  robots: 'noindex, nofollow',
}

export default function PropuestaSantaPola() {
  return (
    <div className={s.page}>

      {/* ==================== COVER ==================== */}
      <div className={s.cover}>
        <div className={s.coverContent}>
          <div className={s.coverBadge}>Propuesta Comercial — Confidencial</div>
          <h1 className={s.coverTitle}>
            Gestión Integral de<br />48 Apartamentos<br />Turísticos
          </h1>
          <h2 className={s.coverSubtitle}>Santa Pola, Alicante</h2>

          <div className={s.coverMeta}>
            <div className={s.coverMetaItem}>
              <div className={s.coverMetaLabel}>Fecha</div>
              <div className={s.coverMetaValue}>Febrero 2026</div>
            </div>
            <div className={s.coverMetaItem}>
              <div className={s.coverMetaLabel}>Preparado por</div>
              <div className={s.coverMetaValue}>Alejandro Santalla</div>
            </div>
            <div className={s.coverMetaItem}>
              <div className={s.coverMetaLabel}>Contacto</div>
              <div className={s.coverMetaValue}>652 656 440</div>
            </div>
            <div className={s.coverMetaItem}>
              <div className={s.coverMetaLabel}>Email</div>
              <div className={s.coverMetaValue}>alejandrosatlla@gmail.com</div>
            </div>
          </div>
        </div>
        <div className={s.coverFooter}>
          <span>Datos de mercado: PriceLabs Market Dashboard · Febrero 2026</span>
          <span>Documento confidencial</span>
        </div>
      </div>

      {/* ==================== SECTION 1: RESUMEN EJECUTIVO ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>01</div>
        <div className={s.sectionTitle}>Resumen Ejecutivo</div>
        <div className={s.sectionSubtitle}>Indicadores clave del mercado de alquiler vacacional en Santa Pola</div>
        <div className={s.divider} />

        {/* LICENSE GATE — Condición previa */}
        <div className={s.criticalBox} style={{ marginBottom: 32 }}>
          <div className={s.criticalBoxTitle}>Condición previa obligatoria — Licencias turísticas</div>
          <p>
            Los 48 apartamentos deben disponer de <strong>licencia turística vigente</strong> inscrita
            en el Registro de Turismo de la Comunitat Valenciana. Sin licencia, no es posible comercializar
            legalmente en ninguna plataforma. Verificar el estado de las licencias es el <strong>paso 1</strong> antes
            de cualquier actividad operativa.
          </p>
        </div>

        <div className={s.kpiGrid}>
          <div className={s.kpiCardHighlight}>
            <div className={s.kpiLabel}>Ingresos medios / apt / año</div>
            <div className={s.kpiValue}>14.917€</div>
            <div className={s.kpiChange}>Dato real PriceLabs 2025</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>ADR (Tarifa Media Noche)</div>
            <div className={s.kpiValue}>83€</div>
            <div className={s.kpiChange}>↑ +1€ vs año anterior</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Ocupación Media</div>
            <div className={s.kpiValue}>66%</div>
            <div className={s.kpiChange}>↑ +3 pts vs año anterior</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>RevPAR</div>
            <div className={s.kpiValue}>55€</div>
            <div className={s.kpiChange}>↑ +4€ vs año anterior</div>
          </div>
        </div>

        <div className={s.kpiGrid}>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Listados activos</div>
            <div className={s.kpiValue}>1.333</div>
            <div className={s.kpiChange}>↑ +89 vs año anterior</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Reservas totales</div>
            <div className={s.kpiValue}>32.378</div>
            <div className={s.kpiChange}>↑ +5.417 vs año anterior</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Estancia media</div>
            <div className={s.kpiValue}>3 noches</div>
            <div className={s.kpiChange}>Estable</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Ventana de reserva</div>
            <div className={s.kpiValue}>17 días</div>
            <div className={s.kpiChange}>↑ +3 días vs año anterior</div>
          </div>
        </div>

        <div className={s.infoBox}>
          <div className={s.infoBoxTitle}>Tendencia positiva</div>
          <p>
            Todos los indicadores clave muestran crecimiento interanual. La ocupación ha subido 3 puntos
            porcentuales, las reservas han crecido un 20%, y los ingresos por apartamento han aumentado
            en 298€/año. El mercado de Santa Pola está en fase de crecimiento sostenido.
          </p>
        </div>

        <p className={s.textXs} style={{ marginTop: 20 }}>
          Fuente: PriceLabs Market Dashboard — Santa Pola, Mercado Completo ABB. Fecha: 17 febrero 2026.
        </p>
      </div>

      {/* ==================== SECTION 2: ANÁLISIS DE MERCADO ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>02</div>
        <div className={s.sectionTitle}>Análisis del Mercado</div>
        <div className={s.sectionSubtitle}>Estacionalidad, precios y ocupación — Datos reales de PriceLabs 2024-2026</div>
        <div className={s.divider} />

        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Distribución estacional de ingresos por apartamento</h3>

        <div className={s.chartContainer}>
          {[
            { month: 'Ene', value: 768, pct: 25 },
            { month: 'Feb', value: 678, pct: 22 },
            { month: 'Mar', value: 823, pct: 27 },
            { month: 'Abr', value: 1100, pct: 35 },
            { month: 'May', value: 1200, pct: 39 },
            { month: 'Jun', value: 1600, pct: 52 },
            { month: 'Jul', value: 2500, pct: 81 },
            { month: 'Ago', value: 3100, pct: 100 },
            { month: 'Sep', value: 1600, pct: 52 },
            { month: 'Oct', value: 1300, pct: 42 },
            { month: 'Nov', value: 916, pct: 30 },
            { month: 'Dic', value: 905, pct: 29 },
          ].map((d) => (
            <div key={d.month} className={s.chartBarGroup}>
              <div className={s.chartBar} style={{ height: `${d.pct}%` }}>
                <span className={s.chartBarLabel}>
                  {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : `${d.value}€`}
                </span>
              </div>
              <div className={s.chartMonthLabel}>{d.month}</div>
            </div>
          ))}
        </div>
        <p className={`${s.textXs} ${s.mb4}`}>
          Distribución mensual estimada 2025. Ingreso anualizado PriceLabs: 14.917€. Fuente: PriceLabs.
        </p>

        <div style={{ height: 20 }} />

        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Ocupación y ADR mensual (2025)</h3>

        <table className={s.table}>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ocupación</th>
              <th></th>
              <th>ADR (€/noche)</th>
              <th>RevPAR</th>
              <th>Ingreso/apt</th>
            </tr>
          </thead>
          <tbody>
            {[
              { mes: 'Enero', occ: 47, adr: 61, revpar: 29, ing: '768€' },
              { mes: 'Febrero', occ: 49, adr: 59, revpar: 29, ing: '678€' },
              { mes: 'Marzo', occ: 53, adr: 57, revpar: 31, ing: '823€' },
              { mes: 'Abril', occ: 65, adr: 68, revpar: 44, ing: '1.100€' },
              { mes: 'Mayo', occ: 61, adr: 72, revpar: 44, ing: '1.200€' },
              { mes: 'Junio', occ: 74, adr: 84, revpar: 63, ing: '1.600€' },
            ].map((r) => (
              <tr key={r.mes}>
                <td>{r.mes}</td>
                <td className={s.tdMoney}>{r.occ}%</td>
                <td>
                  <div className={s.occBarBg}>
                    <div className={s.occBarFill} style={{ width: `${r.occ}%` }} />
                  </div>
                </td>
                <td className={s.tdMoney}>{r.adr}€</td>
                <td className={s.tdMoney}>{r.revpar}€</td>
                <td className={s.tdMoney}>{r.ing}</td>
              </tr>
            ))}
            {/* Jul & Aug highlighted */}
            {[
              { mes: 'Julio', occ: 86, adr: 105, revpar: 90, ing: '2.500€' },
              { mes: 'Agosto', occ: 93, adr: 116, revpar: 107, ing: '3.100€' },
            ].map((r) => (
              <tr key={r.mes} className={s.rowHighlight}>
                <td><strong>{r.mes}</strong></td>
                <td className={s.tdMoney}><strong>{r.occ}%</strong></td>
                <td>
                  <div className={s.occBarBg}>
                    <div className={s.occBarFill} style={{ width: `${r.occ}%` }} />
                  </div>
                </td>
                <td className={s.tdMoney}><strong>{r.adr}€</strong></td>
                <td className={s.tdMoney}><strong>{r.revpar}€</strong></td>
                <td className={s.tdMoney}><strong>{r.ing}</strong></td>
              </tr>
            ))}
            {[
              { mes: 'Septiembre', occ: 75, adr: 82, revpar: 62, ing: '1.600€' },
              { mes: 'Octubre', occ: 68, adr: 71, revpar: 48, ing: '1.300€' },
              { mes: 'Noviembre', occ: 52, adr: 59, revpar: 31, ing: '916€' },
              { mes: 'Diciembre', occ: 51, adr: 68, revpar: 35, ing: '905€' },
            ].map((r) => (
              <tr key={r.mes}>
                <td>{r.mes}</td>
                <td className={s.tdMoney}>{r.occ}%</td>
                <td>
                  <div className={s.occBarBg}>
                    <div className={s.occBarFill} style={{ width: `${r.occ}%` }} />
                  </div>
                </td>
                <td className={s.tdMoney}>{r.adr}€</td>
                <td className={s.tdMoney}>{r.revpar}€</td>
                <td className={s.tdMoney}>{r.ing}</td>
              </tr>
            ))}
            <tr className={s.rowTotal}>
              <td>MEDIA ANUAL</td>
              <td className={s.tdMoney}>66%</td>
              <td></td>
              <td className={s.tdMoney}>83€</td>
              <td className={s.tdMoney}>55€</td>
              <td className={s.tdHighlight}>14.917€</td>
            </tr>
          </tbody>
        </table>

        <p className={s.textXs}>
          Cifra anualizada (14.917€) reportada por PriceLabs. La distribución mensual refleja
          la estacionalidad estimada del mercado para 2025.
        </p>
      </div>

      {/* ==================== SECTION 3: PRECIOS POR TIPOLOGÍA ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>03</div>
        <div className={s.sectionTitle}>Precios por Tipología</div>
        <div className={s.sectionSubtitle}>Desglose de tarifas y distribución del mercado por número de dormitorios</div>
        <div className={s.divider} />

        <table className={s.table}>
          <thead>
            <tr>
              <th>Tipología</th>
              <th>Listados</th>
              <th>% mercado</th>
              <th>Precio listado</th>
              <th>Precio/noche real</th>
              <th>Precio/semana</th>
              <th>Precio/mes</th>
              <th>Estancia media</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Estudio</strong></td>
              <td>9</td><td>0,9%</td>
              <td className={s.tdMoney}>85€</td>
              <td className={s.tdMoney}>70€</td>
              <td className={s.tdMoney}>66€</td>
              <td className={s.tdMoney}>44€</td>
              <td>2 noches</td>
            </tr>
            <tr>
              <td><strong>1 Dormitorio</strong></td>
              <td>154</td><td>15,5%</td>
              <td className={s.tdMoney}>79€</td>
              <td className={s.tdMoney}>63€</td>
              <td className={s.tdMoney}>59€</td>
              <td className={s.tdMoney}>44€</td>
              <td>4 noches</td>
            </tr>
            <tr>
              <td><strong>2 Dormitorios</strong></td>
              <td>444</td><td>44,6%</td>
              <td className={s.tdMoney}>91€</td>
              <td className={s.tdMoney}>75€</td>
              <td className={s.tdMoney}>73€</td>
              <td className={s.tdMoney}>52€</td>
              <td>3 noches</td>
            </tr>
            <tr>
              <td><strong>3 Dormitorios</strong></td>
              <td>309</td><td>31,0%</td>
              <td className={s.tdMoney}>110€</td>
              <td className={s.tdMoney}>86€</td>
              <td className={s.tdMoney}>87€</td>
              <td className={s.tdMoney}>62€</td>
              <td>3 noches</td>
            </tr>
            <tr>
              <td><strong>4 Dormitorios</strong></td>
              <td>46</td><td>4,6%</td>
              <td className={s.tdMoney}>140€</td>
              <td className={s.tdMoney}>119€</td>
              <td className={s.tdMoney}>118€</td>
              <td className={s.tdMoney}>50€</td>
              <td>3 noches</td>
            </tr>
            <tr className={s.rowTotal}>
              <td>TOTAL MERCADO</td>
              <td>996</td><td>100%</td>
              <td className={s.tdMoney}>97€</td>
              <td className={s.tdMoney}>77€</td>
              <td className={s.tdMoney}>76€</td>
              <td className={s.tdMoney}>54€</td>
              <td>3 noches</td>
            </tr>
          </tbody>
        </table>

        <div className={s.infoBox}>
          <div className={s.infoBoxTitle}>Distribución del mercado</div>
          <p>
            El 76% del mercado se concentra en apartamentos de 2 y 3 dormitorios (444 + 309 = 753 listings).
            Los apartamentos de 2 dormitorios dominan con el 44,6% del mercado, seguidos por 3 dormitorios (31%).
            Los precios por noche oscilan entre 63€ (1 dormitorio) y 119€ (4 dormitorios).
          </p>
        </div>

        <h3 style={{ fontSize: 18, marginBottom: 20, marginTop: 30 }}>
          Estimación de ingresos anuales por tipología
        </h3>

        <table className={s.table}>
          <thead>
            <tr>
              <th>Tipología</th>
              <th>ADR medio</th>
              <th>Ocupación</th>
              <th>Noches/año</th>
              <th>Ingreso bruto/año</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Estudio</strong></td>
              <td className={s.tdMoney}>70€</td>
              <td>66%</td><td>241</td>
              <td className={s.tdHighlight}>16.870€</td>
            </tr>
            <tr>
              <td><strong>1 Dormitorio</strong></td>
              <td className={s.tdMoney}>63€</td>
              <td>66%</td><td>241</td>
              <td className={s.tdHighlight}>15.183€</td>
            </tr>
            <tr>
              <td><strong>2 Dormitorios</strong></td>
              <td className={s.tdMoney}>75€</td>
              <td>66%</td><td>241</td>
              <td className={s.tdHighlight}>18.075€</td>
            </tr>
            <tr>
              <td><strong>3 Dormitorios</strong></td>
              <td className={s.tdMoney}>86€</td>
              <td>66%</td><td>241</td>
              <td className={s.tdHighlight}>20.726€</td>
            </tr>
            <tr>
              <td><strong>4 Dormitorios</strong></td>
              <td className={s.tdMoney}>119€</td>
              <td>66%</td><td>241</td>
              <td className={s.tdHighlight}>28.679€</td>
            </tr>
          </tbody>
        </table>

        <p className={s.textSm}>
          Ocupación aplicada: 66% (dato agregado de mercado PriceLabs). La ocupación real variará por
          apartamento según tipología, ubicación y calidad del anuncio. Las estimaciones por tipología
          son orientativas; la cifra de referencia para proyecciones es la media de mercado: 14.917€/año.
        </p>
      </div>

      {/* ==================== SECTION 4: SERVICIOS Y TARIFAS ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>04</div>
        <div className={s.sectionTitle}>Servicios y Tarifas</div>
        <div className={s.sectionSubtitle}>Estructura de costes para la gestión integral de los 48 apartamentos</div>
        <div className={s.divider} />

        <div className={s.serviceGrid}>
          <div className={s.serviceCardPrimary}>
            <div className={`${s.serviceIcon} ${s.serviceIconPrimary}`}>📊</div>
            <div className={s.serviceName}>Gestión Integral</div>
            <div className={s.servicePrice}>20% sobre facturación</div>
            <ul className={s.serviceList}>
              <li>Publicación y optimización en Airbnb, Booking.com, Vrbo y otros canales</li>
              <li>Pricing dinámico y optimización de tarifas</li>
              <li>Gestión de reservas y calendario</li>
              <li>Atención al huésped 9–22h, emergencias 24h</li>
              <li>Check-in y check-out</li>
              <li>Fotografía profesional de cada apartamento</li>
              <li>Gestión de reseñas</li>
              <li>Informes mensuales de rendimiento</li>
              <li>Gestión de incidencias con huéspedes</li>
              <li>Coordinación con plataformas para fianzas por daños</li>
            </ul>
          </div>

          <div className={s.serviceCard}>
            <div className={`${s.serviceIcon} ${s.serviceIconDefault}`}>🧹</div>
            <div className={s.serviceName}>Limpieza</div>
            <div className={s.servicePrice}>Tarifa por servicio (según tipología)</div>
            <ul className={s.serviceList}>
              <li>Limpieza profesional entre cada estancia</li>
              <li>Lavado y reposición de sábanas y toallas</li>
              <li>Reposición de amenities</li>
              <li>Inspección de calidad post-limpieza</li>
              <li>Equipo profesional dedicado</li>
              <li>Disponibilidad 7 días/semana</li>
              <li>Protocolo estandarizado</li>
            </ul>
            <div className={s.warningBox} style={{ borderLeftWidth: 3, padding: '12px 16px', marginTop: 16 }}>
              <p style={{ fontSize: 12 }}>
                Tarifa a definir tras valoración individual de cada apartamento (metros, baños, camas).
              </p>
            </div>
          </div>

          <div className={s.serviceCard}>
            <div className={`${s.serviceIcon} ${s.serviceIconDefault}`}>🔧</div>
            <div className={s.serviceName}>Mantenimiento</div>
            <div className={s.servicePrice}>150€ + IVA / apartamento / mes</div>
            <ul className={s.serviceList}>
              <li>Ropa de cama completa (sábanas, fundas, edredones nórdicos)</li>
              <li>Toallas (baño, manos, alfombrilla)</li>
              <li>Revisión y reparación de juntas</li>
              <li>Revisión de grifos y sifones</li>
              <li>Mantenimiento de cerraduras</li>
              <li>Revisión de aires acondicionados</li>
              <li>Pintura anual</li>
              <li>Reparaciones menores</li>
            </ul>
          </div>
        </div>

        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Exclusiones y responsabilidades</h3>

        <table className={s.table}>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Responsable</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Colchones</td>
              <td>Facturación aparte</td>
              <td>Reposición cuando sea necesario, previa aprobación</td>
            </tr>
            <tr>
              <td>Electrodomésticos</td>
              <td>Facturación aparte</td>
              <td>Sustitución de lavadora, nevera, microondas, etc.</td>
            </tr>
            <tr>
              <td>Equipos de climatización</td>
              <td>Facturación aparte</td>
              <td>Sustitución de splits o reparaciones mayores</td>
            </tr>
            <tr>
              <td>Roturas estructurales</td>
              <td><strong>Propiedad</strong></td>
              <td>Humedades, tuberías empotradas, estructura</td>
            </tr>
            <tr>
              <td>Daños de huéspedes</td>
              <td><strong>Plataformas (fianzas)</strong></td>
              <td>Gestionamos la reclamación con Airbnb/Booking</td>
            </tr>
          </tbody>
        </table>

        <div className={s.warningBox}>
          <div className={s.warningBoxTitle}>Revisión inicial obligatoria</div>
          <p>
            Antes del inicio de la actividad, se realizará una revisión completa del estado de los
            48 apartamentos para dejar todo en condiciones óptimas. El coste de esta puesta a punto
            inicial se presupuestará aparte según el estado actual de los inmuebles.
          </p>
        </div>
      </div>

      {/* ==================== SECTION 5: PROYECCIÓN FINANCIERA ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>05</div>
        <div className={s.sectionTitle}>Proyección Financiera</div>
        <div className={s.sectionSubtitle}>Estimación de ingresos y costes para 48 apartamentos — Tres escenarios</div>
        <div className={s.divider} />

        <table className={s.table}>
          <thead>
            <tr>
              <th>Concepto</th>
              <th style={{ textAlign: 'right' }}>Conservador</th>
              <th style={{ textAlign: 'right' }}>Moderado</th>
              <th style={{ textAlign: 'right' }}>Optimista</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} style={{ background: '#f8f9fc', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Ingresos
              </td>
            </tr>
            <tr>
              <td>Ingreso medio por apartamento/año</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>14.917€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>17.900€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>21.500€</td>
            </tr>
            <tr>
              <td>Referencia</td>
              <td style={{ textAlign: 'right' }} className={s.textXs}>Media mercado PriceLabs</td>
              <td style={{ textAlign: 'right' }} className={s.textXs}>Gestión profesional (+20%)</td>
              <td style={{ textAlign: 'right' }} className={s.textXs}>Optimización máxima (+44%)</td>
            </tr>
            <tr className={s.rowTotal}>
              <td><strong>FACTURACIÓN BRUTA TOTAL (48 apts)</strong></td>
              <td style={{ textAlign: 'right' }} className={s.tdHighlight}>716.016€</td>
              <td style={{ textAlign: 'right' }} className={s.tdHighlight}>859.200€</td>
              <td style={{ textAlign: 'right' }} className={s.tdHighlight}>1.032.000€</td>
            </tr>

            <tr>
              <td colSpan={4} style={{ background: '#f8f9fc', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Costes de gestión (lo que paga la propiedad)
              </td>
            </tr>
            <tr>
              <td>Comisión de gestión (20%)</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>143.203€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>171.840€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>206.400€</td>
            </tr>
            <tr>
              <td>Mantenimiento (150€ + IVA × 48 apts × 12 meses)</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney} colSpan={3}>104.544€ / año</td>
            </tr>
            <tr>
              <td>Limpieza (estimación ~40€ × rotaciones)</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>~153.600€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>~168.960€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>~182.400€</td>
            </tr>
            <tr>
              <td>Comisiones de plataformas (~15%)</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>107.402€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>128.880€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>154.800€</td>
            </tr>
            <tr className={s.rowTotal}>
              <td><strong>TOTAL COSTES</strong></td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>508.749€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>574.224€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>648.144€</td>
            </tr>

            <tr>
              <td colSpan={4} style={{ background: '#f8f9fc', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Resultado para la propiedad
              </td>
            </tr>
            <tr className={s.rowTotal} style={{ fontSize: 16 }}>
              <td><strong>RESULTADO OPERATIVO ESTIMADO</strong></td>
              <td style={{ textAlign: 'right' }} className={s.tdHighlight}>207.267€</td>
              <td style={{ textAlign: 'right' }} className={s.tdHighlight}>284.976€</td>
              <td style={{ textAlign: 'right' }} className={s.tdHighlight}>383.856€</td>
            </tr>
            <tr>
              <td>Por apartamento / mes</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>360€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>495€</td>
              <td style={{ textAlign: 'right' }} className={s.tdMoney}>666€</td>
            </tr>
          </tbody>
        </table>

        <div className={s.summaryBox}>
          <h3>Resumen para el propietario — Escenario moderado</h3>
          <div className={s.summaryGrid}>
            <div className={s.summaryItem}>
              <div className={s.summaryItemValue}>859.200€</div>
              <div className={s.summaryItemLabel}>Facturación bruta anual</div>
            </div>
            <div className={s.summaryItem}>
              <div className={s.summaryItemValue}>284.976€</div>
              <div className={s.summaryItemLabel}>Resultado operativo anual</div>
            </div>
            <div className={s.summaryItem}>
              <div className={s.summaryItemValue}>495€</div>
              <div className={s.summaryItemLabel}>Por apartamento / mes</div>
            </div>
          </div>
        </div>

        <div className={s.infoBox}>
          <div className={s.infoBoxTitle}>Notas sobre la estimación</div>
          <p>
            • Los ingresos están basados en datos reales de PriceLabs para Santa Pola (febrero 2026),
            con 1.333 listings analizados. Cifra base: 14.917€/año por apartamento.<br />
            • La tarifa de limpieza se ha estimado a 40€ por rotación. La tarifa final se determinará
            tras la valoración individual de cada apartamento.<br />
            • Las comisiones de plataformas (Airbnb, Booking) promedian un 15% sobre la facturación bruta.<br />
            • <strong>No incluido en el resultado operativo:</strong> IBI, suministros (agua, luz, gas, internet),
            comunidad de propietarios, seguros ni impuestos. Estos costes corren a cargo de la propiedad.<br />
            • La estimación de ingresos depende de la tipología, ubicación y estado de los apartamentos.
          </p>
        </div>
      </div>

      {/* ==================== SECTION 6: POR QUÉ NOSOTROS ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>06</div>
        <div className={s.sectionTitle}>Por Qué Nosotros</div>
        <div className={s.sectionSubtitle}>Experiencia demostrada en gestión de apartamentos turísticos en Alicante</div>
        <div className={s.divider} />

        <div className={s.kpiGrid3}>
          <div className={s.kpiCardHighlight}>
            <div className={s.kpiLabel}>Apartamentos en gestión</div>
            <div className={s.kpiValue}>35</div>
            <div className={s.kpiChange}>Alicante capital</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Plataformas activas</div>
            <div className={s.kpiValue}>4+</div>
            <div className={s.kpiChange}>Airbnb, Booking, Vrbo, directa</div>
          </div>
          <div className={s.kpiCard}>
            <div className={s.kpiLabel}>Servicio de mantenimiento</div>
            <div className={s.kpiValue}>Integral</div>
            <div className={s.kpiChange}>Precio cerrado mensual</div>
          </div>
        </div>

        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Nuestras ventajas competitivas</h3>

        <table className={s.table}>
          <thead>
            <tr>
              <th>Aspecto</th>
              <th>Nuestra gestión</th>
              <th>Gestión individual / otras gestoras</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Pricing</strong></td>
              <td>Dinámico, basado en datos de mercado en tiempo real</td>
              <td>Precio fijo o manual</td>
            </tr>
            <tr>
              <td><strong>Canales</strong></td>
              <td>Airbnb + Booking + Vrbo + reserva directa</td>
              <td>Normalmente solo Airbnb</td>
            </tr>
            <tr>
              <td><strong>Respuesta</strong></td>
              <td>Atención 9–22h + emergencias 24h</td>
              <td>Horario limitado</td>
            </tr>
            <tr>
              <td><strong>Limpieza</strong></td>
              <td>Equipo profesional dedicado con protocolo estandarizado</td>
              <td>Autónomos sin control de calidad</td>
            </tr>
            <tr>
              <td><strong>Mantenimiento</strong></td>
              <td>Servicio integral con precio cerrado mensual</td>
              <td>Reparaciones a demanda (más caro e impredecible)</td>
            </tr>
            <tr>
              <td><strong>Reporting</strong></td>
              <td>Informes mensuales detallados</td>
              <td>Sin reporting o básico</td>
            </tr>
            <tr>
              <td><strong>Escalabilidad</strong></td>
              <td>Infraestructura para 83+ apartamentos</td>
              <td>Problemas de escala con volúmenes altos</td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: 40 }} />

        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Información necesaria para presupuesto definitivo</h3>

        <p className={`${s.textSm} ${s.mb4}`}>
          Para ajustar esta propuesta con cifras definitivas, necesitamos conocer:
        </p>

        <table className={s.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Información solicitada</th>
              <th>Impacto en propuesta</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td><strong>Estado de las licencias turísticas</strong></td><td>Requisito legal imprescindible para operar</td></tr>
            <tr><td>2</td><td>Tipologías de los 48 apartamentos (dormitorios, m², baños)</td><td>Ajusta la estimación de ingresos y tarifa de limpieza</td></tr>
            <tr><td>3</td><td>Estado actual de los inmuebles (obra nueva, reformados)</td><td>Determina coste de puesta a punto inicial</td></tr>
            <tr><td>4</td><td>Sistema de climatización (splits / conductos)</td><td>Ajusta coste de mantenimiento</td></tr>
            <tr><td>5</td><td>Sistema de cerraduras actual</td><td>Necesidad de instalar cerraduras electrónicas</td></tr>
            <tr><td>6</td><td>Equipamiento (mobiliario, electrodomésticos, ropa de cama)</td><td>Determina inversión inicial necesaria</td></tr>
            <tr><td>7</td><td>Distancia a la playa / ubicación exacta</td><td>Impacta directamente en ADR y ocupación</td></tr>
            <tr><td>8</td><td>¿Edificio completo o unidades repartidas?</td><td>Logística de limpieza y mantenimiento</td></tr>
          </tbody>
        </table>
      </div>

      {/* ==================== SECTION 7: CONTEXTO REGULATORIO ==================== */}
      <div className={`${s.section} ${s.pageBreak}`}>
        <div className={s.sectionNumber}>07</div>
        <div className={s.sectionTitle}>Contexto Regulatorio</div>
        <div className={s.sectionSubtitle}>Decreto-Ley 9/2024 de la Comunidad Valenciana — Puntos clave</div>
        <div className={s.divider} />

        <table className={s.table}>
          <thead>
            <tr>
              <th>Requisito</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Registro obligatorio</strong></td><td>Cada apartamento debe estar inscrito en el Registro de Turismo de la Comunitat Valenciana</td></tr>
            <tr><td><strong>Validez del registro</strong></td><td>5 años (renovable). Antes era indefinido.</td></tr>
            <tr><td><strong>NRUA obligatorio</strong></td><td>Desde julio 2025, el número NRUA debe aparecer en todos los anuncios</td></tr>
            <tr><td><strong>Aprobación de comunidad</strong></td><td>3/5 de propietarios deben aprobar (desde abril 2025) — para nuevas licencias</td></tr>
            <tr><td><strong>Estancia máxima</strong></td><td>10 días consecutivos por huésped</td></tr>
            <tr><td><strong>Cerraduras</strong></td><td>Prohibidas las cajas de llaves (lockbox) en vía pública o zonas comunes</td></tr>
            <tr><td><strong>No retroactividad</strong></td><td>Licencias existentes están protegidas bajo la normativa anterior</td></tr>
          </tbody>
        </table>

        <div className={`${s.infoBox} ${s.mt4}`}>
          <div className={s.infoBoxTitle}>Oportunidad regulatoria</div>
          <p>
            Las viviendas turísticas registradas en Santa Pola han descendido un <strong>18,9%</strong> en
            el último año (de 1.968 a 1.595) debido al endurecimiento normativo. Esto significa{' '}
            <strong>menos competencia</strong> para los apartamentos que ya cuentan con licencia. La oferta
            se está contrayendo mientras la demanda crece (+13,5% en visitas turísticas en 2024).
          </p>
        </div>

        <div style={{ height: 60 }} />

        {/* ===== PRÓXIMOS PASOS ===== */}
        <div className={s.ctaBox}>
          <h3 style={{ fontSize: 22, marginBottom: 16 }}>Próximos pasos</h3>
          <div style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto', marginBottom: 28 }}>
            <ol style={{ paddingLeft: 20, fontSize: 14, color: '#374151', lineHeight: 2 }}>
              <li><strong>Verificar el estado de las 48 licencias turísticas</strong></li>
              <li>Facilitar tipología y estado de los apartamentos</li>
              <li>Visita presencial para valoración de puesta a punto</li>
              <li>Presupuesto definitivo con cifras ajustadas</li>
            </ol>
          </div>
          <div style={{ display: 'inline-flex', gap: 40 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Alejandro Santalla</div>
              <div style={{ color: '#6b7280' }}>652 656 440</div>
              <div style={{ color: '#6b7280' }}>alejandrosatlla@gmail.com</div>
            </div>
          </div>
        </div>

        <div className={s.pageFooter}>
          <p>Documento confidencial — Propuesta de gestión integral 48 apartamentos Santa Pola</p>
          <p>Datos de mercado: PriceLabs Market Dashboard · Febrero 2026 · 1.333 listings analizados</p>
        </div>
      </div>

    </div>
  )
}
