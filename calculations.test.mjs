import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from './calculations.mjs';
test('reparte arreglos, comisión fija de cámaras y cubiertas sin comisión',()=>{
  const t=summarize([{type:'repair',amount:1000000,quantity:1,method:'cash'},{type:'tube',amount:1300000,quantity:2,method:'transfer'},{type:'tire',amount:5000000,quantity:1,method:'cash'}]);
  assert.deepEqual(t,{total:8600000,cash:6000000,transfer:2600000,repairShare:300000,tubeShare:600000,share:900000,owner:7700000,remaining:5100000});
});
test('detecta el efectivo faltante cuando se cobra por transferencia',()=>{
  const t=summarize([{type:'repair',amount:1000000,quantity:1,method:'transfer'}]);
  assert.equal(t.share,300000);assert.equal(t.remaining,-300000);
});
test('una cámara de $13.000 aporta solo $3.000',()=>{
  const t=summarize([{type:'tube',amount:1300000,quantity:1,method:'cash'}]);
  assert.equal(t.share,300000);assert.equal(t.owner,1000000);
});
