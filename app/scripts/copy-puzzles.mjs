import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = join(__dirname, '..', '..');
const source = join(repoRoot, 'puzzle');
const dest = join(__dirname, '..', 'public', 'puzzle');

if (!existsSync(source)) {
  console.log('No puzzle directory at repo root; skipping copy.');
  process.exit(0);
}

if (!existsSync(join(__dirname, '..', 'public'))) {
  mkdirSync(join(__dirname, '..', 'public'), { recursive: true });
}

console.log('Copying puzzle data to public/puzzle ...');
cpSync(source, dest, { recursive: true });
console.log('Done.');
