const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(__dirname+'/app/atlas-solution-calculator.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
scripts.forEach(s=>new vm.Script(s));
const context=vm.createContext({});vm.runInContext(scripts[0]+';globalThis.core=AtlasCalc;',context);const c=context.core;
let checks=0;const near=(actual,expected)=>{checks++;assert(Math.abs(actual-expected)<=Math.max(Math.abs(expected)*1e-11,1e-25),`${actual} != ${expected}`);};const rejects=fn=>{checks++;assert.throws(fn);};
near(c.percentPrepare(5,250,'wv').solute,12.5);
near(c.percentPrepare(70,500,'vv').solute,350);
near(c.percentPrepare(5,100,'ww').solute,5);
near(c.percentPrepare(5,100,'ww').solvent,95);
near(c.percentPrepare(100,100,'ww').solvent,0);
near(c.percentPrepare(120,100,'wv').solute,120);
rejects(()=>c.percentPrepare(101,100,'vv'));rejects(()=>c.percentPrepare(101,100,'ww'));
near(c.percentMolar(.9,58.44,'wv','toMolar'),.1540041067761807);
near(c.percentMolar(.1540041067761807,58.44,'wv','toPercent'),.9);
near(c.percentMolar(37,36.46,'ww','toMolar',1.19),12.07624794295118)
near(c.percentMolar(12.076247943,36.46,'ww','toPercent',1.19),37);
rejects(()=>c.percentMolar(30,58.44,'ww','toPercent',1));rejects(()=>c.percentMolar(5,58.44,'vv','toMolar'));
near(c.molarMass(.5,1,58.44),29.22);
near(c.molarMass(.1,.1,58.44),.5844);
near(c.molarMass(.1,.1,58.44,95),.6151578947368421);
near(c.molarity(.6151578947368421,.1,58.44,95),.1);
near(c.molarMass(1e-9,1e-6,100),1e-13);
const dil=c.dilution(1,.01,.1);near(dil.take,.001);near(dil.remainder,.099);
near(c.dilution(37,10,100).take,27.027027027027028);
checks++;assert.equal(c.dilution(1,1,.1).equal,true);
near(c.dilution(1,1,.1).remainder,0);
rejects(()=>c.dilution(1,2,.1));rejects(()=>c.dilution(0,1,.1));
const conc=c.concentrated(37,1.19,36.46,.1,.1);
near(conc.stock,12.076247943);near(conc.take,364.6/440300);
near(c.convert(1e6,'mass','µg','kg'),.001);
near(c.convert(1,'mass','kg','µg'),1e9);
near(c.convert(1,'volume','L','µL'),1e6);
near(c.convert(1,'molar','M','nM'),1e9);
near(c.convert(1,'massConcentration','mg/mL','g/L'),1);
near(c.convert(1,'massConcentration','µg/mL','mg/L'),1);
near(c.convert(1,'massConcentration','ng/mL','µg/L'),1);
near(c.convert(0,'mass','g','kg'),0);
for(const [category,units]of Object.entries(c.units))for(const from of Object.keys(units))for(const to of Object.keys(units)){near(c.convert(c.convert(3.125,category,from,to),category,to,from),3.125);}
near(c.number('0,5'),.5);near(c.number('1e-6'),1e-6);near(c.number(' +.5 '),.5);near(c.number('0','Value',true),0);
for(const bad of ['', 'abc','Infinity','NaN','1,234.5','1.234,5','--1','1e999','1 000','-2','0'])rejects(()=>c.number(bad));
for(const bad of [-1,0,Infinity,NaN]){rejects(()=>c.molarMass(bad,1,58.44));rejects(()=>c.molarity(1,bad,58.44));}
rejects(()=>c.molarMass(1,1,58.44,101));rejects(()=>c.concentrated(0,1,50,1,.1));rejects(()=>c.concentrated(50,0,50,1,.1));rejects(()=>c.concentrated(10,1,100,2,.1));
rejects(()=>c.convert(1,'mass','g','L'));rejects(()=>c.convert(Infinity,'mass','g','kg'));
rejects(()=>c.molarMass(1e300,1e300,100));rejects(()=>c.molarMass(1e-300,1e-300,1));
checks++;assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(html),'Runtime must not load network assets');
checks++;assert(html.includes('data:font/ttf;base64,'),'Font must work offline');
// Draft 0.2: ambiguous separators must never silently change an intended order of magnitude.
for(const ambiguous of ['1.000','2,500','123.456','+1.000','-1,234']){
  checks++;assert(c.ambiguity(ambiguous).includes('Did you mean'));
  rejects(()=>c.number(ambiguous,'Test field',true,'test'));
}
for(const [text,n]of [['0.500',.5],['0,250',.25],['-0.125',-.125],['0.001',.001],['+0.500',.5],['00.500',.5]]){
  checks++;assert.equal(c.ambiguity(text),'');near(c.parseNumber(text),n);
  if(n>0)near(c.number(text),n);
}
// Parsing a negative decimal is unambiguous; quantity-domain validation is unchanged.
rejects(()=>c.number('-0.125'));rejects(()=>c.number('-0.125','Mass',true));
let separatorError;try{c.number('2,500','Final volume',false,'amount');}catch(e){separatorError=e;}
checks++;assert.equal(separatorError.field,'amount');
checks++;assert(separatorError.message.includes('2.5 or 2500'));
checks++;assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(scripts.join('\n')),'No automatic network calls');
checks++;assert(!/\b(?:localStorage|sessionStorage|indexedDB)\s*[.(]/.test(scripts.join('\n')),'Session history must stay in memory');
for(const [text,n]of [['1000',1000],['1.0',1],['2.50',2.5],['2500',2500],['0.0010',.001],['1e-3',.001],['1.000e0',1],['1234.567',1234.567],['1,0000',1]])near(c.number(text),n);
near(c.massMolar(1,58.44,'massToMolar'),1/58.44);
near(c.massMolar(.001,58.44,'molarToMass'),.05844);
near(c.convert(c.massMolar(c.convert(1,'massConcentration','mg/mL','g/L'),58.44,'massToMolar'),'molar','M','mM'),17.11156741957563);
for(const mw of [18.015,58.44,180.156])for(const mass of [1e-12,.5,100])near(c.massMolar(c.massMolar(mass,mw,'massToMolar'),mw,'molarToMass'),mass);
near(c.percentMass(1,'percentToMass'),10);near(c.percentMass(10,'massToPercent'),1);
near(c.convert(c.percentMass(1,'percentToMass'),'massConcentration','g/L','mg/mL'),10);
for(const value of [.01,1,120])near(c.percentMass(c.percentMass(value,'percentToMass'),'massToPercent'),value);
rejects(()=>c.massMolar(1,0,'massToMolar'));rejects(()=>c.massMolar(-1,58.44,'massToMolar'));rejects(()=>c.massMolar(1,58.44,'bad'));rejects(()=>c.percentMass(1,'bad'));rejects(()=>c.percentMass(0,'percentToMass'));
near(c.percentPrepare(5,250,'wv',80).pure,12.5);near(c.percentPrepare(5,250,'wv',80).solute,15.625);
near(c.percentPrepare(5,100,'ww',80).solute,6.25);near(c.percentPrepare(5,100,'ww',80).solvent,93.75);
near(c.percentPrepare(80,100,'ww',80).solvent,0);
rejects(()=>c.percentPrepare(81,100,'ww',80));rejects(()=>c.percentPrepare(5,100,'wv',0));rejects(()=>c.percentPrepare(5,100,'wv',101));rejects(()=>c.percentPrepare(5,100,'vv',80));
const retained=c.serialDilution(100,10,3,1,'retained');
near(retained.stockRequired,.111);near(retained.totalDiluent,2.889);
near(retained.rows[0].diluent,.999);near(retained.rows[1].diluent,.99);near(retained.rows[2].diluent,.9);
for(let i=0;i<3;i++){near(retained.rows[i].retained,1);near(retained.rows[i].concentration,100/10**(i+1));near(retained.rows[i].mixed,retained.rows[i].diluent+retained.rows[i].transfer);near(retained.rows[i].outgoing,i===2?0:retained.rows[i+1].transfer);}
near(retained.stockRequired+retained.totalDiluent,3);
const mixed=c.serialDilution(100,10,3,1,'mixed');for(let i=0;i<3;i++){near(mixed.rows[i].transfer,.1);near(mixed.rows[i].diluent,.9);near(mixed.rows[i].retained,i===2?1:.9);near(mixed.rows[i].concentration,100/10**(i+1));}
const defaultPlan=c.serialDilution(100,10,3,1);checks++;assert.equal(defaultPlan.volumeBasis,'mixed');near(defaultPlan.stockRequired,.1);near(defaultPlan.rows[0].retained,.9);
near(mixed.stockRequired+mixed.totalDiluent,mixed.rows.reduce((sum,r)=>sum+r.retained,0));
const single=c.serialDilution(10,2,1,1,'retained');near(single.rows[0].transfer,.5);near(single.rows[0].concentration,5);near(single.rows[0].retained,1);
for(const mode of ['mixed','retained'])for(const factor of [1.1,2,3,10])for(const n of [1,2,10,100]){const p=c.serialDilution(1,factor,n,.001,mode);near(p.stockRequired+p.totalDiluent,p.rows.reduce((sum,r)=>sum+r.retained,0));checks++;assert(p.rows.every(r=>r.transfer>0&&r.diluent>0&&r.concentration>0&&Number.isFinite(r.cumulative)));}
for(const n of [0,-1,1.5,101,Infinity,NaN])rejects(()=>c.serialDilution(1,10,n,1));
for(const factor of [0,1,-1,Infinity])rejects(()=>c.serialDilution(1,factor,3,1));
rejects(()=>c.serialDilution(0,10,3,1));rejects(()=>c.serialDilution(1,10,3,0));rejects(()=>c.serialDilution(1,10,3,1,'bad'));rejects(()=>c.serialDilution(1,1e100,100,1));
// Rebuilding a relocated copy must not reach into any sibling project.
const path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const isolated=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-independent-build-'));
for(const name of ['build.cjs','core.js','ui.js','template.html','style.css'])fs.copyFileSync(path.join(__dirname,name),path.join(isolated,name));
fs.cpSync(path.join(__dirname,'vendor'),path.join(isolated,'vendor'),{recursive:true});
cp.execFileSync(process.execPath,[path.join(isolated,'build.cjs')],{cwd:isolated,stdio:'pipe'});
checks++;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(isolated,'app/atlas-solution-calculator.html'))).digest('hex'),crypto.createHash('sha256').update(html).digest('hex'),'Relocated build differs');
console.log(`PASS: ${checks} checks on the embedded calculation engine, unit round-trips, validation, syntax and offline assets.`);
