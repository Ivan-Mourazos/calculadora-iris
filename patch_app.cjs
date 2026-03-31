const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Solución Pantalla en Branco: Substituír crypto.randomUUID()
// Definimos unha función local simple para IDs se non existe crypto.randomUUID
const idGenerator = "() => Math.random().toString(36).substring(2, 11)";

// Engadimos a función ao principio de App()
if (!content.includes('const generateId =')) {
    content = content.replace('function App() {', `function App() {\n  const generateId = ${idGenerator};`);
}

// Substituímos todas as chamadas a crypto.randomUUID() pola nosa función
content = content.replace(/crypto\.randomUUID\(\)/g, 'generateId()');

// 2. Mellora Acordeón 1 (Modelo)
// Buscamos o div do acordeón 1 e o seu resumo
const modelAccordionOld = "                       <div id={`toldo-${toldo.id}-model`} className={`border border-slate-200 rounded-3xl transition-all duration-300 ${toldo.isModelCollapsed ? 'bg-slate-50/50' : 'bg-white shadow-sm ring-1 ring-slate-200/60 p-1'}`}>";
const modelAccordionNew = `                      <div id={\`toldo-\${toldo.id}-model\`} className={\`border rounded-3xl transition-all duration-300 \${
                        toldo.isModelCollapsed 
                          ? (toldo.modelo && toldo.mecanismo ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-200') 
                          : 'bg-white shadow-md ring-1 ring-slate-200/60 p-1 border-slate-200'
                      }\`}>`;

content = content.replace(modelAccordionOld, modelAccordionNew);

// Indicador de check e resumo no Acordeón 1
const modelHeaderOldSnippet = "text-blue-600 ${toldo.isModelCollapsed ? 'bg-slate-100' : 'bg-blue-50'}";
const modelHeaderNewSnippet = " ${toldo.isModelCollapsed && toldo.modelo && toldo.mecanismo ? 'bg-emerald-100 text-emerald-600' : toldo.isModelCollapsed ? 'bg-slate-100 text-blue-600' : 'bg-blue-50 text-blue-600'}";
content = content.replace(modelHeaderOldSnippet, modelHeaderNewSnippet);

// 3. Mellora Acordeón 2 (Materiais)
const materialAccordionOld = "                       <div id={`toldo-${toldo.id}-material`} className={`border border-slate-200 rounded-3xl transition-all duration-300 ${toldo.isMaterialCollapsed ? 'bg-slate-50/50' : 'bg-white shadow-sm ring-1 ring-slate-200/60 p-1'}`}>";
const materialAccordionNew = `                      <div id={\`toldo-\${toldo.id}-material\`} className={\`border rounded-3xl transition-all duration-300 \${
                        toldo.isMaterialCollapsed 
                          ? (toldo.tela && toldo.lacado ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-200') 
                          : 'bg-white shadow-md ring-1 ring-slate-200/60 p-1 border-slate-200'
                      }\`}>`;

content = content.replace(materialAccordionOld, materialAccordionNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.tsx parcheado con éxito.');
