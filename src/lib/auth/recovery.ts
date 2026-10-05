export const RECOVERY_FRUITS = [
  'Apple',
  'Banana',
  'Cherry',
  'Grape',
  'Kiwi',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Pineapple',
  'Strawberry',
  'Watermelon',
] as const;

export type RecoveryFruit = (typeof RECOVERY_FRUITS)[number];

export function normalizeRecoveryFruit(value: string): string {
  return value.trim().toLowerCase();
}

export function isRecoveryFruit(value: string): value is RecoveryFruit {
  return RECOVERY_FRUITS.some((fruit) => normalizeRecoveryFruit(fruit) === normalizeRecoveryFruit(value));
}