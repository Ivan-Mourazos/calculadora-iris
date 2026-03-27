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
      modelo: '',
      cofre: '',
      guia: '',
      mecanismo: '',
      swbs: '',
      entreParedes: '',
      tela: '',
      cristal: '',
      lacado: '',
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
        modelo: '',
        cofre: '',
        guia: '',
        mecanismo: '',
        swbs: '',
        entreParedes: '',
        tela: '',
        cristal: '',
        lacado: '',
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

  const isOrderBlocked = toldos.some(t => t.result?.status === 'VERMELLO' || t.result?.status === 'ERROR')
  const isOrderEmpty = toldos.some(t => !t.result)

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans pb-32">
      {/* Header Premium */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 border-r border-slate-200 pr-3 sm:pr-6">
              <img src="/faviconTGM.png" alt="TGM Logo" className="h-8 sm:h-10 w-auto object-contain brightness-110 drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-0.5 sm:mb-1 truncate">
                Calculadora Iris
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest sm:tracking-[0.2em] truncate">
                Toldos Gómez
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Activo</span>
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
                    <Select label="Tea / Lona" value={toldo.tela} options={catalog.telas} onChange={v => updateToldo(toldo.id, { tela: v })} search />
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
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-1.5 flex-1 group relative">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1.5 transition-colors group-focus-within:text-[#FBAB18]">{label}</label>
      <div className="relative" onClick={() => {
        setIsOpen(!isOpen)
        if (!isOpen) setSearchTerm('')
      }}>
        <input 
          type="text"
          inputMode="search"
          enterKeyHint="done"
          readOnly={!isOpen && !search}
          value={isOpen ? searchTerm : value}
          onFocus={() => {
            if (!isOpen) {
              setIsOpen(true)
              setSearchTerm('')
            }
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 250)}
          onChange={e => {
            e.stopPropagation()
            setSearchTerm(e.target.value)
          }}
          placeholder="Seleccione ou busque..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold focus:border-[#FBAB18] focus:ring-4 focus:ring-[#FBAB18]/5 outline-none transition-all hover:border-slate-300 text-slate-900 shadow-sm cursor-pointer"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-[#FBAB18] transition-colors">
          <ChevronRight size={18} strokeWidth={3} className={isOpen ? '-rotate-90' : 'rotate-90'} />
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-amber-50 transition-colors border-b border-slate-50 last:border-0 ${value === opt ? 'text-[#FBAB18] font-black bg-amber-50/30' : 'text-slate-700'}`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                Sen resultados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalInput({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2 pl-1.5 transition-colors group-focus-within:text-[#FBAB18]">
        {icon}
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-2xl p-4 text-sm font-semibold focus:border-[#FBAB18] focus:ring-4 focus:ring-[#FBAB18]/5 outline-none transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-300 shadow-sm"
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
      case 'AMARELO': return 'bg-amber-50 border-amber-200 text-amber-700 shadow-lg shadow-amber-500/10'
      case 'VERMELLO': return 'bg-rose-50 border-rose-200 text-rose-700 shadow-lg shadow-rose-500/10'
      case 'ERROR': return 'bg-red-50 border-red-200 text-red-700 shadow-lg shadow-red-500/10'
      default: return 'bg-slate-50'
    }
  }

  return (
    <div className="space-y-8 mt-12 bg-slate-50/50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-inner">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
        <Ruler size={14} className="text-[#FBAB18]" />
        Medidas de Oco
      </h3>
      
      <div className="relative aspect-[4/3] sm:aspect-video bg-white rounded-3xl border-2 border-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden shadow-2xl shadow-slate-200/40">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#FBAB18',stopOpacity:0.25}} />
              <stop offset="100%" style={{stopColor:'#FBAB18',stopOpacity:0.1}} />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
            </filter>
          </defs>
          
          {/* Sombra de fondo para el trazo principal */}
          <path d="M 40,40 L 160,40 L 170,110 L 30,110 Z" fill="url(#grad)" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Trazo principal */}
          <path d="M 40,40 L 160,40 L 170,110 L 30,110 Z" fill="none" stroke="#FBAB18" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Diagonales con más contraste y etiquetas */}
          <line x1="40" y1="40" x2="170" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6" />
          <line x1="160" y1="40" x2="30" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6" />
          
          <g filter="url(#shadow)" className="text-[10px] fill-slate-500 font-black">
            <text x="65" y="60" textAnchor="middle">D1</text>
            <text x="135" y="60" textAnchor="middle">D2</text>
          </g>
          
          {/* Etiquetas con fondo para legibilidad máxima */}
          <g filter="url(#shadow)">
            <text x="100" y="28" textAnchor="middle" className="text-[11px] fill-slate-900 uppercase font-black tracking-widest bg-white">Arriba</text>
            <text x="100" y="132" textAnchor="middle" className="text-[11px] fill-slate-900 uppercase font-black tracking-widest">Abaixo</text>
            
            <text x="12" y="78" textAnchor="middle" className="text-[10px] fill-slate-900 uppercase font-black tracking-widest [writing-mode:vertical-rl]">Esquerda</text>
            <text x="188" y="78" textAnchor="middle" className="text-[10px] fill-slate-900 uppercase font-black tracking-widest [writing-mode:vertical-rl]">Dereita</text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MeasurementInput label="Fronte Superior" value={measurements.fSup} onChange={v => handleNumInput('fSup', v)} />
        <MeasurementInput label="Fronte Inferior" value={measurements.fInf} onChange={v => handleNumInput('fInf', v)} />
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
                    Desfase: <span className="font-mono text-base ml-2">{result.errorCm.toFixed(1)} cm</span>
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
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight pl-1.5 group-focus-within:text-[#FBAB18] transition-colors">
        {label}
      </label>
      <input 
        type="number" 
        inputMode="decimal"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-lg font-mono font-bold focus:border-[#FBAB18] focus:ring-4 focus:ring-[#FBAB18]/5 outline-none transition-all placeholder:text-slate-200 text-slate-900 shadow-sm shadow-slate-200/50"
        placeholder="0.0"
      />
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  const size = 32
  switch (status) {
    case 'VERDE': return <CheckCircle size={size} className="flex-shrink-0" />
    case 'AMARELO': return <AlertTriangle size={size} className="flex-shrink-0" />
    case 'VERMELLO': return <AlertTriangle size={size} className="flex-shrink-0" />
    case 'ERROR': return <XCircle size={size} className="flex-shrink-0" />
    default: return null
  }
}

export default App
