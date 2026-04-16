'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Download, X, Plus, Trash2, ArrowRight, Send } from 'lucide-react'

const ZONES = [
  { id: 'cocina', name: 'Cocina', items: [
    { t: 'Sartén antiadherente (26-28cm)', l: 'must' },
    { t: 'Cazuela mediana', l: 'must' },
    { t: 'Cazo pequeño', l: 'must' },
    { t: 'Set de cuchillos (pan, carne, puntilla)', l: 'must' },
    { t: 'Tabla de corte', l: 'must' },
    { t: 'Sacacorchos / abridor de vino', l: 'must' },
    { t: 'Tijeras de cocina', l: 'must' },
    { t: 'Escurridor de pasta', l: 'must' },
    { t: 'Colador', l: 'must' },
    { t: 'Cubiertos (x huéspedes + 4 extra)', l: 'must' },
    { t: 'Platos llanos y hondos (x huéspedes + 4)', l: 'must' },
    { t: 'Vasos de agua (x huéspedes + 4)', l: 'must' },
    { t: 'Copas de vino', l: 'must' },
    { t: 'Tazas de café/té', l: 'must' },
    { t: 'Bol para cereales/ensalada', l: 'must' },
    { t: 'Ensaladera', l: 'must' },
    { t: 'Aceitera', l: 'must' },
    { t: 'Set de especias (sal, pimienta)', l: 'must' },
    { t: 'PortaRollos de cocina', l: 'must' },
    { t: 'Cubo de basura', l: 'must' },
    { t: 'Escoba + recogedor', l: 'must' },
    { t: 'Fregona + cubo', l: 'must' },
    { t: 'Servilletas / portaservilletas', l: 'should' },
    { t: 'Tuppers (set de 3)', l: 'should' },
    { t: 'Tostador', l: 'should' },
    { t: 'Hervidor de agua', l: 'should' },
    { t: 'Cafetera italiana o cápsulas', l: 'should' },
    { t: 'Cafetera Nespresso + cápsulas', l: 'wow' },
  ]},
  { id: 'bano', name: 'Baño', items: [
    { t: 'Secador de pelo', l: 'must' },
    { t: 'Papelera con tapa', l: 'must' },
    { t: 'Escobilla de WC', l: 'must' },
    { t: 'Dispensador champú, jabón y gel ducha', l: 'must' },
    { t: 'Alfombrines de ducha', l: 'must' },
    { t: 'Botiquín: tiritas, ibuprofeno, termómetro', l: 'should' },
  ]},
  { id: 'dormitorio', name: 'Dormitorio', items: [
    { t: 'Fundas de almohada extra', l: 'must' },
    { t: 'Protector de colchón impermeable', l: 'must' },
    { t: 'Protector de almohada', l: 'must' },
    { t: 'Almohadas (2 por persona)', l: 'must' },
    { t: 'Perchas (mínimo 12)', l: 'must' },
    { t: 'Espejo de cuerpo entero', l: 'must' },
    { t: 'Cortinas opacas o persiana', l: 'must' },
    { t: 'Manta extra / colcha', l: 'should' },
  ]},
  { id: 'limpieza', name: 'Limpieza', items: [
    { t: 'Escoba + recogedor', l: 'must' },
    { t: 'Fregona + cubo escurridor', l: 'must' },
    { t: 'Ambientador', l: 'should' },
  ]},
  { id: 'lavanderia', name: 'Lavandería', items: [
    { t: 'Pinzas de tender', l: 'must' },
    { t: 'Plancha', l: 'must' },
    { t: 'Tabla de planchar', l: 'must' },
    { t: 'Cesta de ropa sucia', l: 'should' },
  ]},
  { id: 'general', name: 'General / Entrada', items: [
    { t: 'Bombillas de repuesto', l: 'must' },
    { t: 'Alargador/regleta con USB', l: 'must' },
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
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [props, setProps] = useState('')
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [popKey, setPopKey] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem('cl3'); if (s) setChecked(JSON.parse(s))
      const c = localStorage.getItem('cl3-custom'); if (c) setCustomItems(JSON.parse(c))
    } catch {}
  }, [])
  useEffect(() => { if (Object.keys(checked).length) localStorage.setItem('cl3', JSON.stringify(checked)) }, [checked])
  useEffect(() => { if (Object.keys(customItems).length) localStorage.setItem('cl3-custom', JSON.stringify(customItems)) }, [customItems])

  const allItems = ZONES.reduce((a, z) => a + z.items.length + (customItems[z.id]?.length || 0), 0)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const pct = allItems ? Math.round((checkedCount / allItems) * 100) : 0

  function addCustomItem(zoneId: string) {
    if (!newItem.trim()) return
    setCustomItems(p => ({ ...p, [zoneId]: [...(p[zoneId] || []), newItem.trim()] }))
    setNewItem('')
    setAddingTo(null)
  }

  function removeCustomItem(zoneId: string, idx: number) {
    setCustomItems(p => { const items = [...(p[zoneId] || [])]; items.splice(idx, 1); return { ...p, [zoneId]: items } })
    const key = `${zoneId}-c${idx}`
    setChecked(p => { const n = { ...p }; delete n[key]; return n })
  }

  function copySelection() {
    const selected: Record<string, string[]> = {}
    ZONES.forEach(zone => {
      const items: string[] = []
      zone.items.forEach((item, i) => { if (checked[`${zone.id}-${i}`]) items.push(item.t) })
      const customs = customItems[zone.id] || []
      customs.forEach((item, i) => { if (checked[`${zone.id}-c${i}`]) items.push(`[CUSTOM] ${item}`) })
      customs.forEach((item, i) => { if (!checked[`${zone.id}-c${i}`]) items.push(`[CUSTOM-NEW] ${item}`) })
      if (items.length > 0) selected[zone.name] = items
    })
    const text = Object.entries(selected).map(([zone, items]) => `\n${zone}:\n${items.map(i => `  - ${i}`).join('\n')}`).join('\n')
    const summary = `CHECKLIST SELECCIONADO (${checkedCount} de ${allItems} marcados)\n${text}`
    navigator.clipboard.writeText(summary).then(() => { setSent(true); setTimeout(() => setSent(false), 3000) })
  }

  return (
    <div style={{ background: '#fff', color: '#111', minHeight: '100vh', fontFamily: '-apple-system,sans-serif' }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.35) rotate(8deg)} 100%{transform:scale(1)} }
        .pop { animation: pop 0.35s ease; }
      `}</style>

      {/* NAV */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '0 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#111' }}>
            <img src="/isotipo-gradient.svg" alt="" width={24} height={14} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Itineramio</span>
          </a>
          <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Download size={14} /> Descargar PDF
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '48px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 300, lineHeight: 1.15, marginBottom: 12 }}>
          Checklist de compras para tu <span style={{ color: '#7c3aed' }}>Airbnb</span>
        </h1>
        <p style={{ fontSize: 15, color: '#999', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
          Todo lo que tienes que comprar. Marca, añade los tuyos, y descarga el PDF.
        </p>
        <div style={{ maxWidth: 360, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: '#ccc' }}>Progreso</span>
            <span style={{ color: '#666', fontWeight: 500 }}>{checkedCount}/{allItems} — {pct}%</span>
          </div>
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#7c3aed', borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 12 }}>
            {Object.entries(BADGE).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#aaa' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: v.color }} />{v.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHECKLIST */}
      <div style={{ padding: '0 16px 48px', maxWidth: 700, margin: '0 auto' }}>
        {ZONES.map(zone => {
          const isOpen = !!openZones[zone.id]
          const customs = customItems[zone.id] || []
          const totalZone = zone.items.length + customs.length
          const zc = zone.items.filter((_, i) => checked[`${zone.id}-${i}`]).length + customs.filter((_, i) => checked[`${zone.id}-c${i}`]).length
          const allDone = zc === totalZone && totalZone > 0

          return (
            <div key={zone.id} style={{ marginBottom: 6, borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
              <div onClick={() => setOpenZones(p => ({ ...p, [zone.id]: !p[zone.id] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: allDone ? '#f0fdf4' : '#fafafa', cursor: 'pointer' }}>
                {allDone && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" strokeWidth={3} /></div>}
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{zone.name}</span>
                {allDone && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>COMPLETO</span>}
                <span style={{ fontSize: 11, color: '#ccc', marginRight: 8 }}>{zc}/{totalZone}</span>
                <ChevronDown size={14} color="#ccc" style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
              </div>

              {isOpen && (
                <div style={{ padding: '4px 12px 12px' }}>
                  {zone.items.map((item, i) => {
                    const key = `${zone.id}-${i}`
                    const on = !!checked[key]
                    const b = BADGE[item.l]
                    return (
                      <div key={key} onClick={() => {
                        setChecked(p => ({ ...p, [key]: !p[key] }))
                        if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 350) }
                      }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 6, cursor: 'pointer', background: on ? '#f5f3ff' : 'transparent' }}>
                        <div className={popKey === key ? 'pop' : ''} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${on ? '#7c3aed' : '#ddd'}`, background: on ? '#7c3aed' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {on && <Check size={12} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ flex: 1, fontSize: 14, color: on ? '#bbb' : '#444', textDecoration: on ? 'line-through' : 'none' }}>{item.t}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: b.bg, color: b.color, flexShrink: 0 }}>{b.label}</span>
                      </div>
                    )
                  })}

                  {customs.map((item, i) => {
                    const key = `${zone.id}-c${i}`
                    const on = !!checked[key]
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 6, background: on ? '#f0fdf4' : 'transparent' }}>
                        <div onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })); if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 350) } }}
                          className={popKey === key ? 'pop' : ''} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${on ? '#22c55e' : '#ddd'}`, background: on ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' }}>
                          {on && <Check size={12} color="#fff" strokeWidth={3} />}
                        </div>
                        <span onClick={() => { setChecked(p => ({ ...p, [key]: !p[key] })); if (!on) { setPopKey(key); setTimeout(() => setPopKey(null), 350) } }}
                          style={{ flex: 1, fontSize: 14, color: on ? '#bbb' : '#444', textDecoration: on ? 'line-through' : 'none', cursor: 'pointer' }}>{item}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: '#f0fdf4', color: '#22c55e', flexShrink: 0 }}>TUYO</span>
                        <button onClick={() => removeCustomItem(zone.id, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ddd' }}><Trash2 size={14} /></button>
                      </div>
                    )
                  })}

                  {addingTo === zone.id ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '4px 8px' }}>
                      <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomItem(zone.id)}
                        placeholder="Escribe el item..." autoFocus style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, outline: 'none' }} />
                      <button onClick={() => addCustomItem(zone.id)} style={{ padding: '8px 14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Añadir</button>
                      <button onClick={() => { setAddingTo(null); setNewItem('') }} style={{ padding: '8px 10px', background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#999' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <div onClick={() => setAddingTo(zone.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 8px', marginTop: 4, cursor: 'pointer', color: '#bbb', fontSize: 13, borderRadius: 6 }}>
                      <Plus size={14} /> Añadir item personalizado
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Buttons */}
        <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button onClick={copySelection} style={{ padding: '14px 28px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {sent ? <><Check size={16} /> Copiado — pégamelo en el chat</> : <><Send size={16} /> Enviar selección ({checkedCount} items)</>}
          </button>
          <button onClick={() => setShowModal(true)} style={{ padding: '14px 28px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={16} /> Descargar checklist en PDF
          </button>
        </div>
      </div>

      {/* SEO */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '48px 24px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 20 }}>La lista de compras definitiva para tu Airbnb</h2>
        <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>Un escurridor de pasta, un sacacorchos, una plancha — las cosas que solo echas en falta cuando el huésped te escribe a las 10 de la noche preguntando.</p>
        <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7 }}>Cada item clasificado en: <strong style={{ color: '#ef4444' }}>MUST</strong> (sin esto hay queja), <strong style={{ color: '#f59e0b' }}>SHOULD</strong> (marca la diferencia) y <strong style={{ color: '#7c3aed' }}>WOW</strong> (aparece en la reseña).</p>
      </div>

      {/* CTA */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 12 }}>¿Ya tienes todo comprado?</h2>
        <p style={{ color: '#aaa', marginBottom: 24, fontSize: 15 }}>El siguiente paso: que tu huésped sepa dónde está cada cosa sin preguntarte.</p>
        <a href="/landing-tes" style={{ padding: '14px 28px', background: '#111', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Conoce Itineramio <ArrowRight size={14} />
        </a>
      </div>

      <div style={{ borderTop: '1px solid #f0f0f0', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#ddd' }}>Itineramio</p>
      </div>

      {/* MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.35)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            {done ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Check size={24} color="#fff" /></div>
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>Enviado</h3>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Revisa tu email.</p>
                <button onClick={() => { setShowModal(false); setDone(false) }} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cerrar</button>
              </div>
            ) : (
              <form onSubmit={async (e) => { e.preventDefault(); setSending(true); await new Promise(r => setTimeout(r, 1500)); setSending(false); setDone(true) }}>
                <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 500 }}>Descargar checklist</h3>
                  <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 12, color: '#aaa', padding: '4px 20px 16px' }}>Te lo enviamos al email en PDF.</p>
                <div style={{ padding: '0 20px 20px' }}>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" style={{ width: '100%', padding: '10px 14px', border: '1px solid #eee', borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' as const }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" style={{ width: '100%', padding: '10px 14px', border: '1px solid #eee', borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' as const }} />
                  <select value={props} onChange={e => setProps(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: '1px solid #eee', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' as const }}>
                    <option value="">¿Cuántas propiedades?</option>
                    <option>1</option><option>2-3</option><option>4-6</option><option>7-10</option><option>Más de 10</option>
                  </select>
                  <button type="submit" disabled={sending} style={{ width: '100%', padding: 12, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
                    {sending ? 'Enviando...' : 'Descargar gratis'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
