import { useState } from 'react'
import { Ruler, AlertTriangle, CheckCircle, XCircle, ChevronRight, Plus, Trash2, Box, Palette, User, ClipboardList } from 'lucide-react'
import { validateMeasurements, type Measurements, type ValidationResult } from './utils/geometry'
import catalog from './data/catalog.json'

interface Toldo {
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

function App() {
  const [isClientDataCollapsed, setIsClientDataCollapsed] = useState(false)
  const [clientData, setClientData] = useState({
    pedido: '',
    responsable: ''
  })
  
  const [toldos, setToldos] = useState<Toldo[]>([
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
    // Ao engadir un toldo, se os datos do cliente están listos, colapsamos para dar espazo
    if (clientData.pedido && clientData.responsable) {
      setIsClientDataCollapsed(true);
    }
  }

  const removeToldo = (id: string) => {
    if (toldos.length > 1) {
      setToldos(prev => prev.filter(t => t.id !== id))
    }
  }

  const updateToldo = (id: string, updates: Partial<Toldo>) => {
    setToldos(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates }
        if (updates.measurements || updates.modelo) {
          const m = updated.measurements
          if (m.fSup > 0 && m.sIzq > 0 && m.sDer > 0 && m.diag1 > 0 && m.diag2 > 0) {
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

  const isClientDataComplete = clientData.pedido && clientData.responsable;
  const isOrderBlocked = toldos.some(t => t.result?.status === 'VERMELLO' || t.result?.status === 'ERROR')
  const isOrderEmpty = toldos.some(t => !t.result)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32 selection:bg-blue-100">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/faviconTGM.png" 
              alt="Logo TGM" 
              className="h-10 w-10 object-contain"
              onError={(e) => { e.currentTarget.src = 'https://www.toldosgomez.com/favicon.ico' }}
            />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">
                CALCULADORA IRIS
              </h1>
              <p className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-1">
                Toldos Gómez
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Activa</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        
        {/* Sección de Datos de Cliente (Colapsable) */}
        <section className={`bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden transition-all duration-500 ${isClientDataCollapsed ? 'max-h-24' : 'max-h-[500px]'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <User size={18} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Datos do Cliente</h2>
              </div>
              {isClientDataComplete && (
                <button 
                  onClick={() => setIsClientDataCollapsed(!isClientDataCollapsed)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  {isClientDataCollapsed ? 'EDITAR' : 'CONFIRMAR'}
                </button>
              )}
            </div>

            {isClientDataCollapsed ? (
              <div className="flex gap-3 flex-wrap animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Pedido:</span>
                  <span className="text-xs font-bold text-blue-800">{clientData.pedido}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Responsable:</span>
                  <span className="text-xs font-bold text-slate-700">{clientData.responsable}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                <GlobalInput 
                  label="Pedido / Oportunidade" 
                  value={clientData.pedido} 
                  onChange={v => setClientData({...clientData, pedido: v})} 
                  icon={<ClipboardList size={14} />} 
                />
                <GlobalInput 
                  label="Responsable da Medición" 
                  value={clientData.responsable} 
                  onChange={v => setClientData({...clientData, responsable: v})} 
                  icon={<User size={14} />} 
                />
              </div>
            )}
          </div>
        </section>

        {/* Lista de Toldos */}
        <div className="space-y-12">
          {toldos.map((toldo, index) => (
            <div key={toldo.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40 relative">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">Toldo {index + 1}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OF</span>
                    <input 
                      value={toldo.of}
                      onChange={e => updateToldo(toldo.id, { of: e.target.value })}
                      placeholder="00000"
                      className="bg-transparent text-sm font-bold text-slate-900 outline-none w-16 text-right"
                    />
                  </div>
                  {toldos.length > 1 && (
                    <button onClick={() => removeToldo(toldo.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Box size={14} /> Configuración Técnica
                  </h4>
                  <div className="space-y-4">
                    <Select label="Modelo" value={toldo.modelo} options={catalog.modelos} onChange={v => updateToldo(toldo.id, { modelo: v })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Cofre" value={toldo.cofre} options={catalog.cofre} onChange={v => updateToldo(toldo.id, { cofre: v })} />
                      <Select label="Mecanismo" value={toldo.mecanismo} options={catalog.mecanismo} onChange={v => updateToldo(toldo.id, { mecanismo: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Guía Comp." value={toldo.guia} options={catalog.guiaCompensadora} onChange={v => updateToldo(toldo.id, { guia: v })} />
                      <Select label="Entre Paredes" value={toldo.entreParedes} options={catalog.entreParedes} onChange={v => updateToldo(toldo.id, { entreParedes: v })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Palette size={14} /> Materiais e Acabados
                  </h4>
                  <div className="space-y-4">
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

        <button onClick={addToldo} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-[2.5rem] text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest">
          <Plus size={20} /> Engadir outro toldo
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-[100]">
        <div className="max-w-4xl mx-auto">
          <button 
            disabled={isOrderBlocked || isOrderEmpty || !isClientDataComplete}
            className={`w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl
              ${(isOrderBlocked || isOrderEmpty || !isClientDataComplete) 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                : 'bg-blue-600 text-white shadow-blue-500/20 active:scale-95'}`}
          >
            {isClientDataComplete ? 'GARDAR PEDIDO COMPLETO' : 'COMPLETA DATOS DO CLIENTE'}
            <ChevronRight size={20} strokeWidth={3} />
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
    <div className="flex flex-col gap-1.5 flex-1 relative">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">{label}</label>
      <div className="relative">
        <input 
          readOnly={!search}
          value={isOpen && search ? searchTerm : value}
          onFocus={() => { setIsOpen(true); if(search) setSearchTerm(''); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onChange={e => search && setSearchTerm(e.target.value)}
          onMouseDown={(e) => {
            if (document.activeElement === e.currentTarget && !search) {
              setIsOpen(!isOpen);
              e.preventDefault();
            }
          }}
          placeholder="Seleccionar..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={16} className={isOpen ? '-rotate-90' : 'rotate-90'} transition-transform="true" />
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[150] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${value === opt ? 'text-blue-600 font-black bg-blue-50/50' : 'text-slate-700'}`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Sen resultados</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalInput({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2 pl-1">
        {icon} {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
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

  const getStatusClasses = () => {
    if (!result) return 'bg-slate-50 border-slate-200'
    switch (result.status) {
      case 'VERDE': return 'bg-emerald-50 border-emerald-200 text-emerald-700'
      case 'AMARELO': return 'bg-amber-50 border-amber-200 text-amber-700'
      case 'VERMELLO': return 'bg-rose-50 border-rose-200 text-rose-700'
      case 'ERROR': return 'bg-red-50 border-red-200 text-red-700'
      default: return 'bg-slate-50'
    }
  }

  return (
    <div className="space-y-8 mt-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Ruler size={14} className="text-blue-600" /> Medidas de Oco (cm)
      </h4>
      
      <div className="relative aspect-video bg-white rounded-3xl border border-slate-200 flex items-center justify-center p-6 shadow-inner">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          <path d="M 40,40 L 160,40 L 170,110 L 30,110 Z" fill="#ebf3ff" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
          <line x1="40" y1="40" x2="170" y2="110" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
          <line x1="160" y1="40" x2="30" y2="110" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
          <g className="text-[10px] fill-slate-400 font-bold">
            <text x="65" y="60" textAnchor="middle">D1</text>
            <text x="135" y="60" textAnchor="middle">D2</text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <MeasurementInput label="Fronte Superior" value={measurements.fSup} onChange={v => handleNumInput('fSup', v)} />
        <MeasurementInput label="Fronte Inferior" value={measurements.fInf} onChange={v => handleNumInput('fInf', v)} />
        <MeasurementInput label="S. Esquerda" value={measurements.sIzq} onChange={v => handleNumInput('sIzq', v)} />
        <MeasurementInput label="S. Dereita" value={measurements.sDer} onChange={v => handleNumInput('sDer', v)} />
        <MeasurementInput label="Diagonal 1 (D1)" value={measurements.diag1} onChange={v => handleNumInput('diag1', v)} />
        <MeasurementInput label="Diagonal 2 (D2)" value={measurements.diag2} onChange={v => handleNumInput('diag2', v)} />
      </div>

      {result && (
        <div className={`p-6 rounded-3xl border-2 transition-all shadow-lg ${getStatusClasses()}`}>
          <div className="flex items-start gap-4">
            {result.status === 'VERDE' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            <div className="flex-1">
              <p className="font-black text-base">{result.message}</p>
              {result.sideOffsets && (
                <div className="mt-3 flex gap-4 pt-3 border-t border-current/10">
                  <div className="flex-1 text-center">
                    <p className="text-[9px] uppercase font-black opacity-60">Esq.</p>
                    <p className="font-mono text-xs font-bold">{result.sideOffsets.izq.toFixed(1)} cm</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[9px] uppercase font-black opacity-60">Der.</p>
                    <p className="font-mono text-xs font-bold">{result.sideOffsets.der.toFixed(1)} cm</p>
                  </div>
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight pl-1">{label}</label>
      <input 
        type="number" 
        inputMode="decimal"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-base font-mono font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
        placeholder="0.0"
      />
    </div>
  )
}

export default App;
