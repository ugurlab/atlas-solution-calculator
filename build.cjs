const fs=require('fs'),path=require('path');
const base=__dirname,read=p=>fs.readFileSync(path.join(base,p),'utf8');
let fonts='';for(const weight of [400,600,700]){const bytes=fs.readFileSync(path.join(base,'vendor/font-'+weight+'.ttf'));fonts+=`@font-face{font-family:'Instrument Sans';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/ttf;base64,${bytes.toString('base64')}) format('truetype');}`;}
const html=read('template.html').replace('/* EMBED_STYLE */',()=>fonts+read('style.css')).replace('/* EMBED_CORE */',()=>read('core.js')).replace('/* EMBED_UI */',()=>read('ui.js'));
fs.mkdirSync(path.join(base,'app'),{recursive:true});fs.writeFileSync(path.join(base,'app/atlas-solution-calculator.html'),html);
fs.copyFileSync(path.join(base,'vendor/FONT-LICENSE.txt'),path.join(base,'app/FONT-LICENSE.txt'));
fs.copyFileSync(path.join(base,'vendor/LICENSE.txt'),path.join(base,'app/LICENSE.txt'));
console.log('Built offline app:',Buffer.byteLength(html),'bytes');
