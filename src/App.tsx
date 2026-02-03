import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Plus, Trash2, Save, Download, Upload, Eye, EyeOff, 
  Tv, Layers, Home, Monitor, Lock,
  FileText, Image as ImageIcon, Video, Code, Share2, Menu, X, Palette, 
  Sparkles, ChevronDown, ChevronUp, Edit3
} from 'lucide-react';

// --- CONFIGURACIÓN INICIAL DE LA NARRATIVA ---
const INITIAL_DATA = {
  pages: {
    'home': {
      id: 'home',
      title: 'El Umbral de los Dos Mundos',
      theme: 'journal',
      publishDate: new Date().toISOString(),
      blocks: [
        { id: 'b1', type: 'text', content: 'Existen dos realidades entrelazadas. El mundo de arriba, donde caminan los hombres, y el mundo de abajo, donde danzan las hadas.', actionType: 'none', clueLink: '', options: { scale: 100 } },
        { id: 'b2', type: 'text', content: 'Los humanos son animales que desean ser algo más para escapar del peso de la tierra...', actionType: 'hover', clueLink: 'mundo-arriba', options: { scale: 100 } },
        { id: 'b3', type: 'text', content: 'Las hadas son el espejo de tus propios deseos; si dejas de desear, ellas dejan de existir.', actionType: 'triple-click', clueLink: 'mundo-abajo', options: { scale: 100 } }
      ]
    },
    'mundo-arriba': {
      id: 'mundo-arriba',
      title: 'El Mundo de Arriba',
      theme: 'default',
      publishDate: new Date().toISOString(),
      blocks: [
        { id: 'b4', type: 'text', content: 'Aquí la gravedad es una ley física y emocional. Los deseos se arrastran buscando el cielo.', actionType: 'none', clueLink: '', options: { scale: 100 } },
        { id: 'b5', type: 'image', content: 'https://images.unsplash.com/photo-1516339901600-2e1a62d0ed74?auto=format&fit=crop&q=80&w=1000', actionType: 'long-hover', clueLink: 'home', options: { scale: 100 } }
      ]
    },
    'mundo-abajo': {
      id: 'mundo-abajo',
      title: 'El Reflejo de Abajo',
      theme: 'retro-tv',
      publishDate: new Date().toISOString(),
      blocks: [
        { id: 'b6', type: 'text', content: 'Has descendido al reflejo. Aquí la señal es débil, como la voluntad de quien olvida su origen.', actionType: 'none', clueLink: '', options: { scale: 100 } }
      ]
    }
  },
  homePageId: 'home'
};

// --- ESTILOS CSS INYECTADOS PARA TEMAS ---
const themeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime&family=Inter:wght@400;900&display=swap');

  .theme-journal {
    font-family: 'Special Elite', cursive;
    background-color: #f4e4bc;
    background-image: url('https://www.transparenttextures.com/patterns/old-map.png');
    color: #2c1e11;
    box-shadow: inset 0 0 100px rgba(0,0,0,0.1);
  }

  .theme-tv {
    background-color: #0a0a0a;
    color: #10b981;
    text-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
    font-family: 'Courier Prime', monospace;
  }

  .scanlines {
    position: absolute; inset: 0; pointer-events: none; z-index: 10;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    background-size: 100% 4px, 3px 100%;
  }

  @keyframes flicker {
    0% { opacity: 0.1; } 50% { opacity: 0.15; } 100% { opacity: 0.1; }
  }
  .flicker { animation: flicker 0.1s infinite; position: absolute; inset: 0; pointer-events: none; z-index: 11; background: white; opacity: 0.05; }
