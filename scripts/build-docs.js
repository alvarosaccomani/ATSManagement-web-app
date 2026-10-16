const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_OUTPUT_DIR = path.join(ROOT_DIR, 'documentation');

const LANGUAGES = [
  {
    code: 'es',
    compodocLang: 'es-ES',
    includesDir: 'docs/es',
    includesName: 'Manuales de Uso',
    label: '🇪🇸 Español',
  },
  {
    code: 'en',
    compodocLang: 'en-US',
    includesDir: 'docs/en',
    includesName: 'User Manuals',
    label: '🇺🇸 English',
  },
  {
    code: 'pt',
    compodocLang: 'pt-BR',
    includesDir: 'docs/pt',
    includesName: 'Manuais de Uso',
    label: '🇧🇷 Português',
  },
];

/**
 * Convierte el título de un manual en el nombre de archivo HTML generado por Compodoc.
 * @param {string} title Título definido en summary.json
 * @returns {string} Nombre de archivo HTML en additional-documentation
 */
function toCompodocSlugFile(title) {
  return `${title.toLowerCase().replace(/ /g, '-')}.html`;
}

/**
 * Construye el mapa de equivalencias de archivos en additional-documentation entre idiomas.
 * @returns {Record<string, Record<string, string>>} Mapa: lang -> filename -> { es, en, pt }
 */
function buildAdditionalDocsMap() {
  const summaries = {};
  for (const lang of LANGUAGES) {
    const summaryPath = path.join(ROOT_DIR, lang.includesDir, 'summary.json');
    summaries[lang.code] = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  }

  const mapByLang = { es: {}, en: {}, pt: {} };
  const itemCount = summaries.es.length;

  for (let i = 0; i < itemCount; i++) {
    const slugs = {};
    for (const lang of LANGUAGES) {
      slugs[lang.code] = `additional-documentation/${toCompodocSlugFile(summaries[lang.code][i].title)}`;
    }
    for (const lang of LANGUAGES) {
      mapByLang[lang.code][slugs[lang.code]] = slugs;
    }
  }

  return mapByLang;
}

/**
 * Obtiene recursivamente todos los archivos .html dentro de un directorio.
 * @param {string} dir Directorio base
 * @returns {string[]} Lista de rutas absolutas
 */
function getHtmlFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getHtmlFilesRecursively(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Codifica cada segmento de una ruta relativa conservando las barras '/'.
 * @param {string} relPath Ruta relativa con '/'
 * @returns {string} Ruta relativa codificada para atributo HTML
 */
function encodeRelativePath(relPath) {
  return relPath
    .split('/')
    .map((segment) => (segment === '..' || segment === '.' ? segment : encodeURIComponent(segment)))
    .join('/');
}

/**
 * Inyecta el selector de idioma (<select id="compodoc-lang-select">) en todos los HTML generados.
 * @param {Record<string, Record<string, Record<string, string>>>} additionalDocsMap Mapa de rutas equivalentes
 */
function injectLanguageSwitcher(additionalDocsMap) {
  const styleBlock = `
        <style id="compodoc-lang-switcher-styles">
            .compodoc-lang-switcher {
                position: absolute;
                top: 70px;
                right: calc(88px + var(--content-scrollbar-width, 0px));
                z-index: 1050;
                display: inline-flex;
                align-items: center;
            }
            @media (min-width: 768px) {
                .compodoc-lang-switcher {
                    top: 15px;
                }
            }
            .compodoc-lang-select {
                height: 34px;
                padding: 0 12px;
                border-radius: 17px;
                border: 1px solid rgba(92, 192, 174, 0.65);
                background-color: #ffffff;
                color: #2c3e50;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                outline: none;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                transition: all 0.2s ease;
            }
            .compodoc-lang-select:hover,
            .compodoc-lang-select:focus {
                border-color: #5cc0ae;
                box-shadow: 0 0 0 2px rgba(92, 192, 174, 0.25);
            }
            body.dark .compodoc-lang-select {
                background-color: #212529;
                color: #f8f9fa;
                border-color: rgba(241, 196, 15, 0.65);
            }
            body.dark .compodoc-lang-select:hover,
            body.dark .compodoc-lang-select:focus {
                border-color: #f1c40f;
                box-shadow: 0 0 0 2px rgba(241, 196, 15, 0.25);
            }
        </style>`;

  for (const lang of LANGUAGES) {
    const langDir = path.join(DOCS_OUTPUT_DIR, lang.code);
    const htmlFiles = getHtmlFilesRecursively(langDir);

    for (const htmlFile of htmlFiles) {
      const relPath = path.relative(langDir, htmlFile).split(path.sep).join('/');
      if (relPath.startsWith('template-playground')) {
        continue;
      }

      let content = fs.readFileSync(htmlFile, 'utf8');
      if (content.includes('id="compodoc-lang-select"')) {
        continue;
      }

      const depth = relPath.split('/').length - 1;
      const prefixToRoot = '../'.repeat(depth + 1);

      const mappedTargets = additionalDocsMap[lang.code][relPath];
      const optionsHtml = LANGUAGES.map((target) => {
        const targetRelPath = mappedTargets ? mappedTargets[target.code] : relPath;
        const targetHref = `${prefixToRoot}${target.code}/${encodeRelativePath(targetRelPath)}`;
        const selectedAttr = target.code === lang.code ? ' selected' : '';
        return `<option value="${target.code}" data-url="${targetHref}"${selectedAttr}>${target.label}</option>`;
      }).join('\n                    ');

      const switcherHtml = `
          <div class="compodoc-lang-switcher">
               <select id="compodoc-lang-select" class="compodoc-lang-select" aria-label="Seleccionar idioma / Select language / Selecionar idioma">
                    ${optionsHtml}
               </select>
          </div>`;

      const switcherScript = `
          <script id="compodoc-lang-switcher-script">
               (function () {
                    try {
                         localStorage.setItem('compodoc_lang', '${lang.code}');
                    } catch (e) {}
                    var select = document.getElementById('compodoc-lang-select');
                    if (select) {
                         select.addEventListener('change', function (evt) {
                              var targetLang = evt.target.value;
                              try {
                                   localStorage.setItem('compodoc_lang', targetLang);
                              } catch (e) {}
                              var selectedOption = evt.target.options[evt.target.selectedIndex];
                              var targetUrl = selectedOption ? selectedOption.getAttribute('data-url') : null;
                              if (targetUrl) {
                                   window.location.href = targetUrl + (window.location.hash || '');
                              }
                         });
                    }
               })();
          </script>`;

      if (content.includes('</head>')) {
        content = content.replace('</head>', `${styleBlock}\n    </head>`);
      }

      if (content.includes('<label class="dark-mode-switch">')) {
        content = content.replace(
          '<label class="dark-mode-switch">',
          `${switcherHtml}\n          <label class="dark-mode-switch">`
        );
      }

      if (content.includes('</body>')) {
        content = content.replace('</body>', `${switcherScript}\n    </body>`);
      }

      fs.writeFileSync(htmlFile, content, 'utf8');
    }
  }
}

/**
 * Crea el archivo documentation/index.html con redirección automática según el idioma preferido.
 */
function createRootRedirectIndex() {
  const indexHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>ATSManagement Web App — Documentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    (function () {
      var supported = ['es', 'en', 'pt'];
      var savedLang = null;
      try {
        savedLang = localStorage.getItem('compodoc_lang');
      } catch (e) {}
      var targetLang = supported.indexOf(savedLang) !== -1 ? savedLang : 'es';
      window.location.replace('./' + targetLang + '/index.html');
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=./es/index.html">
  </noscript>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8f9fa;
      color: #2c3e50;
    }
    .links {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }
    a {
      padding: 8px 16px;
      border-radius: 20px;
      background: #ffffff;
      border: 1px solid #5cc0ae;
      color: #2c3e50;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <p>Redirigiendo a la documentación / Redirecting to documentation...</p>
  <div class="links">
    <a href="./es/index.html">🇪🇸 Español</a>
    <a href="./en/index.html">🇺🇸 English</a>
    <a href="./pt/index.html">🇧🇷 Português</a>
  </div>
</body>
</html>
`;

  fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');
}

/**
 * Limpia los archivos antiguos de la raíz de documentation/ para dejar únicamente es/, en/, pt/ e index.html.
 */
function cleanDocumentationRoot() {
  if (!fs.existsSync(DOCS_OUTPUT_DIR)) {
    fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(DOCS_OUTPUT_DIR, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(DOCS_OUTPUT_DIR, entry.name);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

/**
 * Inicia un servidor HTTP estático liviano para servir documentation/ en el puerto 8080.
 * @param {number} port Puerto de escucha
 */
function serveDocumentation(port = 8080) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };

  const server = http.createServer((req, res) => {
    const rawUrl = (req.url || '/').split('?')[0].split('#')[0];
    const decodedPath = decodeURIComponent(rawUrl);
    let safeRelPath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
    let targetPath = path.join(DOCS_OUTPUT_DIR, safeRelPath);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(targetPath).pipe(res);
  });

  server.listen(port, () => {
    console.log(`\nMulti-language documentation server listening at http://localhost:${port}`);
    console.log(`  - Español:   http://localhost:${port}/es/index.html`);
    console.log(`  - English:   http://localhost:${port}/en/index.html`);
    console.log(`  - Português: http://localhost:${port}/pt/index.html`);
  });
}

function main() {
  console.log('Cleaning documentation directory...');
  cleanDocumentationRoot();

  for (const lang of LANGUAGES) {
    console.log(`\nBuilding Compodoc for [${lang.code}] (${lang.compodocLang})...`);
    const cmd = `npx @compodoc/compodoc -p tsconfig.app.json -d documentation/${lang.code} --language ${lang.compodocLang} --includes ${lang.includesDir} --includesName "${lang.includesName}"`;
    execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' });
  }

  console.log('\nInjecting multi-language switcher into HTML files...');
  const additionalDocsMap = buildAdditionalDocsMap();
  injectLanguageSwitcher(additionalDocsMap);

  console.log('Creating root redirect documentation/index.html...');
  createRootRedirectIndex();

  console.log('\nMulti-language documentation build complete!');

  if (process.argv.includes('--serve')) {
    serveDocumentation(8080);
  }
}

main();
