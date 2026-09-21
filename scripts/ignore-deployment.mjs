import { execFileSync } from 'node:child_process';
import { affectsApplication } from './deployment-scope.mjs';

// Vercel convention: 0 skips; 1 proceeds. This script never runs a build itself.
const application = process.argv[2];
const previous = process.env.VERCEL_GIT_PREVIOUS_SHA;
if (!['crm', 'website'].includes(application) || !/^[a-f0-9]{40}$/i.test(previous ?? '')) process.exit(1);
try {
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding:'utf8' }).trim();
  const paths = execFileSync('git', ['diff', '--name-only', '-z', previous, 'HEAD', '--'], { cwd:root, encoding:'utf8' }).split('\0').filter(Boolean);
  process.exit(affectsApplication(application, paths) ? 1 : 0);
} catch {
  // Missing/shallow history must never silently skip a needed deployment.
  process.exit(1);
}