`;

export default function App() {
  // --- ESTADO ---
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('enigma_cms_v1');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [currentPageId, setCurrentPageId] = useState(config.homePageId);
  const [isDev, setIsDev] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [devClicks, setDevClicks] = useState(0);
  const [devMsg, setDevMsg] = useState("");

  // Inyectar estilos al montar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = themeStyles;
    document.head.append(style);
    return () => style.remove();
  }, []);

  // Persistencia automática
  useEffect(() => {
    localStorage.setItem('enigma_cms_v1', JSON.stringify(config));
  }, [config]);

  // --- LÓGICA DE ACCESO SECRETO ---
  const onFooterClick = () => {
    const n = devClicks + 1;
    setDevClicks(n);
    if (n >= 5 && n < 10) setDevMsg(`Modo editor en ${10 - n}...`);
    if (n >= 10) { setShowLogin(true); setDevClicks(0); setDevMsg(""); }
    
    clearTimeout((window as any).tOut);
    (window as any).tOut = setTimeout(() => { setDevClicks(0); setDevMsg(""); }, 3000);
  };

  const handleLogin = () => {
    if (password === "Daniela") {
      setIsDev(true);
      setShowLogin(false);
      setSidebarOpen(true);
      setPassword("");
    } else {
      alert("Clave incorrecta");
    }
  };

  // --- CMS ACCIONES ---
  const addBlock = () => {
    const id = 'b' + Date.now();
    const pg = config.pages[currentPageId];
    const newBlock = { id, type: 'text', content: 'Nuevo fragmento...', actionType: 'none', clueLink: '', options: { scale: 100 } };
    setConfig({ ...config, pages: { ...config.pages, [currentPageId]: { ...pg, blocks: [...pg.blocks, newBlock] } } });
    setEditingId(id);
    setActiveTab('blocks');
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'misterio_config.json';
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setConfig(data);
        setCurrentPageId(data.homePageId);
      } catch (err) { alert("Error al importar JSON"); }
    };
    reader.readAsText(file);
  };

  const currentPage = config.pages[currentPageId] || Object.values(config.pages)[0];

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 overflow-hidden ${isDev ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      
      {/* MODAL DE LOGIN */}
      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl text-center">
            <Lock className="mx-auto text-blue-500 mb-6" size={56} />
            <h2 className="text-white font-black uppercase tracking-widest mb-8">ACCESO RESTRINGIDO</h2>
            <input 
              type="password" autoFocus value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-zinc-800 border border-zinc-700 p-5 rounded-2xl text-white text-center text-3xl tracking-[0.5em] mb-6 outline-none focus:ring-4 focus:ring-blue-500/20"
              placeholder="••••"
            />
            <button onClick={handleLogin} className="w-full bg-blue-600 p-5 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all">IDENTIFICAR</button>
            <button onClick={() => setShowLogin(false)} className="mt-6 text-zinc-500 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* PANEL LATERAL (EDITOR) */}
      {isDev && (
        <aside className={`h-full bg-zinc-950 border-r border-zinc-800 flex flex-col z-[100] transition-all duration-300 ${sidebarOpen ? 'w-[85vw] md:w-80' : 'w-0 overflow-hidden'}`}>
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" /> ENIGMA CMS
            </span>
            <button onClick={() => setSidebarOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
          </div>

          <div className="flex border-b border-zinc-900 shrink-0">
            {[
              { id: 'pages', icon: Home, label: 'Páginas' },
              { id: 'style', icon: Palette, label: 'Diseño' },
              { id: 'blocks', icon: Layers, label: 'Bloques' },
              { id: 'system', icon: Settings, label: 'Sistema' }
            ].map(tab => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-blue-400 bg-blue-400/5' : 'text-zinc-600'}`}
              >
                <tab.icon size={16} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeTab === 'pages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Navegación</h4><button onClick={() => { const id='pg'+Date.now(); setConfig({...config, pages: {...config.pages, [id]: {id, title:'Página Nueva', theme:'default', blocks:[]}}}); setCurrentPageId(id); }} className="text-blue-500 hover:bg-blue-500/10 p-1 rounded"><Plus size={18}/></button></div>
                <div className="space-y-2">
                  {Object.values(config.pages).map(p => (
                    <div key={p.id} onClick={() => setCurrentPageId(p.id)} className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${currentPageId === p.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                      <span className="text-xs font-bold uppercase truncate pr-4">{p.title}</span>
                      {Object.keys(config.pages).length > 1 && <button onClick={e => { e.stopPropagation(); const {[p.id]:_, ...rest}=config.pages; setConfig({...config, pages: rest}); if(currentPageId===p.id) setCurrentPageId(Object.keys(rest)[0]); }}><Trash2 size={14}/></button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-600 block mb-2 tracking-widest">Nombre de Página</label>
                  <input value={currentPage.title} onChange={e => setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, title: e.target.value}}})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-600 block mb-2 tracking-widest">Tema Visual</label>
                  <div className="grid gap-2">
                    {['default', 'journal', 'retro-tv'].map(t => (
                      <button key={t} onClick={() => setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, theme: t}}})} className={`p-4 rounded-2xl border text-[10px] font-black uppercase text-left transition-all ${currentPage.theme === t ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>{t.replace('-',' ')}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setConfig({...config, homePageId: currentPageId})} className={`w-full p-4 rounded-2xl border text-[10px] font-black uppercase flex items-center justify-center gap-2 ${config.homePageId === currentPageId ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>Hacer Inicio</button>
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className="space-y-4 pb-20">
                <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Fragmentos</h4><button onClick={addBlock} className="bg-blue-600 text-white p-1 rounded-lg"><Plus size={18}/></button></div>
                {currentPage.blocks.map((b, i) => (
                  <div key={b.id} className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${editingId === b.id ? 'border-blue-500' : 'border-zinc-800'}`}>
                    <div onClick={() => setEditingId(editingId === b.id ? null : b.id)} className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50">
                      <span className="text-[9px] font-black uppercase text-zinc-500 truncate">{b.type}: {b.content}</span>
                      {editingId === b.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </div>
                    {editingId === b.id && (
                      <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-4 animate-in fade-in zoom-in">
                        <select value={b.type} onChange={e => { const blocks = [...currentPage.blocks]; blocks[i].type = e.target.value; setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, blocks}}}); }} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] text-white outline-none">
                          <option value="text">Texto</option><option value="image">Imagen</option><option value="video">Video</option><option value="html">HTML</option>
                        </select>
                        <textarea value={b.content} onChange={e => { const blocks = [...currentPage.blocks]; blocks[i].content = e.target.value; setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, blocks}}}); }} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] text-white min-h-[60px] outline-none" />
                        <div className="grid grid-cols-2 gap-2">
                          <select value={b.actionType} onChange={e => { const blocks = [...currentPage.blocks]; blocks[i].actionType = e.target.value; setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, blocks}}}); }} className="w-full bg-zinc-900 p-2 rounded text-[9px] text-zinc-500 outline-none">
                            <option value="none">Pista: Ninguna</option><option value="hover">Al pasar mouse</option><option value="long-hover">Esperar 3s</option><option value="triple-click">3 Clics</option>
                          </select>
                          <select value={b.clueLink} onChange={e => { const blocks = [...currentPage.blocks]; blocks[i].clueLink = e.target.value; setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, blocks}}}); }} className="w-full bg-zinc-900 p-2 rounded text-[9px] text-zinc-500 outline-none">
                            <option value="">Destino...</option>
                            {Object.values(config.pages).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                          </select>
                        </div>
                        <button onClick={() => { const blocks = currentPage.blocks.filter(block => block.id !== b.id); setConfig({...config, pages: {...config.pages, [currentPageId]: {...currentPage, blocks}}}); }} className="w-full p-2 bg-red-600/10 text-red-500 text-[9px] font-black uppercase rounded-lg">Borrar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-4">
                <button onClick={() => { localStorage.setItem('enigma_cms_v1', JSON.stringify(config)); alert("Guardado"); }} className="w-full p-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex justify-between items-center text-xs font-bold uppercase hover:bg-emerald-600/20 transition-all">Guardar <Save size={18}/></button>
                <button onClick={exportData} className="w-full p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl flex justify-between items-center text-xs font-bold uppercase hover:bg-zinc-800 transition-all">Exportar <Download size={18}/></button>
                <label className="w-full p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl flex justify-between items-center text-xs font-bold uppercase cursor-pointer hover:bg-zinc-800 transition-all">Importar <Upload size={18}/><input type="file" className="hidden" onChange={importData} /></label>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isDev && (
          <div className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-zinc-100 rounded-2xl text-zinc-900 hover:bg-zinc-200 transition-all">
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500 animate-pulse" /> Modo Edición
            </div>
            <button onClick={() => setIsDev(false)} className="px-5 py-2.5 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-zinc-800 active:scale-95 transition-all">
              <EyeOff size={14} className="inline mr-2"/> Finalizar
            </button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-700 ${isDev ? 'p-6 md:p-12' : 'p-0'}`}>
          <div className={`mx-auto transition-all duration-700 min-h-full ${isDev ? 'bg-white shadow-2xl rounded-[3.5rem] border-[14px] border-zinc-900 max-w-[420px] md:max-w-4xl relative overflow-hidden' : 'w-full'}`}>
             <PageRenderer 
                page={currentPage} 
                allPages={config.pages} 
                isDev={isDev} 
                onNavigate={id => { setCurrentPageId(id); window.scrollTo(0,0); }}
                onFooterClick={onFooterClick}
                onSelectBlock={id => { setEditingId(id); setActiveTab('blocks'); setSidebarOpen(true); }}
                msg={devMsg}
             />
          </div>
        </div>

        {isDev && (
          <button onClick={addBlock} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[110] hover:scale-110 active:scale-90 transition-all lg:hidden border-4 border-white">
            <Plus size={32}/>
          </button>
        )}
      </main>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function PageRenderer({ page, isDev, onNavigate, onFooterClick, onSelectBlock, msg }: any) {
  if (!page) return <div className="p-20 text-center text-slate-400 italic">Buscando en los mundos...</div>;

  const themes: any = {
    default: "bg-white text-zinc-900 p-8 md:p-24 flex flex-col items-center",
    journal: "theme-journal text-[#2c1e11] p-10 md:p-32 flex flex-col items-center min-h-full relative",
    'retro-tv': "theme-tv p-8 md:p-24 flex flex-col items-center min-h-full relative overflow-hidden"
  };

  return (
    <div className={`${themes[page.theme] || themes.default} w-full transition-all duration-1000 select-none`}>
      {page.theme === 'retro-tv' && (
        <>
          <div className="scanlines"></div>
          <div className="flicker"></div>
        </>
      )}

      <div className="w-full max-w-2xl space-y-20 pb-40 z-20 relative">
        <header className="border-b-4 border-current pb-10 mb-20 animate-in slide-in-from-top-4 duration-1000">
          <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">{page.title}</h1>
          <div className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">ENIGMA • {page.id}</div>
        </header>

        <div className="space-y-24">
          {page.blocks.map((b: any) => (
            <div 
              key={b.id} 
              onClick={e => { if(isDev) { e.stopPropagation(); onSelectBlock(b.id); } }} 
              className={isDev ? 'cursor-edit hover:ring-2 hover:ring-blue-500 rounded-2xl p-2 transition-all' : ''}
            >
              <HiddenWrapper block={b} onNavigate={onNavigate} isDev={isDev}>
                <BlockRenderer block={b} />
              </HiddenWrapper>
            </div>
          ))}
        </div>

        <footer 
          onClick={onFooterClick}
          className="mt-40 py-24 border-t-2 border-current/10 text-center opacity-20 hover:opacity-100 transition-all cursor-pointer relative"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.6em] select-none">© DANIELA • LOS DOS MUNDOS</div>
          {msg && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-600 text-white px-8 py-3 rounded-full text-[10px] font-black animate-bounce shadow-2xl border-2 border-white/20 whitespace-nowrap">
              {msg}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

function HiddenWrapper({ block, children, onNavigate, isDev }: any) {
  const [revealed, setRevealed] = useState(false);
  const [clicks, setClicks] = useState(0);
  const timer = useRef<any>(null);

  const onEnter = () => { if(!isDev) { if(block.actionType === 'hover') setRevealed(true); if(block.actionType === 'long-hover') timer.current = setTimeout(() => setRevealed(true), 2500); } };
  const onLeave = () => { if(!isDev) { if(block.actionType === 'hover' || block.actionType === 'long-hover') { setRevealed(false); clearTimeout(timer.current); } } };
  const onClick = () => { if(!isDev && block.actionType === 'triple-click') { const next = clicks + 1; setClicks(next); if(next === 3) { setRevealed(true); setClicks(0); } setTimeout(() => setClicks(0), 1000); } };

  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} className="relative group/item transition-all duration-500">
      <div className={`${revealed && block.clueLink ? 'opacity-10 blur-xl pointer-events-none scale-90' : 'transition-all duration-700 ease-out'}`}>
        {children}
      </div>
      {revealed && block.clueLink && !isDev && (
        <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in fade-in duration-500 z-50">
           <button 
             onClick={(e) => { e.stopPropagation(); onNavigate(block.clueLink); }}
             className="bg-black text-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3 border border-white/20"
           >
             DESCUBRIR <Share2 size={16}/>
           </button>
        </div>
      )}
    </div>
  );
}

function BlockRenderer({ block }: any) {
  const parseVideo = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`;
    if (url.includes('tiktok.com')) return `https://www.tiktok.com/embed/v2/${url.split('/video/')[1]?.split('?')[0]}`;
    return url;
  };

  switch(block.type) {
    case 'text': return <p className="text-xl md:text-5xl leading-[1.05] whitespace-pre-wrap tracking-tighter">{block.content}</p>;
    case 'image': return <img src={block.content} className="w-full rounded-[2.5rem] shadow-2xl grayscale-[0.6] hover:grayscale-0 transition-all duration-1000" alt="Misterio" />;
    case 'video':
      const v = parseVideo(block.content);
      return <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4 border-white/5">{v ? <iframe src={v} className="w-full h-full" allowFullScreen /> : "Enlace no válido"}</div>;
    case 'html': return <div dangerouslySetInnerHTML={{ __html: block.content }} />;
    default: return null;
  }
}
