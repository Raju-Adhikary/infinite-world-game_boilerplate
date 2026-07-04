/**
 * UI Manager
 * Handles all UI screens and menus
 */
import { CFG } from '../config/config.js';

export class UIManager {
  constructor(input) {
    this.input = input;
    this.debugEl = document.getElementById('debug-panel');
    this.startEl = document.getElementById('start-screen');
    this.pauseEl = document.getElementById('pause-screen');
    this.settingsEl = document.getElementById('settings-screen');
    this.loadingEl = document.getElementById('loading-screen');
    this.mobileCtrl = document.getElementById('mobile-controls');
    this.crosshair = document.getElementById('crosshair');
    this.prevSettings = null;

    this._bind();
    this._loadSettings();
  }

  _bind() {
    document.getElementById('btn-play').onclick = () => this._emit('play');
    document.getElementById('btn-start-settings').onclick = () => {
      this.startEl.classList.add('hidden');
      this.settingsEl.classList.remove('hidden');
      this.prevSettings = 'start';
    };

    document.getElementById('btn-resume').onclick = () => this._emit('resume');
    document.getElementById('btn-pause-settings').onclick = () => {
      this.pauseEl.classList.add('hidden');
      this.settingsEl.classList.remove('hidden');
      this.prevSettings = 'pause';
    };

    document.getElementById('btn-quit').onclick = () => this._emit('quit');
    document.getElementById('btn-settings-back').onclick = () => {
      this.settingsEl.classList.add('hidden');
      if (this.prevSettings === 'start') this.startEl.classList.remove('hidden');
      else if (this.prevSettings === 'pause') this.pauseEl.classList.remove('hidden');
      this._saveSettings();
    };

    // Settings controls
    const bind = (id, cb) => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => cb(el));
      if (el.type === 'range') cb(el);
    };

    bind('s-render-dist', el => {
      CFG.settings.renderDist = +el.value;
      document.getElementById('v-render-dist').textContent = el.value;
    });

    bind('s-fov', el => {
      CFG.settings.fov = +el.value;
      document.getElementById('v-fov').textContent = el.value;
    });

    bind('s-master-vol', el => {
      CFG.settings.masterVol = +el.value;
      document.getElementById('v-master-vol').textContent = el.value;
    });

    bind('s-sfx-vol', el => {
      CFG.settings.sfxVol = +el.value;
      document.getElementById('v-sfx-vol').textContent = el.value;
    });

    bind('s-music-vol', el => {
      CFG.settings.musicVol = +el.value;
      document.getElementById('v-music-vol').textContent = el.value;
    });

    bind('s-sensitivity', el => {
      CFG.settings.sensitivity = +el.value;
      document.getElementById('v-sensitivity').textContent = el.value;
    });

    // Toggles
    const tog = (id, key) => {
      const el = document.getElementById(id);
      el.onclick = () => {
        CFG.settings[key] = !CFG.settings[key];
        el.classList.toggle('on', CFG.settings[key]);
      };
    };

    tog('s-shadows', 'shadows');
    tog('s-show-fps', 'showFps');
    tog('s-invert-y', 'invertY');

    // Keyboard shortcuts
    this._onKey = e => {
      if (e.code === 'Escape') this._emit('toggle-pause');
      if (e.code === 'F3') {
        e.preventDefault();
        this._emit('toggle-debug');
      }
    };

    window.addEventListener('keydown', this._onKey);
  }

  _emit(ev) {
    this['on' + ev]?.();
  }

  _loadSettings() {
    try {
      const s = localStorage.getItem('ge_settings');
      if (s) Object.assign(CFG.settings, JSON.parse(s));
    } catch { }

    // Sync UI
    const set = (id, vId, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        if (vId) document.getElementById(vId).textContent = val;
      }
    };

    set('s-render-dist', 'v-render-dist', CFG.settings.renderDist);
    set('s-fov', 'v-fov', CFG.settings.fov);
    set('s-master-vol', 'v-master-vol', CFG.settings.masterVol);
    set('s-sfx-vol', 'v-sfx-vol', CFG.settings.sfxVol);
    set('s-music-vol', 'v-music-vol', CFG.settings.musicVol);
    set('s-sensitivity', 'v-sensitivity', CFG.settings.sensitivity);

    document.getElementById('s-shadows').classList.toggle('on', CFG.settings.shadows);
    document.getElementById('s-show-fps').classList.toggle('on', CFG.settings.showFps);
    document.getElementById('s-invert-y').classList.toggle('on', CFG.settings.invertY);
  }

  _saveSettings() {
    try {
      localStorage.setItem('ge_settings', JSON.stringify(CFG.settings));
    } catch { }
  }

  showLoading() { this.loadingEl.classList.remove('hidden'); }
  hideLoading() { this.loadingEl.classList.add('hidden'); }
  showStart() { this.startEl.classList.remove('hidden'); this.crosshair.classList.add('hidden'); }
  hideStart() { this.startEl.classList.add('hidden'); }
  showPause() {
    this.pauseEl.classList.remove('hidden');
    if (document.pointerLockElement) document.exitPointerLock();
    this.crosshair.classList.add('hidden');
  }
  hidePause() {
    this.pauseEl.classList.add('hidden');
    this.crosshair.classList.remove('hidden');
    if (!this.input.isTouchDevice) document.getElementById('game-container')?.requestPointerLock();
  }
  showMobileControls() { this.mobileCtrl.classList.remove('hidden'); }
  toggleDebug() { this.debugEl.classList.toggle('hidden'); }

  updateDebug(data) {
    if (!CFG.settings.showFps) {
      this.debugEl.classList.add('hidden');
      return;
    }

    this.debugEl.classList.remove('hidden');
    const c = data.fps > 50 ? 'dbg-ok' : data.fps > 30 ? 'dbg-val' : 'dbg-err';
    this.debugEl.innerHTML =
      `<span class="dbg-label">FPS</span> <span class="${c}">${data.fps}</span><br>` +
      `<span class="dbg-label">Entities</span> <span class="dbg-val">${data.entities}</span><br>` +
      `<span class="dbg-label">Chunks</span> <span class="dbg-val">${data.chunks}</span><br>` +
      `<span class="dbg-label">Physics</span> <span class="dbg-val">${data.physicsBodies}</span><br>` +
      `<span class="dbg-label">Pos</span> <span class="dbg-val">${data.pos.x.toFixed(1)}, ${data.pos.y.toFixed(1)}, ${data.pos.z.toFixed(1)}</span><br>` +
      `<span class="dbg-label">Vel</span> <span class="dbg-val">${data.vel.y.toFixed(1)} y</span><br>` +
      `<span class="dbg-label">Draws</span> <span class="dbg-val">${data.drawCalls}</span><br>` +
      `<span class="dbg-label">Tris</span> <span class="dbg-val">${(data.triangles / 1000).toFixed(1)}k</span><br>` +
      `<span class="dbg-label">Biome</span> <span class="dbg-val">${data.biome}</span><br>` +
      (data.entityTypes ? `<span class="dbg-label">Types</span> <span class="dbg-val">${Object.entries(data.entityTypes).map(([k, v]) => k + ':' + v).join(' ')}</span>` : '');
  }
}
