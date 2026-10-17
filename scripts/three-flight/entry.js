import {loadFleetAssets} from './assets.js';
import {startFlightRuntime} from './runtime.js';
import {createFlightController} from './controller.js';
import {openLocalBattle} from './local-battle.js';

const started = performance.now();
const loading = new AbortController();
const battlefield = document.documentElement.dataset.mode === 'battlefield';
const legacy = document.getElementById('legacy-renderer-link');
if (legacy) legacy.href = (battlefield ? 'legacy-webgl/battlefield.html' : 'legacy-webgl/hangar.html') + location.search;
window.addEventListener('pagehide', () => loading.abort(), {once: true});

try {
 if(!battlefield||!await openLocalBattle(new URLSearchParams(location.search),loading.signal)){
  const {fleet, assets} = await loadFleetAssets({signal: loading.signal, includeBattleModels: battlefield});
  // Compatibility surfaces are for the existing parent frame and diagnostic tools.
  window.FlightFleet = fleet;
  window.BattleFleetAssets = assets;
  const app = startFlightRuntime({fleet, assets, createController: battlefield ? createFlightController : null});
  app.loadedMs = performance.now() - started;
  document.documentElement.dataset.renderer = 'three';
 }
} catch (error) {
  if (loading.signal.aborted) {
    // Leaving the page while assets load is a normal cancellation.
  } else {
    console.error(error);
    document.getElementById('no-webgl').hidden = false;
    document.getElementById('webgl-error').textContent = String(error.message || error);
    document.documentElement.dataset.ready = 'error';
  }
}
