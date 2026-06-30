// Written by Claude Code (Opus 4.8)
// Public entry point. Kept explicit (no `export *`) so the JSDoc typedefs that
// several modules re-import don't collide.
export { generateRandomPointsForChallenge, getSourcesFromEnv } from './config.js';
export { generateRoundsForChallenge } from './generate.js';

/**
 * @typedef {import('./types.js').RoundPoint} RoundPoint
 * @typedef {import('./types.js').PanoramaxSource} PanoramaxSource
 * @typedef {import('./types.js').CollectionRef} CollectionRef
 */

export {};
