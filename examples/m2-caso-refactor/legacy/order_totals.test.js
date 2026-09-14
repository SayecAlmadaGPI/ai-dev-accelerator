// order_totals.test.js (legacy) — tests de CARACTERIZACIÓN, paso 1 del M8 §8.2.
//
// Corre ANTES de tocar nada: fija el comportamiento actual del monolito.
// La suite vive en ../characterization_suite.js (una sola fuente de verdad:
// la MISMA tabla de golden cases corre después contra refactored/).

import { registerTotalsSuite } from '../characterization_suite.js';
import totals from './order_totals.js';

registerTotalsSuite(totals, 'legacy');