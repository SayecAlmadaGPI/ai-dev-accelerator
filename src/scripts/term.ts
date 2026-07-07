// Isla vanilla del simulador de terminal (Fase 4c).
// Soporta múltiples instancias (querySelectorAll). Lee data-scenario para
// precargar un escenario específico. Cada instancia encapsula su propio estado.

import { scenarios, type TermScenario } from '../data/terminal-scenarios';

export function initTerm(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('[data-term-mount]').forEach((mount) => {
    if ((mount as any).__termMounted) return;
    (mount as any).__termMounted = true;
    mountTerm(mount);
  });
}

function mountTerm(host: HTMLElement): void {
  const scenarioId = host.dataset.scenario;
  const startScenario =
    scenarios.find((s) => s.id === scenarioId) || scenarios[0];

  host.classList.add('aida-term');

  host.innerHTML = `
    <div class="aida-term__bar">
      <label class="aida-term__sel-label" for="aida-term-sel-${uniqueId()}">Escenario</label>
      <select id="aida-term-sel-${uniqueId()}" class="aida-term__sel">
        ${scenarios
          .map((s) => `<option value="${s.id}"${s.id === startScenario.id ? ' selected' : ''}>${esc(s.title)}</option>`)
          .join('')}
      </select>
      <span class="aida-term__hint">Escribe <code>help</code> + Enter</span>
    </div>
    <div class="aida-term__screen" aria-live="polite" aria-label="Salida del terminal"></div>
    <div class="aida-term__inputline">
      <span class="aida-term__prompt" aria-hidden="true"></span>
      <input class="aida-term__input" type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="Comando" />
    </div>`;

  const screen = host.querySelector<HTMLElement>('.aida-term__screen')!;
  const prompt = host.querySelector<HTMLElement>('.aida-term__prompt')!;
  const input = host.querySelector<HTMLInputElement>('.aida-term__input')!;

  let current: TermScenario = startScenario;
  let history: string[] = [];
  let histIdx = -1;

  function setPrompt() {
    prompt.textContent = current.prompt;
  }

  function writeLine(text: string, cls?: string) {
    const lineEl = document.createElement('div');
    lineEl.className = 'aida-term__line' + (cls ? ' ' + cls : '');
    lineEl.innerHTML = esc(text).replace(/ /g, '&nbsp;');
    screen.appendChild(lineEl);
    screen.scrollTop = screen.scrollHeight;
  }

  function writeMultiline(text: string) {
    text.split('\n').forEach((l) => writeLine(l));
  }

  function loadScenario(s: TermScenario) {
    current = s;
    screen.innerHTML = '';
    history = [];
    histIdx = -1;
    setPrompt();
    writeLine(s.title, 'aida-term__line--title');
    s.intro.split('\n').forEach((l) => writeLine(l));
    input.value = '';
    input.focus();
  }

  function runCommand(cmd: string) {
    if (!cmd) return;
    history.push(cmd);
    histIdx = history.length;

    const parts = cmd.split(/\s+/);
    const head = parts[0];
    const args = parts.slice(1).join(' ');

    if (head === 'clear' || head === 'cls') {
      screen.innerHTML = '';
      return;
    }
    if (head === 'help') {
      const keys = Object.keys(current.commands);
      writeLine('Comandos disponibles en este escenario:');
      writeLine('  help, clear, echo <texto>, ls [ruta]');
      keys.forEach((k) => writeLine('  ' + k));
      if (!keys.length) writeLine('  (ninguno específico)');
      writeLine('');
      writeLine('Consejo: copia y pega un comando de la lista de arriba.');
      return;
    }
    if (head === 'echo') {
      writeLine(args);
      return;
    }
    if (head === 'ls') {
      if (cmd.includes('.planning')) {
        writeLine('roadmap.md  state.json  tasks/  phases/');
      } else {
        writeLine('AGENTS.md  docs/  src/  .planning/  init.sh');
      }
      return;
    }

    if (current.commands[cmd]) {
      writeMultiline(current.commands[cmd]);
      return;
    }
    if (current.commands[head] && !args) {
      writeMultiline(current.commands[head]);
      return;
    }

    const suggest = Object.keys(current.commands).find((k) => k.startsWith(head));
    if (suggest) {
      writeLine(
        `Comando no encontrado. ¿quisiste decir \`${suggest}\`?`,
        'aida-term__line--warn',
      );
    } else {
      writeLine(`Comando no encontrado: ${cmd}`, 'aida-term__line--error');
      writeLine('Escribe `help` para ver los comandos disponibles.');
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input.value.trim();
      if (cmd) {
        writeLine(current.prompt + cmd);
        runCommand(cmd);
      }
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
      } else {
        histIdx = history.length;
        input.value = '';
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      input.value = '';
      writeLine('^C');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      screen.innerHTML = '';
    }
  });

  host.addEventListener('click', (e) => {
    if (e.target !== input) input.focus();
  });

  host.querySelector<HTMLSelectElement>('.aida-term__sel')!.addEventListener(
    'change',
    (e) => {
      const id = (e.target as HTMLSelectElement).value;
      const s = scenarios.find((x) => x.id === id) || scenarios[0];
      loadScenario(s);
    },
  );

  loadScenario(startScenario);
}

let idCounter = 0;
function uniqueId() {
  return 't' + ++idCounter;
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}