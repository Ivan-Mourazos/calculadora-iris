import { useState } from 'react'
import { Ruler, AlertTriangle, CheckCircle, XCircle, ChevronRight, ChevronDown, Plus, Trash2, Box, Palette, User, ClipboardList, ArrowRightLeft, Settings, Mail, Lock, LogIn, LogOut } from 'lucide-react'
import { validateMeasurements, type Measurements, type ValidationResult } from './utils/geometry'
import catalog from './data/catalog.json'

interface Toldo {
  id: string;
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
  isMaterialCollapsed?: boolean;
  isModelCollapsed?: boolean;
  of?: string; // Orde de Fabricación (para produción)
}

interface Pedido {
  id: string;
  cliente: string;
  localidade: string;
  responsable: string;
  data: string;
  estado: 'PENDENTE' | 'PRODUCION' | 'OFICINA_TECNICA' | 'MONTAXE';
  numeroPedido?: string; // Número de pedido (para produción)
  toldos: Toldo[];
  imaxes?: string[]; // Array de imaxes en Base64
  comentarios?: string;
  datasEstados?: {
    PENDENTE?: string;
    PRODUCION?: string;
    OFICINA_TECNICA?: string;
    MONTAXE?: string;
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isClientDataCollapsed, setIsClientDataCollapsed] = useState(false)
  const [clientData, setClientData] = useState({
    cliente: '',
    localidade: '',
    responsable: '',
    comentarios: '',
    data: new Date().toISOString().split('T')[0]
  })
  
  const scrollToElement = (id: string, offset = 100) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const saved = localStorage.getItem('tgm_pedidos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentView, setCurrentView] = useState<'form' | 'list' | 'detail'>('form');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [editingPedidoId, setEditingPedidoId] = useState<string | null>(null);
  const [currentImaxes, setCurrentImaxes] = useState<string[]>([]);

  // Sync pedidos con localStorage
  const saveToLocalStorage = (newPedidos: Pedido[]) => {
    localStorage.setItem('tgm_pedidos', JSON.stringify(newPedidos));
  };

  const [toldos, setToldos] = useState<Toldo[]>([
    {
      id: crypto.randomUUID(),
      modelo: '',
      cofre: '',
      guia: '',
      mecanismo: '',
      swbs: 'Non',
      entreParedes: '',
      tela: '',
      cristal: 'Non',
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
        modelo: '',
        cofre: '',
        guia: '',
        mecanismo: '',
        swbs: 'Non',
        entreParedes: '',
        tela: '',
        cristal: 'Non',
        lacado: '',
        measurements: { fSup: 0, fInf: 0, sIzq: 0, sDer: 0, diag1: 0, diag2: 0 },
        result: null
      }
    ])
    // Ao engadir un toldo, se os datos do cliente están listos, colapsamos para dar espazo
    if (clientData.responsable && clientData.cliente) {
      setIsClientDataCollapsed(true);
      scrollToElement('client-section');
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

  const isClientDataComplete = clientData.responsable && clientData.cliente && clientData.localidade;
  const isToldosConfigComplete = toldos.every(t => t.modelo && t.mecanismo && t.tela && t.lacado);
  const isOrderBlocked = toldos.some(t => t.result?.status === 'VERMELLO' || t.result?.status === 'ERROR')
  const isOrderEmpty = toldos.some(t => !t.result)
  const canSaveOrder = isClientDataComplete && isToldosConfigComplete && !isOrderBlocked && !isOrderEmpty;

  const handleSavePedido = () => {
    if (!canSaveOrder) return;

    const newPedido: Pedido = {
      id: editingPedidoId || crypto.randomUUID(),
      cliente: clientData.cliente,
      localidade: clientData.localidade,
      responsable: clientData.responsable,
      data: clientData.data,
      estado: 'PENDENTE',
      toldos: toldos,
      imaxes: currentImaxes,
      comentarios: clientData.comentarios,
      datasEstados: editingPedidoId 
        ? pedidos.find(p => p.id === editingPedidoId)?.datasEstados 
        : { PENDENTE: new Date().toISOString() }
    };

    setPedidos(prev => {
      let updated;
      if (editingPedidoId) {
        updated = prev.map(p => p.id === editingPedidoId ? newPedido : p);
      } else {
        updated = [newPedido, ...prev];
      }
      saveToLocalStorage(updated);
      return updated;
    });

    // Resetear formulario
    setToldos([{
      id: crypto.randomUUID(),
      modelo: '', cofre: '', guia: '', mecanismo: '', swbs: 'Non', entreParedes: '', tela: '', cristal: 'Non', lacado: '',
      measurements: { fSup: 0, fInf: 0, sIzq: 0, sDer: 0, diag1: 0, diag2: 0 }, result: null
    }]);
    setClientData(prev => ({ ...prev, cliente: '', localidade: '', comentarios: '' }));
    setIsClientDataCollapsed(false);
    setEditingPedidoId(null);
    setCurrentImaxes([]);
    setCurrentView('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadPedidoForEditing = (pedido: Pedido) => {
    setClientData({
      cliente: pedido.cliente,
      localidade: pedido.localidade,
      responsable: pedido.responsable,
      comentarios: pedido.comentarios || '',
      data: pedido.data
    });
    setToldos(pedido.toldos);
    setEditingPedidoId(pedido.id);
    setIsClientDataCollapsed(true);
    setCurrentImaxes(pedido.imaxes || []);
    setCurrentView('form');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionar para aforrar espacio en localStorage
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setCurrentImaxes(prev => [...prev, dataUrl]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setCurrentImaxes(prev => prev.filter((_, i) => i !== index));
  };

  const deletePedido = (id: string) => {
    if (window.confirm('¿Seguro que queres eliminar este pedido? Esta acción non se pode desfacer.')) {
      setPedidos(prev => {
        const updated = prev.filter(p => p.id !== id);
        saveToLocalStorage(updated);
        return updated;
      });
      if (selectedPedido?.id === id) {
        setCurrentView('list');
        setSelectedPedido(null);
      }
    }
  };

  const simulateProcessing = (id: string, status: Pedido['estado']) => {
    setPedidos(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const newStatus = status;
          const updates: Partial<Pedido> = { 
            estado: newStatus,
            datasEstados: {
              ...(p.datasEstados || {}),
              [newStatus]: new Date().toISOString()
            }
          };
          
          return { ...p, ...updates };
        }
        return p;
      });
      saveToLocalStorage(updated);
      return updated;
    });
    if (selectedPedido?.id === id) {
       setSelectedPedido(prev => {
         if (!prev) return null;
         const now = new Date().toISOString();
         const updated = { 
           ...prev, 
           estado: status,
           datasEstados: {
             ...(prev.datasEstados || {}),
             [status]: now
           }
         };
         return updated as Pedido;
       });
    }
  };

