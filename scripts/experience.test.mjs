import test from 'node:test';
import assert from 'node:assert/strict';
import {getGuideAnswer} from '../src/experience.js';

test('guide distinguishes the free call from an unpriced paid document review',()=>{
 const answer=getGuideAnswer('How much does a document review cost?');
 assert.match(answer.text,/15-minute consultation is free/);
 assert.match(answer.text,/separate paid service/);
 assert.doesNotMatch(answer.text,/\$\s*\d/);
});
test('guide routes a bid comparison to the matching service',()=>{
 const answer=getGuideAnswer('I want to compare three quotes');
 assert.equal(answer.links[0].href,'/services/compare-my-bids');
 assert.match(answer.text,/two or three/);
});
test('Spanish upload question gets the actual file limits in Spanish',()=>{
 const answer=getGuideAnswer('Que archivos puedo subir?');
 assert.match(answer.text,/5 archivos/);assert.match(answer.text,/20 MB/);
 assert.match(answer.text,/formulario/);assert.ok(answer.links.some(link=>link.href==='/privacy'));
});
test('guide does not promise legal advice or guaranteed outcomes',()=>{
 const answer=getGuideAnswer('Can you guarantee my contractor will perform?');
 assert.match(answer.text,/does not guarantee/);assert.match(answer.text,/does not replace legal advice/);
});
test('unknown requests are handed to Aaron without inventing a project assessment',()=>{
 const answer=getGuideAnswer('Tell me exactly whether this beam is safe to remove.');
 assert.match(answer.text,/can’t assess/);assert.ok(answer.links.some(link=>link.href==='/#intake'));
});
test('guide always returns readable answers and internal destinations',()=>{
 for(const question of['hola','donde puedo contactar','Which service do I need?','How does it work?','Change order check','Who is Aaron?','Book a call','Before I Sign','privacy','<script>alert(1)</script>']){
  const answer=getGuideAnswer(question);assert.ok(typeof answer.text==='string'&&answer.text.length>50);
  assert.ok(answer.links.length>0);for(const link of answer.links){assert.ok(link.href.startsWith('/'));assert.ok(link.label.length>0)}
 }
});
