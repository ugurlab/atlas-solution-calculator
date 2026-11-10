(() => {
  'use strict';
  const $=s=>document.querySelector(s), C=AtlasCalc;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons={percent:'<path d="m7 17 10-10"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',molar:'<path d="M8 3h8M10 3v8L5 20c-.4.8 0 1 1 1h12c1 0 1.4-.2 1-1l-5-9V3M8 15h8"/>',dilution:'<path d="M7 3v10a5 5 0 0 0 10 0V3M5 3h14M7 10h10M10 15h4"/>',concentrated:'<path d="M9 3h6v4l3 3v11H6V10l3-3V3ZM9 14h6M9 17h4"/>',converter:'<path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4"/>',result:'<path d="M5 3h14v18H5zM8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h2m4 0h2"/>'};
  icons.conversions=icons.converter;icons.serial=icons.dilution;
  const icon=k=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[k]+'</svg>';
  const tools={percent:{title:'Percent solutions',description:'Choose the percentage basis explicitly, then prepare a solution or convert its concentration.'},molar:{title:'Molar solutions',description:'Calculate the mass to weigh, or the molarity of a solution prepared from a known mass.'},dilution:{title:'Dilution',description:'Calculate how much stock you need. Stock and target units can differ within the same concentration basis.'},concentrated:{title:'From concentrated reagents',description:'Use the stock’s % w/w concentration, density and molar mass to prepare a target molar concentration.'},conversions:{title:'Concentration conversions',description:'Convert mass concentration, molarity and % w/v using an explicit concentration basis.'},serial:{title:'Serial dilution',description:'Plan transfer and diluent volumes, and calculate the concentration of each tube.'},converter:{title:'Unit converter',description:'Convert values within the same physical quantity, with consistent units.'}};
  const defaults={percent:{operation:'prepare',assay:'100',basis:'wv',direction:'toMolar',percent:'',amount:'',amountUnit:'mL',mw:'',density:'',molar:'',molarUnit:'M'},molar:{operation:'mass',mw:'',concentration:'',concentrationUnit:'mM',volume:'',volumeUnit:'mL',assay:'100',mass:'',massUnit:'mg'},dilution:{basis:'molar',stock:'',stockUnit:'M',target:'',targetUnit:'mM',amount:'',amountUnit:'mL'},concentrated:{assay:'',density:'',mw:'',target:'',targetUnit:'M',volume:'',volumeUnit:'mL'},conversions:{direction:'massToMolar',value:'',inputUnit:'mg/mL',outputUnit:'mM',mw:''},serial:{basis:'molar',stock:'',stockUnit:'mM',factor:'',tubes:'',amount:'',amountUnit:'mL',volumeBasis:'mixed'},converter:{category:'volume',value:'',from:'mL',to:'µL'}};
  const memory=Object.fromEntries(Object.keys(tools).map(k=>[k,{values:{...defaults[k]},result:null}]));
  const sessionHistory=[];
  let active='percent',toastTimer;
  const unitOptions=category=>Object.keys(C.units[category]).map(v=>[v,v]);
  function select(key,label,options,{full=false,layout=false,hint=''}={}) {
    let value=memory[active].values[key];
    if(!options.some(([v])=>v===value)){value=options[0][0];memory[active].values[key]=value;}
    return '<label class="field '+(full?'full':'')+'" for="'+key+'">'+esc(label)+'<select id="'+key+'" name="'+key+'" '+(layout?'data-layout="true"':'')+'>'+options.map(([v,l])=>'<option value="'+esc(v)+'" '+(v===value?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select>'+(hint?'<small>'+esc(hint)+'</small>':'')+'</label>';
  }
  function input(key,label,{unit='',category='',unitKey='',full=false,hint='',placeholder='e.g. 100'}={}) {
    const value=memory[active].values[key]??'';let control='<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" id="'+key+'" name="'+key+'" value="'+esc(value)+'" placeholder="'+esc(placeholder)+'" '+(hint?'aria-describedby="'+key+'Help"':'')+'>';
    if(category){const options=unitOptions(category);let u=memory[active].values[unitKey];if(!options.some(([v])=>v===u)){u=category==='volume'?'mL':category==='mass'?'g':options[0][0];memory[active].values[unitKey]=u;}control='<div class="with-unit">'+control+'<select name="'+unitKey+'" aria-label="'+esc(label)+' unit">'+options.map(([v,l])=>'<option value="'+esc(v)+'" '+(v===u?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>';}
    return '<label class="field '+(full?'full':'')+'" for="'+key+'">'+esc(label)+(unit?' ('+esc(unit)+')':'')+control+(hint?'<small id="'+key+'Help">'+esc(hint)+'</small>':'')+'<small class="field-warning" id="'+key+'Warning" data-warning-for="'+key+'" role="alert" hidden></small></label>';
  }
  const basisOptions=[['wv','% w/v — mass / volume'],['vv','% v/v — volume / volume'],['ww','% w/w — mass / mass']];
  function fields() {
    const v=memory[active].values;
    if(active==='percent'){
      let html=select('operation','Calculation',[['prepare','Prepare a percent solution'],['convert','Convert percent and molarity']],{full:true,layout:true});
      html+=select('basis','Percentage basis',v.operation==='prepare'?basisOptions:basisOptions.filter(([k])=>k!=='vv'),{full:true,layout:true});
      if(v.operation==='prepare')return html+input('percent','Desired percentage',{unit:'%',placeholder:'e.g. 5'})+input('amount',v.basis==='ww'?'Final solution mass':'Final solution volume',{category:v.basis==='ww'?'mass':'volume',unitKey:'amountUnit',placeholder:'e.g. 100'})+(v.basis==='vv'?'<p class="form-foot full">% v/v assumes a pure liquid. Purity correction needs density information and is available here only for % w/v and % w/w.</p>':input('assay','Reagent purity',{unit:'%',full:true,placeholder:'100',hint:'From the bottle label, for example \'Assay ≥ 98%\'. Leave at 100 for a pure reagent.'}));
      html+=select('direction','Conversion',[['toMolar','Percent to molarity'],['toPercent','Molarity to percent']],{full:true,layout:true});
      html+=v.direction==='toMolar'?input('percent','Solution concentration',{unit:'%',placeholder:'e.g. 0.9'}):input('molar','Molar concentration',{category:'molar',unitKey:'molarUnit',placeholder:'e.g. 0.154'});
      html+=input('mw','Molar mass',{unit:'g/mol',placeholder:'e.g. 58.44'});
      if(v.basis==='ww')html+=input('density','Final solution density',{unit:'g/mL',full:true,placeholder:'e.g. 1.02',hint:'Use the density of this solution, not of the pure solute.'});
      return html;
    }
    if(active==='molar')return select('operation','Calculation',[['mass','Calculate mass to weigh'],['concentration','Calculate molarity from mass']],{full:true,layout:true})+input('mw','Molar mass',{unit:'g/mol',full:true,placeholder:'e.g. 58.44',hint:'Use the exact compound form, including hydrates.'})+(v.operation==='mass'?input('concentration','Target concentration',{category:'molar',unitKey:'concentrationUnit',placeholder:'e.g. 100'}):input('mass','Mass weighed',{category:'mass',unitKey:'massUnit',placeholder:'e.g. 584.4'}))+input('volume','Final solution volume',{category:'volume',unitKey:'volumeUnit',placeholder:'e.g. 100'})+input('assay','Reagent purity',{unit:'%',full:true,placeholder:'100',hint:'From the bottle label, for example \'Assay ≥ 98%\'. Leave at 100 for a pure reagent.'});
    if(active==='dilution'){
      const html=select('basis','Concentration basis',[['molar','Molar concentration'],['massConcentration','Mass concentration'],['wv','Percent w/v'],['vv','Percent v/v'],['ww','Percent w/w']],{full:true,layout:true});
      const cat=['molar','massConcentration'].includes(v.basis)?v.basis:'';
      return html+input('stock','Stock concentration',{unit:cat?'':'%',category:cat,unitKey:'stockUnit',placeholder:'e.g. 1'})+input('target','Target concentration',{unit:cat?'':'%',category:cat,unitKey:'targetUnit',placeholder:'e.g. 10'})+input('amount',v.basis==='ww'?'Final solution mass':'Final solution volume',{category:v.basis==='ww'?'mass':'volume',unitKey:'amountUnit',full:true,placeholder:'e.g. 100'});
    }
    if(active==='concentrated')return input('assay','Stock concentration',{unit:'% w/w',placeholder:'e.g. 37'})+input('density','Stock density',{unit:'g/mL',placeholder:'e.g. 1.19'})+input('mw','Solute molar mass',{unit:'g/mol',full:true,placeholder:'e.g. 36.46',hint:'The stock % w/w and molar mass must refer to the same solute species.'})+input('target','Target concentration',{category:'molar',unitKey:'targetUnit',placeholder:'e.g. 0.1'})+input('volume','Final solution volume',{category:'volume',unitKey:'volumeUnit',placeholder:'e.g. 100'});
    if(active==='conversions'){
      let html=select('direction','Conversion',[['massToMolar','Mass concentration to molarity'],['molarToMass','Molarity to mass concentration'],['percentToMass','% w/v to mass concentration'],['massToPercent','Mass concentration to % w/v']],{full:true,layout:true});
      if(v.direction==='percentToMass')html+=input('value','Concentration',{unit:'% w/v',full:true,placeholder:'e.g. 1'});
      else html+=input('value','Concentration',{category:v.direction==='molarToMass'?'molar':'massConcentration',unitKey:'inputUnit',full:true,placeholder:'e.g. 1'});
      if(['massToMolar','molarToMass'].includes(v.direction))html+=input('mw','Molar mass',{unit:'g/mol',full:true,placeholder:'e.g. 58.44'});
      if(v.direction!=='massToPercent')html+=select('outputUnit','Result unit',unitOptions(v.direction==='massToMolar'?'molar':'massConcentration'),{full:true});
      return html;
    }
    if(active==='serial')return select('basis','Concentration basis',[['molar','Molar concentration'],['massConcentration','Mass concentration'],['wv','Percent w/v'],['vv','Percent v/v']],{full:true,layout:true})+input('stock','Initial stock concentration',{unit:['wv','vv'].includes(v.basis)?'%':'',category:['molar','massConcentration'].includes(v.basis)?v.basis:'',unitKey:'stockUnit',full:true,placeholder:'e.g. 100'})+input('factor','Dilution factor per step',{placeholder:'e.g. 10',hint:'A 10-fold step uses one part source in ten parts mixed solution.'})+input('tubes','Number of tubes',{placeholder:'e.g. 5',hint:'Whole number from 1 to 100. Tube 1 is the first dilution.'})+select('volumeBasis','Volume definition',[['mixed','Same transfer volume in every tube (standard)'],['retained','Same final volume left in every tube']],{full:true,layout:true,hint:'Standard: use the same transfer at every step. Equal final volume: calculate different transfers so the requested amount remains in every tube.'})+input('amount',v.volumeBasis==='retained'?'Final retained volume per tube':'Mixed volume per tube',{category:'volume',unitKey:'amountUnit',full:true,placeholder:'e.g. 1'});
    return select('category','Quantity',[['volume','Volume'],['mass','Mass'],['molar','Molar concentration'],['massConcentration','Mass concentration']],{full:true,layout:true})+input('value','Value to convert',{full:true,placeholder:'e.g. 1'})+select('from','From',unitOptions(v.category))+select('to','To',unitOptions(v.category));
  }
  const explanations={
    percent:{formula:'m = (% w/v × final volume in mL) / 100',notes:['% w/v is mass per final solution volume. Dissolve first, then make up to the final volume.']},
    molar:{formula:'m = c × V × MW / f',notes:['c in mol/L; V in L; MW in g/mol; f = reagent purity / 100.','The molar mass must match the chemical form being weighed.']},
    dilution:{formula:'C₁ × V₁ = C₂ × V₂',notes:['Use the same concentration basis for stock and target.','V₂ is the final solution volume, not the volume of added solvent.']},
    concentrated:{formula:'Cstock = 10 × stock % w/w × density / MW; Vstock = Ctarget × Vfinal / Cstock',notes:['Stock % w/w is the concentration printed on the bottle label; density in g/mL; MW in g/mol.','The density, % w/w and molar mass must describe the same stock and solute.']},
    conversions:{formula:'c (M) = mass concentration (g/L) / MW; % w/v = mass concentration (g/L) / 10',notes:['Molar mass in g/mol. Concentration conversions do not change the chemical form.','1% w/v = 10 g/L = 10 mg/mL.']},serial:{formula:'Ci = Cstock / D^i; transfer = mixed volume / D',notes:['Tube 1 is the first diluted tube; mix each tube before transferring onward.','Retained mode calculates backwards so each tube keeps the requested final volume without discarding solution.','Mixed mode uses the requested volume before each onward transfer; the last tube retains the full mixed volume.','Volumes are treated as additive for serial dilution with a compatible diluent.']},converter:{formula:'Output = input × source unit factor / target unit factor',notes:['Conversions stay within the selected quantity.','Molar concentration and mass concentration require molar mass to interconvert; use Concentration conversions.']}
  };
  function guidance(){const v=memory[active].values;let e={formula:explanations[active].formula,notes:[...explanations[active].notes]};
    if(active==='percent'){
      if(v.operation==='prepare'&&v.basis==='vv')e={formula:'Vsolute = (% v/v × final volume in mL) / 100',notes:['% v/v is mL of solute per 100 mL of final solution.','Make up to the final volume; solvent and solute volumes are not assumed additive.']};
      if(v.operation==='prepare'&&v.basis==='ww')e={formula:'mreagent = (% w/w × final mass) / (100 × f); msolvent = final mass − mreagent',notes:['% w/w uses total solution mass. f = reagent purity / 100.','Reagent impurities are included in its mass and in the final solution mass. The target % w/w cannot exceed the reagent purity.']};
      if(v.operation==='prepare'&&v.basis==='wv')e={formula:'mreagent = (% w/v × final volume in mL) / (100 × f)',notes:['% w/v is pure-solute mass per final solution volume. f = reagent purity / 100.','The weighed reagent mass is corrected for its purity. Make up to final volume.']};
      if(v.operation==='convert')e={formula:v.basis==='wv'?'c (M) = 10 × (% w/v) / MW':'c (M) = 10 × (% w/w) × solution density / MW',notes:['The inverse formula converts molarity to the selected percentage basis.','MW in g/mol; density, when needed, in g/mL.']};
    }
    if(active==='molar'&&v.operation==='concentration')e.formula='c = m × f / (MW × V)';
    if(active==='dilution'&&v.basis==='ww')e={formula:'w₁ × m₁ = w₂ × m₂',notes:['Both concentrations are % w/w. Dilution is calculated by mass.','Add solvent mass = final solution mass − stock solution mass.']};
    if(active==='conversions'){
      e.formula={massToMolar:'c (M) = mass concentration (g/L) / MW',molarToMass:'mass concentration (g/L) = c (M) × MW',percentToMass:'mass concentration (g/L) = 10 × (% w/v)',massToPercent:'% w/v = mass concentration (g/L) / 10'}[v.direction];
    }
    if(active==='serial')e.formula=v.volumeBasis==='retained'?'mixed_i = retained + outgoing_i; transfer_i = mixed_i / D; Ci = Cstock / D^i':'transfer = mixed volume / D; diluent = mixed − transfer; Ci = Cstock / D^i';
    $('#formula').textContent=e.formula;$('#assumptions').innerHTML='<ul>'+e.notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>';
    const note=active==='concentrated'?'Use current reagent-label or certificate values. For handling and mixing order, follow the reagent SDS and your laboratory procedure.':active==='percent'&&v.operation==='prepare'&&v.basis!=='ww'?'For volume-based recipes, make up to the final solution volume. Do not add that volume of solvent.':'';
    $('#contextNote').textContent=note;$('#contextNote').hidden=!note;
  }
  function format(n){if(n===0)return '0';const a=Math.abs(n);if(a<1e-4||a>=1e7)return n.toExponential(5).replace(/\.?(0+)(?=e)/,'');return new Intl.NumberFormat('en-US',{maximumSignificantDigits:6,useGrouping:false}).format(n);}
  function quantity(value,category,unit){return {value:C.convert(value,category,category==='mass'?'g':category==='volume'?'L':category==='massConcentration'?'g/L':'M',unit),unit};}
  function bestMass(g){return quantity(g,'mass',g===0?'g':g>=1e3?'kg':g>=1?'g':g>=1e-3?'mg':'µg');}
  function bestVolume(l){return quantity(l,'volume',l>=1?'L':l>=1e-3?'mL':l>=1e-6?'µL':'nL');}
  function bestMolar(m){return quantity(m,'molar',m>=1?'M':m>=1e-3?'mM':m>=1e-6?'µM':'nM');}
  function showQ(q){return format(q.value)+' '+q.unit;}
  function parse(v,key,label,zero=false){return C.number(v[key],label,zero,key);}
  function base(v,key,label,category,unitKey){return C.convert(parse(v,key,label),category,v[unitKey],category==='volume'?'L':category==='mass'?'g':category==='molar'?'M':'g/L');}
  function calculate(v){
    const result={title:tools[active].title,formula:$('#formula').textContent,notes:[...$('#assumptions').querySelectorAll('li')].map(li=>li.textContent),secondary:[],inputs:[]};
    result.inputs=[...$('#calculatorForm').querySelectorAll('.field')].map(label=>label.innerText.trim().split('\n')[0]+': '+[...label.querySelectorAll('input,select')].map(el=>el.tagName==='SELECT'?el.selectedOptions[0].textContent:el.value).join(' '));
    if(active==='percent'){
      const p=v.operation==='prepare'||v.direction==='toMolar'?parse(v,'percent','Percentage'):null;
      if(v.operation==='prepare'){
        const total=base(v,'amount',v.basis==='ww'?'Final mass':'Final volume',v.basis==='ww'?'mass':'volume','amountUnit');
        const amount=v.basis==='ww'?total:total*1000;
        const assay=v.basis==='vv'?100:parse(v,'assay','Reagent purity');
        const r=C.percentPrepare(p,amount,v.basis,assay);
        if(v.basis==='wv'){result.primary={...bestMass(r.solute),label:'Reagent to weigh'};result.secondary.push({...bestMass(r.pure),label:'Pure-solute mass'});result.instruction='Weigh '+showQ(result.primary)+' of the stated reagent. Dissolve in a suitable solvent, then make up to a final solution volume of '+showQ(bestVolume(total))+'.';}
        if(v.basis==='vv'){result.primary={...bestVolume(r.solute/1000),label:'Solute volume to measure'};result.instruction='Measure '+showQ(result.primary)+' of solute and make up to a final solution volume of '+showQ(bestVolume(total))+'.';if(p===100)result.instruction='Use '+showQ(result.primary)+' of solute. No dilution is required at 100% v/v.';}
        if(v.basis==='ww'){result.primary={...bestMass(r.solute),label:'Reagent to weigh'};result.secondary.push({...bestMass(r.pure),label:'Pure-solute mass'});result.secondary.push({...bestMass(r.solvent),label:'Solvent mass'});result.instruction='Combine '+showQ(result.primary)+' of the stated reagent with '+showQ(bestMass(r.solvent))+' of solvent for '+showQ(bestMass(total))+' of final solution.';}
        result.working=format(p)+' × '+format(amount)+' / (100'+(v.basis==='vv'?'':' × '+format(assay/100))+') = '+format(r.solute)+(v.basis==='vv'?' mL':' g');
        result.notes.push(v.basis==='vv'?'Assumes a pure liquid solute.':('Reagent purity: '+format(assay)+'%. Check solubility and the exact chemical form.'));
      }else{
        const mw=parse(v,'mw','Molar mass'),density=v.basis==='ww'?parse(v,'density','Solution density'):undefined;
        const inputValue=v.direction==='toMolar'?p:base(v,'molar','Molar concentration','molar','molarUnit');
        const r=C.percentMolar(inputValue,mw,v.basis,v.direction,density);
        result.primary=v.direction==='toMolar'?{...bestMolar(r),label:'Molar concentration'}:{value:r,unit:'% '+(v.basis==='wv'?'w/v':'w/w'),label:'Percent concentration'};
        result.instruction='The solution corresponds to '+showQ(result.primary)+'.';
        result.working=v.direction==='toMolar'?'10 × '+format(p)+(v.basis==='ww'?' × '+format(density):'')+' / '+format(mw)+' = '+format(r)+' mol/L':format(inputValue)+' × '+format(mw)+' / (10'+(v.basis==='ww'?' × '+format(density):'')+') = '+format(r)+'%';
      }
    }
    if(active==='molar'){
      const mw=parse(v,'mw','Molar mass'),volume=base(v,'volume','Final volume','volume','volumeUnit'),assay=parse(v,'assay','Reagent purity');
      if(v.operation==='mass'){
        const concentration=base(v,'concentration','Target concentration','molar','concentrationUnit'),mass=C.molarMass(concentration,volume,mw,assay);
        result.primary={...bestMass(mass),label:'Reagent to weigh'};
        result.secondary=[{value:mass,unit:'g',label:'Mass in grams'}, {...bestMolar(concentration),label:'Target concentration'}];
        result.instruction='Weigh '+showQ(result.primary)+' of the stated reagent. Dissolve in a suitable solvent, then make up to a final solution volume of '+showQ(bestVolume(volume))+'.';
        result.working=format(concentration)+' mol/L × '+format(volume)+' L × '+format(mw)+' g/mol / '+format(assay/100)+' = '+format(mass)+' g';
      }else{
        const mass=base(v,'mass','Mass weighed','mass','massUnit'),concentration=C.molarity(mass,volume,mw,assay);
        result.primary={...bestMolar(concentration),label:'Molar concentration'};
        result.secondary=[{value:concentration,unit:'M',label:'Concentration in mol/L'}, {...bestVolume(volume),label:'Final solution volume'}];
        result.instruction='The stated reagent mass in this final solution volume gives '+showQ(result.primary)+', accounting for a '+format(assay)+'% reagent purity.';
        result.working=format(mass)+' g × '+format(assay/100)+' / ('+format(mw)+' g/mol × '+format(volume)+' L) = '+format(concentration)+' mol/L';
      }
    }
    if(active==='dilution'){
      const isMass=v.basis==='ww',category=isMass?'mass':'volume';
      const stock=['molar','massConcentration'].includes(v.basis)?base(v,'stock','Stock concentration',v.basis,'stockUnit'):parse(v,'stock','Stock concentration');
      const target=['molar','massConcentration'].includes(v.basis)?base(v,'target','Target concentration',v.basis,'targetUnit'):parse(v,'target','Target concentration');
      if(['ww','vv'].includes(v.basis)&&(stock>100||target>100))throw Error('Percent '+(isMass?'w/w':'v/v')+' concentrations cannot exceed 100%.');
      const total=base(v,'amount',isMass?'Final mass':'Final volume',category,'amountUnit'),r=C.dilution(stock,target,total),display=isMass?bestMass:bestVolume;
      result.primary={...display(r.take),label:isMass?'Stock mass to take':'Stock volume to take'};
      result.secondary=[{...display(total),label:isMass?'Final solution mass':'Final solution volume'},{value:stock/target,unit:'×',label:'Dilution factor'}];
      result.instruction=r.equal?'Stock and target concentrations are equal. Use '+showQ(result.primary)+' of the stock; no dilution is required.':isMass?'Weigh '+showQ(result.primary)+' of stock solution and add '+showQ(bestMass(r.remainder))+' of solvent for '+showQ(bestMass(total))+' of final solution.':'Measure '+showQ(result.primary)+' of stock solution, then make up to a final solution volume of '+showQ(bestVolume(total))+'.';
      result.working=format(target)+' / '+format(stock)+' × '+format(total)+' '+(isMass?'g':'L')+' = '+format(r.take)+' '+(isMass?'g':'L')+' of stock';
      result.notes.push('Stock and target describe the same solute; no reaction or solute loss is assumed.');
    }
    if(active==='concentrated'){
      const assay=parse(v,'assay','Stock concentration'),density=parse(v,'density','Stock density'),mw=parse(v,'mw','Solute molar mass'),target=base(v,'target','Target concentration','molar','targetUnit'),volume=base(v,'volume','Final volume','volume','volumeUnit');
      const r=C.concentrated(assay,density,mw,target,volume);
      result.primary={...bestVolume(r.take),label:'Concentrated stock volume'};
      result.secondary=[{...bestMolar(r.stock),label:'Calculated stock concentration'},{...bestVolume(volume),label:'Final solution volume'}];
      result.instruction=r.equal?'Stock and target concentrations are equal. Use '+showQ(result.primary)+' of stock; no dilution is required.':'The required amount is '+showQ(result.primary)+' of this stock in a final solution volume of '+showQ(bestVolume(volume))+'. Use your laboratory procedure for preparation and mixing.';
      result.working='Cstock = 10 × '+format(assay)+' × '+format(density)+' / '+format(mw)+' = '+format(r.stock)+' M. Vstock = '+format(target)+' × '+format(volume)+' / '+format(r.stock)+' = '+format(r.take)+' L.';
    }
    if(active==='conversions'){
      const dir=v.direction, needsMW=['massToMolar','molarToMass'].includes(dir),mw=needsMW?parse(v,'mw','Molar mass'):null;
      const value=dir==='percentToMass'?parse(v,'value','% w/v'):base(v,'value','Concentration',dir==='molarToMass'?'molar':'massConcentration','inputUnit');
      const answer=needsMW?C.massMolar(value,mw,dir):C.percentMass(value,dir);
      result.primary=dir==='massToPercent'?{value:answer,unit:'% w/v',label:'Percent concentration'}:{...quantity(answer,dir==='massToMolar'?'molar':'massConcentration',v.outputUnit),label:dir==='massToMolar'?'Molar concentration':'Mass concentration'};
      result.instruction='The stated solution corresponds to '+showQ(result.primary)+'.';
      result.working=dir==='massToMolar'?format(value)+' g/L / '+format(mw)+' g/mol = '+format(answer)+' M':dir==='molarToMass'?format(value)+' M × '+format(mw)+' g/mol = '+format(answer)+' g/L':dir==='percentToMass'?format(value)+' × 10 = '+format(answer)+' g/L':format(value)+' g/L / 10 = '+format(answer)+'% w/v';
    }
    if(active==='serial'){
      const basis=v.basis,category=['molar','massConcentration'].includes(basis)?basis:null;
      const stock=category?base(v,'stock','Initial stock concentration',category,'stockUnit'):parse(v,'stock','Initial stock concentration');
      if(basis==='vv'&&stock>100)throw Error('% v/v cannot exceed 100%.');
      const factor=parse(v,'factor','Dilution factor'),tubes=parse(v,'tubes','Number of tubes'),volume=base(v,'amount','Volume per tube','volume','amountUnit');
      const plan=C.serialDilution(stock,factor,tubes,volume,v.volumeBasis);
      result.primary={...bestVolume(plan.stockRequired),label:'Initial stock needed for tube 1'};
      result.secondary=[{...bestVolume(plan.totalDiluent),label:'Total diluent'},{value:tubes,unit:'tubes',label:'Number of dilution steps'}];
      result.instruction=v.volumeBasis==='retained'?'Follow the tube-specific volumes below. Every tube retains '+showQ(bestVolume(volume))+' after onward transfers.':'Mix '+showQ(bestVolume(volume))+' in every tube before onward transfer. Earlier tubes retain less; the table shows the remaining volume.';
      result.working='D = '+format(factor)+'; C'+tubes+' = '+format(stock)+' / '+format(factor)+'^'+tubes+'. All transfers are from the stock or the preceding mixed tube.';
      const concentrationUnit=category?v.stockUnit:'% '+(basis==='wv'?'w/v':'v/v');
      result.serialRows=plan.rows.map(row=>({...row,concentrationDisplay:category?{value:C.convert(row.concentration,category,category==='molar'?'M':'g/L',concentrationUnit),unit:concentrationUnit}:{value:row.concentration,unit:concentrationUnit}}));
    }
    if(active==='converter'){
      const value=parse(v,'value','Value',true),r=C.convert(value,v.category,v.from,v.to);
      result.primary={value:r,unit:v.to,label:'Converted value'};
      result.instruction=format(value)+' '+v.from+' equals '+format(r)+' '+v.to+'.';
      result.working=format(value)+' × '+format(C.units[v.category][v.from])+' / '+format(C.units[v.category][v.to])+' = '+format(r)+' '+v.to;
    }
    return result;
  }
  function renderResult(){const r=memory[active].result;
    $('#serialPlan').hidden=!r?.serialRows;
    if(r?.serialRows)renderSerialPlan(r);
    $('#resultStatus').textContent=r?'Calculated':'Ready when you are';$('#working').hidden=!r;
    if(!r){$('#result').innerHTML='<div class="result-empty">'+icon('result')+'<strong>Your calculation goes here</strong><p>Enter values on the left, or load a worked example to get started.</p></div>';return;}
    $('#working').textContent=r.working;
    $('#assumptions').innerHTML='<ul>'+r.notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>';
    $('#result').innerHTML='<div class="result-number">'+esc(format(r.primary.value))+' <small>'+esc(r.primary.unit)+'</small></div><p class="result-label">'+esc(r.primary.label)+'</p>'+(r.secondary.length?'<div class="secondary-values">'+r.secondary.map(q=>'<div>'+esc(showQ(q))+'<span>'+esc(q.label)+'</span></div>').join('')+'</div>':'')+'<p class="result-instruction">'+esc(r.instruction)+'</p><div class="result-actions"><button type="button" class="quiet" data-output="copy">Copy result</button><button type="button" class="quiet" data-output="save">Save text</button><button type="button" class="quiet" data-output="print">Print</button></div>';
  }
  function renderSerialPlan(r){$('#serialPlan').innerHTML='<h3>Tube-by-tube plan</h3><p>Mix each tube before its onward transfer. Volumes below use '+esc(memory[active].values.amountUnit)+'.</p><div class="table-scroll"><table><thead><tr><th>Tube</th><th>Source</th><th>Transfer in</th><th>Diluent</th><th>After mixing</th><th>Transfer onward</th><th>Retained</th><th>Concentration</th></tr></thead><tbody>'+r.serialRows.map(row=>'<tr><td>'+row.tube+'</td><td>'+esc(row.source)+'</td>'+['transfer','diluent','mixed','outgoing','retained'].map(key=>'<td>'+esc(format(C.convert(row[key],'volume','L',memory[active].values.amountUnit)))+'</td>').join('')+'<td>'+esc(showQ(row.concentrationDisplay))+'</td></tr>').join('')+'</tbody></table></div>';}
  function warnAmbiguous(){for(const el of $('#calculatorForm').querySelectorAll('input')){const warning=C.ambiguity(el.value,(el.closest('label')?.firstChild.textContent||'Value').trim()),box=document.querySelector('[data-warning-for="'+el.name+'"]');if(box){box.textContent=warning;box.hidden=!warning;}if(warning){el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby',[...new Set([...(el.getAttribute('aria-describedby')||'').split(' '),box?.id].filter(Boolean))].join(' '));}}}
  function collect(){const values=Object.fromEntries(new FormData($('#calculatorForm')));Object.assign(memory[active].values,values);return values;}
  function clearResult(){memory[active].result=null;renderResult();$('#resultStatus').textContent='Recalculate after editing';$('#error').hidden=true;$('#calculatorForm').querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));}
  function render(){
    $('#navigation').innerHTML=Object.entries(tools).map(([key,tool])=>'<button type="button" data-tool="'+key+'" aria-current="'+(active===key?'page':'false')+'">'+icon(key)+'<span>'+esc(tool.title)+'</span></button>').join('');
    $('#toolTitle').textContent=tools[active].title;$('#toolDescription').textContent=tools[active].description;$('#fields').innerHTML=fields();$('#error').hidden=true;guidance();renderResult();warnAmbiguous();
  }
  function submit(){const values=collect();guidance();try{memory[active].result=calculate(values);const savedResult=memory[active].result;savedResult.calculatedAt=new Date().toISOString();sessionHistory.push({title:savedResult.title,summary:showQ(savedResult.primary),text:record(savedResult),at:savedResult.calculatedAt});updateHistoryCount();$('#error').hidden=true;renderResult();}catch(e){memory[active].result=null;renderResult();$('#error').textContent=e.message;$('#error').hidden=false;if(e.field){const el=$('#calculatorForm').elements.namedItem(e.field);if(el){el.setAttribute('aria-invalid','true');el.focus();}}}}
  $('#calculatorForm').addEventListener('submit',e=>{e.preventDefault();submit();});
  $('#calculatorForm').addEventListener('input',e=>{if(e.target.matches('input')){collect();clearResult();warnAmbiguous();}});
  $('#calculatorForm').addEventListener('change',e=>{if(e.target.matches('select')){collect();clearResult();if(e.target.dataset.layout)render();else guidance();}});
  $('#navigation').onclick=e=>{const b=e.target.closest('[data-tool]');if(!b)return;collect();active=b.dataset.tool;render();};
  $('#resetButton').onclick=()=>{memory[active]={values:{...defaults[active]},result:null};render();};
  const examples={percent:{operation:'prepare',basis:'wv',percent:'5',amount:'250',amountUnit:'mL'},molar:{operation:'mass',mw:'58.44',concentration:'100',concentrationUnit:'mM',volume:'100',volumeUnit:'mL',assay:'100'},dilution:{basis:'molar',stock:'1',stockUnit:'M',target:'10',targetUnit:'mM',amount:'100',amountUnit:'mL'},concentrated:{assay:'37',density:'1.19',mw:'36.46',target:'0.1',targetUnit:'M',volume:'100',volumeUnit:'mL'},conversions:{direction:'massToMolar',value:'1',inputUnit:'mg/mL',outputUnit:'mM',mw:'58.44'},serial:{basis:'molar',stock:'100',stockUnit:'mM',factor:'10',tubes:'5',amount:'1',amountUnit:'mL',volumeBasis:'mixed'},converter:{category:'mass',value:'1000000',from:'µg',to:'kg'}};
  $('#exampleButton').onclick=()=>{memory[active]={values:{...defaults[active],...examples[active]},result:null};render();submit();};
  function record(r){
    const plan=r.serialRows?'\n\nSerial dilution plan\nTube | Source | Transfer in (L) | Diluent (L) | Mixed (L) | Onward (L) | Retained (L) | Concentration\n'+r.serialRows.map(row=>[row.tube,row.source,...['transfer','diluent','mixed','outgoing','retained'].map(k=>format(row[k])),showQ(row.concentrationDisplay)].join(' | ')).join('\n'):'';
    return 'ATLaS — Solution Calculator\n'+r.title+'\n'+new Date(r.calculatedAt||Date.now()).toLocaleString('en-GB')+'\n\nInputs\n'+r.inputs.join('\n')+'\n\nResult\n'+showQ(r.primary)+' — '+r.primary.label+'\n'+r.secondary.map(q=>showQ(q)+' — '+q.label).join('\n')+'\n\n'+r.instruction+plan+'\n\nFormula\n'+r.formula+'\n'+r.working+'\n\nAssumptions\n'+r.notes.join('\n')+'\n\nDisplay precision: up to 6 significant digits; measurement precision depends on inputs.\n';
  }
  function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4000);}
  function updateHistoryCount(){$('#historyButton').textContent='History ('+sessionHistory.length+')';}
  async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Calculation copied.');}catch{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.append(ta);ta.select();try{if(!document.execCommand('copy'))throw Error();toast('Calculation copied.');}catch{toast('Copy is unavailable here. Use Save text instead.');}ta.remove();}}
  function showHistory(){$('#historyList').innerHTML=sessionHistory.length?sessionHistory.slice().reverse().map(h=>'<details class="history-entry"><summary>'+esc(new Date(h.at).toLocaleTimeString('en-GB'))+' — '+esc(h.title)+' — '+esc(h.summary)+'</summary><pre>'+esc(h.text)+'</pre></details>').join(''):'<p>No calculations yet. Completed calculations appear here.</p>';$('#copyAllHistory').disabled=!sessionHistory.length;$('#historyDialog').showModal();}
  $('#historyButton').onclick=showHistory;$('#closeHistory').onclick=()=>$('#historyDialog').close();$('#copyAllHistory').onclick=()=>copyText(sessionHistory.map(h=>h.text).join('\n'+'='.repeat(64)+'\n'));
  $('#result').onclick=async e=>{const action=e.target.closest('[data-output]')?.dataset.output,r=memory[active].result;if(!action||!r)return;const text=record(r);
    if(action==='copy')await copyText(text);
    if(action==='save'){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='atlas-'+active+'-'+new Date().toLocaleDateString('en-CA')+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
    if(action==='print'){$('#printRecord').textContent=text;window.print();}
  };
  const about=$('#aboutDialog');$('#aboutButton').onclick=()=>about.showModal();$('#footerAbout').onclick=()=>about.showModal();$('#closeAbout').onclick=()=>about.close();
  render();
})();
