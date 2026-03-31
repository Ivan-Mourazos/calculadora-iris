const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Mellora visual de contenedores (Fondo verde se completo)
// Modelo
const modelDivOld = /<div id=\{`toldo-\$\{toldo\.id\}-model`\} className=\{`border border-slate-200 rounded-3xl transition-all duration-300 \$\{toldo\.isModelCollapsed \? 'bg-slate-50\/50' : 'bg-white shadow-sm ring-1 ring-slate-200\/60 p-1'\}\}`>/;
const modelDivNew = `<div id={\`toldo-\${toldo.id}-model\`} className={\`border rounded-3xl transition-all duration-300 \${
                        toldo.isModelCollapsed 
                          ? (toldo.modelo && toldo.mecanismo ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-200') 
                          : 'bg-white shadow-md ring-1 ring-slate-200/60 p-1 border-slate-200'
                      }\`}>`;

content = content.replace(modelDivOld, modelDivNew);

// Material
const materialDivOld = /<div id=\{`toldo-\$\{toldo\.id\}-material`\} className=\{`border border-slate-200 rounded-3xl transition-all duration-300 \$\{toldo\.isMaterialCollapsed \? 'bg-slate-50\/50' : 'bg-white shadow-sm ring-1 ring-slate-200\/60 p-1'\}\}`>/;
const materialDivNew = `<div id={\`toldo-\${toldo.id}-material\`} className={\`border rounded-3xl transition-all duration-300 \${
                        toldo.isMaterialCollapsed 
                          ? (toldo.tela && toldo.lacado ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-200') 
                          : 'bg-white shadow-md ring-1 ring-slate-200/60 p-1 border-slate-200'
                      }\`}>`;

content = content.replace(materialDivOld, materialDivNew);

// 2. Engadir Icono CheckCircle xunto á ChevronDown
const chevronOld = /<ChevronDown size=\{18\} className=\{`text-slate-300 transition-transform duration-500 \$\{toldo\.is(Model|Material)Collapsed \? '' : 'rotate-180'\}\}` \/>/g;

content = content.replace(chevronOld, (match, type) => {
    const field1 = type === 'Model' ? 'modelo' : 'tela';
    const field2 = type === 'Model' ? 'mecanismo' : 'lacado';
    return `<div className="flex items-center gap-3">
                            {toldo.is${type}Collapsed && toldo.${field1} && toldo.${field2} && (
                              <div className="bg-emerald-500 text-white p-1 rounded-full animate-in zoom-in duration-300 shadow-sm border border-emerald-400">
                                <CheckCircle size={10} />
                              </div>
                            )}
                            ${match}
                          </div>`;
});

// 3. Mellorar resumo do Segundo Acordeón (o Regex anterior non cubría todo)
const materialSummaryOld = /<span className="text-amber-600 font-extrabold uppercase truncate max-w-\[150px\]">\{toldo\.tela \|\| 'Sen lona'\}<\/span>/;
const materialSummaryNew = `<span className="text-amber-700 font-bold uppercase bg-amber-100/30 px-1.5 py-0.5 rounded border border-amber-200/50 max-w-[150px] truncate">{toldo.tela || 'Escoller lona'}</span>`;
content = content.replace(materialSummaryOld, materialSummaryNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.tsx finalizado con todas as melloras visuais.');
