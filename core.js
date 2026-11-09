/* ATLaS calculation engine. Copyright (c) 2026 Ugur Comlekcioglu. MIT License. */
const AtlasCalc = (() => {
  'use strict';
  const units = {
    volume: {nL:1e-9, 'µL':1e-6, mL:1e-3, L:1},
    mass: {'µg':1e-6, mg:1e-3, g:1, kg:1e3},
    molar: {M:1, mM:1e-3, 'µM':1e-6, nM:1e-9},
    massConcentration: {'g/L':1, 'mg/mL':1, 'µg/mL':1e-3, 'mg/L':1e-3, 'ng/mL':1e-6, 'µg/L':1e-6}
  };
  function fail(message, field) { const e = new Error(message); e.field = field; throw e; }
  function ambiguity(value, label='Value') {
    const s=String(value??'').trim();
    if(!/^[+\-]?[1-9]\d{0,2}[.,]\d{3}$/.test(s))return '';
    const decimal=Number(s.replace(',','.')), grouped=Number(s.replace(/[.,]/,''));
    if(decimal===grouped)return '';
    const plain=String(decimal), explicit=Number.isInteger(decimal)?plain+'.0':(/\.\d{3}$/.test(plain)?plain+'0':plain);
    return label+' is ambiguous. Did you mean '+plain+' or '+grouped+'? Enter '+explicit+' or '+grouped+' without thousands separators.';
  }
  function parseNumber(value, label='Value', field='') {
    const s=String(value ?? '').trim();
    const warning=ambiguity(s,label);if(warning)fail(warning,field);
    if(!/^[+\-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+\-]?\d+)?$/.test(s)) fail('Enter a valid number for '+label+'. Use a decimal point or comma, without thousands separators.',field);
    const n=Number(s.replace(',','.'));
    if(!Number.isFinite(n))fail(label+' must be finite.',field);
    return n;
  }
  function number(value, label='Value', zero=false, field='') {
    const n=parseNumber(value,label,field);
    if(zero ? n<0 : n<=0)fail(label+' must be '+(zero?'zero or greater':'greater than zero')+' and finite.',field);
    return n;
  }
  function positive(n,label='Value') { if(typeof n!=='number'||!Number.isFinite(n)||n<=0) fail(label+' must be greater than zero and finite.'); return n; }
  function fraction(p,label='Percentage') { positive(p,label); if(p>100)fail(label+' cannot exceed 100%.'); return p/100; }
  function finite(n) { if(!Number.isFinite(n)||(n===0))fail('The result is outside the supported numerical range. Check the values and units.'); return n; }
  function convert(value, category, from, to) {
    if(typeof value!=='number'||!Number.isFinite(value)||value<0) fail('Value must be zero or greater and finite.');
    if(!units[category]||!Object.hasOwn(units[category],from)||!Object.hasOwn(units[category],to))fail('Choose units from the same quantity.');
    if(value===0)return 0;
    return finite(value*(units[category][from]/units[category][to]));
  }
  function percentPrepare(percent, total, basis, assay=100) {
    positive(percent,'Percentage'); positive(total,'Final amount');
    if(!['wv','vv','ww'].includes(basis))fail('Choose a percentage basis.');
    if(basis!=='wv')fraction(percent);
    const f=fraction(assay,'Mass assay');
    if(basis==='vv'&&assay!==100)fail('Mass assay correction for % v/v requires additional density information. Use a pure liquid or a mass-based preparation.');
    if(basis==='ww'&&percent>assay*(1+1e-12))fail('The target % w/w exceeds the reagent mass assay. This preparation cannot reach that target.');
    const pure=finite(percent*total/100), solute=finite(pure/f);
    return {solute,pure,solvent:basis==='ww'?Math.max(0,total-solute):null};
  }
  function percentMolar(value, mw, basis, direction, density) {
    positive(value,'Concentration'); positive(mw,'Molar mass');
    if(!['wv','ww'].includes(basis)||!['toMolar','toPercent'].includes(direction))fail('Choose a supported concentration conversion.');
    if(basis==='ww')positive(density,'Solution density');
    if(basis==='ww'&&direction==='toMolar')fraction(value);
    const result=finite(direction==='toMolar'?value*10*(basis==='ww'?density:1)/mw:value*mw/(10*(basis==='ww'?density:1)));
    if(basis==='ww'&&direction==='toPercent'&&result>100*(1+1e-12))fail('These values imply more than 100% w/w. Check the solution density, molar mass and concentration.');
    return basis==='ww'&&direction==='toPercent'?Math.min(result,100):result;
  }
  function molarMass(concentration, volume, mw, assay=100) {
    positive(concentration,'Concentration');positive(volume,'Final volume');positive(mw,'Molar mass');
    const f=fraction(assay,'Mass assay');
    return finite(concentration*volume*mw/f);
  }
  function molarity(mass, volume, mw, assay=100) {
    positive(mass,'Mass');positive(volume,'Final volume');positive(mw,'Molar mass');
    const f=fraction(assay,'Mass assay');
    return finite(mass*f/mw/volume);
  }
  function dilution(stock, target, finalAmount) {
    positive(stock,'Stock concentration');positive(target,'Target concentration');positive(finalAmount,'Final amount');
    if(target>stock*(1+1e-12))fail('The target concentration is higher than the stock. A dilution cannot produce this concentration.');
    const ratio=Math.min(1,target/stock), take=finite(ratio*finalAmount);
    return {take, remainder:Math.max(0,finalAmount-take), equal:ratio===1};
  }
  function concentrated(assay, density, mw, target, finalVolume) {
    fraction(assay,'Stock assay');positive(density,'Stock density');positive(mw,'Molar mass');
    const stock=finite(10*assay*density/mw);
    return {stock,...dilution(stock,target,finalVolume)};
  }
  function massMolar(value,mw,direction) {
    positive(value,'Concentration');positive(mw,'Molar mass');
    if(!['massToMolar','molarToMass'].includes(direction))fail('Choose a supported concentration conversion.');
    return finite(direction==='massToMolar'?value/mw:value*mw);
  }
  function percentMass(value,direction) {
    positive(value,'Concentration');
    if(!['percentToMass','massToPercent'].includes(direction))fail('Choose a supported concentration conversion.');
    return finite(direction==='percentToMass'?value*10:value/10);
  }
  function serialDilution(stock,factor,tubes,volume,volumeBasis='mixed') {
    positive(stock,'Stock concentration');positive(factor,'Dilution factor');positive(volume,'Volume per tube');
    if(factor<=1)fail('The dilution factor must be greater than 1.');
    if(!Number.isInteger(tubes)||tubes<1||tubes>100)fail('Choose a whole number of tubes from 1 to 100.');
    if(!['retained','mixed'].includes(volumeBasis))fail('Choose the volume basis.');
    const rows=new Array(tubes);let outgoing=0;
    for(let i=tubes-1;i>=0;i--){
      const mixed=finite(volumeBasis==='retained'?volume+outgoing:volume);
      const transfer=finite(mixed/factor),diluent=finite(mixed*(1-1/factor));
      const cumulative=finite(Math.pow(factor,i+1)),concentration=finite(stock/cumulative);
      rows[i]={tube:i+1,source:i===0?'Stock':'Tube '+i,transfer,diluent,mixed,outgoing,retained:Math.max(0,mixed-outgoing),concentration,cumulative};
      outgoing=transfer;
    }
    return {rows,stockRequired:rows[0].transfer,totalDiluent:finite(rows.reduce((sum,r)=>sum+r.diluent,0)),factor,volumeBasis};
  }
  return Object.freeze({units,ambiguity,parseNumber,number,convert,percentPrepare,percentMolar,molarMass,molarity,dilution,concentrated,massMolar,percentMass,serialDilution});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AtlasCalc;
