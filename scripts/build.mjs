import { cp, mkdir, rm } from 'node:fs/promises';
const target=new URL('../dist/',import.meta.url);
await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});
for(const file of ['index.html','display.html','openplay.html','stacking.js','rentals.js','sw.js','announcement.jpeg','North yard.png','North yarn.png','North_yarn.png']) await cp(new URL('../public/'+file,import.meta.url),new URL(file,target));
console.log('Built North Yard. Native API uses Neon DATABASE_URL.');
