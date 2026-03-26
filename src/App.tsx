import { useState } from 'react'
import { Ruler, AlertTriangle, CheckCircle, XCircle, ChevronRight, Plus, Trash2, ClipboardList, User, Calendar, Settings, Box, Palette } from 'lucide-react'
import { validateMeasurements, type Measurements, type ValidationResult } from './utils/geometry'
import catalog from './data/catalog.json'

interface ToldoData {
  id: string;
  of: string;
  modelo: string;
  cofre: string;
  guia: string;
  mecanismo: string;
  swbs: string;
  entreParedes: string;
  tela: string;
  cristal: string;
  lacado: string;
  measurements: Measurements;
  result: ValidationResult | null;
}

interface OrderInfo {
  pedido: string;
  cliente: string;
  tecnico: string;
  data: string;
}

function App() {
  const [order, setOrder] = useState<OrderInfo>({
    pedido: '',
    cliente: '',
    tecnico: '',
    data: new Date().toISOString().split('T')[0]
  })

  const [toldos, setToldos] = useState<ToldoData[]>([
    {
      id: crypto.randomUUID(),
      of: '',
      modelo: catalog.modelos[0],
      cofre: catalog.cofre[0],
      guia: catalog.guiaCompensadora[0],
      mecanismo: catalog.mecanismo[0],
      swbs: catalog.swbs[0],
      entreParedes: catalog.entreParedes[0],
      tela: catalog.telas[0],
      cristal: catalog.cristal[0],
      lacado: catalog.lacados[0],
      measurements: { fSup: 0, fInf: 0, sIzq: 0, sDer: 0, diag1: 0, diag2: 0 },
      result: null
    }
  ])

  const addToldo = () => {
    setToldos(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        of: '',
        modelo: catalog.modelos[0],
        cofre: catalog.cofre[0],
        guia: catalog.guiaCompensadora[0],
        mecanismo: catalog.mecanismo[0],
        swbs: catalog.swbs[0],
        entreParedes: catalog.entreParedes[0],
        tela: catalog.telas[0],
        cristal: catalog.cristal[0],
        lacado: catalog.lacados[0],
        measurements: { fSup: 0, fInf: 0, sIzq: 0, sDer: 0, diag1: 0, diag2: 0 },
        result: null
      }
    ])
  }

  const removeToldo = (id: string) => {
    if (toldos.length > 1) {
      setToldos(prev => prev.filter(t => t.id !== id))
    }
  }

  const updateToldo = (id: string, updates: Partial<ToldoData>) => {
    setToldos(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates }
        if (updates.measurements) {
          const m = updates.measurements
          if (m.fSup > 0 && m.fInf > 0 && m.sIzq > 0 && m.sDer > 0 && m.diag1 > 0 && m.diag2 > 0) {
            updated.result = validateMeasurements(m)
          } else {
            updated.result = null
          }
        }
        return updated
      }
      return t
    }))
  }

  const isOrderBlocked = toldos.some(t => t.result?.status === 'ROJO' || t.result?.status === 'ERROR')
  const isOrderEmpty = toldos.some(t => !t.result)

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans pb-32">
      {/* Header Premium */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#FBAB18]/10 p-2 rounded-2xl">
              <img src="https://www.toldosgomez.com/images/logo.png" alt="TGM Logo" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Calculadora Iris
                <span className="text-[10px] bg-[#FBAB18] text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Pro</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Xestión de Medidas Toldos Gómez</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pt-8">
        {/* Datos do Pedido */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl shadow-slate-200/50">
          <GlobalInput label="Cliente" value={order.cliente} onChange={v => setOrder(prev => ({ ...prev, cliente: v }))} icon={<User size={14} />} />
          <GlobalInput label="Pedido / Oportunidade" value={order.pedido} onChange={v => setOrder(prev => ({ ...prev, pedido: v }))} icon={<ClipboardList size={14} />} />
          <GlobalInput label="Técnico" value={order.tecnico} onChange={v => setOrder(prev => ({ ...prev, tecnico: v }))} icon={<User size={14} />} />
          <GlobalInput label="Data" type="date" value={order.data} onChange={v => setOrder(prev => ({ ...prev, data: v }))} icon={<Calendar size={14} />} />
        </section>

        <div className="space-y-16">
          {toldos.map((toldo, index) => (
            <div key={toldo.id} className="relative group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-[#FBAB18]/5 transition-all duration-500">
              <div className="absolute -left-1 top-12 bottom-12 w-1.5 bg-[#FBAB18]/20 rounded-full group-focus-within:bg-[#FBAB18] transition-all" />
              
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black flex items-center gap-4 text-slate-900">
                  <span className="bg-[#FBAB18] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl shadow-amber-900/10 -rotate-3 group-hover:rotate-0 transition-transform font-black">
                    {index + 1}
                  </span>
                  Toldo {index + 1}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-inner">
                    <span className="text-[10px] font-black text-slate-400 uppercase">OF</span>
                    <input 
                      placeholder="00000"
                      value={toldo.of}
                      onChange={e => updateToldo(toldo.id, { of: e.target.value })}
                      className="bg-transparent text-sm outline-none w-20 text-right font-mono font-bold text-slate-900"
                    />
                  </div>
                  {toldos.length > 1 && (
                    <button onClick={() => removeToldo(toldo.id)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Configuración Técnica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-[#FBAB18] uppercase tracking-[0.2em] flex items-center gap-2 mb-6 border-b border-amber-100 pb-2">
                    <Box size={14} />
                    Modelo e Configuración
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Select label="Modelo" value={toldo.modelo} options={catalog.modelos} onChange={v => updateToldo(toldo.id, { modelo: v })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Cofre" value={toldo.cofre} options={catalog.cofre} onChange={v => updateToldo(toldo.id, { cofre: v })} />
                      <Select label="Cristal" value={toldo.cristal} options={catalog.cristal} onChange={v => updateToldo(toldo.id, { cristal: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Mecanismo" value={toldo.mecanismo} options={catalog.mecanismo} onChange={v => updateToldo(toldo.id, { mecanismo: v })} />
                      <Select label="Guía Comp." value={toldo.guia} options={catalog.guiaCompensadora} onChange={v => updateToldo(toldo.id, { guia: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="SWBS" value={toldo.swbs} options={catalog.swbs} onChange={v => updateToldo(toldo.id, { swbs: v })} />
                      <Select label="Entre Paredes" value={toldo.entreParedes} options={catalog.entreParedes} onChange={v => updateToldo(toldo.id, { entreParedes: v })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-[#FBAB18] uppercase tracking-[0.2em] flex items-center gap-2 mb-6 border-b border-amber-100 pb-2">
                    <Palette size={14} />
                    Materiais e Acabados
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Select label="Tela / Lona" value={toldo.tela} options={catalog.telas} onChange={v => updateToldo(toldo.id, { tela: v })} search />
                    <Select label="Lacado / RAL" value={toldo.lacado} options={catalog.lacados} onChange={v => updateToldo(toldo.id, { lacado: v })} />
                  </div>
                </div>
              </div>

              <MeasurementBlock 
                measurements={toldo.measurements} 
                onUpdate={m => updateToldo(toldo.id, { measurements: m })} 
                result={toldo.result}
              />
            </div>
          ))}
        </div>

        <button onClick={addToldo} className="w-full mt-12 py-6 border-2 border-dashed border-slate-300 rounded-[2rem] text-slate-400 hover:border-[#FBAB18] hover:text-[#FBAB18] hover:bg-amber-50/50 flex items-center justify-center gap-3 transition-all group font-black uppercase text-sm tracking-widest shadow-lg shadow-slate-200/20">
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          Engadir outro toldo
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50">
        <div className="max-w-2xl mx-auto">
          <button 
            disabled={isOrderBlocked || isOrderEmpty}
            className={`w-full py-6 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl tracking-tight
              ${(isOrderBlocked || isOrderEmpty) 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                : 'bg-[#FBAB18] text-white shadow-[#FBAB18]/30 active:scale-[0.98] hover:scale-[1.01] hover:brightness-105'}`}
          >
            GARDAR PEDIDO COMPLETO
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Select({ label, value, options, onChange, search = false }: { label: string, value: string, options: string[], onChange: (v: string) => void, search?: boolean }) {
  return (
    <div className="flex flex-col gap-2 flex-1 group">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1 transition-colors group-focus-within:text-[#FBAB18]">{label}</label>
      <div className="relative">
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm focus:border-[#FBAB18] focus:shadow-[0_8px_30px_rgb(251,171,24,0.12)] outline-none transition-all appearance-none cursor-pointer hover:border-slate-300 text-slate-900 shadow-sm"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={16} strokeWidth={3} className="rotate-90" />
        </div>
      </div>
    </div>
  )
}

function GlobalInput({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, type?: string }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2 pl-1 transition-colors group-focus-within:text-[#FBAB18]">
        {icon}
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#FBAB18] focus:shadow-[0_8px_30px_rgb(251,171,24,0.12)] outline-none transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-200 shadow-sm"
        placeholder={`Introduza ${label.toLowerCase()}...`}
      />
    </div>
  )
}

function MeasurementBlock({ measurements, onUpdate, result }: { measurements: Measurements, onUpdate: (m: Measurements) => void, result: ValidationResult | null }) {
  const handleNumInput = (key: keyof Measurements, val: string) => {
    const num = parseFloat(val) || 0
    onUpdate({ ...measurements, [key]: num })
  }

  const getStatusColor = () => {
    if (!result) return 'bg-slate-50 border-slate-200'
    switch (result.status) {
      case 'VERDE': return 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-lg shadow-emerald-500/10'
      case 'AMARILLO': return 'bg-amber-50 border-amber-200 text-amber-700 shadow-lg shadow-amber-500/10'
      case 'ROJO': return 'bg-rose-50 border-rose-200 text-rose-700 shadow-lg shadow-rose-500/10'
      case 'ERROR': return 'bg-red-50 border-red-200 text-red-700 shadow-lg shadow-red-500/10'
      default: return 'bg-slate-50'
    }
  }

  return (
    <div className="space-y-8 mt-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
        <Ruler size={14} className="text-[#FBAB18]" />
        Medidas de Hueco
      </h3>
      
      <div className="relative aspect-video bg-white rounded-3xl border border-slate-200 flex items-center justify-center p-6 overflow-hidden shadow-xl shadow-slate-200/50">
        <svg viewBox="0 0 200 150" className="w-full h-full opacity-90">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#FBAB18',stopOpacity:0.15}} />
              <stop offset="100%" style={{stopColor:'#FBAB18',stopOpacity:0.05}} />
            </linearGradient>
            <filter id="glow">
               <feGaussianBlur stdDeviation="1.5" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path d="M 40,40 L 160,40 L 170,110 L 30,110 Z" fill="url(#grad)" stroke="#FBAB18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="40" y1="40" x2="170" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
          <line x1="160" y1="40" x2="30" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
          <text x="100" y="32" textAnchor="middle" className="text-[9px] fill-slate-500 uppercase font-black tracking-widest">Arriba</text>
          <text x="100" y="125" textAnchor="middle" className="text-[9px] fill-slate-500 uppercase font-black tracking-widest">Abaixo</text>
          <text x="25" y="75" textAnchor="middle" className="text-[9px] fill-slate-500 uppercase font-black tracking-widest [writing-mode:vertical-rl]">Esquerda</text>
          <text x="175" y="75" textAnchor="middle" className="text-[9px] fill-slate-500 uppercase font-black tracking-widest [writing-mode:vertical-rl]">Dereita</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <MeasurementInput label="Frente Superior" value={measurements.fSup} onChange={v => handleNumInput('fSup', v)} />
        <MeasurementInput label="Frente Inferior" value={measurements.fInf} onChange={v => handleNumInput('fInf', v)} />
        <MeasurementInput label="S. Esquerda" value={measurements.sIzq} onChange={v => handleNumInput('sIzq', v)} />
        <MeasurementInput label="S. Dereita" value={measurements.sDer} onChange={v => handleNumInput('sDer', v)} />
        <MeasurementInput label="Diagonal 1" value={measurements.diag1} onChange={v => handleNumInput('diag1', v)} />
        <MeasurementInput label="Diagonal 2" value={measurements.diag2} onChange={v => handleNumInput('diag2', v)} />
      </div>

      {result && (
        <div className={`p-6 rounded-3xl border-2 transition-all duration-500 shadow-2xl ${getStatusColor()}`}>
          <div className="flex items-start gap-4">
            <StatusIcon status={result.status} />
            <div className="flex-1">
              <p className="font-black text-lg mb-1 leading-tight">{result.message}</p>
              {result.isPossible && (
                <div className="flex items-center gap-4 mt-2 border-t border-current/10 pt-2">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                    Desfase: <span className="font-mono text-base ml-2">{result.errorMm.toFixed(1)} mm</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MeasurementInput({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight pl-1 group-focus-within:text-[#FBAB18] transition-colors">
        {label}
      </label>
      <input 
        type="number" 
        inputMode="decimal"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-lg font-mono font-bold focus:border-[#FBAB18] focus:shadow-[0_8px_30px_rgb(251,171,24,0.12)] focus:scale-[1.02] outline-none transition-all placeholder:text-slate-100 text-slate-900 shadow-sm shadow-slate-200/50"
        placeholder="0.0"
      />
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  const size = 32
  switch (status) {
    case 'VERDE': return <CheckCircle size={size} className="flex-shrink-0" />
    case 'AMARILLO': return <AlertTriangle size={size} className="flex-shrink-0" />
    case 'ROJO': return <AlertTriangle size={size} className="flex-shrink-0" />
    case 'ERROR': return <XCircle size={size} className="flex-shrink-0" />
    default: return null
  }
}

export default App
