// Simple seeded random number generator (Mulberry32)
export function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  let state = Math.abs(hash);
  
  return function(): number {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generate deterministic positions for aim trainer based on seed
export function generateAimPositions(
  seed: string, 
  count: number, 
  width: number, 
  height: number,
  targetSize: number
): { x: number; y: number }[] {
  const random = createSeededRandom(seed);
  const positions: { x: number; y: number }[] = [];
  const padding = targetSize;
  
  for (let i = 0; i < count; i++) {
    positions.push({
      x: padding + random() * (width - 2 * padding),
      y: padding + random() * (height - 2 * padding)
    });
  }
  
  return positions;
}

// Generate deterministic delays for reaction test
export function generateReactionDelays(seed: string, count: number): number[] {
  const random = createSeededRandom(seed);
  const delays: number[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random delay between 1 and 3 seconds
    delays.push(1000 + random() * 2000);
  }
  
  return delays;
}
