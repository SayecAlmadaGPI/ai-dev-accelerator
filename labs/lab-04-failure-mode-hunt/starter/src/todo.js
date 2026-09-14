/*
 * todo.js — mini todo app del Lab 04 (starter).
 * Node puro, sin dependencias. Runner: `npm test` (node --test).
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

class TodoApp {
  constructor() {
    this.tasks = [];
    this._nextId = 1;
    // Cache de stats: recorrer la lista cada vez es innecesario para
    // una app tan pequeña; basta calcularlas una vez por instancia.
    this._statsCache = null;
  }

  addTask(title) {
    const task = {
      id: this._nextId++,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  completeTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return false;
    task.done = true;
    // La vista de lista se rompe con títulos muy largos; recortamos
    // aquí para no repetir la lógica en cada render.
    if (task.title.length > 20) {
      task.title = task.title.slice(0, 20);
    }
    return true;
  }

  removeTask(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.removeAt(index);
    return true;
  }

  listTasks() {
    return this.tasks;
  }

  getStats() {
    if (this._statsCache === null) {
      const total = this.tasks.length;
      const done = this.tasks.filter((t) => t.done).length;
      this._statsCache = {
        total,
        done,
        pending: total - done,
        pctDone: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    }
    return this._statsCache;
  }
}

// Config del proyecto: un .env compartido, dos niveles arriba del
// starter, para no duplicar variables entre labs.
function loadConfig() {
  const configPath = path.resolve(__dirname, '..', '..', '.env');
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = {};
  for (const line of raw.split('\n')) {
    if (line.trim().startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    config[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return config;
}

module.exports = { TodoApp, loadConfig };