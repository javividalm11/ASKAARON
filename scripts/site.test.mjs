import test from'node:test';import assert from'node:assert/strict';import site from'../dist/server/index.js';
const base='https://ask-aaron.example';
test('all internal page and asset links resolve',async()=>{const response=await site.fetch(new Request(base),{});assert.equal(response.status,200);const html=await response.text();assert.match(html,/Ask Aaron/);const paths=[...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map(m=>m[1]);for(const path of new Set(paths)){const result=await site.fetch(new Request(base+path),{});assert.equal(result.status,200,path)}for(const path of['/start','/insights','/privacy','/services/compare-my-bids','/services/change-order-check','/insights/what-does-as-discussed-really-mean','/sitemap.xml','/robots.txt'])assert.equal((await site.fetch(new Request(base+path),{})).status,200,path);assert.equal((await site.fetch(new Request(base+'/missing'),{})).status,404)});
test('homepage includes the working consultation intake',async()=>{const html=await(await site.fetch(new Request(base),{})).text();assert.match(html,/editorial-hero/);assert.match(html,/id="intake"/);assert.match(html,/name="name"[^>]*required/);assert.match(html,/name="email"[^>]*required/);assert.match(html,/name="service"[^>]*required/);assert.match(html,/name="documents" multiple/);assert.match(html,/name="consent" type="checkbox" required/);assert.match(html,/name="message" required/)});
function form(){const f=new FormData;f.set('name','Test homeowner');f.set('email','test@example.com');f.set('service','Before I Sign');f.set('message','Review a renovation proposal');f.set('consent','on');return f}
function submit(f,origin=base){return new Request(base+'/api/intake',{method:'POST',headers:{Origin:origin},body:f})}
test('intake persists metadata and file privately',async()=>{const records=new Map;const f=form();f.append('documents',new File(['%PDF-1.4 test'],'estimate.pdf',{type:'application/pdf'}));const response=await site.fetch(submit(f),{BUCKET:{put:async(k,v)=>records.set(k,v)}});assert.equal(response.status,201);assert.equal(records.size,2);const metadata=JSON.parse([...records].find(([k])=>k.endsWith('request.json'))[1]);assert.equal(metadata.email,'test@example.com');assert.equal(metadata.files[0].name,'estimate.pdf');assert.equal((await response.json()).reference.length,8);assert.equal((await site.fetch(new Request(base+'/'+metadata.files[0].key),{})).status,404)});
test('intake rejects invalid origin, missing consent, and unsupported files',async()=>{const env={BUCKET:{put:async()=>{throw Error('Should not write')}}};assert.equal((await site.fetch(submit(form(),'https://other.example'),env)).status,403);const missing=form();missing.delete('consent');assert.equal((await site.fetch(submit(missing),env)).status,400);const bad=form();bad.append('documents',new File(['alert(1)'],'test.html',{type:'text/html'}));assert.equal((await site.fetch(submit(bad),env)).status,400);assert.equal((await site.fetch(submit(form()),{})).status,503)});
test('failed storage does not claim success and cleans uploaded files',async()=>{let calls=0;const deleted=[];const f=form();f.append('documents',new File(['data'],'photo.jpg',{type:'image/jpeg'}));const response=await site.fetch(submit(f),{BUCKET:{put:async()=>{if(++calls===2)throw Error('storage unavailable')},delete:async key=>deleted.push(key)}});assert.equal(response.status,503);assert.equal(deleted.length,1)});


test('Pages build includes entry HTML and serves assets through the Pages binding',async()=>{
  const {readFile,stat}=await import('node:fs/promises');
  const {default:pages}=await import('../dist/pages/_worker.js');
  const output=new URL('../dist/pages/',import.meta.url);
  assert.match(await readFile(new URL('index.html',output),'utf8'),/editorial-hero/);
  assert.ok((await stat(new URL('_worker.js',output))).size<1024*1024,'Worker must not embed image assets');
  const env={ASSETS:{fetch:async request=>{
    const path=new URL(request.url).pathname.slice(1);
    return new Response(await readFile(new URL(path,output)),{headers:{'Content-Type':path.endsWith('.css')?'text/css':'image/png'}});
  }}};
  const home=await pages.fetch(new Request(base),env);
  assert.equal(home.status,200);
  assert.match(await home.text(),new RegExp('<link rel="canonical" href="'+base+'/"'));
  for(const path of ['/styles.css','/assets/logo.png']){
    const response=await pages.fetch(new Request(base+path),env);
    assert.equal(response.status,200);
    assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL(path.slice(1),output)));
  }
  assert.equal((await pages.fetch(new Request(base+'/missing'),env)).status,404);
  assert.equal((await pages.fetch(submit(form()),env)).status,503);
  const records=new Map;
  const response=await pages.fetch(submit(form()),{...env,BUCKET:{put:async(k,v)=>records.set(k,v)}});
  assert.equal(response.status,201);
  assert.equal(records.size,1);
});
