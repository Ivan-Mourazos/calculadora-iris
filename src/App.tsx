import { useState } from 'react'
import { Ruler, CheckCircle, XCircle, RotateCcw, AlertTriangle, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { 
  validateCommercialMeasurements, 
  calculateOutputOffsets, 
  type Measurements 
} from './utils/geometry'

function App() {
  const [step, setStep] = useState<'medidas' | 'desfases'>('medidas')
  const [measurements, setMeasurements] = useState<Measurements>({
    fSup: 0,
    fInf: 0,
    sIzq: 0,
    sDer: 0,
    diag1: 0,
    diag2: 0,
  })

  const handleNumInput = (key: keyof Measurements, val: string) => {
    const num = parseFloat(val) || 0
    setMeasurements(prev => ({ ...prev, [key]: num }))
  }

  const resetMeasurements = () => {
    setMeasurements({
      fSup: 0,
      fInf: 0,
      sIzq: 0,
      sDer: 0,
      diag1: 0,
      diag2: 0,
    })
    setStep('medidas')
  }

  const validation = validateCommercialMeasurements(measurements)
  const isFormActive = Object.values(measurements).some(v => v > 0)
  const isFormComplete = measurements.fSup > 0 && measurements.fInf > 0 && measurements.sIzq > 0 && measurements.sDer > 0 && measurements.diag1 > 0 && measurements.diag2 > 0

  const canProceed = isFormComplete && validation && (validation.status === 'CORRECTA' || validation.status === 'ACEPTABLE')
  
  const offsetResult = (isFormComplete && validation && validation.isPossible)
    ? calculateOutputOffsets(measurements, validation)
    : null

  const getValidationStatusClasses = () => {
    if (!validation) return 'bg-slate-50 border-slate-200 text-slate-400'
    switch (validation.status) {
      case 'CORRECTA':
        return 'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-emerald-100/50'
      case 'ACEPTABLE':
        return 'bg-amber-50/90 border-amber-200 text-amber-800 shadow-amber-100/50'
      case 'INCORRECTA':
        return 'bg-rose-50/90 border-rose-200 text-rose-800 shadow-rose-100/50'
      case 'IMPOSIBLE':
        return 'bg-red-50/80 border-red-200 text-red-800 shadow-red-100/50'
    }
  }

  // Default static coordinates (perfect rectangle - no slanted sides)
  let pA = { x: 15, y: 14 };
  let pB = { x: 185, y: 14 };
  let pC = { x: 185, y: 115 };
  let pD = { x: 15, y: 115 };

  // Only distort drawing in step 2 (fabrication offsets view)
  if (step === 'desfases' && isFormComplete && validation && validation.isPossible) {
    const { fSup } = measurements;
    const { h1, h2, dirX1, dirX2 } = validation.details;

    const multiplier = 5.0; // Exaggerate offsets in the drawing to make them highly visible
    const lA = { x: 0, y: 0 };
    const lB = { x: fSup, y: 0 };
    const lC = { x: fSup + dirX2 * multiplier, y: h2 };
    const lD = { x: -dirX1 * multiplier, y: h1 };

    const minX = Math.min(0, fSup, fSup + dirX2 * multiplier, -dirX1 * multiplier);
    const maxX = Math.max(0, fSup, fSup + dirX2 * multiplier, -dirX1 * multiplier);
    const minY = 0;
    const maxY = Math.max(h1, h2);

    const W = maxX - minX || 1;
    const H = maxY - minY || 1;

    // Bigger target bounds for dynamic drawing
    const targetW = 170;
    const targetH = 101;

    const scale = Math.min(targetW / W, targetH / H);

    const offsetX = 15 + (targetW - W * scale) / 2 - minX * scale;
    const offsetY = 14 + (targetH - H * scale) / 2 - minY * scale;

    pA = { x: lA.x * scale + offsetX, y: lA.y * scale + offsetY };
    pB = { x: lB.x * scale + offsetX, y: lB.y * scale + offsetY };
    pC = { x: lC.x * scale + offsetX, y: lC.y * scale + offsetY };
    pD = { x: lD.x * scale + offsetX, y: lD.y * scale + offsetY };
  }

  // Adjust text positions close to lines (dy="-4" shifts it perpendicular to line)
  const fSupX = (pA.x + pB.x) / 2;
  const fSupY = Math.min(pA.y, pB.y) - 5;

  const fInfX = (pC.x + pD.x) / 2;
  const fInfY = Math.max(pC.y, pD.y) + 11;

  const sIzqX = (pA.x + pD.x) / 2 - 8;
  const sIzqY = (pA.y + pD.y) / 2;
  const angleIzq = Math.atan2(pD.y - pA.y, pD.x - pA.x) * 180 / Math.PI - 180;

  const sDerX = (pB.x + pC.x) / 2 + 8;
  const sDerY = (pB.y + pC.y) / 2;
  const angleDer = Math.atan2(pC.y - pB.y, pC.x - pB.x) * 180 / Math.PI - 180;

  const diag1X = pA.x + (pC.x - pA.x) * 0.35;
  const diag1Y = pA.y + (pC.y - pA.y) * 0.45;

  const diag2X = pB.x + (pD.x - pB.x) * 0.35;
  const diag2Y = pB.y + (pD.y - pB.y) * 0.45;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/faviconTGM.png"
              alt="Logo TGM"
              className="h-8 w-8 object-contain"
            />
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-slate-900">
                ESCUADRO E EXACTITUDE
              </h1>
              <p className="text-[9px] font-bold text-blue-600 tracking-widest uppercase mt-0.5">
                Toldos Gómez
              </p>
            </div>
          </div>
          {isFormActive && (
            <button
              onClick={resetMeasurements}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              title="Limpar medidas"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Diagrama SVG interactivo */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Ruler size={14} className="text-blue-600" /> Esquema de Medidas (cm)
            </h2>
            {isFormComplete && validation && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                step === 'medidas'
                  ? (validation.status === 'CORRECTA' || validation.status === 'ACEPTABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
                  : (offsetResult?.status !== 'CRITICO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
              }`}>
                {step === 'medidas'
                  ? (validation.status === 'CORRECTA' || validation.status === 'ACEPTABLE' ? 'Válidas' : 'Incorrectas')
                  : (offsetResult?.status !== 'CRITICO' ? 'Escuadrado' : 'Desfase Crítico')
                }
              </span>
            )}
          </div>

          <div className="relative aspect-[16/9] bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center p-3">
            <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-sm">
              {/* Sombra base (sin esquinas redondeadas) */}
              <path d={`M ${pA.x},${pA.y} L ${pB.x},${pB.y} L ${pC.x},${pC.y} L ${pD.x},${pD.y} Z`} fill="#e2e8f0" opacity="0.3" />

              {/* O Trapezoide dinámico (líneas finas, sin esquinas redondeadas) */}
              <path d={`M ${pA.x},${pA.y} L ${pB.x},${pB.y} L ${pC.x},${pC.y} L ${pD.x},${pD.y} Z`} fill="#ffffff" stroke="#3b82f6" strokeWidth="1" strokeLinejoin="miter" />

              {/* Rectángulo de referencia e liñas de desfase no paso 2 */}
              {step === 'desfases' && offsetResult && validation && validation.details && (
                <g>
                  {/* Liña de base de referencia (recta horizontal teórica na base) */}
                  <line 
                    x1={validation.details.dirX1 < 0 ? pD.x : pA.x} 
                    y1={pD.y} 
                    x2={validation.details.dirX2 < 0 ? pC.x : pB.x} 
                    y2={pC.y} 
                    stroke="#cbd5e1" 
                    strokeWidth="1" 
                    strokeDasharray="3" 
                  />

                  {/* Lado Esquerdo (dinámico arriba/abaixo segundo o signo de dirX1) */}
                  {(() => {
                    const dirX1 = validation.details.dirX1;
                    const isLeftInward = dirX1 < 0; // dirX1 < 0 significa ángulo agudo (cara a dentro)
                    const refX = isLeftInward ? pD.x : pA.x;
                    const wallX = isLeftInward ? pA.x : pD.x;
                    const labelY = isLeftInward ? pA.y - 8 : pD.y + 9;
                    const arrowY = isLeftInward ? pA.y - 2.5 : pD.y + 4.5;
                    const lineY = isLeftInward ? pA.y : pD.y;

                    return (
                      <g>
                        {/* Liña vertical de referencia */}
                        <line x1={refX} y1={pA.y} x2={refX} y2={pD.y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3" />
                        {/* Liña horizontal de desfase (vermella) */}
                        <line x1={refX} y1={lineY} x2={wallX} y2={lineY} stroke="#f43f5e" strokeWidth="1.5" />
                        {/* Símbolo de frecha indicador de dirección */}
                        {offsetResult.offsetL > 0.05 && (
                          <text
                            x={(refX + wallX) / 2}
                            y={arrowY}
                            textAnchor="middle"
                            className="fill-rose-600 text-[6px] font-medium"
                          >
                            {wallX < refX ? '←' : '→'}
                          </text>
                        )}
                        {/* Texto do desfase */}
                        {offsetResult.offsetL > 0.05 && (
                          <text
                            x={(refX + wallX) / 2}
                            y={labelY}
                            textAnchor="middle"
                            className="fill-rose-600 text-[5.5px] font-medium"
                          >
                            {`${offsetResult.offsetL.toFixed(1)} cm`}
                          </text>
                        )}
                      </g>
                    );
                  })()}

                  {/* Lado Dereito (dinámico arriba/abaixo segundo o signo de dirX2) */}
                  {(() => {
                    const dirX2 = validation.details.dirX2;
                    const isRightInward = dirX2 < 0; // dirX2 < 0 significa ángulo agudo (cara a dentro)
                    const refX = isRightInward ? pC.x : pB.x;
                    const wallX = isRightInward ? pB.x : pC.x;
                    const labelY = isRightInward ? pB.y - 8 : pC.y + 9;
                    const arrowY = isRightInward ? pB.y - 2.5 : pC.y + 4.5;
                    const lineY = isRightInward ? pB.y : pC.y;

                    return (
                      <g>
                        {/* Liña vertical de referencia */}
                        <line x1={refX} y1={pB.y} x2={refX} y2={pC.y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3" />
                        {/* Liña horizontal de desfase (vermella) */}
                        <line x1={refX} y1={lineY} x2={wallX} y2={lineY} stroke="#f43f5e" strokeWidth="1.5" />
                        {/* Símbolo de frecha indicador de dirección */}
                        {offsetResult.offsetR > 0.05 && (
                          <text
                            x={(refX + wallX) / 2}
                            y={arrowY}
                            textAnchor="middle"
                            className="fill-rose-600 text-[6px] font-medium"
                          >
                            {wallX < refX ? '←' : '→'}
                          </text>
                        )}
                        {/* Texto do desfase */}
                        {offsetResult.offsetR > 0.05 && (
                          <text
                            x={(refX + wallX) / 2}
                            y={labelY}
                            textAnchor="middle"
                            className="fill-rose-600 text-[5.5px] font-medium"
                          >
                            {`${offsetResult.offsetR.toFixed(1)} cm`}
                          </text>
                        )}
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Diagonais */}
              <line
                x1={pA.x}
                y1={pA.y}
                x2={pC.x}
                y2={pC.y}
                stroke={measurements.diag1 > 0 ? "#d97706" : "#cbd5e1"}
                strokeWidth={measurements.diag1 > 0 ? "1.2" : "0.8"}
                strokeDasharray="3"
              />
              <line
                x1={pB.x}
                y1={pB.y}
                x2={pD.x}
                y2={pD.y}
                stroke={measurements.diag2 > 0 ? "#6366f1" : "#cbd5e1"}
                strokeWidth={measurements.diag2 > 0 ? "1.2" : "0.8"}
                strokeDasharray="3"
              />

              {/* Etiquetas e valores en tempo real */}
              <g className="text-[7px] font-medium uppercase tracking-tighter">
                {/* Frente Superior */}
                <text x={fSupX} y={fSupY} textAnchor="middle" className={measurements.fSup > 0 ? "fill-slate-900 text-[8px]" : "fill-blue-600"}>
                  {measurements.fSup > 0 ? `${measurements.fSup} cm` : "Fr. Sup"}
                </text>

                {/* Frente Inferior */}
                <text x={fInfX} y={fInfY} textAnchor="middle" className={measurements.fInf > 0 ? "fill-slate-900 text-[8px]" : "fill-blue-600"}>
                  {measurements.fInf > 0 ? `${measurements.fInf} cm` : "Fr. Inf"}
                </text>

                {/* Saída Esquerda */}
                <text x={sIzqX} y={sIzqY} textAnchor="middle" transform={`rotate(${angleIzq}, ${sIzqX}, ${sIzqY})`} className={measurements.sIzq > 0 ? "fill-slate-900 text-[8px]" : "fill-slate-400"}>
                  {measurements.sIzq > 0 ? `${measurements.sIzq} cm` : "S. Esq"}
                </text>

                {/* Saída Dereita */}
                <text x={sDerX} y={sDerY} textAnchor="middle" transform={`rotate(${angleDer}, ${sDerX}, ${sDerY})`} className={measurements.sDer > 0 ? "fill-slate-900 text-[8px]" : "fill-slate-400"}>
                  {measurements.sDer > 0 ? `${measurements.sDer} cm` : "S. Der"}
                </text>

                {/* Diagonal 1 (D1) */}
                <g>
                  <rect
                    x={diag1X - 14}
                    y={diag1Y - 5}
                    width="28"
                    height="10"
                    rx="2"
                    fill={measurements.diag1 > 0 ? "#fef3c7" : "#f1f5f9"}
                    stroke={measurements.diag1 > 0 ? "#f59e0b" : "#e2e8f0"}
                    strokeWidth="0.5"
                  />
                  <text
                    x={diag1X}
                    y={diag1Y + 2.5}
                    textAnchor="middle"
                    className={`text-[6px] font-medium ${measurements.diag1 > 0 ? "fill-amber-800" : "fill-slate-400"}`}
                  >
                    {measurements.diag1 > 0 ? `${measurements.diag1} cm` : "D1"}
                  </text>
                </g>

                {/* Diagonal 2 (D2) */}
                <g>
                  <rect
                    x={diag2X - 14}
                    y={diag2Y - 5}
                    width="28"
                    height="10"
                    rx="2"
                    fill={measurements.diag2 > 0 ? "#e0e7ff" : "#f1f5f9"}
                    stroke={measurements.diag2 > 0 ? "#6366f1" : "#e2e8f0"}
                    strokeWidth="0.5"
                  />
                  <text
                    x={diag2X}
                    y={diag2Y + 2.5}
                    textAnchor="middle"
                    className={`text-[6px] font-medium ${measurements.diag2 > 0 ? "fill-indigo-800" : "fill-slate-400"}`}
                  >
                    {measurements.diag2 > 0 ? `${measurements.diag2} cm` : "D2"}
                  </text>
                </g>
              </g>

              {/* Vértices eliminados para esquinas sen círculos */}
            </svg>
          </div>
        </div>

        {step === 'medidas' ? (
          <>
            {/* Formulario de Entrada (Mobile First - 2 columnas compactas) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Introducir Medidas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Frente Superior" value={measurements.fSup} onChange={v => handleNumInput('fSup', v)} icon="fS" />
                <NumInput label="Frente Inferior" value={measurements.fInf} onChange={v => handleNumInput('fInf', v)} icon="fI" />
                <NumInput label="Saída Esquerda" value={measurements.sIzq} onChange={v => handleNumInput('sIzq', v)} icon="sE" />
                <NumInput label="Saída Dereita" value={measurements.sDer} onChange={v => handleNumInput('sDer', v)} icon="sD" />
                <NumInput label="Diagonal 1 (D1)" value={measurements.diag1} onChange={v => handleNumInput('diag1', v)} color="amber" icon="D1" />
                <NumInput label="Diagonal 2 (D2)" value={measurements.diag2} onChange={v => handleNumInput('diag2', v)} color="indigo" icon="D2" />
              </div>
            </div>

            {/* Diagnóstico en tempo real */}
            {isFormComplete && validation ? (
              <div className={`p-5 rounded-3xl border shadow-md transition-all duration-300 animate-in zoom-in-95 ${getValidationStatusClasses()}`}>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="p-2.5 rounded-xl bg-white shadow-sm border border-current">
                    {validation.status === 'CORRECTA' || validation.status === 'ACEPTABLE' ? (
                      <CheckCircle size={22} className="text-emerald-600" />
                    ) : (
                      <XCircle size={22} className="text-rose-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Validación de Medidas</p>
                    <h4 className="text-lg font-black leading-none mt-0.5">
                      {validation.status === 'CORRECTA' && 'Correctas'}
                      {validation.status === 'ACEPTABLE' && 'Aceptables'}
                      {validation.status === 'INCORRECTA' && 'Incorrectas'}
                      {validation.status === 'IMPOSIBLE' && 'Imposibles'}
                    </h4>
                  </div>
                </div>
                <p className="text-xs font-bold leading-tight mb-4 opacity-90">{validation.message}</p>

                 {validation.isPossible && (
                  <div className="pt-4 border-t border-current/10 flex justify-center">
                    <div className="bg-white/50 backdrop-blur-sm py-3 px-6 rounded-2xl border border-current/5 text-center min-w-[150px]">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5">Erro na medida</p>
                      <p className="text-lg font-black">{validation.deviation.toFixed(2)}<span className="text-xs ml-0.5 font-bold">cm</span></p>
                    </div>
                  </div>
                )}

                {canProceed && (
                  <button
                    onClick={() => setStep('desfases')}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-wider py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group hover:scale-[1.02]"
                  >
                    <span>Ver desfases de saídas</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            ) : isFormActive ? (
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-3xl p-5 text-amber-800 flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Agardando medidas</h4>
                  <p className="text-[11px] font-bold opacity-90 mt-1">
                    Completa todas as medidas (frentes, saídas e diagonais) para calcular o escuadro.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100/50 border border-slate-200/50 rounded-3xl p-5 text-slate-500 flex items-start gap-3">
                <Ruler size={18} className="mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Sen datos</h4>
                  <p className="text-[11px] font-bold opacity-80 mt-1">
                    Introduce as dimensións arriba para verificar se as medidas están ben tomadas.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Step === 'desfases' */
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-300">
            {/* Panel de Desfases de Salidas */}
            {offsetResult && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Cálculos de Desfases
                  </h3>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    offsetResult.status === 'CORRECTO' ? 'bg-emerald-100 text-emerald-800' :
                    offsetResult.status === 'MODERADO' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {offsetResult.status}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {offsetResult.message}
                </p>

                {/* Tarjetas de Resultados */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Desfase Esq.</p>
                    <p className="text-2xl font-black text-slate-900">{offsetResult.offsetL.toFixed(1)}<span className="text-sm ml-0.5 font-bold text-slate-500">cm</span></p>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Desfase Der.</p>
                    <p className="text-2xl font-black text-slate-900">{offsetResult.offsetR.toFixed(1)}<span className="text-sm ml-0.5 font-bold text-slate-500">cm</span></p>
                  </div>
                </div>

                {/* Frente Toldo Final e Frente Inferior Teórico */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100/80 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/80 mb-1">Frente Toldo Final</p>
                    <p className="text-xl font-black text-blue-700">{offsetResult.frenteToldo.toFixed(1)}<span className="text-xs ml-0.5 font-bold text-blue-500">cm</span></p>
                    <p className="text-[8px] text-slate-400 mt-1 font-bold">Frente sup. con descontos</p>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Fr. Inf. Teórico</p>
                    <p className="text-xl font-black text-slate-800">{validation?.theoFInf.toFixed(1)}<span className="text-xs ml-0.5 font-bold text-slate-500">cm</span></p>
                    <p className="text-[8px] text-slate-400 mt-1 font-bold">Base sen erro de cota</p>
                  </div>
                </div>

                {/* Botón de Regreso */}
                <button
                  onClick={() => setStep('medidas')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase text-xs tracking-wider py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 group hover:scale-[1.01]"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  <span>Volver ás medidas</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function NumInput({
  label,
  value,
  onChange,
  color = 'blue',
  icon
}: {
  label: string
  value: number
  onChange: (v: string) => void
  color?: 'blue' | 'amber' | 'indigo'
  icon: string
}) {
  return (
    <div className="flex flex-col gap-1 relative group">
      <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest pl-1 truncate">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-tighter w-6 h-6 flex items-center justify-center rounded-lg border transition-all
          ${color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-600' :
            color === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-600' :
            'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
          {icon}
        </div>
        <input
          type="number"
          inputMode="decimal"
          value={value === 0 ? '' : value}
          onChange={e => onChange(e.target.value)}
          placeholder="0.0"
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-3 text-sm font-black focus:bg-white outline-none transition-all placeholder:text-slate-200
            ${color === 'blue' ? 'focus:border-blue-500' :
              color === 'amber' ? 'focus:border-amber-500' :
              'focus:border-indigo-500'}`}
        />
      </div>
    </div>
  )
}

export default App;
