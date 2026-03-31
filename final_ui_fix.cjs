const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Asegurar generateId (por si acaso)
if (!content.includes('const generateId =')) {
    content = content.replace('function App() {', `function App() {\n  const generateId = () => Math.random().toString(36).substring(2, 11);`);
}
content = content.replace(/crypto\.randomUUID\(\)/g, 'generateId()');

// 2. Mellora Acordeón 1 (Modelo) - CONTEIDO E ESTILO
const modelDivOld = /<div id=\{`toldo-\$\{toldo\.id\}-model`\} className=\{`border border-slate-200 rounded-3xl transition-all duration-300 \$\{toldo\.isModelCollapsed \? 'bg-slate-50\/50' : 'bg-white shadow-sm ring-1 ring-slate-200\/60 p-1'\}\}`>/;
const modelDivNew = `<div id={\`toldo-\${toldo.id}-model\`} className={\`border rounded-3xl transition-all duration-300 \${
                        toldo.isModelCollapsed 
                          ? (toldo.modelo && toldo.mecanismo ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-200') 
                          : 'bg-white shadow-md ring-1 ring-slate-200/60 p-1 border-slate-200'
                      }\`}>`;

content = content.replace(modelDivOld, modelDivNew);

// Axuste de iconos e resumo do Acordeón 1
const modelSummaryOld = /<span className="text-slate-600">Conf: \{toldo\.cofre \|\| 'Non'\} · \{toldo\.mecanismo \|\| 'Manual'\}<\/span>/;
const modelSummaryNew = `<span className="text-slate-600 font-bold">{toldo.mecanismo || 'Manual'} {toldo.cofre !== 'Non' ? \`· Cofre \${toldo.cofre}\` : '· Sen cofre'}</span>`;
content = content.replace(modelSummaryOld, modelSummaryNew);

// 3. Mellora Acordeón 2 (Materiais) - CONTEIDO E ESTILO
const materialDivOld = /<div id=\{`toldo-\$\{toldo\.id\}-material`\} className=\{`border border-slate-200 rounded-3xl transition-all duration-300 \$\{toldo\.isMaterialCollapsed \? 'bg-slate-50\/50' : 'bg-white shadow-sm ring-1 ring-slate-200\/60 p-1'\}\}`>/;
const materialDivNew = `<div id={\`toldo-\${toldo.id}-material\`} className={\`border rounded-3xl transition-all duration-300 \${
                        toldo.isMaterialCollapsed 
                          ? (toldo.tela && toldo.lacado ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-200') 
                          : 'bg-white shadow-md ring-1 ring-slate-200/60 p-1 border-slate-200'
                      }\`}>`;

content = content.replace(materialDivOld, materialDivNew);

const materialSummaryOld = /<span className="text-slate-600">\{toldo\.lacado \|\| 'Sen lacado'\}<\/span>/;
const materialSummaryNew = `<span className="text-slate-600 font-bold">Lacado: {toldo.lacado || 'Estándar'}</span>`;
content = content.replace(materialSummaryOld, materialSummaryNew);

// 4. Engadir burbulla de Check cando está completo (ao lado do Chevron)
const chevronRegex = /<ChevronDown size=\{18\} className=\{`text-slate-300 transition-transform duration-500 \$\{toldo\.is(Model|Material)Collapsed \? '' : 'rotate-180'\}\}` \/>/g;
content = content.replace(chevronRegex, (match, type) => {
    const isModel = type === 'Model';
    const condition = isModel ? 'toldo.modelo && toldo.mecanismo' : 'toldo.tela && toldo.lacado';
    return `<div className="flex items-center gap-3">
                            {toldo.is${type}Collapsed && ${condition} && (
                              <div className="bg-emerald-500 text-white p-1 rounded-full animate-in zoom-in duration-300 shadow-sm border border-emerald-400">
                                <CheckCircle size={10} />
                              </div>
                            )}
                            ${match}
                          </div>`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.tsx refinado con textos claros e feedback visual.');
