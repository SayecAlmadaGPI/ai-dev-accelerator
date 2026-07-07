// Isla vanilla del playground JS (Fase 4d).
// Soporta múltiples instancias (querySelectorAll). Lee data-example para
// precargar un ejemplo específico. Cada instancia encapsula su propio estado.
// Ejecuta en iframe sandboxed (allow-scripts SIN allow-same-origin).

import { examples } from '../data/playground-examples';

export function initPlayground(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('[data-playground-mount]').forEach((mount) => {
    if ((mount as any).__pgMounted) return;
    (mount as any).__pgMounted = true;
    mountPlayground(mount);
  });
}

function mountPlayground(host: HTMLElement): void {
  const exampleId = host.dataset.example;
  const startExample =
    examples.find((e) => e.id === exampleId) || examples[0];

  host.classList.add('aida-pg');

  host.innerHTML = `
    <div class="aida-pg__bar">
      <label class="aida-pg__sel-label" for="aida-pg-sel-${uniqueId()}">Ejemplo</label>
      <select id="aida-pg-sel-${uniqueId()}" class="aida-pg__sel">
        <option value="">— en blanco —</option>
        ${examples
          .map(
            (e) =>
              `<option value="${e.id}"${e.id === startExample.id ? ' selected' : ''}>${esc(e.title)}</option>`,
          )
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

  const editor = host.querySelector<HTMLTextAreaElement>('.aida-pg__editor')!;
  const sel = host.querySelector<HTMLSelectElement>('.aida-pg__sel')!;
  const runBtn = host.querySelector<HTMLButtonElement>('.aida-pg__btn.primary')!;
  const clearBtn = host.querySelector<HTMLButtonElement>('.aida-pg__btn.secondary')!;
  const out = host.querySelector<HTMLElement>('.aida-pg__out')!;
  const state = host.querySelector<HTMLElement>('.aida-pg__state')!;

  let iframe: HTMLIFrameElement | null = null;
  let runTimer: ReturnType<typeof setTimeout> | null = null;

  // Creamos un handler de message que solo acepta de NUESTRO iframe.
  function onMessage(e: MessageEvent): void {
    if (!iframe || e.source !== iframe.contentWindow) return;
    const d = e.data;
    if (!d || d.__pg !== 1) return;

    if (d.done) {
      if (runTimer) {
        clearTimeout(runTimer);
        runTimer = null;
      }
      runBtn.disabled = false;
      state.textContent = 'Listo';
      state.dataset.state = 'ok';
      return;
    }
    appendLog(d.level || 'log', d.args || []);
  }

  function appendLog(level: string, args: string[]): void {
    const line = document.createElement('div');
    line.className = 'aida-pg__line aida-pg__line--' + level;
    line.textContent = args.map(formatArg).join('  ');
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function clearOutput(): void {
    out.textContent = '';
  }

  function run(code: string): void {
    clearOutput();
    runBtn.disabled = true;
    state.textContent = 'Ejecutando…';
    state.dataset.state = 'edit';

    if (iframe) {
      iframe.remove();
      iframe = null;
    }

    iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.classList.add('aida-pg__frame');
    iframe.srcdoc = buildSrcDoc(code);
    document.body.appendChild(iframe);

    if (runTimer) clearTimeout(runTimer);
    runTimer = setTimeout(() => {
      if (runBtn.disabled) {
        state.textContent = 'Ejecutando (paso de 5s; posible bucle infinito)';
      }
    }, 5000);
  }

  sel.addEventListener('change', () => {
    const ex = examples.find((e) => e.id === sel.value);
    editor.value = ex ? ex.code : '';
    editor.focus();
  });

  runBtn.addEventListener('click', () => run(editor.value));
  clearBtn.addEventListener('click', () => {
    editor.value = '';
    clearOutput();
    state.textContent = '';
  });

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run(editor.value);
    }
  });

  window.addEventListener('message', onMessage);

  if (startExample) {
    editor.value = startExample.code;
    sel.value = startExample.id;
  }
}

function buildSrcDoc(code: string): string {
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

let idCounter = 0;
function uniqueId() {
  return 'p' + ++idCounter;
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}