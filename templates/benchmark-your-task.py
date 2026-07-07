#!/usr/bin/env python3
"""
benchmark-your-task.py — Evalúa un modelo en TU codebase, no en HumanEval
------------------------------------------------------------------------
Esqueleto para la prueba ciega del M9 §9.4.2. Toma tareas reales de tu
repo, las corre contra dos (o más) modelos a ciegas, y registra cuál
resuelve cada una. El que gane en TUS tareas merece adopción; el que
gana en SWE-bench pero pierde en las tuyas no.

Principio: el benchmark que importa es el de tu dominio. Un leaderboard
público no sabe qué es "resuelto" para ti; este script, sí, porque tú
defines el criterio.

Uso:
  1. Define tus tareas en TASKS (más abajo): prompt + cómo verificar.
  2. Configura los modelos a comparar en MODELS (con su API/client).
  3. Corre: python benchmark-your-task.py
  4. Lee el resultado a ciegas (sin saber qué modelo es cuál) y decide.

NO es producción: es un punto de partida. Adapta la verificación a tu
stack real. El valor está en el protocolo (prueba ciega en tu dominio),
no en este script.
"""

import json
import subprocess
from dataclasses import dataclass, asdict
from typing import Callable

# --------------------------------------------------------------------------
# 1. Tus tareas reales (reemplaza con tareas de TU codebase)
# --------------------------------------------------------------------------
# Una tarea = prompt + función de verificación que decide si "resuelto".
# La verificación NO es "el modelo dice que terminó"; es un sensor
# computacional (M6 §6.1): corre tests, typecheck, o un comando concreto.

@dataclass
class Task:
    id: str
    prompt: str
    verify: Callable[[], tuple[bool, str]]  # (resuelto?, nota)


def _verify_via_command(command: list[str], must_contain: str = "") -> tuple[bool, str]:
    """Verificación canónica: corre un comando y decide por exit code + output."""
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=120)
        ok = result.returncode == 0
        if ok and must_contain and must_contain not in result.stdout:
            return False, f"comando OK pero falta '{must_contain}' en output"
        return ok, result.stdout[-200:]
    except subprocess.TimeoutExpired:
        return False, "timeout"


# Ejemplos (reemplaza):
TASKS: list[Task] = [
    Task(
        id="T1",
        prompt=(
            "Implementa filterByDate(items, range) que filtra eventos por "
            "[from, to) con from inclusivo y to exclusivo, sin mutar items. "
            "Lee AGENTS.md y docs/specs/project-status-date-filter.md antes."
        ),
        verify=lambda: _verify_via_command(["npm", "test", "--", "filterByDate"]),
    ),
    Task(
        id="T2",
        prompt=(
            "Refactoriza src/legacy/pricing.ts extrayendo el cálculo de "
            "impuestos a una función pura, preservando comportamiento. "
            "Los tests de caracterización deben seguir en verde."
        ),
        verify=lambda: _verify_via_command(["npm", "test", "--", "pricing"]),
    ),
    # Agrega 5-10 tareas reales más. La muestra debe representar tu trabajo.
]


# --------------------------------------------------------------------------
# 2. Modelos a comparar (reemplaza con tu cliente real)
# --------------------------------------------------------------------------
# Cada modelo tiene un nombre CIEGO (M_A, M_B) que solo se revela al final.
# La idea: evalúas el output sin saber qué modelo lo produjo.

@dataclass
class Model:
    blind_id: str          # "M_A", "M_B" — no reveles el nombre real aún.
    real_name: str         # se revela solo en el reporte final.
    run: Callable[[str], str]  # run(prompt) -> output del modelo.


def _run_model_a(prompt: str) -> str:
    """TODO: integra tu cliente del modelo A (API, CLI, etc.)."""
    # Ejemplo placeholder: subprocess a tu CLI local.
    # result = subprocess.run(["claude", "-p", prompt], capture_output=True, text=True)
    # return result.stdout
    raise NotImplementedError("Integra el cliente del modelo A.")


def _run_model_b(prompt: str) -> str:
    """TODO: integra tu cliente del modelo B."""
    raise NotImplementedError("Integra el cliente del modelo B.")


MODELS: list[Model] = [
    Model(blind_id="M_A", real_name="[modelo actual]", run=_run_model_a),
    Model(blind_id="M_B", real_name="[modelo nuevo]",  run=_run_model_b),
]


# --------------------------------------------------------------------------
# 3. Ejecución de la prueba
# --------------------------------------------------------------------------
def run_trial(model: Model, task: Task) -> dict:
    """Corre una tarea contra un modelo y verifica a ciegas."""
    output = model.run(task.prompt)
    resolved, note = task.verify()
    return {
        "task": task.id,
        "model_blind": model.blind_id,
        "resolved": resolved,
        "note": note,
        "output_len": len(output),
    }


def main() -> None:
    results = []
    for model in MODELS:
        for task in TASKS:
            print(f"[trial] {model.blind_id} :: {task.id}")
            try:
                results.append(run_trial(model, task))
            except NotImplementedError as e:
                print(f"[skip] integra el cliente antes de correr: {e}")
                return

    # --------------------------------------------------------------------------
    # 4. Reporte a ciegas (primero), revelado al final
    # --------------------------------------------------------------------------
    print("\n=== Resultado a ciegas ===")
    summary: dict[str, dict] = {}
    for r in results:
        bid = r["model_blind"]
        summary.setdefault(bid, {"resolved": 0, "total": 0})
        summary[bid]["total"] += 1
        if r["resolved"]:
            summary[bid]["resolved"] += 1
        print(f"  {r['task']} :: {r['model_blind']} -> "
              f"{'RESUELTO' if r['resolved'] else 'falla'}")

    print("\n=== Resumen a ciegas ===")
    for bid, s in summary.items():
        print(f"  {bid}: {s['resolved']}/{s['total']} resueltas "
              f"({100*s['resolved']//max(s['total'],1)}%)")

    # Revelado (después de que evalúas a ciegas):
    print("\n=== Revelado (no mires hasta haber decidido a ciegas) ===")
    for m in MODELS:
        s = summary.get(m.blind_id, {"resolved": 0, "total": 0})
        print(f"  {m.blind_id} = {m.real_name}  "
              f"-> {s['resolved']}/{s['total']}")

    print("\nDecisión: adopta el modelo con mejor tasa EN TUS tareas,")
    print("no el de mejor SWE-bench. (M9 §9.4.2)")

    # Persiste el resultado para el reporte de adopción (10-preguntas-antes-adoptar.md).
    with open("benchmark-your-task-result.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\nDetalle guardado en benchmark-your-task-result.json")


if __name__ == "__main__":
    main()