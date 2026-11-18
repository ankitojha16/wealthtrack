export function prepareRecordPayload<T extends { id?: string; user_id?: string | null; key?: string; category?: string; monthYear?: string; netWorth?: number; net_worth?: number }>(
  table: string,
  row: T,
  userId: string
): any {
  const payload: any = { ...row, user_id: userId };

  if (table === 'budgets' && payload.category) {
    payload.id = `b_${userId}_${payload.category}`;
  } else if (table === 'snapshots' && payload.monthYear) {
    payload.id = `snap_${userId}_${payload.monthYear}`;
  } else if (table === 'app_settings' && payload.key) {
    payload.id = `${payload.key}:${userId}`;
  } else if (!payload.id) {
    const identity = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    payload.id = identity;
  }

  if (table === 'snapshots') {
    // Ensure both camelCase and snake_case are populated for database compatibility
    const nw = payload.netWorth ?? payload.net_worth ?? 0;
    payload.net_worth = nw;
    payload.netWorth = nw;
  }

  return payload;
}
