export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  between(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  pickIndex<T>(items: readonly T[]): number {
    if (items.length === 0) {
      return 0;
    }

    return Math.min(items.length - 1, Math.floor(this.next() * items.length));
  }
}

