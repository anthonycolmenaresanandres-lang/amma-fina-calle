import assert from 'node:assert/strict';
import http from 'node:http';
const read = (port, path, headers={}) => new Promise((resolve,reject) => {
  http.get({hostname:'127.0.0.1',port,path,headers},response=>{
    let body=''; response.setEncoding('utf8'); response.on('data',chunk=>body+=chunk);
    response.on('end',()=>resolve({status:response.statusCode,body}));
  }).on('error',reject);
});
for(const path of ['/olympia','/olympia/play']) {
  assert.equal((await read(3119,path)).status,200,`Enabled ${path}`);
  assert.equal((await read(3119,path,{Host:'example.com'})).status,404,`External host ${path}`);
  assert.equal((await read(3119,path,{'x-forwarded-host':'example.com'})).status,404,`Forwarded external host ${path}`);
  assert.equal((await read(3120,path)).status,404,`Production flag absent ${path}`);
}
const menu=(await read(3119,'/olympia')).body;
assert.match(menu,/noindex/); assert.match(menu,/nofollow/);
assert.match(menu,/NY Chopped Cheese/); assert.match(menu,/Unpublished concept/);
assert(!menu.includes('50%')); assert(!menu.includes('Everyday 6AM')); assert(!menu.includes('William Housten'));
console.log('PASS Olympia HTTP: menu/game 200 locally; external/forwarded hosts 404; production without flag 404; noindex and template exclusions.');
