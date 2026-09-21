const common = ['package.json', 'yarn.lock', '.yarnrc.yml', '.nvmrc', 'scripts/'];

export function affectsApplication(application, paths) {
  if (!['crm', 'website'].includes(application)) return true;
  const prefixes = [`apps/${application}/`, ...common];
  if (application === 'crm') prefixes.push('shared/');
  return paths.some(path => prefixes.some(prefix => prefix.endsWith('/') ? path.startsWith(prefix) : path === prefix));
}
