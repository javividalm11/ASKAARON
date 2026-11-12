import {writeFile} from 'node:fs/promises';
const endpoint='https://fonts.googleapis.com/css2?family=Inter+Tight:wght@100..900&family=Caveat+Brush&family=Anton&display=swap';
const response=await fetch(endpoint,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});if(!response.ok)throw Error('Font stylesheet: '+response.status);const css=await response.text();
for(const [family,file] of [['Inter Tight','dive-tight.woff2'],['Caveat Brush','dive-brush.woff2'],['Anton','dive-anton.woff2']]){
 const blocks=[...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(m=>m[1]);
 const block=blocks.find(b=>b.includes("'"+family+"'"));if(!block)throw Error('No latin font '+family);
 const url=block.match(/url\(([^)]+)\)/)[1],font=await fetch(url);if(!font.ok)throw Error('Font download: '+font.status);await writeFile(new URL('../assets/'+file,import.meta.url),Buffer.from(await font.arrayBuffer()));console.log('Saved '+file);
}
