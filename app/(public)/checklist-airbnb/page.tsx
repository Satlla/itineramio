'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Download, X, Plus, Trash2, ArrowRight, Mail, Loader2 } from 'lucide-react'
import Image from 'next/image'

const ZONES = [
  { id: 'cocina', name: 'Cocina', items: [
    { t: 'Sartén antiadherente (26-28cm)', l: 'must' },{ t: 'Cazuela mediana', l: 'must' },{ t: 'Cazo pequeño', l: 'must' },{ t: 'Set de cuchillos (pan, carne, puntilla)', l: 'must' },{ t: 'Tabla de corte', l: 'must' },{ t: 'Sacacorchos / abridor de vino', l: 'must' },{ t: 'Tijeras de cocina', l: 'must' },{ t: 'Escurridor de pasta', l: 'must' },{ t: 'Colador', l: 'must' },{ t: 'Cubiertos (x huéspedes + 4 extra)', l: 'must' },{ t: 'Platos llanos y hondos (x huéspedes + 4)', l: 'must' },{ t: 'Vasos de agua (x huéspedes + 4)', l: 'must' },{ t: 'Copas de vino', l: 'must' },{ t: 'Tazas de café/té', l: 'must' },{ t: 'Bol para cereales/ensalada', l: 'must' },{ t: 'Ensaladera', l: 'must' },{ t: 'Aceitera', l: 'must' },{ t: 'Set de especias (sal, pimienta)', l: 'must' },{ t: 'PortaRollos de cocina', l: 'must' },{ t: 'Cubo de basura', l: 'must' },{ t: 'Escoba + recogedor', l: 'must' },{ t: 'Fregona + cubo', l: 'must' },
    { t: 'Servilletas / portaservilletas', l: 'should' },{ t: 'Tuppers (set de 3)', l: 'should' },{ t: 'Tostador', l: 'should' },{ t: 'Hervidor de agua', l: 'should' },{ t: 'Cafetera italiana o cápsulas', l: 'should' },
    { t: 'Cafetera Nespresso + cápsulas', l: 'wow' },
  ]},
  { id: 'bano', name: 'Baño', items: [
    { t: 'Secador de pelo', l: 'must' },{ t: 'Papelera con tapa', l: 'must' },{ t: 'Escobilla de WC', l: 'must' },{ t: 'Dispensador champú, jabón y gel ducha', l: 'must' },{ t: 'Alfombrines de ducha', l: 'must' },
    { t: 'Botiquín: tiritas, ibuprofeno, termómetro', l: 'should' },
  ]},
  { id: 'dormitorio', name: 'Dormitorio', items: [
    { t: 'Fundas de almohada extra', l: 'must' },{ t: 'Protector de colchón impermeable', l: 'must' },{ t: 'Protector de almohada', l: 'must' },{ t: 'Almohadas (2 por persona)', l: 'must' },{ t: 'Perchas (mínimo 12)', l: 'must' },{ t: 'Espejo de cuerpo entero', l: 'must' },{ t: 'Cortinas opacas o persiana', l: 'must' },
    { t: 'Manta extra / colcha', l: 'should' },
  ]},
  { id: 'limpieza', name: 'Limpieza', items: [
    { t: 'Escoba + recogedor', l: 'must' },{ t: 'Fregona + cubo escurridor', l: 'must' },
    { t: 'Ambientador', l: 'should' },
  ]},
  { id: 'lavanderia', name: 'Lavandería', items: [
    { t: 'Pinzas de tender', l: 'must' },{ t: 'Plancha', l: 'must' },{ t: 'Tabla de planchar', l: 'must' },
    { t: 'Cesta de ropa sucia', l: 'should' },
  ]},
  { id: 'general', name: 'General', items: [
    { t: 'Bombillas de repuesto', l: 'must' },{ t: 'Alargador/regleta con USB', l: 'must' },
    { t: 'Guía digital con videos por zonas', l: 'wow' },
  ]},
]

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  must: { bg: '#fef2f2', color: '#ef4444', label: 'MUST' },
  should: { bg: '#fffbeb', color: '#f59e0b', label: 'SHOULD' },
  wow: { bg: '#f5f3ff', color: '#8b5cf6', label: 'WOW' },
  custom: { bg: '#f0fdf4', color: '#22c55e', label: 'TUYO' },
}

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [openZones, setOpenZones] = useState<Record<string, boolean>>({ cocina: true })
  const [customItems, setCustomItems] = useState<Record<string, string[]>>({})
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newItem, setNewItem] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [props, setProps] = useState('')
  const [popKey, setPopKey] = useState<string | null>(null)
  const [activeSpot, setActiveSpot] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  useEffect(() => { try { const s = localStorage.getItem('cl3'); if (s) setChecked(JSON.parse(s)); const c = localStorage.getItem('cl3-custom'); if (c) setCustomItems(JSON.parse(c)) } catch {} }, [])
  useEffect(() => { if (Object.keys(checked).length) localStorage.setItem('cl3', JSON.stringify(checked)) }, [checked])
  useEffect(() => { if (Object.keys(customItems).length) localStorage.setItem('cl3-custom', JSON.stringify(customItems)) }, [customItems])

  const allItems = ZONES.reduce((a, z) => a + z.items.length + (customItems[z.id]?.length || 0), 0)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const pct = allItems ? Math.round((checkedCount / allItems) * 100) : 0

  function addCustomItem(zoneId: string) { if (!newItem.trim()) return; setCustomItems(p => ({ ...p, [zoneId]: [...(p[zoneId] || []), newItem.trim()] })); setNewItem(''); setAddingTo(null) }
  function removeCustomItem(zoneId: string, idx: number) { setCustomItems(p => { const items = [...(p[zoneId] || [])]; items.splice(idx, 1); return { ...p, [zoneId]: items } }); setChecked(p => { const n = { ...p }; delete n[`${zoneId}-c${idx}`]; return n }) }

  function getChecklist() {
    const result: Record<string, string[]> = {}
    ZONES.forEach(zone => { const items: string[] = []; zone.items.forEach((item, i) => { if (checked[`${zone.id}-${i}`]) items.push(item.t) }); (customItems[zone.id] || []).forEach(item => items.push(item)); if (items.length > 0) result[zone.name] = items })
    return result
  }

  async function sendChecklist() {
    if (!email || !name) return; setEmailSending(true)
    try { await fetch('/api/public/checklist-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, properties: props, checklist: getChecklist() }) }); setEmailSent(true) } catch {}
    setEmailSending(false)
  }

  return (
    <div style={{ background: '#fff', color: '#111', minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif' }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.35) rotate(8deg)} 100%{transform:scale(1)} }
        .pop { animation: pop 0.35s ease; }
        @keyframes pulse { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.5);opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
      `}</style>

      {/* ===== NAV ===== */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '0 24px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/isotipo-gradient.svg" alt="" width={40} height={24} />
            <span style={{ fontWeight: 600, fontSize: 20, color: '#111' }}>Itineramio</span>
          </a>
          <button onClick={() => setShowEmailModal(true)} style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Recibir por email
          </button>
        </div>
      </div>

      {/* ===== HERO — Title + Kitchen with hotspots ===== */}
      <section style={{ paddingTop: 100, paddingBottom: 0 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', padding: '40px 24px 48px', maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 300, lineHeight: 1.08, color: '#111', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Checklist de compras para tu alojamiento
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#999', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Todo lo que necesitas comprar. Marca lo que tienes. Descubre lo que te falta.
          </p>
        </div>

        {/* Kitchen image with interactive hotspots */}
        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
          <Image src="/images/render-casa.png" alt="Apartamento equipado" width={1920} height={1080} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.1))' }} />

          {/* Hotspot dots */}
          {[
            { id: 'cocina', x: '25%', y: '40%', label: 'Cocina', items: ['Sartén antiadherente', 'Cazuela mediana', 'Set de cuchillos', 'Tabla de corte', 'Escurridor de pasta'] },
            { id: 'cubiertos', x: '35%', y: '50%', label: 'Cubiertos', items: ['Cubiertos (tenedores, cuchillos, cucharas)', 'Platos llanos y hondos', 'Vasos de agua', 'Copas de vino', 'Tazas de café'] },
            { id: 'encimera', x: '30%', y: '32%', label: 'Encimera', items: ['Cafetera', 'Tostador', 'Hervidor de agua', 'Sacacorchos', 'Aceitera'] },
            { id: 'sofa', x: '18%', y: '60%', label: 'Salón', items: ['Manta extra', 'Cojines', 'Mando TV con pilas', 'Cargador USB'] },
            { id: 'tv', x: '70%', y: '35%', label: 'Smart TV', items: ['Pilas para mando (AA/AAA)', 'Alargador/regleta con USB'] },
            { id: 'mesa', x: '42%', y: '65%', label: 'Mesa', items: ['Servilletas', 'Ensaladera', 'Bol para cereales'] },
            { id: 'limpieza', x: '12%', y: '72%', label: 'Limpieza', items: ['Escoba + recogedor', 'Fregona + cubo', 'Ambientador'] },
            { id: 'lavanderia', x: '55%', y: '70%', label: 'Lavandería', items: ['Plancha', 'Tabla de planchar', 'Pinzas de tender', 'Cesta de ropa'] },
          ].map(spot => (
            <div key={spot.id} onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
              style={{ position: 'absolute', left: spot.x, top: spot.y, transform: 'translate(-50%, -50%)', zIndex: activeSpot === spot.id ? 40 : 20, cursor: 'pointer' }}>
              {/* Pulse */}
              <div style={{ position: 'absolute', width: 28, height: 28, left: '50%', top: '50%', marginLeft: -14, marginTop: -14, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', animation: 'pulse 2.5s infinite ease-out' }} />
              {/* Dot */}
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7c3aed', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }} />
              {/* Label */}
              <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 3, backdropFilter: 'blur(4px)' }}>{spot.label}</span>
              </div>
              {/* Panel */}
              {activeSpot === spot.id && (
                <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 220, background: '#fff', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', padding: 16, zIndex: 100 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>{spot.label}</div>
                  {spot.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 12, color: '#555' }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS — Tesla style numbers ===== */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, textAlign: 'center' }}>
          {[
            { value: `${allItems}`, label: 'Items', sub: 'organizados por zona' },
            { value: '6', label: 'Zonas', sub: 'cocina, baño, dormitorio...' },
            { value: '3', label: 'Niveles', sub: 'must, should, wow' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 200, color: '#111', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: '#ccc', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROGRESS BAR ===== */}
      <section id="checklist" style={{ padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}>Tu progreso</span>
            <span style={{ color: '#555', fontWeight: 500 }}>{checkedCount} de {allItems} — {pct}%</span>
          </div>
          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#111', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
            {Object.entries(BADGE).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#aaa', letterSpacing: '0.05em' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.color }} />{v.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CHECKLIST ===== */}
      <section style={{ padding: '8px 16px 64px', maxWidth: 700, margin: '0 auto' }}>
        {ZONES.map(zone => {
          const isOpen = !!openZones[zone.id]
          const customs = customItems[zone.id] || []
          const totalZone = zone.items.length + customs.length
          const zc = zone.items.filter((_, i) => checked[`${zone.id}-${i}`]).length + customs.filter((_, i) => checked[`${zone.id}-c${i}`]).length
          const allDone = zc === totalZone && totalZone > 0

          return (
            <div key={zone.id} style={{ marginBottom: 2, borderBottom: '1px solid #f0f0f0' }}>
              {/* Zone header — Tesla minimal */}
              <div onClick={() => setOpenZones(p => ({ ...p, [zone.id]: !p[zone.id] }))}
                style={{ display: 'flex', alignItems: 'center', padding: '20px 4px', cursor: 'pointer' }}>
                <span style={{ flex: 1, fontSize: 16, fontWeight: 400, letterSpacing: '-0.01em', color: allDone ? '#22c55e' : '#111' }}>{zone.name}</span>
                {allDone && <span style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 12 }}>Completo</span>}
                <span style={{ fontSize: 12, color: '#ccc', marginRight: 12 }}>{zc}/{totalZone}</span>
                <ChevronDown size={16} color="#ccc" style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
              </div>

              {isOpen && (
                <div style={{ paddingBottom: 16 }}>
                  {zone.items.map((item, i) => {
                    const key = `${zone.id}-${i}`; const on = !!checked[key]; const b = BADGE[item.l]
                    return (
                      <div key={key} onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })); if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 350) } }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', cursor: 'pointer' }}>
                        <div className={popKey === key ? 'pop' : ''} style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${on ? '#111' : '#ddd'}`, background: on ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {on && <Check size={11} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ flex: 1, fontSize: 14, color: on ? '#ccc' : '#444', textDecoration: on ? 'line-through' : 'none', transition: 'all 0.15s' }}>{item.t}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: b.bg, color: b.color, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.label}</span>
                      </div>
                    )
                  })}

                  {customs.map((item, i) => {
                    const key = `${zone.id}-c${i}`; const on = !!checked[key]
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px' }}>
                        <div onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })); if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 350) } }}
                          className={popKey === key ? 'pop' : ''} style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${on ? '#22c55e' : '#ddd'}`, background: on ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' }}>
                          {on && <Check size={11} color="#fff" strokeWidth={3} />}
                        </div>
                        <span onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })) }} style={{ flex: 1, fontSize: 14, color: on ? '#ccc' : '#444', textDecoration: on ? 'line-through' : 'none', cursor: 'pointer' }}>{item}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: '#f0fdf4', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>tuyo</span>
                        <button onClick={() => removeCustomItem(zone.id, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', padding: 2 }}><Trash2 size={13} /></button>
                      </div>
                    )
                  })}

                  {addingTo === zone.id ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '0 4px' }}>
                      <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomItem(zone.id)}
                        placeholder="Escribe el item..." autoFocus style={{ flex: 1, padding: '8px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 14, outline: 'none' }} />
                      <button onClick={() => addCustomItem(zone.id)} style={{ padding: '8px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>Añadir</button>
                      <button onClick={() => { setAddingTo(null); setNewItem('') }} style={{ padding: '8px', background: '#f5f5f5', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#999' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <div onClick={() => setAddingTo(zone.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 4px', cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
                      <Plus size={13} /> Añadir item
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* ===== SEND BANNER ===== */}
      {checkedCount > 0 && (
        <section style={{ padding: '0 24px 48px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 32px', background: '#fafafa', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#555' }}><strong>{checkedCount} items</strong> seleccionados. Recibe tu checklist personalizado por email.</p>
            <button onClick={() => setShowEmailModal(true)} style={{ padding: '12px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.02em' }}>
              Enviar a mi email
            </button>
          </div>
        </section>
      )}

      {/* ===== FULL IMAGE — Casa ===== */}
      <section style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image src="/images/render-casa.png" alt="Apartamento equipado" fill style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 5, padding: '48px 32px', maxWidth: 600 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 300, color: '#fff', marginBottom: 12, lineHeight: 1.15 }}>
            Guía digital de tu apartamento turístico con videos
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Una vez tienes todo comprado, el siguiente nivel es documentarlo. Instrucciones de cada electrodoméstico, normas, WiFi, recomendaciones. Accesible con un QR.
          </p>
        </div>
      </section>

      {/* ===== CTA — Tesla style ===== */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 300, color: '#111', marginBottom: 12, letterSpacing: '-0.02em' }}>
          ¿Ya tienes todo comprado?
        </h2>
        <p style={{ fontSize: 15, color: '#aaa', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
          El siguiente paso: que tu huésped sepa dónde está cada cosa sin preguntarte.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <a href="/landing-tes" style={{ padding: '14px 32px', background: '#111', color: '#fff', borderRadius: 4, fontSize: 14, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em' }}>
            Crea tu guía digital gratis
          </a>
          <a href="/demo" style={{ padding: '14px 32px', background: 'transparent', color: '#555', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em' }}>
            Ver demo
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#ddd' }}>Itineramio</p>
      </div>

      {/* ===== EMAIL MODAL ===== */}
      {showEmailModal && (
        <div onClick={() => { if (!emailSending) setShowEmailModal(false) }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            {emailSent ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Check size={24} color="#fff" /></div>
                <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 8 }}>Checklist enviado</h3>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>Revisa tu email con tu lista personalizada.</p>
                <button onClick={() => { setShowEmailModal(false); setEmailSent(false) }} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontSize: 13, fontWeight: 500, textDecoration: 'underline' }}>Cerrar</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); sendChecklist() }}>
                <div style={{ padding: '24px 24px 0' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>Recibe tu checklist por email</h3>
                  <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>{checkedCount > 0 ? `${checkedCount} items seleccionados.` : 'Tu checklist personalizado.'}</p>
                </div>
                <div style={{ padding: '0 24px 24px' }}>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" style={{ width: '100%', padding: '12px 14px', border: '1px solid #eee', borderRadius: 4, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' as const, outline: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" style={{ width: '100%', padding: '12px 14px', border: '1px solid #eee', borderRadius: 4, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' as const, outline: 'none' }} />
                  <select value={props} onChange={e => setProps(e.target.value)} required style={{ width: '100%', padding: '12px 14px', border: '1px solid #eee', borderRadius: 4, fontSize: 14, marginBottom: 20, boxSizing: 'border-box' as const }}>
                    <option value="">¿Cuántas propiedades gestionas?</option>
                    <option>1</option><option>2-3</option><option>4-6</option><option>7-10</option><option>Más de 10</option>
                  </select>
                  <button type="submit" disabled={emailSending} style={{ width: '100%', padding: 14, background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: emailSending ? 0.6 : 1, letterSpacing: '0.02em' }}>
                    {emailSending ? 'Enviando...' : 'Enviar mi checklist'}
                  </button>
                  <p style={{ fontSize: 10, color: '#ccc', textAlign: 'center', marginTop: 12 }}>Sin spam. Solo tu checklist.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
