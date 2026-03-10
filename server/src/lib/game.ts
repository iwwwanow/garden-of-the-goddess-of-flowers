// FD earned on day N: 2^(N-1)
export function fdForDay(day: number): number {
  return Math.pow(2, day - 1);
}

// Prime sequence for seeds: 3, 7, 11, 13, ...
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export function seedsForHarvest(harvestNumber: number): number {
  let count = 0;
  let n = 2;
  while (count < harvestNumber) {
    if (isPrime(n)) count++;
    n++;
  }
  return n - 1;
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
