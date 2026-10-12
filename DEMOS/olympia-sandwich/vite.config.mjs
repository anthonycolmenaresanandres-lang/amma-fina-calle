import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
// All mutable tool output stays inside this isolated draft.
export default defineConfig({
 base:'./',
 cacheDir:fileURLToPath(new URL('./.cache/vite',import.meta.url)),
 server:{host:'127.0.0.1',port:4186,strictPort:true},
 preview:{host:'127.0.0.1',port:4186,strictPort:true},
 build:{outDir:'../../APP/web/public/demo/olympia-sandwich',emptyOutDir:false},
});
