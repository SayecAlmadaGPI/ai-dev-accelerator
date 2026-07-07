// Isla vanilla del playground JS (Fase 4d). Se monta en
// <div data-playground-mount>. Editor (textarea mono) + dropdown de ejemplos
// + boton "Ejecutar" + panel de output. La ejecucion ocurre en un iframe
// sandboxed (sandbox="allow-scripts" SIN allow-same-origin): el codigo del
// usuario no puede tocar el DOM del sitio ni las cookies. Un shim de console.*
// hace postMessage al parent, que valida event.source === iframe.contentWindow
// antes de mostrar los logs. Sin React, patron Fase 3/4.

import { examples } from '../data/playground-examples';

let iframe: HTMLIFrameElement | null = null;
let out: HTMLElement | null = null;
let runBtn: HTMLButtonElement | null = null;
let runTimer: ReturnType<typeof setTimeout> | null = null;

export function initPlayground(): void {
  if (typeof document === 'undefined') return;
  const mount = document.querySelector<HTMLElement>('[data-playground-mount]');
  if (!mount) return;

  mount.classList.add('aida-pg');

  mount.innerHTML = `
    <div class="aida-pg__bar">
      <label class="aida-pg__sel-label" for="aida-pg-sel">Ejemplo</label>
      <select id="aida-pg-sel" class="aida-pg__sel">
        <option value="">— en blanco —</option>
        ${examples
          .map((e) => `<option value="${e.id}">${esc(e.title)}</option>`)
          .join('')}
      </select>
    </div>
    <textarea class="aida-pg__editor" spellcheck="false" autocomplete="off"
      autocorrect="off" autocapitalize="off"
      placeholder="// Escribe JS y pulsa Ejecutar. Usa console.log para ver la salida."></textarea>
    <div class="aida-pg__controls">
      <button class="aida-pg__btn sl-link-button primary" type="button">Ejecutar</button>
      <button class="aida-pg__btn sl-link-button secondary" type="button">Limpiar</button>
      <span class="aida-pg__state"></span>
    </div>
    <pre class="aida-pg__out" aria-live="polite"></pre>`;

  const editor = mount.querySelector<HTMLTextAreaElement>('.aida-pg__editor')!;
  const sel = mount.querySelector<HTMLSelectElement>('.aida-pg__sel')!;
  runBtn = mount.querySelector<HTMLButtonElement>('.aida-pg__btn.primary')!;
  const clearBtn = mount.querySelector<HTMLButtonElement>('.aida-pg__btn.secondary')!;
  out = mount.querySelector<HTMLElement>('.aida-pg__out')!;
  const state = mount.querySelector<HTMLElement>('.aida-pg__state')!;

  sel.addEventListener('change', () => {
    const ex = examples.find((e) => e.id === sel.value);
    editor.value = ex ? ex.code : '';
    editor.focus();
  });

  runBtn.addEventListener('click', () => run(editor.value, state));
  clearBtn.addEventListener('click', () => {
    editor.value = '';
    clearOutput();
    state.textContent = '';
  });

  // Ctrl/Cmd+Enter ejecuta.
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run(editor.value, state);
    }
  });

  window.addEventListener('message', onMessage);

  // Carga el primer ejemplo para que la pagina no este vacia.
  if (examples.length) {
    editor.value = examples[0].code;
    sel.value = examples[0].id;
  }
}

function run(code: string, state: HTMLElement): void {
  clearOutput();
  if (runBtn) runBtn.disabled = true;
  state.textContent = 'Ejecutando…';
  state.dataset.state = 'edit';

  // Limpia un iframe anterior.
  if (iframe) {
    iframe.remove();
    iframe = null;
  }

  iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.classList.add('aida-pg__frame');
  // El srcdoc arma el shim de console + el codigo del usuario.
  iframe.srcdoc = buildSrcDoc(code);
  document.body.appendChild(iframe);

  // Timeout de seguridad: si no responde en 5s, avisamos al usuario.
  if (runTimer) clearTimeout(runTimer);
  runTimer = setTimeout(() => {
    if (runBtn && runBtn.disabled) {
      state.textContent = 'Ejecutando (paso de 5s; posible bucle infinito)';
    }
  }, 5000);
}

function onMessage(e: MessageEvent): void {
  // Seguridad: solo aceptamos mensajes del iframe que creamos.
  if (!iframe || e.source !== iframe.contentWindow) return;
  const d = e.data;
  if (!d || d.__pg !== 1) return;

  if (d.done) {
    if (runTimer) { clearTimeout(runTimer); runTimer = null; }
    if (runBtn) runBtn.disabled = false;
    const state = document.querySelector<HTMLElement>('.aida-pg__state');
    if (state) {
      state.textContent = 'Listo';
      state.dataset.state = 'ok';
    }
    return;
  }
  appendLog(d.level || 'log', d.args || []);
}

function appendLog(level: string, args: string[]): void {
  if (!out) return;
  const line = document.createElement('div');
  line.className = 'aida-pg__line aida-pg__line--' + level;
  line.textContent = args.map(formatArg).join('  ');
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function formatArg(a: any): string {
  if (a === null) return 'null';
  if (a === undefined) return 'undefined';
  if (typeof a === 'object') {
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  }
  return String(a);
}

function clearOutput(): void {
  if (out) out.textContent = '';
}

function buildSrcDoc(code: string): string {
  // Escapa secuencias que cerrarian el <script> o abririan comentarios.
  const safe = code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
  return (
    '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<script>\n' +
    '(function(){\n' +
    '  function ser(a){\n' +
    '    if(a===null) return null;\n' +
    '    if(a===undefined) return undefined;\n' +
    '    if(typeof a==="object"){ try{ return JSON.parse(JSON.stringify(a)); }catch(e){ return String(a); } }\n' +
    '    return String(a);\n' +
    '  }\n' +
    '  function send(level,args){ parent.postMessage({__pg:1,level:level,args:Array.from(args).map(ser)},"*"); }\n' +
    '  ["log","info","warn","error","debug"].forEach(function(m){\n' +
    '    var orig=console[m];\n' +
    '    console[m]=function(){ send(m,arguments); };\n' +
    '  });\n' +
    '  window.onerror=function(msg,src,line,col,err){ send("error",["Uncaught: "+(err&&err.message||msg)+(line?" (linea "+line+")":"")]); return true; };\n' +
    '  window.addEventListener("unhandledrejection",function(ev){ var r=ev.reason; send("error",["Promesa rechazada: "+(r&&r.message||r)]); });\n' +
    '})();\n' +
    'try{\n' +
    safe + '\n' +
    '}catch(e){ parent.postMessage({__pg:1,level:"error",args:["Uncaught: "+(e&&e.message||e)]},"*"); }\n' +
    'parent.postMessage({__pg:1,done:1},"*");\n' +
    '<\\/script>\n' +
    '</body></html>'
  );
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}