import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

// Render the same React tree for visitors and crawlers, then hydrate it in place.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  const page = await readFile('dist/index.html', 'utf8');
  const markup = render();
  if (!markup.includes('atlas.samilososami.com') || !markup.includes('electrónica')) throw new Error('Missing portfolio content in prerender');
  await writeFile('dist/index.html', page.replace('<div id="root"></div>', `<div id="root">${markup}</div>`));
  console.log('Portfolio prerendered: profile, ATLAS and recognition links are present in the HTML.');
} finally {
  await server.close();
}
