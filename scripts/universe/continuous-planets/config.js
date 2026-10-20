export const PLANET_DEFAULTS = Object.freeze({
  terrestrial:{seed:17,radius:175}, mercury:{seed:31,radius:140},
  mars:{seed:73,radius:154}, gas:{seed:206,radius:224},
});
export const QUALITY = Object.freeze({
  low:{grid:12,maxLevel:12,errorPixels:4,maxLeaves:160,cacheTiles:260,workers:2,commitsPerFrame:2,detailInstances:420,pixelRatio:1},
  standard:{grid:16,maxLevel:14,errorPixels:3,maxLeaves:280,cacheTiles:450,workers:2,commitsPerFrame:3,detailInstances:1000,pixelRatio:1.25},
  high:{grid:24,maxLevel:15,errorPixels:1.6,maxLeaves:480,cacheTiles:760,workers:3,commitsPerFrame:4,detailInstances:1800,pixelRatio:1.5},
});
export function qualityConfig(q){if(!QUALITY[q])throw new Error(`Unknown quality: ${q}`);return QUALITY[q];}
