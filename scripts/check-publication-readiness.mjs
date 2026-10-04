import { readFileSync } from 'node:fs';

// Manual review aid only. Not attached to development, build or deployment.
const config = JSON.parse(readFileSync(new URL('../apps/website/src/lib/publicationReadiness.json', import.meta.url), 'utf8'));
const pending = [];
for (const [group, fields] of Object.entries(config)) {
  if (group === 'checks') continue;
  for (const field of fields) {
    if (typeof field.value !== 'string' || !field.value.trim() || /por preencher|por confirmar|pendente/i.test(field.value)) pending.push(`${group}.${field.id}: ${field.label}`);
  }
}
for (const check of config.checks) if (check.status !== 'verified') pending.push(`checks.${check.id}: ${check.label}`);
console.log(pending.length ? `PUBLICAÇÃO PENDENTE — ${pending.length} pontos por resolver.` : 'Sem pendências registadas. Isto não certifica conformidade nem substitui a revisão final.');
for (const item of pending) console.log(`- ${item}`);
console.log('Consultar docs/publication-readiness.md; confirmar os contactos e serviços reais antes de concluir prontidão.');
process.exitCode = pending.length ? 1 : 0;
