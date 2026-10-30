import {summarize} from './calculations.mjs';
const $ = id => document.getElementById(id);
const key = 'gomeriacuenta.movements.v1';
const names = {repair:'Arreglo',tube:'Cámara',tire:'Cubierta'};
const money = value => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(value/100);
let entries = [];
let stage = 'repair';
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(saved) || !saved.every(e => names[e.type] && ['cash','transfer'].includes(e.method) && Number.isSafeInteger(e.amount) && e.amount>0 && Number.isInteger(e.quantity) && e.quantity>0 && e.quantity<=999 && typeof e.id==='string' && typeof e.description==='string')) throw new Error();
  entries = saved;
} catch { $('error').textContent='No se pudieron recuperar los datos guardados. Podés cargar nuevos movimientos.'; }
function render() {
  const t = summarize(entries);
  const repairs = summarize(entries.filter(e=>e.type==='repair'));
  const tubes = summarize(entries.filter(e=>e.type==='tube'));
  const tires = summarize(entries.filter(e=>e.type==='tire'));
  const current = stage==='repair' ? repairs : summarize(entries.filter(e=>e.type!=='repair'));
  $('repairs-total').textContent=money(repairs.total);
  $('repairs-owner').textContent=money(repairs.owner);
  $('repairs-worker').textContent=money(repairs.share);
  $('tubes-total').textContent=money(tubes.total);
  $('tubes-worker').textContent=money(tubes.share);
  $('tires-total').textContent=money(tires.total);
  $('running-total').textContent=money(current.total);
  $('running-methods').textContent=`Efectivo: ${money(current.cash)} · Transferencia: ${money(current.transfer)}`;
  for (const [id,field] of Object.entries({payment:'share',total:'total',cash:'cash',transfer:'transfer','repair-share':'repairShare','tube-share':'tubeShare',share:'share',owner:'owner',remaining:'remaining'})) $(id).textContent=money(t[field]);
  $('cash-message').textContent=t.remaining<0 ? `Faltan ${money(-t.remaining)} en efectivo para completar el pago. Hay que aportarlos de lo cobrado por transferencia.` : `Después de pagar quedan ${money(t.remaining)} en efectivo para la otra parte.`;
  $('count').textContent=entries.length;
  $('empty').hidden=entries.length>0;
  $('reset').disabled=entries.length===0;
  $('entries').replaceChildren(...entries.slice().reverse().map(e=>{
    const li=document.createElement('li');
    const info=document.createElement('div'); info.className='entry-info';
    const title=document.createElement('strong'); title.textContent=e.description || names[e.type];
    const detail=document.createElement('small'); detail.textContent=`${names[e.type]} · ${e.quantity} × ${money(e.amount)} · ${e.method==='cash'?'Efectivo':'Transferencia'}`;
    info.append(title,detail);
    const amount=document.createElement('span'); amount.className='entry-amount'; amount.textContent=money(e.amount*e.quantity);
    const remove=document.createElement('button'); remove.className='delete'; remove.textContent='×'; remove.setAttribute('aria-label',`Eliminar ${e.description || names[e.type]}`);
    remove.onclick=()=>{if(confirm('¿Eliminar este movimiento?')){entries=entries.filter(item=>item.id!==e.id);persist();}};
    li.append(info,amount,remove);return li;
  }));
}
function persist(){
  try{localStorage.setItem(key,JSON.stringify(entries));$('error').textContent='';}
  catch{$('error').textContent='El navegador no permite guardar. Los datos se perderán al cerrar esta página.';}
  render();
}
$('type').onchange=()=>{
  const type=$('type').value;
  $('amount').min=type==='tube'?'3000':'0.01';
  $('rule').textContent={repair:'El 30% del arreglo se suma al pago en efectivo.',tube:'Se suman $3.000 por cámara al del 30%. El resto de la venta queda para la otra parte.',tire:'La venta completa queda para la otra parte. No genera comisión.'}[type];
};
function setStage(next) {
  if ($('amount').value && !confirm('Hay un importe sin sumar. ¿Cambiar de paso y descartar ese importe?')) return;
  stage=next;
  $('amount').value='';
  $('added').textContent='';
  $('type-label').hidden=stage==='repair';
  for (const option of $('type').options) {option.hidden=stage==='repair'?option.value!=='repair':option.value==='repair';option.disabled=option.hidden;}
  $('type').value=stage==='repair'?'repair':'tube';
  $('type').onchange();
  $('step-title').textContent=stage==='repair'?'Primero, sumá los arreglos':'Ahora, sumá cámaras y cubiertas';
  $('running-label').textContent=stage==='repair'?'Acumulado de arreglos':'Acumulado de cámaras y cubiertas';
  $('repairs-step').setAttribute('aria-pressed',String(stage==='repair'));
  $('sales-step').setAttribute('aria-pressed',String(stage==='sales'));
  $('next-step').hidden=stage==='sales';
  render();
}
$('repairs-step').onclick=()=>setStage('repair');
$('sales-step').onclick=()=>setStage('sales');
$('next-step').onclick=()=>setStage('sales');
$('entry-form').onsubmit=e=>{
  e.preventDefault();
  const amount=Math.round(Number($('amount').value)*100), quantity=1, type=$('type').value;
  const method=e.submitter?.value;
  if(!['cash','transfer'].includes(method)){$('error').textContent='Tocá Efectivo o Transferencia para sumar el importe.';return;}
  if(!Number.isSafeInteger(amount)||amount<=0||amount>100000000000||!Number.isInteger(quantity)||quantity<1||quantity>999||(type==='tube'&&amount<300000)){$('error').textContent='Revisá el importe y la cantidad. Las cámaras deben cubrir la comisión de $3.000 por unidad.';return;}
  entries.push({id:crypto.randomUUID(),type,amount,quantity,description:'',method});
  persist();$('added').textContent=`Sumaste ${money(amount)} en ${method==='cash'?'efectivo':'transferencia'}. Ingresá el próximo importe.`;$('amount').value='';$('amount').focus();
};
$('reset').onclick=()=>{if(confirm('¿Borrar todos los movimientos y empezar una cuenta nueva? Esta acción no se puede deshacer.')){entries=[];persist();}};
render();
