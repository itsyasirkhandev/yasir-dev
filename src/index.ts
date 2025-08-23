import projectData from '../__project__/project.json' assert { type: 'json' };
import { initIsEqual } from '@nordcraft/ssr/dist/rendering/equals';
import type { ProjectFiles, ToddleProject } from '@nordcraft/ssr/dist/ssr.types';
import { Hono } from 'hono';
import type { HonoEnv } from '../hono';
import { proxyRequestHandler } from './routes/apiProxy';
import { customCode } from './routes/customCode';
import { customElement } from './routes/customElement';
import { favicon } from './routes/favicon';
import { fontRouter } from './routes/font';
import { manifest } from './routes/manifest';
import { robots } from './routes/robots';
import { serviceWorker } from './routes/serviceWorker';
import { sitemap } from './routes/sitemap';
import { stylesheetHandler } from './routes/stylesheetHandler';
import { toddlePage } from './routes/toddlePage';

// Inject isEqual on globalThis
// this is currently used by some builtin formulas
initIsEqual();

const app = new Hono<HonoEnv>();

// The project data is now bundled directly into the server code
const project = projectData as { files: ProjectFiles; project: ToddleProject };

// Load the project onto context for other routes
app.use(async (c, next) => {
  c.set('project', project);
  await next();
});

app.get('/sitemap.xml', sitemap);
app.get('/robots.txt', robots);
app.get('/manifest.json', manifest);
app.get('/favicon.ico', favicon);
app.get('/serviceWorker.js', serviceWorker);

// Nordcraft specific endpoints/services on /.toddle/ subpath 👇
app.route('/.toddle/fonts', fontRouter);
app.get('/.toddle/stylesheet/:pageName{.+.css}', stylesheetHandler);
app.get('/.toddle/custom-code.js', customCode);
app.all(
  '/.toddle/omvej/components/:componentName/apis/:apiName',
  proxyRequestHandler,
);
app.get('/.toddle/custom-element/:filename{.+.js}', customElement);

// Treat all other requests as page requests
app.get('/*', toddlePage);

export default app;
