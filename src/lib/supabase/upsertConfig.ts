export function getUpsertConflictTarget(table: string): string {
  if (table === 'app_settings') return 'id';
  return 'id';
}
