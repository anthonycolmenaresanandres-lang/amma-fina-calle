// Shared offline-only fixture. Never imported by application code.
export function memoryLedger() {
  const rows = new Map();
  return {
    async status(key) { return rows.get(key) ?? null; },
    async freeze(key, payload) { if (!rows.has(key)) rows.set(key, { state: 'pending', payload, attempts: 0 }); },
    async claim(key) {
      const row = rows.get(key);
      if (!row || row.state !== 'pending' || row.attempts >= 3) return null;
      row.state = 'sending'; row.attempts++; row.attemptId = String(row.attempts);
      return { payload: row.payload, attemptId: row.attemptId };
    },
    async finish(key, attemptId, state) {
      const row = rows.get(key);
      if (!row || row.state !== 'sending' || row.attemptId !== attemptId) throw Error('claim lost');
      row.state = state;
    },
  };
}
export const keyFor = periods => `fina-calle-traffic-${periods.map(p => `${p.kind}-${p.first}-${p.last}`).join('-and-')}`;
