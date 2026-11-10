const fs=require('fs'),path=require('path');
const base=__dirname,read=p=>fs.readFileSync(path.join(base,p),'utf8');
let fonts='';for(const weight of [400,600,700]){const bytes=fs.readFileSync(path.join(base,'vendor/font-'+weight+'.ttf'));fonts+=`@font-face{font-family:'Instrument Sans';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/ttf;base64,${bytes.toString('base64')}) format('truetype');}`;}

// Licence texts travel inside the HTML file (Desk & Bench DESIGN.md, section 11).
// HTML comments must not contain "--": the OFL's dashed rules become "=" rules
// and its two spaced double hyphens become en dashes. The wording is unchanged.
const template=read('template.html');
const version=(template.match(/Version (\d+\.\d+\.\d+)/)||[])[1];
if(!version)throw new Error('Version not found in template.html');
const safe=text=>text.replace(/\r\n/g,'\n').trim().replace(/^-{3,}$/gm,m=>'='.repeat(m.length)).replace(/ -- /g,' – ');
const licences=['<!--',`ATLaS Solution Calculator ${version} — Desk & Bench`,'https://github.com/ugurlab/atlas-solution-calculator','',
  'LICENCES','This file contains the application and an embedded font. Keep this notice when you share or change it.','',
  '1. ATLaS Solution Calculator','',safe(read('vendor/LICENSE.txt')),'',
  '2. Instrument Sans font (embedded below)','',safe(read('vendor/FONT-LICENSE.txt')),'-->'].join('\n');
if(licences.slice(4,-3).includes('--'))throw new Error('Licence comment must not contain "--"');

const html=template.replace('<!-- LICENCES -->',()=>licences).replace('/* EMBED_STYLE */',()=>fonts+read('style.css')).replace('/* EMBED_CORE */',()=>read('core.js')).replace('/* EMBED_UI */',()=>read('ui.js'));
fs.mkdirSync(path.join(base,'app'),{recursive:true});fs.writeFileSync(path.join(base,'app/atlas-solution-calculator.html'),html);
for(const old of ['LICENSE.txt','FONT-LICENSE.txt'])fs.rmSync(path.join(base,'app',old),{force:true});
console.log('Built offline app:',Buffer.byteLength(html),'bytes');