  const formatDate = (dateValue: string) => {
    if (!dateValue) return '';
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return dateValue;
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateValue;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={(user) => {
      setIsAuthenticated(true);
      setClientData(prev => ({ ...prev, responsable: user.split('@')[0].replace('.', ' ').toUpperCase() }));
    }} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32 selection:bg-blue-100">
      {/* Header Premium */}
      <header className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
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
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2 group p-2 rounded-xl transition-all cursor-pointer ${isUserMenuOpen ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-slate-100'}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={`text-[10px] font-black tracking-wider uppercase truncate max-w-[120px] transition-colors ${isUserMenuOpen ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`}>
                {clientData.responsable || 'Técnico'}
              </span>
              <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180 text-blue-400' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[100]" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sesión técnica</p>
                    <p className="text-[11px] font-bold text-slate-900 truncate">{clientData.responsable}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentView('list');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50"
                  >
                    <ClipboardList size={16} className="text-blue-500" />
                    Os meus pedidos
                  </button>
                  <button 
                    onClick={() => {
                      setEditingPedidoId(null);
                      setToldos([{
                        id: crypto.randomUUID(),
                        modelo: '', cofre: '', guia: '', mecanismo: '', swbs: 'Non', entreParedes: '', tela: '', cristal: 'Non', lacado: '',
                        measurements: { fSup: 0, fInf: 0, sIzq: 0, sDer: 0, diag1: 0, diag2: 0 }, result: null
                      }]);
                      setClientData(prev => ({ ...prev, cliente: '', localidade: '' }));
                      setIsClientDataCollapsed(false);
                      setCurrentView('form');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50"
                  >
                    <Plus size={16} className="text-emerald-500" />
                    Novo pedido
                  </button>
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAuthenticated(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Pechar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {currentView === 'list' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Os meus Pedidos</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Histórico de medicións</p>
              </div>
              <button 
                onClick={() => setCurrentView('form')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Novo Cálculo
              </button>
            </div>

            {pedidos.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                <div className="p-6 bg-slate-50 rounded-full text-slate-300 mb-6">
                  <ClipboardList size={48} />
                </div>
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Aínda non hai pedidos</h3>
                <p className="text-sm text-slate-300 font-bold mt-2">Os teus cálculos aparecerán aquí despois de gardalos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-6 group">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`p-3 rounded-2xl shrink-0 ${
                        pedido.estado === 'PENDENTE' ? 'bg-amber-50 text-amber-500' :
                        pedido.estado === 'PRODUCION' ? 'bg-blue-50 text-blue-500' :
                        pedido.estado === 'OFICINA_TECNICA' ? 'bg-purple-50 text-purple-500' :
                        'bg-emerald-50 text-emerald-500'
                      }`}>
                        {pedido.estado === 'PENDENTE' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-col gap-1 mb-1">
                          <h4 className="font-black text-slate-900 uppercase tracking-tight leading-tight">{pedido.cliente}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                              pedido.estado === 'PENDENTE' ? 'bg-amber-100 text-amber-700' :
                              pedido.estado === 'PRODUCION' ? 'bg-blue-100 text-blue-700' :
                              pedido.estado === 'OFICINA_TECNICA' ? 'bg-purple-100 text-purple-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {pedido.estado.replace('_', ' ')}
                            </span>
                            {pedido.numeroPedido && <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">ID: {pedido.numeroPedido}</span>}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                          <span className="flex items-center gap-1.5"><ClipboardList size={12} className="text-slate-300" /> {formatDate(pedido.data)}</span>
                          <span className="flex items-center gap-1.5"><Box size={12} className="text-slate-300" /> {pedido.toldos.length} Toldos</span>
                          <span className="flex items-center gap-1.5"><User size={12} className="text-slate-300" /> {pedido.responsable}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => {
                          setSelectedPedido(pedido);
                          setCurrentView('detail');
                        }}
                        className="bg-slate-50 text-slate-500 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Ver Detalle
                      </button>
                      {pedido.estado === 'PENDENTE' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => loadPedidoForEditing(pedido)}
                            className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => deletePedido(pedido.id)}
                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar pedido"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : currentView === 'detail' && selectedPedido ? (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
                <div>
                  <button onClick={() => setCurrentView('list')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 mb-2 hover:-translate-x-1 transition-transform">
                    <ArrowRightLeft size={10} /> Volver á lista
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Detalles do Pedido</h2>
                </div>
                <div className="flex gap-2">
                  {selectedPedido.estado === 'PENDENTE' && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => deletePedido(selectedPedido.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all mr-2"
                        title="Eliminar pedido"
                      >
                        <Trash2 size={24} />
                      </button>
                      <button 
                        onClick={() => simulateProcessing(selectedPedido.id, 'PRODUCION')}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                      >
                        Pasar a Produción (Simulación)
                      </button>
                    </div>
                  )}
                  {selectedPedido.estado === 'PRODUCION' && (
                    <button 
                      onClick={() => simulateProcessing(selectedPedido.id, 'MONTAXE')}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
                    >
                      Finalizar Montaxe
                    </button>
                  )}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Resumen Cliente */}
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                          selectedPedido.estado === 'PENDENTE' ? 'bg-amber-100 text-amber-700' :
                          selectedPedido.estado === 'PRODUCION' ? 'bg-blue-100 text-blue-700' :
                          selectedPedido.estado === 'OFICINA_TECNICA' ? 'bg-purple-100 text-purple-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedPedido.estado.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Información da Obra</h3>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cliente</p>
                        <p className="text-sm font-black text-slate-800">{selectedPedido.cliente}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Data</p>
                        <p className="text-sm font-black text-slate-800">{formatDate(selectedPedido.data)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <Box size={10} /> Localidade / Dirección exacta
                        </p>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{selectedPedido.localidade}</p>
                      </div>
                    </div>

                    {selectedPedido.comentarios && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <ClipboardList size={10} /> Anotacións do Técnico
                        </p>
                        <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap">{selectedPedido.comentarios}</p>
                      </div>
                    )}

                    {selectedPedido.imaxes && selectedPedido.imaxes.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Fotos da Obra</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedPedido.imaxes.map((img, idx) => (
                            <img key={idx} src={img} className="aspect-square w-full object-cover rounded-2xl border border-slate-100 shadow-sm" alt={`Instalación ${idx}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedPedido.numeroPedido || selectedPedido.estado === 'PRODUCION') && (
                      <div className={`mt-6 pt-6 border-t border-slate-50 flex justify-between items-center -mx-6 -mb-6 px-6 py-4 ${selectedPedido.numeroPedido ? 'bg-blue-50/30' : 'bg-amber-50/30'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${selectedPedido.numeroPedido ? 'text-blue-600' : 'text-amber-600'}`}>Num. Pedido Sistema</p>
                        <p className={`text-lg font-black tracking-tighter ${selectedPedido.numeroPedido ? 'text-blue-700' : 'text-amber-700 animate-pulse'}`}>
                          {selectedPedido.numeroPedido || 'PENDENTE DE ASIGNAR'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Lista de Productos */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Productos ({selectedPedido.toldos.length})</h3>
                    {selectedPedido.toldos.map((t, idx) => (
                      <div key={t.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">{idx + 1}</span>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t.modelo || 'Toldo sen modelo'}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.mecanismo || 'Manual'} · {t.tela || 'Lona estándar'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {(t.of || selectedPedido.estado === 'PRODUCION') ? (
                             <div className={`${t.of ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'} px-3 py-1.5 rounded-lg border transition-colors`}>
                               <p className={`text-[8px] font-black ${t.of ? 'text-indigo-400' : 'text-amber-400'} uppercase tracking-tighter leading-none mb-0.5`}>Ref. Fabricación</p>
                               <p className={`text-[11px] font-black ${t.of ? 'text-indigo-600' : 'text-amber-600 italic'} tracking-tight leading-none`}>
                                 {t.of || 'Pendente OF'}
                               </p>
                             </div>
                          ) : (
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">A espera de envío</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Sidebar stats/Accións */}
                   <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Estado do Proceso</h3>
                     <div className="space-y-0 relative">
                        {/* Conector Vertical */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100"></div>
                        
                        <div className="space-y-8 relative z-10">
                          <div className="flex items-center gap-5">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${['PENDENTE', 'PRODUCION', 'MONTAXE'].includes(selectedPedido.estado) ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                               <ClipboardList size={14} />
                             </div>
                             <div>
                                <p className={`text-[11px] font-black uppercase tracking-widest ${selectedPedido.estado === 'PENDENTE' ? 'text-blue-600' : 'text-slate-400'}`}>Presuposto</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                  {selectedPedido.datasEstados?.PENDENTE ? formatDate(selectedPedido.datasEstados.PENDENTE) : 'Medición completada'}
                                </p>
                             </div>
                           </div>
 
                           <div className="flex items-center gap-5">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${['PRODUCION', 'MONTAXE'].includes(selectedPedido.estado) ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                               <Settings size={14} />
                             </div>
                             <div>
                                <p className={`text-[11px] font-black uppercase tracking-widest ${selectedPedido.estado === 'PRODUCION' ? 'text-blue-600' : 'text-slate-400'}`}>Produción</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                  {selectedPedido.datasEstados?.PRODUCION ? formatDate(selectedPedido.datasEstados.PRODUCION) : 'En fabricación'}
                                </p>
                             </div>
                           </div>
 
                           <div className="flex items-center gap-5">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${['MONTAXE'].includes(selectedPedido.estado) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                               <CheckCircle size={14} />
                             </div>
                             <div>
                                <p className={`text-[11px] font-black uppercase tracking-widest ${selectedPedido.estado === 'MONTAXE' ? 'text-emerald-600' : 'text-slate-400'}`}>Instalado</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                  {selectedPedido.datasEstados?.MONTAXE ? formatDate(selectedPedido.datasEstados.MONTAXE) : 'Entrega finalizada'}
                                </p>
                             </div>
                          </div>
                        </div>
                     </div>
                   </div>

                   {selectedPedido.estado === 'PENDENTE' && (
                     <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                       <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <AlertTriangle size={14} /> Pedido Editable
                       </p>
                       <p className="text-xs font-medium text-amber-600 leading-relaxed mb-4">Aínda podes modificar as medidas e a configuración antes de pasar a produción.</p>
                       <button 
                        onClick={() => loadPedidoForEditing(selectedPedido)}
                        className="w-full bg-white text-amber-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-200 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                       >
                         Modificar Medidas
                       </button>
                     </div>
                   )}
                </div>
             </div>
           </div>
        ) : (
          <>
            {/* Formulario Orixinal */}
            <div className="space-y-10">
              {/* Sección de Datos de Cliente (Colapsable) */}
              <section id="client-section" className={`transition-all duration-300 ${isClientDataCollapsed ? 'bg-slate-100/50 py-2 px-4 rounded-2xl border border-slate-200' : 'bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-6'}`}>
                {isClientDataCollapsed ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 py-1 animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                      <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-2 whitespace-nowrap shadow-sm ring-1 ring-blue-500">
                        <User size={12} strokeWidth={3} />
                        <span className="text-[10px] font-black">{clientData.cliente || 'Sen nome'}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-white text-slate-600 rounded-lg flex items-center gap-2 min-w-0 shadow-sm border border-slate-200 ring-1 ring-slate-100">
                        <Box size={12} />
                        <span className="text-[10px] font-black truncate">{clientData.localidade || 'Sen dirección'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsClientDataCollapsed(false)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-sm font-black text-[9px] uppercase tracking-widest"
                    >
                      Modificar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600 shadow-sm shadow-blue-100">
                          <User size={20} />
                        </div>
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Datos do Cliente</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Información da obra {editingPedidoId && <span className="text-blue-600">(EDITANDO)</span>}</p>
                        </div>
                      </div>
                    </div>
  
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                      <div className="md:col-span-2">
                        <GlobalInput 
                          label="Nome do Cliente / Empresa" 
                          value={clientData.cliente} 
                          onChange={v => setClientData({...clientData, cliente: v})} 
                          icon={<User size={14} />} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <GlobalInput 
                          label="Localidade / Dirección Exacta" 
                          value={clientData.localidade} 
                          onChange={v => setClientData({...clientData, localidade: v})} 
                          icon={<Box size={14} />} 
                          placeholder="Rúa, número e localidade (EXACTA)..."
                        />
                      </div>
  
                      <GlobalInput 
                        label="Técnico" 
                        value={clientData.responsable} 
                        onChange={v => setClientData({...clientData, responsable: v})} 
                        icon={<User size={14} />} 
                      />
                       <GlobalInput 
                        label="Data" 
                        type="date"
                        value={clientData.data} 
                        onChange={v => setClientData({...clientData, data: v})} 
                        icon={<ClipboardList size={14} />} 
                      />
  
                      <div className="flex items-end">
                        <button 
                          disabled={!isClientDataComplete}
                          onClick={() => {
                            setIsClientDataCollapsed(true);
                            scrollToElement('client-section');
                          }}
                          className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]
                            ${isClientDataComplete 
                              ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                        >
                          CONFIRMAR DATOS
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
                        {toldos.length > 1 && (
                          <button onClick={() => removeToldo(toldo.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
  
                    <div className="space-y-4 mt-6">
                      {/* ACORDEÓN 1: MODELO E CONFIGURACIÓN */}
                      <div id={`toldo-${toldo.id}-model`} className={`border border-slate-200 rounded-3xl transition-all duration-300 ${toldo.isModelCollapsed ? 'bg-slate-50/50' : 'bg-white shadow-sm ring-1 ring-slate-200/60 p-1'}`}>
                        <div 
                          onClick={() => updateToldo(toldo.id, { isModelCollapsed: !toldo.isModelCollapsed })}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl cursor-pointer relative z-10"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl text-blue-600 ${toldo.isModelCollapsed ? 'bg-slate-100' : 'bg-blue-50'}`}>
                              <Box size={18} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modelo e Configuración</h4>
                              {toldo.isModelCollapsed && (
                                <p className="text-[10px] font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="text-blue-600 font-extrabold uppercase">{toldo.modelo || 'Sen modelo'}</span>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                  <span className="text-slate-600">Conf: {toldo.cofre || 'Non'} · {toldo.mecanismo || 'Manual'}</span>
                                  {toldo.swbs === 'Si' && (
                                    <>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                      <span className="text-indigo-600 font-black">SWBS</span>
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronDown size={18} className={`text-slate-300 transition-transform duration-500 ${toldo.isModelCollapsed ? '' : 'rotate-180'}`} />
                        </div>
  
                        {!toldo.isModelCollapsed && (
                          <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 relative pb-10">
                            <div className="space-y-5">
                              <Select label="Modelo" value={toldo.modelo} options={catalog.modelos} onChange={v => updateToldo(toldo.id, { modelo: v })} />
                              <div className="grid grid-cols-2 gap-4">
                                <Select label="Cofre" value={toldo.cofre} options={catalog.cofre} onChange={v => updateToldo(toldo.id, { cofre: v })} />
                                <Select label="Guía compensadora" value={toldo.guia} options={catalog.guiaCompensadora} onChange={v => updateToldo(toldo.id, { guia: v })} />
                              </div>
                            </div>
                            <div className="space-y-5">
                              <Select label="Mecanismo" value={toldo.mecanismo} options={catalog.mecanismo} onChange={v => updateToldo(toldo.id, { mecanismo: v })} />
                              <div className="grid grid-cols-2 gap-4">
                                <Select label="SWBS" value={toldo.swbs} options={['Si', 'Non']} onChange={v => updateToldo(toldo.id, { swbs: v })} />
                                <Select label="Entre paredes" value={toldo.entreParedes} options={catalog.entreParedes} onChange={v => updateToldo(toldo.id, { entreParedes: v })} />
                              </div>
                            </div>
                            
                            <div className="md:col-span-2 flex justify-end px-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateToldo(toldo.id, { isModelCollapsed: true });
                                  scrollToElement(`toldo-${toldo.id}-model`);
                                }}
                                className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              >
                                Confirmar Configuración
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
  
                      {/* ACORDEÓN 2: MATERIAIS */}
                      <div id={`toldo-${toldo.id}-material`} className={`border border-slate-200 rounded-3xl transition-all duration-300 ${toldo.isMaterialCollapsed ? 'bg-slate-50/50' : 'bg-white shadow-sm ring-1 ring-slate-200/60 p-1'}`}>
                        <div 
                          onClick={() => updateToldo(toldo.id, { isMaterialCollapsed: !toldo.isMaterialCollapsed })}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl cursor-pointer relative z-10"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl text-amber-600 ${toldo.isMaterialCollapsed ? 'bg-slate-100' : 'bg-amber-50'}`}>
                              <Palette size={18} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Materiais</h4>
                              {toldo.isMaterialCollapsed && (
                                <p className="text-[10px] font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="text-amber-600 font-extrabold uppercase truncate max-w-[150px]">{toldo.tela || 'Sen lona'}</span>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                  <span className="text-slate-600">{toldo.lacado || 'Sen lacado'}</span>
                                  {toldo.cristal === 'Si' && (
                                    <>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                      <span className="text-blue-500 font-black">CRISTAL</span>
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronDown size={18} className={`text-slate-300 transition-transform duration-500 ${toldo.isMaterialCollapsed ? '' : 'rotate-180'}`} />
                        </div>
  
                        {!toldo.isMaterialCollapsed && (
                          <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 relative pb-10">
                            <Select label="Tea / Lona" value={toldo.tela} options={catalog.telas} onChange={v => updateToldo(toldo.id, { tela: v })} search />
                            <div className="grid grid-cols-2 gap-4">
                              <Select label="Cristal" value={toldo.cristal} options={['Non', 'Si']} onChange={v => updateToldo(toldo.id, { cristal: v })} />
                              <Select label="Lacado (estrutura)" value={toldo.lacado} options={catalog.lacados} onChange={v => updateToldo(toldo.id, { lacado: v })} />
                            </div>
  
                            <div className="md:col-span-2 flex justify-end px-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateToldo(toldo.id, { isMaterialCollapsed: true });
                                  scrollToElement(`toldo-${toldo.id}-material`);
                                }}
                                className="bg-amber-50 text-amber-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                              >
                                Confirmar Materiais
                              </button>
                            </div>
                          </div>
                        )}
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

              {/* SECCIÓN COMENTARIOS E IMÁXES (AO FINAL) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* BLOQUE COMENTARIOS */}
                 <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Anotacións</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Observacións do técnico</p>
                      </div>
                    </div>
                    <textarea 
                      value={clientData.comentarios}
                      onChange={e => setClientData({...clientData, comentarios: e.target.value})}
                      placeholder="Escribe aquí calquera detalle importante para produción ou montaxe..."
                      className="flex-1 w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                    />
                 </section>

                 {/* BLOQUE IMÁXES */}
                 <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
                          <Box size={20} />
                        </div>
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Imaxes</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fotos da obra</p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Plus size={14} className="inline mr-2" /> Engadir Foto
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>

                    {currentImaxes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in zoom-in-95 duration-500">
                        {currentImaxes.map((img, idx) => (
                          <div key={idx} className="relative aspect-square group">
                            <img src={img} className="w-full h-full object-cover rounded-xl border border-slate-100" alt={`Obra ${idx}`} />
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-50 rounded-2xl p-8 flex flex-col items-center text-center justify-center h-[120px]">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sen fotos</p>
                      </div>
                    )}
                 </section>
              </div>
            </div>
  
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-[900]">
              <div className="max-w-4xl mx-auto">
                <button 
                  disabled={!canSaveOrder}
                  onClick={handleSavePedido}
                  className={`w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl
                    ${!canSaveOrder 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                      : 'bg-blue-600 text-white shadow-blue-500/20 active:scale-95'}`}
                >
                  {!isClientDataComplete ? 'COMPLETA DATOS DO CLIENTE' : 
                   !isToldosConfigComplete ? 'COMPLETA MATERIALES E CONFIG.' :
                   isOrderEmpty ? 'ENGADE RESULTADOS DE MEDICIÓN' :
                   isOrderBlocked ? 'REVISA ERROS DE MEDICIÓN' :
                   (editingPedidoId ? 'ACTUALIZAR PEDIDO' : 'GARDAR PEDIDO COMPLETO')}
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
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

function GlobalInput({ label, value, onChange, icon, placeholder, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, placeholder?: string, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 relative">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || `Introduza o ${label.toLowerCase()}...`}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
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
    <div className="space-y-4 mt-6 bg-white shadow-sm ring-1 ring-slate-200/60 p-4 rounded-[2rem]">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Ruler size={12} className="text-blue-600" /> Toma de Medidas (cm)
        </h4>
        {result && (
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${getStatusClasses()}`}>
            {result.status}
          </span>
        )}
      </div>
      
      {/* Diagrama SVG Premium Maximizado */}
      <div className="relative aspect-[16/9] bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-center p-2">
        <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-sm">
          {/* Sombra proyectada */}
          <path d="M 30,30 L 170,30 L 180,110 L 20,110 Z" fill="#e2e8f0" opacity="0.3" />
          
          {/* El Trapezoide (Oco) */}
          <path d="M 30,25 L 170,25 L 180,105 L 20,105 Z" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Diagonales */}
          <line x1="30" y1="25" x2="180" y2="105" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3" />
          <line x1="170" y1="25" x2="20" y2="105" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3" />

          {/* Etiquetas de Medida e Valores Dinámicos */}
          <g className="text-[7.5px] font-black uppercase tracking-tighter">
            {/* Frente Superior */}
            <text x="100" y="15" textAnchor="middle" className="fill-blue-600">Fr. Sup</text>
            {measurements.fSup > 0 && <text x="100" y="22" textAnchor="middle" className="fill-slate-900 text-[8px]">{measurements.fSup}cm</text>}
            
            {/* Frente Inferior */}
            <text x="100" y="122" textAnchor="middle" className="fill-blue-600">Fr. Inf</text>
            {measurements.fInf > 0 && <text x="100" y="115" textAnchor="middle" className="fill-slate-900 text-[8px]">{measurements.fInf}cm</text>}
            
            {/* Saída Esquerda */}
            <text x="10" y="68" textAnchor="middle" transform="rotate(-78, 10, 68)" className="fill-slate-500">S. Izq</text>
            {measurements.sIzq > 0 && <text x="22" y="68" textAnchor="middle" transform="rotate(-78, 22, 68)" className="fill-slate-900 text-[8px]">{measurements.sIzq}cm</text>}
            
            {/* Saída Dereita */}
            <text x="190" y="68" textAnchor="middle" transform="rotate(78, 190, 68)" className="fill-slate-500">S. Der</text>
            {measurements.sDer > 0 && <text x="178" y="68" textAnchor="middle" transform="rotate(78, 178, 68)" className="fill-slate-900 text-[8px]">{measurements.sDer}cm</text>}
            
            {/* Diagonales */}
            <text x="70" y="58" textAnchor="middle" className="fill-amber-500">D1</text>
            {measurements.diag1 > 0 && <text x="70" y="65" textAnchor="middle" className="fill-slate-900 text-[8px]">{measurements.diag1}cm</text>}
            
            <text x="130" y="58" textAnchor="middle" className="fill-amber-500">D2</text>
            {measurements.diag2 > 0 && <text x="130" y="65" textAnchor="middle" className="fill-slate-900 text-[8px]">{measurements.diag2}cm</text>}
          </g>

          {/* Puntos de anclaje (Vértices) */}
          <circle cx="30" cy="25" r="2.5" fill="#3b82f6" />
          <circle cx="170" cy="25" r="2.5" fill="#3b82f6" />
          <circle cx="180" cy="105" r="2.5" fill="#3b82f6" />
          <circle cx="20" cy="105" r="2.5" fill="#3b82f6" />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-3">
        <NumInput label="Frente Superior" value={measurements.fSup} onChange={v => handleNumInput('fSup', v)} icon="fS" />
        <NumInput label="Frente Inferior" value={measurements.fInf} onChange={v => handleNumInput('fInf', v)} icon="fI" />
        <NumInput label="Saída Esquerda" value={measurements.sIzq} onChange={v => handleNumInput('sIzq', v)} icon="sE" />
        <NumInput label="Saída Dereita" value={measurements.sDer} onChange={v => handleNumInput('sDer', v)} icon="sD" />
        <NumInput label="Diagonal 1" value={measurements.diag1} onChange={v => handleNumInput('diag1', v)} color="amber" icon="D1" />
        <NumInput label="Diagonal 2" value={measurements.diag2} onChange={v => handleNumInput('diag2', v)} color="amber" icon="D2" />
      </div>

      {result && (
        <div className={`p-4 rounded-[1.5rem] border-2 transition-all animate-in zoom-in-95 duration-500 ${getStatusClasses()}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl bg-white shadow-sm border border-current`}>
              {result.status === 'VERMELLO' || result.status === 'ERROR' ? <XCircle size={18} /> : <CheckCircle size={18} />}
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Diagnóstico</p>
              <h5 className="text-sm font-black leading-tight">{result.status}</h5>
            </div>
          </div>
          <p className="text-[11px] font-bold leading-tight mb-3 opacity-90">{result.message}</p>
          
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-current/10">
            <div className="bg-white/40 p-2 rounded-xl border border-current/10 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">D.Esq</p>
              <p className="text-base font-black">{result.details.offsetL.toFixed(1)}<span className="text-[10px] ml-0.5">cm</span></p>
            </div>
            <div className="bg-white/40 p-2 rounded-xl border border-current/10 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">D.Der</p>
              <p className="text-base font-black">{result.details.offsetR.toFixed(1)}<span className="text-[10px] ml-0.5">cm</span></p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-current/10">
            <div className="flex justify-between items-center text-[9px] font-bold opacity-60">
              <span className="flex items-center gap-1"><ArrowRightLeft size={8} /> Diagonais:</span>
              <span>{measurements.diag1}/{measurements.diag2}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NumInput({ label, value, onChange, color = 'blue', icon }: { label: string, value: number, onChange: (v: string) => void, color?: 'blue' | 'amber', icon: string }) {
  return (
    <div className="flex flex-col gap-1 relative group">
      <label className="text-[8px] uppercase font-black text-slate-400 tracking-widest pl-1 truncate">{label}</label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-tighter w-6 h-6 flex items-center justify-center rounded-lg border transition-all
          ${color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
          {icon}
        </div>
        <input 
          type="number" 
          inputMode="decimal"
          value={value === 0 ? '' : value} 
          onChange={e => onChange(e.target.value)} 
          placeholder="0.0"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-3 text-sm font-black focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
        />
      </div>
    </div>
  )
}

function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('pruebas@toldosgomez.com')
  const [code, setCode] = useState('pruebas1234')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Validación básica: calquera email acabado en @toldosgomez.com e código 2026 ou pruebas1234
    const isValidCode = code === '2026' || (email === 'pruebas@toldosgomez.com' && code === 'pruebas1234');
    if (email.endsWith('@toldosgomez.com') && isValidCode) {
      onLogin(email)
    } else {
      setError('Credenciais non válidas. Use o código TGM corporativo.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[120px]" />

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col items-center mb-10">
            <img 
              src="/faviconTGM.png" 
              alt="Logo TGM" 
              className="h-20 w-20 object-contain mb-6 drop-shadow-sm"
              onError={(e) => { e.currentTarget.src = 'https://www.toldosgomez.com/favicon.ico' }}
            />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 text-center">
              ACCESO TÉCNICO
            </h1>
            <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] uppercase mt-2">
              Calculadora Iris · TGM
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1 flex items-center gap-2">
                <Mail size={12} /> Email Corporativo
              </label>
              <input 
                type="email"
                required
                disabled
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@toldosgomez.com"
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 outline-none transition-all cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                  <Lock size={12} /> Código de Acceso
                </label>
                <button 
                  type="button"
                  disabled
                  className="text-[9px] font-black text-slate-300 uppercase tracking-tighter cursor-not-allowed"
                >
                  Esquecín o PIN
                </button>
              </div>
              <input 
                type="password"
                required
                disabled
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Introduza o PIN..."
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 outline-none transition-all cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-shake">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 hover:bg-blue-700"
            >
              ACCEDER AO SISTEMA
              <LogIn size={16} />
            </button>
          </form>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-10">
            © 2026 Toldos Gómez · Departamento de Innovación
          </p>
        </div>
      </div>
    </div>
  )
}

export default App;
