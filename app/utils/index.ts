export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFrom<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('randomFrom requires a non-empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}
