/**
 * Entity Manager
 * Tracks all game entities (objects, bots, etc)
 */
import { _uid } from '../core/utils.js';

export class EntityManager {
  constructor() {
    this.entities = new Map();
    this.byType = new Map();
    this.byId = new Map();
  }

  add(e) {
    e.id = e.id || _uid();
    e.createdAt = performance.now();
    this.entities.set(e.id, e);

    if (!this.byType.has(e.type)) {
      this.byType.set(e.type, []);
    }
    this.byType.get(e.type).push(e.id);
    return e.id;
  }

  get(id) {
    return this.entities.get(id);
  }

  remove(id) {
    const e = this.entities.get(id);
    if (!e) return;

    const arr = this.byType.get(e.type);
    if (arr) {
      const i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1);
    }
    this.entities.delete(id);
  }

  getByType(t) {
    return (this.byType.get(t) || []).map(id => this.entities.get(id)).filter(Boolean);
  }

  all() {
    return [...this.entities.values()];
  }

  count() {
    return this.entities.size;
  }

  countByType() {
    const r = {};
    this.byType.forEach((ids, t) => r[t] = ids.length);
    return r;
  }

  clear() {
    this.entities.clear();
    this.byType.clear();
  }
}
