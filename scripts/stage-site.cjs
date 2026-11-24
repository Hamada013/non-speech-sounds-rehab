'use strict';
// Copies the published files into output/pages for GitHub Pages and checks every offline file's hash.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/pages'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const omitted=new Set(['.github','tests','scripts','node_modules','output','docs']),names=new Set(['.gitignore','AGENTS.md','README.md','package.json','package-lock.json','.DS_Store']);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const tracked=cp.execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{cwd:root}).toString().split('\0').filter(Boolean);
const context={};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/release-worker.js'),'utf8')+';this.release=RELEASE;',context);
const release=context.release,listed=[...release.shell,...release.media];
let total=0;
for(const file of new Set([...tracked,...listed.map(f=>f.url),'sw.js'])){
 const parts=file.split('/');if(parts.some(p=>omitted.has(p))||names.has(parts.at(-1)))continue;
 const source=path.join(root,file);if(!fs.existsSync(source))continue;
 const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);total++;
}
for(const file of listed)if(file.sha!==sha(fs.readFileSync(path.join(out,file.url))))throw Error('Stale offline file: run scripts/build-pwa.cjs ('+file.url+')');
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log(`Pages artifact: ${total} files in output/pages; offline release ${release.version} verified.`);
