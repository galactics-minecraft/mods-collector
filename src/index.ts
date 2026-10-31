import { writeFileSync } from 'fs';

import { resolveMods, type ModRow } from './helpers';
import * as mods from './mods.json';

const csvCell = (value: string | number | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const toCsv = (rows: ModRow[]) =>
  [
    ['mod name', 'id', 'source', 'link', 'type'].join(','),
    ...rows.map(r => [r.name, r.id, r.source, r.link, r.type].map(csvCell).join(',')),
  ].join('\n') + '\n';

const main = async () => {
  const { rows, errors } = await resolveMods(mods);

  rows.forEach(r => {
    const label = `[${r.type}] ${r.name} (${r.id ?? 'link'}, ${r.source})`;

    if (r.manual) console.log(`⚠️  ${label}: no direct download, get it manually from ${r.link}`);
    else console.log(`✅ ${label}: ${r.link}`);
  });
  errors.forEach(e => console.log(`❌ ${e.input}: ${e.error}${e.dependencyOf ? ` (dep of ${e.dependencyOf})` : ''}`));

  // Client gets everything except server-only. Server gets everything except client-only.
  const clientRows = rows.filter(r => r.type !== 'server');
  const serverRows = rows.filter(r => r.type !== 'client');

  writeFileSync('client-mods.csv', toCsv(clientRows));
  writeFileSync('server-mods.csv', toCsv(serverRows));

  const manualCount = rows.filter(r => r.manual).length;

  console.log(
    `Done. client-mods.csv: ${clientRows.length} rows, server-mods.csv: ${serverRows.length} rows ` +
      `(${manualCount} need manual download, ${errors.length} failed).`,
  );
};

main();
