// Isla vanilla del simulador de terminal (Fase 4c). Se monta en
// <div data-term-mount>. Carga xterm.js + addon-fit (pesado) vía import()
// dinámico solo en esta página. Fake shell que interpreta el set curado de
// comandos por escenario (src/data/terminal-scenarios.ts) + help/clear/ls/echo
// globales. Sin React, patrón Fase 3/4.
//
// IMPORTANTE: xterm.js necesita que el contenedor tenga dimensiones reales
// cuando term.open() se llama. Usamos requestAnimationFrame para esperar al
// layout, y damos al host tabindex=0 + focus() para asegurar que reciba input.

import { scenarios, type TermScenario } from '../data/terminal-scenarios';

let term: any = null;
let fit: any = null;
let current: TermScenario = scenarios[0];
let line = '';

export async function initTerm(): Promise<void> {
  if (typeof document === 'undefined') return;
  const mount = document.querySelector<HTMLElement>('[data-term-mount]');
  if (!mount || term) return; // un solo terminal por página

  mount.classList.add('aida-term');

  // Selector de escenarios + contenedor del terminal.
  mount.innerHTML = `
    <div class="aida-term__bar">
      <label class="aida-term__sel-label" for="aida-term-sel">Escenario</label>
      <select id="aida-term-sel" class="aida-term__sel">
        ${scenarios
          .map((s) => `<option value="${s.id}">${esc(s.title)}</option>`)
          .join('')}
      </select>
      <span class="aida-term__hint">Escribe <code>help</code> + Enter</span>
    </div>
    <div class="aida-term__host" tabindex="0" aria-label="Terminal de práctica"></div>`;

  const host = mount.querySelector<HTMLElement>('.aida-term__host')!;

  // Lazy-load: xterm + addon-fit + CSS solo acá.
  const [{ Terminal }, { FitAddon }] = await Promise.all([
    import('@xterm/xterm'),
    import('@xterm/addon-fit'),
  ]);
  await import('@xterm/xterm/css/xterm.css');

  fit = new FitAddon();
  term = new Terminal({
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
    fontSize: 13,
    lineHeight: 1.3,
    cursorBlink: true,
    convertEol: false,
    theme: {
      background: '#0d0a08',
      foreground: '#e9e3da',
      cursor: '#fcd34d',
      selectionBackground: 'rgba(245,158,11,0.3)',
      black: '#0d0a08',
      brightGreen: '#22c55e',
      brightRed: '#ef4444',
      brightYellow: '#fcd34d',
      brightBlue: '#f59e0b',
      cyan: '#f59e0b',
    },
  });
  term.loadAddon(fit);

  // Esperamos al próximo frame para asegurar que el layout del host
  // tenga dimensiones reales antes de abrir xterm. Sin esto, el canvas
  // puede crearse con tamaño 0 y no recibir input.
  await new Promise((resolve) => requestAnimationFrame(resolve));

  term.open(host);

  // xterm mide el contenedor en open(); si aún no tiene layout calculado,
  // el canvas queda en 0x0. Reintentamos fit() en múltiples momentos.
  safeFit();
  requestAnimationFrame(() => {
    safeFit();
    term.refresh(0, term.rows - 1);
  });
  setTimeout(() => {
    safeFit();
    term.focus();
    term.refresh(0, term.rows - 1);
  }, 50);
  setTimeout(() => safeFit(), 300);

  // Click en cualquier parte del terminal enfoca el textarea interno.
  host.addEventListener('click', () => term.focus());

  // ResizeObserver + window resize mantienen el terminal a ancho.
  const ro = new ResizeObserver(() => safeFit());
  ro.observe(host);
  window.addEventListener('resize', onResize);

  term.onData(onData);

  loadScenario(scenarios[0]);

  mount.querySelector<HTMLSelectElement>('.aida-term__sel')!.addEventListener(
    'change',
    (e) => {
      const id = (e.target as HTMLSelectElement).value;
      const s = scenarios.find((x) => x.id === id) || scenarios[0];
      loadScenario(s);
    },
  );
}

function safeFit(): void {
  try {
    fit.fit();
  } catch {
    /* host sin layout todavía */
  }
}

function onResize(): void {
  safeFit();
}

function loadScenario(s: TermScenario): void {
  current = s;
  term.reset();
  term.writeln(`\x1b[38;5;3m${esc(s.title)}\x1b[0m`);
  s.intro.split('\n').forEach((l) => term.writeln(l));
  term.writeln('');
  writePrompt();
  term.focus();
}

function writePrompt(): void {
  term.write(`\x1b[38;5;3m${esc(current.prompt)}\x1b[0m`);
}

function onData(d: string): void {
  const code = d.charCodeAt(0);
  if (d === '\r') {
    // Enter
    term.write('\r\n');
    runCommand(line.trim());
    line = '';
    writePrompt();
  } else if (code === 127 || code === 8) {
    // Backspace: xterm envía DEL (0x7f); algunos terminales BS (0x08).
    if (line.length > 0) {
      line = line.slice(0, -1);
      term.write('\b \b');
    }
  } else if (code === 3) {
    // Ctrl-C
    term.write('^C\r\n');
    line = '';
    writePrompt();
  } else if (code === 12) {
    // Ctrl-L
    term.clear();
    writePrompt();
  } else if (code >= 32) {
    // Caracter imprimible (ignora otras teclas de control).
    line += d;
    term.write(d);
  }
}

function runCommand(cmd: string): void {
  if (!cmd) return;

  const parts = cmd.split(/\s+/);
  const head = parts[0];
  const args = parts.slice(1).join(' ');

  // Globales.
  if (head === 'clear' || head === 'cls') {
    term.clear();
    return;
  }
  if (head === 'help') {
    const keys = Object.keys(current.commands);
    term.writeln('Comandos disponibles en este escenario:');
    term.writeln('  help, clear, echo <texto>, ls [ruta]');
    keys.forEach((k) => term.writeln('  ' + k));
    if (!keys.length) term.writeln('  (ninguno específico)');
    term.writeln('');
    term.writeln('Consejo: copia y pega un comando de la lista de arriba.');
    return;
  }
  if (head === 'echo') {
    term.writeln(args);
    return;
  }
  if (head === 'ls') {
    if (cmd.includes('.planning')) {
      term.writeln('roadmap.md  state.json  tasks/  phases/');
    } else {
      term.writeln('AGENTS.md  docs/  src/  .planning/  init.sh');
    }
    return;
  }

  // Búsqueda exacta (cmd completo) primero.
  if (current.commands[cmd]) {
    printMultiline(current.commands[cmd]);
    return;
  }
  // Coincidencia por head (comando sin args en el set).
  if (current.commands[head] && !args) {
    printMultiline(current.commands[head]);
    return;
  }

  // Sugerencia: ¿el head coincide con algún comando del set?
  const suggest = Object.keys(current.commands).find((k) => k.startsWith(head));
  if (suggest) {
    term.writeln(
      `\x1b[38;5;3mComando no encontrado. ¿quisiste decir \`${esc(suggest)}\`?\x1b[0m`,
    );
  } else {
    term.writeln(`\x1b[38;5;1mComando no encontrado: ${esc(cmd)}\x1b[0m`);
    term.writeln('Escribe `help` para ver los comandos disponibles.');
  }
}

function printMultiline(text: string): void {
  text.split('\n').forEach((l) => term.writeln(l));
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}