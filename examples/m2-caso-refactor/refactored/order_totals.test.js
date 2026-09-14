// order_totals.test.js (refactored) — los MISMOS tests de caracterización,
// ahora contra el resultado del refactor (AC-2 de spec.md).
//
// Misma suite, otro módulo: si el refactor cambió aunque sea un centavo de
// un solo caso, este archivo lo grita. Es el dual-run del M8 §8.6.5
// aplicado al refactor (§8.2).

import { registerTotalsSuite } from '../characterization_suite.js';
import totals from './order_totals.js';

registerTotalsSuite(totals, 'refactored');