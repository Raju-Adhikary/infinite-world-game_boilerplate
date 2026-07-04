/**
 * Audio Manager
 * Handles audio loading, caching, and playback
 */
import { _uid } from './utils.js';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.cache = new Map();
    this.master = 0.8;
    this.sfx = 0.7;
    this.music = 0.5;
    this.active = new Map();
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  setMaster(v) {
    this.master = v;
    this.active.forEach(s => {
      if (s.gain) s.gain.gain.value = s.vol * v;
    });
  }

  async load(url) {
    if (!this.ctx) this.init();
    if (this.cache.has(url)) return this.cache.get(url);

    try {
      const r = await fetch(url);
      if (!r.ok) throw 0;
      const ab = await r.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(ab);
      this.cache.set(url, buf);
      return buf;
    } catch {
      return this._tone(300, 0.08, 'sine');
    }
  }

  play(url, vol = 1, loop = false) {
    if (!this.ctx) return null;
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    src.buffer = this.cache.get(url) || this._tone(300, 0.08);
    src.loop = loop;
    g.gain.value = vol * this.sfx * this.master;
    src.connect(g);
    g.connect(this.ctx.destination);
    src.start();

    const id = _uid();
    this.active.set(id, { src, gain: g, vol: vol * this.sfx });
    src.onended = () => this.active.delete(id);
    return id;
  }

  stop(id) {
    const s = this.active.get(id);
    if (s) {
      try {
        s.src.stop();
      } catch { }
      this.active.delete(id);
    }
  }

  stopAll() {
    this.active.forEach((_, id) => this.stop(id));
  }

  _tone(f, d, t = 'sine') {
    const sr = this.ctx.sampleRate;
    const len = sr * d;
    const buf = this.ctx.createBuffer(1, len, sr);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = Math.sin(2 * Math.PI * f * i / sr) * 0.25 * (1 - i / len);
    }
    return buf;
  }
}
