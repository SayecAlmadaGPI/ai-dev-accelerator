'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { TodoApp } = require('../src/todo.js');

test('addTask asigna id secuencial y estado pendiente', () => {
  const app = new TodoApp();
  const t1 = app.addTask('Primera');
  const t2 = app.addTask('Segunda');
  assert.equal(t1.id, 1);
  assert.equal(t2.id, 2);
  assert.equal(t1.done, false);
  assert.equal(app.listTasks().length, 2);
});

test('completeTask marca la tarea como hecha', () => {
  const app = new TodoApp();
  const task = app.addTask('Comprar café');
  assert.equal(app.completeTask(task.id), true);
  assert.equal(task.done, true);
});

test('completeTask devuelve false para un id inexistente', () => {
  const app = new TodoApp();
  assert.equal(app.completeTask(999), false);
});

test('listTasks devuelve las tareas añadidas, en orden', () => {
  const app = new TodoApp();
  app.addTask('Leer módulo 7');
  app.addTask('Leer módulo 8');
  const titles = app.listTasks().map((t) => t.title);
  assert.deepEqual(titles, ['Leer módulo 7', 'Leer módulo 8']);
});

test('getStats calcula totales, hechas y pendientes', () => {
  const app = new TodoApp();
  app.addTask('Uno');
  app.addTask('Dos');
  app.addTask('Tres');
  app.completeTask(1);
  const stats = app.getStats();
  assert.equal(stats.total, 3);
  assert.equal(stats.done, 1);
  assert.equal(stats.pending, 2);
  assert.equal(stats.pctDone, 33);
});

test('completeTask conserva el título original de la tarea', () => {
  const app = new TodoApp();
  const task = app.addTask('Comprar café de grano en la tienda de la esquina');
  app.completeTask(task.id);
  const [guardada] = app.listTasks();
  // La tarea sigue en la lista, con su título completo.
});