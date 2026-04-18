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
    ZONES.forEach(zone => {
      const items: string[] = []
      zone.items.forEach(item => items.push(item.t))
      ;(customItems[zone.id] || []).forEach(item => items.push(item))
      if (items.length > 0) result[zone.name] = items
    })
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
        @keyframes scanline { 0%{transform:translateY(-10px)} 100%{transform:translateY(200px)} }
      `}</style>

      {/* ===== NAV ===== */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '0 24px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={40} height={24} />
            <span style={{ fontWeight: 600, fontSize: 20, color: '#111' }}>Itineramio</span>
          </a>
          <button onClick={() => setShowEmailModal(true)} style={{ padding: '9px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 10px rgba(124,58,237,0.25)' }}>
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
          <Image src="/images/render-casa.webp" alt="Apartamento equipado" width={1920} height={1080} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent, rgba(0,0,0,0.3))' }} />

          {/* Hotspot dots with pulse + hologram panels */}
          {[
            { id: 'nevera', x: '20%', y: '38%', label: 'Nevera', items: ['Aceitera', 'Set de especias (sal, pimienta)', 'Tuppers (set de 3)'] },
            { id: 'horno', x: '30%', y: '28%', label: 'Horno / Cocina', items: ['Sartén antiadherente', 'Cazuela mediana', 'Cazo pequeño', 'Escurridor de pasta', 'Colador'] },
            { id: 'encimera', x: '32%', y: '45%', label: 'Encimera', items: ['Set de cuchillos', 'Tabla de corte', 'Tijeras de cocina', 'Sacacorchos', 'PortaRollos de cocina'] },
            { id: 'sofa', x: '22%', y: '58%', label: 'Sofá / Salón', items: ['Manta extra / colcha', 'Cojines', 'Perchas (mín. 12)', 'Cargador USB'] },
            { id: 'mesa', x: '38%', y: '62%', label: 'Mesa', items: ['Cubiertos (+4 extra)', 'Platos llanos y hondos', 'Copas de vino', 'Tazas de café', 'Servilletas'] },
            { id: 'tv', x: '70%', y: '32%', label: 'Smart TV', items: ['Pilas para mandos (AA y AAA)', 'Alargador/regleta con USB', 'Bombillas de repuesto'] },
            { id: 'mueble', x: '68%', y: '45%', label: 'Mueble TV', items: ['Vasos de agua (+4 extra)', 'Ensaladera', 'Bol cereales'] },
            { id: 'entrada', x: '22%', y: '72%', label: 'Entrada / General', items: ['Plancha + tabla de planchar', 'Escoba + fregona', 'Ambientador', 'Secador de pelo'] },
          ].map(spot => (
            <div key={spot.id} onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
              style={{ position: 'absolute', left: spot.x, top: spot.y, transform: 'translate(-50%, -50%)', zIndex: activeSpot === spot.id ? 100 : 20, cursor: 'pointer' }}>
              {/* Pulse ring 1 */}
              <div style={{ position: 'absolute', width: 32, height: 32, left: '50%', top: '50%', marginLeft: -16, marginTop: -16, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.5)', animation: 'pulse 2.6s infinite ease-out' }} />
              {/* Pulse ring 2 */}
              <div style={{ position: 'absolute', width: 32, height: 32, left: '50%', top: '50%', marginLeft: -16, marginTop: -16, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.3)', animation: 'pulse 2.6s 0.8s infinite ease-out' }} />
              {/* QR Dot */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.7)', backdropFilter: 'blur(4px)', border: '2px solid rgba(167,139,250,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, border: '1.5px solid rgba(255,255,255,0.8)' }} />
              </div>
              {/* Label */}
              <div style={{ position: 'absolute', top: 34, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '3px 10px', borderRadius: 4, backdropFilter: 'blur(6px)', border: '1px solid rgba(124,58,237,0.2)' }}>{spot.label}</span>
              </div>
              {/* Hologram Panel */}
              {activeSpot === spot.id && (
                <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 240, background: 'rgba(15,10,40,0.85)', backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)', padding: 16, zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
                  {/* Scan line */}
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ width: '100%', height: 10, background: 'linear-gradient(to bottom, rgba(124,58,237,0.08), transparent)', animation: 'scanline 4s linear infinite' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />
                    {spot.label}
                  </div>
                  {spot.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(124,58,237,0.6)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                  {/* Bottom glow line */}
                  <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.2), transparent)', marginTop: 10 }} />
                </div>
              )}
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

      {/* ===== CHECKLIST — Card style like reference ===== */}
      <section style={{ padding: '8px 16px 64px', maxWidth: 600, margin: '0 auto' }}>
        {ZONES.map(zone => {
          const customs = customItems[zone.id] || []
          const totalZone = zone.items.length + customs.length
          const zc = zone.items.filter((_, i) => checked[`${zone.id}-${i}`]).length + customs.filter((_, i) => checked[`${zone.id}-c${i}`]).length
          const allDone = zc === totalZone && totalZone > 0
          const zonePct = totalZone ? Math.round((zc / totalZone) * 100) : 0
          const isOpen = !!openZones[zone.id]

          return (
            <div key={zone.id} style={{ marginBottom: 16, background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Zone header */}
              <div onClick={() => setOpenZones(p => ({ ...p, [zone.id]: !p[zone.id] }))}
                style={{ padding: '18px 20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>{zone.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {allDone && <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>Completo</span>}
                    <span style={{ fontSize: 12, color: '#bbb' }}>{zc}/{totalZone}</span>
                    <ChevronDown size={16} color="#ccc" style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${zonePct}%`, background: allDone ? '#22c55e' : '#7c3aed', borderRadius: 2, transition: 'all 0.4s ease' }} />
                </div>
              </div>

              {/* Items */}
              {isOpen && (
                <div style={{ padding: '0 12px 16px' }}>
                  {zone.items.map((item, i) => {
                    const key = `${zone.id}-${i}`; const on = !!checked[key]; const b = BADGE[item.l]
                    return (
                      <div key={key} onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })); if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 400) } }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', margin: '2px 0', borderRadius: 10, cursor: 'pointer', background: on ? '#f0fdf4' : 'transparent', transition: 'background 0.2s' }}>
                        {/* Circle checkbox */}
                        <div className={popKey === key ? 'pop' : ''} style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: on ? 'none' : '2px solid #ddd',
                          background: on ? '#22c55e' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'all 0.25s ease',
                          boxShadow: on ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
                        }}>
                          {on && <Check size={13} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ flex: 1, fontSize: 14, color: on ? '#aaa' : '#333', textDecoration: on ? 'line-through' : 'none', transition: 'all 0.2s' }}>{item.t}</span>
                        {!on && <ArrowRight size={14} color="#ddd" style={{ flexShrink: 0 }} />}
                        {on && <span style={{ fontSize: 9, fontWeight: 600, color: '#22c55e', flexShrink: 0 }}>Listo</span>}
                      </div>
                    )
                  })}

                  {/* Custom items */}
                  {customs.map((item, i) => {
                    const key = `${zone.id}-c${i}`; const on = !!checked[key]
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', margin: '2px 0', borderRadius: 10, background: on ? '#f0fdf4' : 'transparent' }}>
                        <div onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })); if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 400) } }}
                          className={popKey === key ? 'pop' : ''} style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: on ? 'none' : '2px solid #ddd',
                          background: on ? '#22c55e' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: on ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
                        }}>
                          {on && <Check size={13} color="#fff" strokeWidth={3} />}
                        </div>
                        <span onClick={() => setChecked(p => ({ ...p, [key]: !p[key] }))} style={{ flex: 1, fontSize: 14, color: on ? '#aaa' : '#333', textDecoration: on ? 'line-through' : 'none', cursor: 'pointer' }}>{item}</span>
                        {on ? <span style={{ fontSize: 9, fontWeight: 600, color: '#22c55e' }}>Listo</span> : <button onClick={() => removeCustomItem(zone.id, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', padding: 2 }}><Trash2 size={13} /></button>}
                      </div>
                    )
                  })}

                  {/* Add custom */}
                  {addingTo === zone.id ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '0 10px' }}>
                      <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomItem(zone.id)}
                        placeholder="Escribe el item..." autoFocus style={{ flex: 1, padding: '10px 14px', border: '1px solid #eee', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                      <button onClick={() => addCustomItem(zone.id)} style={{ padding: '10px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Añadir</button>
                      <button onClick={() => { setAddingTo(null); setNewItem('') }} style={{ padding: '10px', background: '#f5f5f5', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#999' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <div onClick={() => setAddingTo(zone.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 10px', cursor: 'pointer', color: '#ccc', fontSize: 13, borderRadius: 10 }}>
                      <Plus size={14} /> Añadir item
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
            <button onClick={() => setShowEmailModal(true)} style={{ padding: '12px 28px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
              Enviar a mi email
            </button>
          </div>
        </section>
      )}

      {/* ===== PHONES + CTA — Dark section ===== */}
      <section style={{ background: '#0a0a0b', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 300, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
          ¿Ya tienes todo comprado?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 48, maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
          El siguiente paso: crea una guía digital con videos para que tu huésped sepa dónde está cada cosa. Sin llamarte, sin escribirte.
        </p>

        {/* Two phones Tesla-style */}
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', height: 520 }}>
          {/* Phone back — stats */}
          <div style={{ position: 'absolute', left: 0, top: 20, zIndex: 10, width: 200 }}>
            <div style={{ background: '#000', borderRadius: 28, padding: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ background: '#111', borderRadius: 22, overflow: 'hidden', aspectRatio: '9/19.5', padding: '24px 16px' }}>
                <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Hoy</div>
                <div style={{ fontSize: 28, fontWeight: 200, color: '#fff', marginBottom: 12 }}>34 <span style={{ fontSize: 10, color: '#666' }}>preguntas</span></div>
                <div style={{ height: 60, marginBottom: 12, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                  <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" /></linearGradient></defs>
                    <path d="M0 30 Q15 25 25 22 T45 18 T65 12 T85 10 T100 5 L100 40 L0 40 Z" fill="url(#cg)" />
                    <path d="M0 30 Q15 25 25 22 T45 18 T65 12 T85 10 T100 5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                  </svg>
                </div>
                {[{ l: 'WiFi', v: '12' }, { l: 'Check-in', v: '8' }, { l: 'Normas', v: '6' }, { l: 'Restaurantes', v: '5' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 10 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.l}</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone front — Mi Casa */}
          <div style={{ position: 'absolute', right: 0, top: 0, zIndex: 20, width: 240 }}>
            <div style={{ background: '#000', borderRadius: 32, padding: 10, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(124,58,237,0.1)' }}>
              <div style={{ background: '#111', borderRadius: 24, overflow: 'hidden', aspectRatio: '9/19.5' }}>
                <div style={{ padding: '20px 16px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Mi Casa</div>
                  <div style={{ fontSize: 10, color: '#7c3aed' }}>Conectado</div>
                </div>
                <div style={{ position: 'relative', margin: '0 10px', borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4' }}>
                  <Image src="/images/houses.webp" alt="Casa" fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '10px 14px' }}>
                  {[{ l: 'Check-in', v: 'Lockbox 4521#' }, { l: 'WiFi', v: 'MiCasa_5G' }, { l: 'Normas', v: '3 reglas' }].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 10 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.l}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 32 }}>
          <a href="/landing-tes" style={{ padding: '14px 32px', background: '#7c3aed', color: '#fff', borderRadius: 24, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
            Crea tu guía digital gratis
          </a>
          <a href="/guide/cmn991v2s0001ju0452vn74yn" target="_blank" rel="noopener noreferrer" style={{ padding: '14px 32px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Ver ejemplo
          </a>
          <a href="/consulta" style={{ padding: '14px 32px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Solicitar demo
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ background: '#0a0a0b', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>Itineramio — itineramio.com</p>
      </div>

      {/* ===== EMAIL MODAL ===== */}
      {showEmailModal && (
        <div onClick={() => { if (!emailSending) setShowEmailModal(false) }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            {emailSent ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 15px rgba(34,197,94,0.3)' }}><Check size={28} color="#fff" /></div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Checklist enviado</h3>
                <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>Revisa tu email con tu lista personalizada.</p>
                <button onClick={() => { setShowEmailModal(false); setEmailSent(false) }} style={{ padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cerrar</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); sendChecklist() }}>
                {/* Header branded */}
                <div style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', padding: '24px 24px 20px', textAlign: 'center' }}>
                  <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} style={{ filter: 'brightness(0) invert(1)', marginBottom: 8 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Recibe tu checklist</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{checkedCount > 0 ? `${checkedCount} items seleccionados` : 'Tu checklist personalizado'}</p>
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" style={{ width: '100%', padding: '12px 16px', border: '1px solid #eee', borderRadius: 12, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' as const, outline: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" style={{ width: '100%', padding: '12px 16px', border: '1px solid #eee', borderRadius: 12, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' as const, outline: 'none' }} />
                  <select value={props} onChange={e => setProps(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #eee', borderRadius: 12, fontSize: 14, marginBottom: 20, boxSizing: 'border-box' as const }}>
                    <option value="">¿Cuántas propiedades gestionas?</option>
                    <option>1</option><option>2-3</option><option>4-6</option><option>7-10</option><option>Más de 10</option>
                  </select>
                  <button type="submit" disabled={emailSending} style={{ width: '100%', padding: 14, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: emailSending ? 0.6 : 1, boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
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
