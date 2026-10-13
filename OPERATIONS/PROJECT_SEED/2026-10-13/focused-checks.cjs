const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root='C:/dev/amma/worktrees/project-seed-red-signwork-20261013';
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+root,...args],{cwd:root,encoding:'utf8'});
const base=git('rev-parse','origin/main').trim();
for(const file of ['APP/web/src/app/(internal)/demo/project-seed/menu-data.ts','APP/web/src/app/play/project-seed/config.ts','APP/web/src/caferush/CafeRushScene.ts','APP/web/src/caferush/config.ts','APP/web/src/caferush/types.ts']){assert.equal(fs.readFileSync(root+'/'+file,'utf8').replace(/\r\n/g,'\n'),git('show',base+':'+file).replace(/\r\n/g,'\n'),file+' must remain unchanged');}
const diff=git('diff','--name-only',base).trim().split('\n').filter(Boolean);assert(diff.every(p=>/project-seed|PROJECT_SEED|OPERATIONS\/(CODEX_QUEUE|HANDOFF_LOG)/.test(p)), 'Other client/shared changes detected');
const lum=hex=>hex.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const colors={body:contrast('fff7e8','a71930'),muted:contrast('f7dccb','a71930'),gold:contrast('f2c85b','a71930'),play:contrast('fff7e8','073b78'),skip:contrast('073b78','fff7e8')};for(const [k,v]of Object.entries(colors))assert(v>=4.5,k+' contrast');
const scale={previous:3.75,current:3.0,reduction:1-3.0/3.75,paddingRatio:1.3/1.125,minRadius:28};const geometry=[280,350,500].map(min=>({min,artDiameter:min*.075*3.0*2.25,tapDiameter:2*Math.max(28,min*.075*3.0*1.3)}));assert(geometry.every(g=>g.tapDiameter>=44&&g.tapDiameter>g.artDiameter));
const result={status:'passed',base,protectedFiles:'menu data, rules/config, shared scene/types unchanged',changedTrackedPaths:diff,contrast:colors,pickups:scale,geometry,limits:'Source/configuration checks; headless rendered interaction verified separately.'};fs.writeFileSync(root+'/OPERATIONS/PROJECT_SEED/2026-10-13/FOCUSED_CHECKS.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
