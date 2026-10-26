const types=new Set(['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function intake(request,env,bookingUrl=''){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid request origin'},403);
 if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return json({error:'Please submit the intake form.'},415);
 if(Number(request.headers.get('content-length')||0)>22*1024*1024)return json({error:'Maximum upload is 20 MB.'},413);
 if(!env.BUCKET)return json({error:'Document intake is temporarily unavailable. Please try again later.'},503);
 let form;try{form=await request.formData()}catch{return json({error:'Unable to read the form.'},400)}
 if(form.get('website'))return json({error:'Unable to accept this submission.'},400);
 const get=(key,max=2000)=>String(form.get(key)||'').trim().slice(0,max);
 const email=get('email',254),name=get('name',150),service=get('service',80),message=get('message');
 if(!name||!/^\S+@\S+\.\S+$/.test(email)||!message||!['Before I Sign','Compare My Bids','Change Order Check','Not sure yet'].includes(service)||get('consent')!=='on')return json({error:'Please complete all required fields and accept the document handling notice.'},400);
 const files=form.getAll('documents').filter(f=>typeof f!=='string'&&f.size>0);
 if(files.length>5||files.reduce((s,f)=>s+f.size,0)>20*1024*1024)return json({error:'Choose up to 5 files, with a maximum combined size of 20 MB.'},413);
 if(files.some(f=>!types.has(f.type)||!/^.+\.(pdf|jpe?g|png|webp|docx?)$/i.test(f.name)))return json({error:'Supported files: PDF, DOC, DOCX, JPG, PNG, or WebP.'},400);
 const id=crypto.randomUUID(),prefix='intakes/'+id+'/',written=[];
 try{for(let i=0;i<files.length;i++){const file=files[i],key=prefix+'files/'+i+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-130);await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});written.push(key)}
 await env.BUCKET.put(prefix+'request.json',JSON.stringify({id,createdAt:new Date().toISOString(),name,email,phone:get('phone',50),service,message,preferredTime:get('preferredTime',300),timezone:get('timezone',100),files:files.map((f,i)=>({name:f.name,size:f.size,key:written[i]})),consent:true}),{httpMetadata:{contentType:'application/json'}});
 return json({reference:id.slice(0,8).toUpperCase(),bookingUrl},201);
 }catch{await Promise.allSettled(written.map(key=>env.BUCKET.delete(key)));return json({error:'Your request could not be saved. Please try again.'},503)}
}
