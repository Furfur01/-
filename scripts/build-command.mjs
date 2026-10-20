import path from 'node:path';
import './build-command-p0.mjs';
import './build-command-ui.mjs';
import './build-ship-catalog.mjs';
import {buildFlightFleet} from './build-flight-fleet.mjs';
import {buildNativeBattleAssets} from './build-native-battle-assets.mjs';
import {buildThreeFlight} from './build-three-flight.mjs';
// CPU asset exporters retain the approved ship geometry. No legacy renderer is generated.
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/galactic-command');
buildFlightFleet(dir);
buildNativeBattleAssets(dir);
await buildThreeFlight();
await import('./build-world.mjs');
console.log('Unified Three.js command world built. Legacy rebuild is an explicit archive-only tool.');
