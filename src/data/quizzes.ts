// Contenido de quizzes por módulo (Fase 4a). Fuente autorada, committed.
// Clave = slug del módulo (coincide con trackable.json y PageTitle).
// TODO en español neutro, forma tú, sin voseo.
// Cada pregunta: { q, options, answer (índice 0-based), explain? }.

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
}
export interface Quiz {
  slug: string;
  title: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    slug: 'modules/00-lenguaje-operativo',
    title: 'Módulo 0 — Lenguaje Operativo',
    questions: [
      {
        q: 'Un agente que "aprendió" tu codebase en una sesión no sabe nada en la siguiente. ¿Por qué?',
        options: [
          'Porque el modelo es no determinista y decide olvidar.',
          'Porque el aprendizaje de la sesión vivió en el contexto, no en los parámetros; al cerrar el contexto, se pierde.',
          'Porque el proveedor reinicia el modelo entre sesiones.',
          'Porque la context window se llena y borra lo anterior.',
        ],
        answer: 1,
        explain: 'El conocimiento paramétrico (training) está congelado; lo que el agente "aprendió" en la sesión era contextual. Si no lo persistes en archivos, desaparece al cerrar el contexto.',
      },
      {
        q: 'Le preguntas al agente "¿no será mejor usar Redis?" y responde "sí, excelente", aunque Mongo era la opción correcta. Esto es:',
        options: [
          'Hallucination de tipo factuality.',
          'Sycophancy: el modelo tiende a validar tu sugerencia en lugar de cuestionarla.',
          'Faithfulness: se desvió del pedido.',
          'Context rot.',
        ],
        answer: 1,
        explain: 'La validación del modelo no es señal de corrección. El sycophancy es la tendencia a estar de acuerdo contigo aunque estés equivocado.',
      },
      {
        q: 'Una API cambió después del cutoff de entrenamiento del modelo. ¿Qué pasa cuando el agente la usa?',
        options: [
          'La usa mal, porque su conocimiento paramétrico está desactualizado.',
          'La detecta automáticamente y busca la nueva versión.',
          'Nada: el contexto lo corrige siempre.',
          'Falla porque el modelo se rehúsa.',
        ],
        answer: 0,
        explain: 'El conocimiento paramétrico tiene fecha de corte. Lo cambiante debe ir en el contexto (archivos, docs), no en la memoria del modelo.',
      },
      {
        q: 'El costo de una sesión larga crece de forma cuadrática con los turnos. ¿Qué lo rompe?',
        options: [
          'Aumentar el effort.',
          'Compactar el contexto (resumir y descartar) para no re-procesar todo el historial cada turno.',
          'Cambiar a un modelo más barato.',
          'Usar prefix cache únicamente.',
        ],
        answer: 1,
        explain: 'Cada turno re-envía todo el historial; el costo es cuadrático. Compactar reduce lo que se re-procesa y rompe esa cuadrática.',
      },
    ],
  },
  {
    slug: 'modules/01-mentalidad-harness',
    title: 'Módulo 1 — Mentalidad de Harness',
    questions: [
      {
        q: '¿Cuál es la idea central del módulo?',
        options: [
          'El modelo es lo único que importa; elijes el mejor y listo.',
          'El agente = modelo + harness; el modelo es dado, el harness es tuyo y ahí se gana o pierde la confiabilidad.',
          'El harness es opcional para modelos capaces.',
          'El harness es solo el system prompt.',
        ],
        answer: 1,
        explain: 'El modelo es dado por el proveedor; el harness (system prompt, AGENTS.md, tools, permisos, hooks, CI) lo diseñas tú. La confiabilidad se gana en el harness.',
      },
      {
        q: 'Una regla que dice "usa el patrón repository" en AGENTS.md es *prosa frágil*. ¿Qué la convierte en enforcement real?',
        options: [
          'Repetirla más veces en el system prompt.',
          'Ponerla en mayúsculas.',
          'Un check determinista (linter que rompe el build) o un generador que scaffoldee la forma correcta.',
          'Cambiar de modelo.',
        ],
        answer: 2,
        explain: 'La jerarquía de enforcement va de débil a fuerte: prosa → regla scoped → check determinista → generador. Lo mecánico no depende del humor del modelo.',
      },
      {
        q: '¿Por qué "probe con Claude y no me dio bueno, Cursor sí" casi nunca es una comparación honesta de modelos?',
        options: [
          'Porque Claude y Cursor usan modelos distintos siempre.',
          'Porque estás comparando dos harnesses distintos sobre el mismo modelo, y atribuyes al modelo lo que es del harness.',
          'Porque Cursor no usa LLM.',
          'Porque la métrica es subjetiva.',
        ],
        answer: 1,
        explain: 'Cambiar de herramienta cambia el harness, no solo el modelo. Atribuir al modelo lo que es mérito o culpa del harness es el error de base.',
      },
      {
        q: '¿Por qué fallan los agentes capaces? El cuello de botella NO es:',
        options: [
          'La no determinación.',
          'La atención finita.',
          'El contexto corruptible.',
          'La falta de capacidad del modelo.',
        ],
        answer: 3,
        explain: 'La capacidad no es el cuello de botella. Lo son la no determinación, la atención finita y el contexto corruptible. El harness crea un entorno donde la capacidad se aprovecha sin desviarse.',
      },
    ],
  },
  {
    slug: 'modules/02-spec-plan-execute',
    title: 'Módulo 2 — Especificar, Planificar y Ejecutar',
    questions: [
      {
        q: 'En vibe coding vs SDD, ¿dónde se resuelve la ambigüedad?',
        options: [
          'Vibe: en runtime dentro del agente, sin auditoría. SDD: en la spec, con revisión humana, antes de escribir código.',
          'Vibe: en la spec. SDD: en runtime.',
          'Ambos en runtime.',
          'Ambos en la spec.',
        ],
        answer: 0,
        explain: 'Vibe coding resuelve la ambigüedad en runtime, sin auditoría. SDD la resuelve en la spec, con revisión humana, antes de que se escriba una línea de código.',
      },
      {
        q: 'Los tres niveles de rigor de SDD son:',
        options: [
          'Spec-First, Spec-Anchored, Spec-Iterative.',
          'Spec-Lite, Spec-Medium, Spec-Full.',
          'Prompt, Plan, Code.',
          'Vibe, TDD, SDD.',
        ],
        answer: 0,
        explain: 'Spec-First (antes de codear), Spec-Anchored (spec que deriva con el código), Spec-Iterative (spec que emerges del prototipo). Elegir mal el nivel es el error más caro.',
      },
      {
        q: '¿Para qué sirve el marcador [NEEDS CLARIFICATION] en una spec?',
        options: [
          'Para señalar lo que el agente inventó.',
          'Para marcar ambigüedades como bloqueantes: cada una es una casilla que debe resolverse antes de ejecutar, no en silencio.',
          'Para indicar bugs.',
          'Para marcar tests faltantes.',
        ],
        answer: 1,
        explain: '[NEEDS CLARIFICATION] convierte la ambigüedad en una casilla explícita y bloqueante. El mismo ticket vago, procesado con SDD, no tiene ni una decisión tomada en silencio.',
      },
      {
        q: '¿Qué distingue a GSD de Superpowers?',
        options: [
          'GSD orquesta entre sesiones (lo durable); Superpowers disciplina la implementación dentro de una sesión.',
          'GSD es para prototipos; Superpowers para producción.',
          'Son lo mismo con distinto nombre.',
          'GSD usa subagentes; Superpowers no.',
        ],
        answer: 0,
        explain: 'Se solapan intencionalmente. GSD prioriza la orquestación durable entre sesiones; Superpowers prioriza la disciplina de implementación dentro de una sesión. Se complementan.',
      },
    ],
  },
  {
    slug: 'modules/03-workbench',
    title: 'Módulo 3 — Diseño del Entorno de Trabajo',
    questions: [
      {
        q: '¿Qué NO pertenece en el AGENTS.md?',
        options: [
          'Reglas de estilo que difieren de los defaults.',
          'Documentación de API detallada (esa va en docs/, referenciada con un context pointer).',
          'Instrucciones de testing (dónde viven, convenciones).',
          'Etiqueta del repo (branching, PR).',
        ],
        answer: 1,
        explain: 'El AGENTS.md es denso. La API detallada va en docs/ y se referencia con un context pointer; meterla en el AGENTS.md lo hincha y compite por slots de contexto.',
      },
      {
        q: 'Una regla "no borres migraciones" en AGENTS.md es prosa. ¿Cómo la vuelves mecánica?',
        options: [
          'Repetirla en el system prompt.',
          'Un hook PreToolUse que bloquea cualquier write a db/migrations/*.sql ya aplicados: el agente no puede hacerlo.',
          'Pedirle al agente que la recuerde.',
          'Moverla a un comentario del código.',
        ],
        answer: 1,
        explain: 'Lo crítico pertenece a hooks (mecánico, determinista); lo demás puede vivir en prosa scoped. Un hook hace el error estructuralmente imposible, no solo desaconsejado.',
      },
      {
        q: '¿Para qué sirve un subagent?',
        options: [
          'Para acelerar el agente principal.',
          'Para aislamiento de contexto: investigación o verificación con contexto fresco, sin llenar el del agente principal.',
          'Para reemplazar al agente principal.',
          'Para correr tests más rápido.',
        ],
        answer: 1,
        explain: 'El subagent lee N archivos o verifica un diff sin saturar el contexto del principal. La revisión adversarial con un subagent fresco detecta lo que el principal, saturado, ya no ve.',
      },
      {
        q: 'La causa #1 de "el agente borró algo que no debía" es:',
        options: [
          'Un bug del modelo.',
          'Elegir mal el modo de autonomía: estado mutante sin sandbox asume riesgo sin querer.',
          'Falta de tests.',
          'Un AGENTS.md chico.',
        ],
        answer: 1,
        explain: 'El permiso es la modalidad de autonomía. Elegir el modo correcto (read-only, propose-then-commit, full-agent) según riesgo es la decisión más subestimada del workbench.',
      },
    ],
  },
  {
    slug: 'modules/04-handoffs',
    title: 'Módulo 4 — Flujo de Trabajo y Handoffs',
    questions: [
      {
        q: '¿Por qué un handoff entre sesiones, y no seguir en la misma conversación?',
        options: [
          'Porque el contexto se degrada con el tamaño y la conversación no es auditable ni diff-able; el estado debe vivir en archivos.',
          'Porque las sesiones largas son más baratas.',
          'Porque el modelo no recuerda nada.',
          'Porque GitHub no permite sesiones largas.',
        ],
        answer: 0,
        explain: 'El estado viaja por artefactos de archivo (spec, state.json, handoff), no por la conversación. La conversación se degrada y no es auditable; los archivos sí.',
      },
      {
        q: '¿Cuándo compactar el contexto proactivamente?',
        options: [
          'Nunca; mejor dejar que el sistema lo haga solo.',
          'Alrededor del ~60% de contexto, antes de esperar al autocompact reactivo (~83%) donde pierdes el control sobre qué sobrevive.',
          'Al 100%.',
          'Solo al cerrar la sesión.',
        ],
        answer: 1,
        explain: 'Compactación proactiva (~60%) te deja decidir qué sobrevive; la reactiva (~83%) decide tarde y por ti. Llegar al borde del costo cuadrático sin cerrar es mala señal.',
      },
      {
        q: '¿Qué NO debe contener un handoff?',
        options: [
          'La spec activa (o su referencia).',
          'El progreso real, no el narrado.',
          'Una transcripción completa de toda la conversación.',
          'Los bloqueantes y las decisiones tomadas.',
        ],
        answer: 2,
        explain: 'El handoff es un índice hacia la spec + el estado narrado, no una transcripción. Si tu handoff es más largo que la spec, es mala señal: la spec debe hacer el trabajo pesado.',
      },
      {
        q: 'El agente te dice "hice todo, commiteo". ¿Qué haces?',
        options: [
          'Confías y mergears.',
          'Detente. Preguntas qué se verificó (comando + número), qué no, y si el commit es por unidad coherente.',
          'Reinicias la sesión.',
          'Cambias de modelo.',
        ],
        answer: 1,
        explain: 'Un commit por unidad coherente (una feature) y un reporte DONE/VERIFIED. "Hice todo" sin evidencia es exactamente lo que el handoff/verificación existe para atrapar.',
      },
    ],
  },
  {
    slug: 'modules/05-herramientas-mcp',
    title: 'Módulo 5 — Herramientas y Protocolos de Integración',
    questions: [
      {
        q: '¿Cuál es la distinción más importante de MCP?',
        options: [
          'Tool vs Resource: una Tool ejecuta una acción (con side effects); un Resource expone datos leídos (sin side effects).',
          'Host vs Server.',
          'Prompt vs Tool.',
          'Roots vs Resources.',
        ],
        answer: 0,
        explain: 'Una Tool es acción (puede mutar, idempotencia importa); un Resource es lectura. Confundirlas lleva a diseñar mal la superficie y los permisos.',
      },
      {
        q: 'Un reintento del modelo después de una Tool con side effects duplica el side effect. ¿Cómo lo evitas?',
        options: [
          'Reintentar siempre.',
          'Diseñar Tools idempotentes o con identificadores de operación, y manejar el reintento explícitamente.',
          'Desactivar los reintentos del modelo.',
          'Usar Resources en su lugar.',
        ],
        answer: 1,
        explain: 'El bug más común y silencioso de las integraciones. La Tool debe ser idempotente o devolver error recuperable; el reintento ciego duplica side effects.',
      },
      {
        q: '¿Cuándo NO merece la pena construir un MCP server?',
        options: [
          'Cuando el agente puede hacerlo bien con curl y cat.',
          'Siempre; MCP es obligatorio.',
          'Solo para tareas triviales.',
          'Cuando el modelo es capaz.',
        ],
        answer: 0,
        explain: 'Construye MCP para el flujo que más tiempo te roba por falta de acceso estructurado, no por moda. Si curl+cat basta, no hace falta MCP.',
      },
      {
        q: '¿Qué es el "host" en MCP?',
        options: [
          'El servidor que expone tools.',
          'La aplicación que el usuario maneja: decide qué servidores conectar y con qué permisos.',
          'El modelo.',
          'El sandbox.',
        ],
        answer: 1,
        explain: 'El host (Cursor, Claude Code) es la app del usuario; conecta servidores y controla permisos. El modelo decide qué Tool invocar, pero a través del harness, no directamente.',
      },
    ],
  },
  {
    slug: 'modules/06-verificacion',
    title: 'Módulo 6 — Verificación y Control de Calidad',
    questions: [
      {
        q: 'El agente afirma "Corrí los tests y pasaron" pero no ejecutó nada. Esto es:',
        options: [
          'Phantom verification: el reporte sin la ejecución.',
          'Hollow report: corrió algo pero el reporte es hueco.',
          'Fake-passing test: el test pasa pero no prueba lo pedido.',
          'Test gaming.',
        ],
        answer: 0,
        explain: 'Phantom = no corrió. Hollow = corrió pero sin números/alcance. Fake-passing = corrió y pasa, pero no prueba lo que se pedía. Exigir el schema DONE/VERIFIED los separa.',
      },
      {
        q: '¿Por qué mecánico > advisory para lo crítico?',
        options: [
          'Porque es más rápido.',
          'Porque lo mecánico (hooks, CI, linters) es determinista y no depende del modelo; lo advisory es prosa que el modelo puede ignorar.',
          'Porque cuesta menos.',
          'Porque es más fácil de escribir.',
        ],
        answer: 1,
        explain: 'La jerarquía hooks > scoped rules > AGENTS.md. Lo crítico vive en la capa más baja (mecánico) porque no depende de que el modelo esté de buen humor.',
      },
      {
        q: '¿Qué partes tiene el reporte DONE/VERIFIED?',
        options: [
          '1. Qué se verificó, 2. Qué NO se verificó, 3. Supuestos hechos, 4. Qué revisa el humano primero.',
          'Solo "pasó/no pasó".',
          '1. Tests, 2. Coverage, 3. Lint.',
          '1. Qué hiciste, 2. Qué falta.',
        ],
        answer: 0,
        explain: 'Las 4 partes separan "verifiqué" de "creo que verifiqué": comandos + números, lo que quedó fuera, lo asumido, y el top-1 de riesgo para ojos humanos.',
      },
      {
        q: 'El agente "acomoda" el test para que testee algo más fácil y pase. Esto es:',
        options: [
          'Test gaming: el código se adapta al test en lugar de al revés; la defensa es que el test describa lo existente y mutation testing.',
          'Phantom verification.',
          'Hollow report.',
          'Environment mismatch.',
        ],
        answer: 0,
        explain: 'Test gaming es el modo más insidioso: el test pasa pero no prueba lo pedido. Mutation testing valida que el test realmente atrapa cambios.',
      },
    ],
  },
  {
    slug: 'modules/07-failure-modes',
    title: 'Módulo 7 — Failure Modes y Defensa Práctica',
    questions: [
      {
        q: 'Según la taxonomía, ¿qué clase de falla agrupa ~40% de los casos?',
        options: [
          'Corrupción de contexto (el contexto se satura/degrada).',
          'Mal uso de tools.',
          'Trayectoria / degeneración.',
          'Sandbox y seguridad.',
        ],
        answer: 0,
        explain: 'La corrupción de contexto es la #1 (≈40%). Por eso la primera pregunta ante una falla es "¿el contexto está saturado?"; si sí, compactar antes que más prompt.',
      },
      {
        q: '¿Qué es "deception" como failure mode?',
        options: [
          'El modelo miente a propósito.',
          'Verificar sin ejecutar; incluye forjar la evidencia de verificación.',
          'Un bug del harness.',
          'Una inyección de prompt.',
        ],
        answer: 1,
        explain: 'Deception es más amplio que "verificar sin ejecutar": incluye forjar la evidencia. Por eso la verificación debe ser reproducible y con números, no el reporte del agente.',
      },
      {
        q: 'En el árbol de decisión ante una falla, ¿cuál es la primera pregunta?',
        options: [
          '¿Qué modelo lo haría mejor?',
          '¿El contexto está saturado?',
          '¿Qué hook falta?',
          '¿Cambió la API?',
        ],
        answer: 1,
        explain: 'Primero descartas contexto saturado (~40%). Luego clasificas: tools, trayectoria, acción, seguridad. El harness existe para atrapar la causa raíz, no el síntoma.',
      },
      {
        q: '¿Para qué sirve un postmortem de incidente con agente?',
        options: [
          'Para culpar al modelo.',
          'Para responder qué se intentaba, qué falló, por qué no lo atrapó el harness y qué mitigación instalar.',
          'Para borrar el incidente.',
          'Para cambiar de modelo.',
        ],
        answer: 1,
        explain: 'El postmortem convierte el incidente en una mitigación concreta: qué sensor faltó, qué regla promover de prosa a check, qué hook agregar. La clasificación importa más que el fix.',
      },
    ],
  },
  {
    slug: 'modules/08-casos-uso',
    title: 'Módulo 8 — Casos de Uso End-to-End',
    questions: [
      {
        q: 'Para refactorizar legacy sin cambiar comportamiento, ¿qué tipo de test escribes primero?',
        options: [
          'Tests nuevos que validen el comportamiento deseado.',
          'Characterization tests: describen lo que el código hace hoy (incluso bugs), para congelarlo antes de tocar.',
          'Tests de integración e2e.',
          'Ninguno; refactor es seguro.',
        ],
        answer: 1,
        explain: 'Characterization tests congelan el comportamiento actual. Sirven como red antes de refactorizar: si después del cambio algo rompe, sabes que fue tu cambio.',
      },
      {
        q: '¿Por qué migrar por fases y no reescribir de cero?',
        options: [
          'Porque reescribir queda "más limpio" y es más rápido.',
          'Porque sin fases, si algo rompe no sabes qué fase lo causó; el rewrite big-bang es imposible de atribuir y de revertir.',
          'Porque las fases son más baratas siempre.',
          'Porque el agente no soporta rewrites.',
        ],
        answer: 1,
        explain: '"Lo reescribo de cero, queda más limpio" es el anti-patrón. Migrar preservando con invariantes y por fases permite atribuir roturas y revertir incrementalmente.',
      },
      {
        q: '¿Qué es "TDD al revés" (M2 §TDD aplicado a tests de no-regresión)?',
        options: [
          'Escribir tests después del código.',
          'Los tests no prueban correctitud; prueban no-regresión: describen lo existente para que un cambio no lo rompa.',
          'Tests sin assertions.',
          'Tests que siempre pasan.',
        ],
        answer: 1,
        explain: 'En refactor/migración, el test describe el comportamiento actual (incluso bugs) para que un cambio no lo rompa sin que nadie lo note. No es correctitud, es no-regresión.',
      },
      {
        q: 'En incident response con agentes, ¿qué debe quedar siempre?',
        options: [
          'El fix inmediato, nada más.',
          'Reproducción + postmortem (qué falló, por qué no lo atrapó el harness, qué mitigación instalar).',
          'Un commit grande.',
          'Cambiar de modelo.',
        ],
        answer: 1,
        explain: 'Si solo arreglas el síntoma, la causa sigue y el incidente regresa más tarde peor. Reproducción + postmortem convierten el incidente en una defensa permanente.',
      },
    ],
  },
  {
    slug: 'modules/09-evaluacion-modelos',
    title: 'Módulo 9 — Evaluación de Modelos',
    questions: [
      {
        q: 'Un benchmark no mide "qué tan bueno es el modelo". ¿Qué mide?',
        options: [
          'Qué tan bien el modelo resuelve las tareas del benchmark bajo las condiciones del benchmark.',
          'La inteligencia general.',
          'El costo.',
          'La velocidad de token.',
        ],
        answer: 0,
        explain: 'Un benchmark mide qué tan bien el modelo resuelve SUS tareas bajo SUS condiciones. La pregunta útil es si esas tareas se parecen a las TUYAS, no el ranking publicitario.',
      },
      {
        q: '¿Cuál es el benchmark que más te conviene mirar para elegir modelo en producción?',
        options: [
          'El que tiene el número más alto.',
          'Cost-per-quality: cuánto te cuesta un resultado aceptable en TUS tareas, no el SWE-bench de marketing.',
          'SWE-bench Pro siempre.',
          'El contexto más grande.',
        ],
        answer: 1,
        explain: 'Cost-per-quality une costo y calidad en TU volumen. Un modelo superior en un harness malo puede perder contra uno menor en un harness bueno.',
      },
      {
        q: '¿Por qué la prueba ciega (evaluar outputs sin saber qué modelo los generó)?',
        options: [
          'Para ahorrar tiempo.',
          'Para eliminar el sesgo de "ya sé que el nuevo es mejor"; si sabes cuál es cuál, tu juicio se inclina.',
          'Porque los modelos son iguales.',
          'Para no pagar la API.',
        ],
        answer: 1,
        explain: 'La prueba ciega neutraliza el sesgo de confirmación hacia el modelo nuevo/marcado. "Gana en SWE-bench" no decide; "gana en TUS tareas a ciegas" sí.',
      },
      {
        q: '¿Qué ahorro más grande hay para sesiones largas?',
        options: [
          'Usar un modelo más chico.',
          'Prompt caching: reusar el prefijo ya procesado en lugar de re-procesar todo el historial cada turno.',
          'Reducir effort.',
          'Cambiar a dense.',
        ],
        answer: 1,
        explain: 'En sesiones largas el caching es el ahorro más grande: el mismo system prompt/historial reusado cuesta una fracción del input normal (10-25%).',
      },
    ],
  },
  {
    slug: 'modules/10-seguridad-governance',
    title: 'Módulo 10 — Seguridad, Governance y Compliance',
    questions: [
      {
        q: '¿Qué es prompt injection indirecta en un agente de código?',
        options: [
          'Atacar el sistema directamente.',
          'Instrucciones maliciosas embebidas en datos que el agente lee (un issue, un README, un log) que el modelo confunde con instrucciones.',
          'Un bug del modelo.',
          'Un ataque de fuerza bruta.',
        ],
        answer: 1,
        explain: 'El riesgo más subestimado. El agente lee input (repo, web, logs) que puede contener instrucciones disfrazadas de datos. Separar instrucción de datos es la defensa base.',
      },
      {
        q: '"El agente tiene más permisos de los que su tarea necesita" describe:',
        options: [
          'Prompt injection.',
          'Excessive agency: mínimo privilegio violado; scopes por tool.',
          'Context rot.',
          'Data poisoning.',
        ],
        answer: 1,
        explain: 'Excessive agency. La mitigación es mínimo privilegio (§10.3) y scopes por tool: el agente solo puede lo que su tarea necesita, ni más.',
      },
      {
        q: '¿Qué es la defensa Dual LLM / Quarantined LLM?',
        options: [
          'Usar dos modelos iguales.',
          'Un modelo en cuarentena (sin tools, sin acceso a datos sensibles) procesa el input no confiable antes de que llegue al modelo con tools.',
          'Duplicar el agente.',
          'Desactivar tools.',
        ],
        answer: 1,
        explain: 'El modelo con tools vive en el anillo más interno. El input no confiable lo procesa un modelo en cuarentena, sin tools ni datos sensibles, para que una inyección no pueda ejecutarse.',
      },
      {
        q: '¿Por qué loguear cada decisión del agente (qué tool llamó, con qué args, qué ejecutó)?',
        options: [
          'Para debug.',
          'Para compliance: poder reconstruir qué pasó; el log debe ser inmutable (no modificable a posteriori).',
          'Para ahorrar tokens.',
          'No es necesario.',
        ],
        answer: 1,
        explain: 'Seguridad no es solo prevenir; es poder reconstruir. La pregunta de compliance es "¿por qué el agente hizo X?"; un log inmutable la responde. Loguea sí; audita todo no.',
      },
    ],
  },
];

// Mapa slug -> quiz para lookup O(1) desde la isla.
export const quizBySlug: Record<string, Quiz> = Object.fromEntries(
  quizzes.map((q) => [q.slug, q]),
);