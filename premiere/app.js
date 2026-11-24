const el=id=>document.getElementById(id);
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem('dj-show-'+k))??f}catch{return f}};
const save=(k,v)=>localStorage.setItem('dj-show-'+k,JSON.stringify(v));
const base=PRICES.flatMap((c,i)=>c.g.flatMap((g,j)=>g.s.map(([name,price,min],k)=>({id:[i,j,k].join('-'),cat:c.c,name,low:Array.isArray(price)?price[0]:price,high:Array.isArray(price)?price[1]:price,min}))));
let edits=read('prices',{}), cart=new Set(read('cart',[]).filter(id=>base.some(s=>s.id===id)));
const current=s=>({...s,...edits[s.id]});
const cash=n=>Number(n).toLocaleString('ru-RU');
const price=s=>(s.low===s.high?cash(s.low):cash(s.low)+'–'+cash(s.high))+' ₽';
const node=(tag,txt)=>Object.assign(document.createElement(tag),{textContent:txt});
const button=(txt,fn)=>{let b=node('button',txt);b.onclick=fn;return b};
if(el('service')){
 const choices=()=>{const q=el('filter').value.trim().toLowerCase();
 el('service').replaceChildren(...base.filter(s=>(s.name+' '+s.cat).toLowerCase().includes(q)).map(s=>new Option(s.cat+' · '+s.name,s.id)));load()};
 const selected=()=>base.find(s=>s.id===el('service').value);
 function load(){el('result').textContent='';const s=selected();el('edit').hidden=!s;el('restore').disabled=!s;if(s)for(const [id,key] of [['low','low'],['high','high'],['minutes','min']])el(id).value=current(s)[key];else el('result').textContent='Услуг не найдено'}
 el('filter').oninput=choices;el('service').onchange=load;
 el('edit').onsubmit=e=>{e.preventDefault();if(!selected())return;const low=+el('low').value,high=+el('high').value;if(low>high){el('result').textContent='Верхняя цена должна быть не меньше нижней.';return}edits[selected().id]={low,high,min:+el('minutes').value};save('prices',edits);el('result').textContent='Сохранено. Новая стоимость уже в меню сайта.'};
 el('restore').onclick=()=>{delete edits[selected().id];save('prices',edits);load();el('result').textContent='Исходные значения восстановлены.'};choices();
}else{
 let cat=PRICES[0].c,limit=8;
 const draw=()=>{const query=el('search').value.trim().toLowerCase();
 const rows=base.map(current).filter(s=>query?(s.cat+' '+s.name).toLowerCase().includes(query):s.cat===cat);
 el('cats').replaceChildren(...PRICES.map(c=>{const b=button(c.c,()=>{cat=c.c;limit=8;el('search').value='';draw()});b.setAttribute('aria-pressed',String(!query&&cat===c.c));return b}));
 el('prices').replaceChildren(...rows.slice(0,limit).map(s=>line(s,false)));if(!rows.length)el('prices').textContent='Ничего не найдено. Попробуйте другое название.';
 el('more').hidden=rows.length<=limit;el('count').textContent=cart.size; bag()};
 function line(s,inBag){const r=node('div','');r.className='row';const t=node('div',s.name);t.append(node('span',s.min+' мин'));const has=cart.has(s.id);
 const b=button(inBag?'−':has?'✓':'+',()=>{if(has)cart.delete(s.id);else cart.add(s.id);save('cart',[...cart]);draw()});
 b.setAttribute('aria-label',(has?'Убрать: ':'Добавить: ')+s.name);b.setAttribute('aria-pressed',String(has));r.append(t,node('b',price(s)),b);return r}
 function bag(){const items=base.filter(s=>cart.has(s.id)).map(current);el('bag').replaceChildren(...items.map(s=>line(s,true)));
 if(!items.length){el('bag').append(node('p','Выберите услуги, чтобы увидеть стоимость и длительность.'),button('К меню услуг',()=>{el('drawer').close();location.hash='menu'}))}
 const sum=k=>items.reduce((v,s)=>v+s[k],0);el('total').textContent=items.length?price({low:sum('low'),high:sum('high')})+' · '+sum('min')+' мин':'';el('actions').hidden=!items.length;el('copy').textContent='Скопировать список'}
 el('more').onclick=()=>{limit+=12;draw()};el('search').oninput=()=>{limit=8;draw()};el('basket').onclick=()=>el('drawer').showModal();
 el('copy').onclick=async()=>{const txt=[...el('bag').querySelectorAll('.row')].map(r=>r.firstChild.textContent+' · '+r.children[1].textContent).join('\n')+'\nИтого: '+el('total').textContent;try{await navigator.clipboard.writeText(txt);el('copy').textContent='Список скопирован'}catch{window.prompt('Скопируйте список',txt)}};
 const scenes=[['h1','Образы дома'],['in3','В гостях у D’ajour'],['in4','Детали интерьера']];
 const motion=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches;
 function scene(i){const [file,label]=scenes[i];el('portrait').src='img/'+file+'.jpg';el('portrait').alt=label;el('sceneLabel').textContent=label;
 if(motion())el('portrait').animate([{opacity:.45,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:650});[...el('scenes').children].forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)))}
 scenes.forEach(([,s],i)=>{const b=button('',()=>scene(i));b.setAttribute('aria-label',s);el('scenes').append(b)});scene(0);
 for(const [f,label] of [['w12','Укладка'],['w2','Макияж'],['w8','Маникюр'],['w9','Перманентный макияж'],['w10','Брови']]){const b=button('',()=>{el('light').querySelector('img').src='img/'+f+'.jpg';el('light').showModal()});b.setAttribute('aria-label','Увеличить: '+label);const img=new Image();img.loading='lazy';img.src='img/'+f+'.jpg';img.alt=label;b.append(img);el('gallery').append(b)}
 window.addEventListener('pageshow',()=>{edits=read('prices',{});draw()});window.addEventListener('storage',()=>{edits=read('prices',{});cart=new Set(read('cart',[]));draw()});draw()
}
