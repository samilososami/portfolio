// Refresh only the generated CasioVideo mount; never the portfolio homepage.
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = resolve(process.argv[2] || resolve(root, '../CasioVideo'));
const manifest = JSON.parse(await readFile(resolve(source, 'web/package.json'), 'utf8'));
if (manifest.name !== 'casiovideo-web') throw new Error('Expected the CasioVideo repository.');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: source, encoding: 'utf8'}).trim();
if (execFileSync('git', ['status', '--porcelain', '--', 'web', 'api'], {cwd: source, encoding: 'utf8'}).trim()) {
  throw new Error('Commit the CasioVideo web/API changes before recording a source revision.');
}
execFileSync('npm', ['run', 'build'], {cwd: resolve(source, 'web'), stdio: 'inherit'});
const destination = resolve(root, 'public/tools/casio/casiovideo');
await mkdir(destination, {recursive: true});
await mkdir(resolve(root, 'api'), {recursive: true});
// Copy a versioned build. Old hashed files may remain, keeping prior open tabs valid.
await cp(resolve(source, 'web/dist'), destination, {recursive: true});
await cp(resolve(source, 'LICENSE'), resolve(destination, 'LICENSE'));
await cp(resolve(source, 'api/release.mjs'), resolve(root, 'api/casiovideo-release.mjs'));
const checksums = {};
async function inventory(dir, prefix = '') {
  for (const name of await readdir(dir)) {
    const absolute = resolve(dir, name), relative = prefix + name;
    if ((await stat(absolute)).isDirectory()) await inventory(absolute, relative + '/');
    else checksums[relative] = createHash('sha256').update(await readFile(absolute)).digest('hex');
  }
}
await inventory(resolve(source, 'web/dist'));
checksums['api/release.mjs'] = createHash('sha256').update(await readFile(resolve(source, 'api/release.mjs'))).digest('hex');
await writeFile(resolve(destination, 'source.json'), JSON.stringify({
  repository: 'https://github.com/samilososami/CasioVideo', revision,
  version: manifest.version, checksums
}, null, 2) + '\n');
console.log(`Mounted CasioVideo ${manifest.version} (${revision}) at /tools/casio/casiovideo/.`);
