const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('client-gen:javascript');
const stableStringify = require('fast-json-stable-stringify');

handlebars.registerHelper(require('./helpers'));

const RESERVED = ['setOption', 'request', 'Resource'];

const templates = {
  package: './templates/package.json.tpl',
  readme: './templates/readme.md.tpl',
  index: './templates/index.js.tpl',
  api: './templates/api.js.tpl',
  resource: './templates/resource.js.tpl',
  resourceDoc: '../../common_templates/resource.md.tpl',
  schemasDoc: '../../common_templates/schemas.md.tpl'
};

const loadTemplates = async () => {
  await Promise.all(Object.keys(templates).map(async (name) => {
    if (typeof(templates[name]) !== 'string') { return; }
    templates[name] = handlebars.compile(
      await fs.readFile(path.resolve(__dirname, templates[name]), { encoding: 'utf8' })
    );
  }));
};

const generatePackageJson = async (api, options) => {
  const file = path.resolve(options.output, 'package.json');
  if (await fs.pathExists(file)) {
    debug('not generating package.json since it already exists');
  } else {
    debug('generating package.json');
    const packageJson = templates.package({ api, options });
    debug('writing package.json');
    await fs.outputFile(file, packageJson);
  }
};

const generateReadme = async (api, options) => {
  const file = path.resolve(options.output, 'README.md');
  if (await fs.pathExists(file)) {
    debug('not generating README.md since it already exists');
  } else {
    debug('generating README.md');
    const readmeDoc = templates.readme({ api, options });
    debug('writing README.md');
    await fs.outputFile(file, readmeDoc);
  }
};

const generateIndexJs = async (api, options) => {
  const file = path.resolve(options.output, 'lib/index.js');
  debug('generating lib/index.js');
  const indexSource = templates.index({ api, options });
  debug('writing lib/index.js');
  await fs.outputFile(file, indexSource);
};

const generateApiJs = async (api, options) => {
  const file = path.resolve(options.output, 'lib/api/index.js');
  debug('generating lib/api/index.js');
  const apiSource = templates.api({ api, options });
  debug('writing lib/api/index.js');
  await fs.outputFile(file, apiSource);
};

const generateResourceJs = async (api, resourceName, options) => {
  const resource = api.resources[resourceName];
  const file = path.resolve(options.output, `lib/api/${resourceName}.js`);
  debug(`generating lib/api/${resourceName}.js`);
  const resourceSource = templates.resource({
    api,
    options,
    resource,
    resourceName
  });
  debug(`writing lib/api/${resourceName}.js`);
  await fs.outputFile(file, resourceSource);
};

const generateSchemaJson = async (api, defName, options) => {
  const wrapper = api.schemaMap[defName];
  const name = `lib/schemas/${wrapper.file}.json`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const schemaSource = JSON.stringify(wrapper.schema, null, 2);
  debug(`writing ${name}`);
  await fs.outputFile(file, schemaSource);
};

const generateResourceDoc = async (api, resourceName, options) => {
  const resource = api.resources[resourceName];
  const file = path.resolve(options.output, `docs/${resourceName}.md`);
  debug(`generating docs/${resourceName}.md`);
  const resourceDoc = templates.resourceDoc({
    api,
    options,
    resource,
    resourceName
  });
  debug(`writing docs/${resourceName}.md`);
  await fs.outputFile(file, resourceDoc);
};

const generateSchemaDoc = async (api, options) => {
  let file = path.resolve(options.output, 'docs/_schemas.md');
  debug('generating docs/_schemas.md');
  const schemasDoc = templates.schemasDoc({ api, options });
  debug('writing docs/_schemas.md');
  await fs.outputFile(file, schemasDoc);

  file = path.resolve(options.output, 'lib/schemas/apiInfo.json');
  debug('writing lib/schemas/apiInfo.json');
  await fs.outputFile(file, stableStringify(api.resources));

  file = path.resolve(options.output, 'lib/schemas/apiExamples.json');
  debug('writing lib/schemas/apiExamples.json');
  await fs.outputFile(file, stableStringify(api.examples));
};

module.exports = async (api, options) => {
  await loadTemplates();
  const promises = [
    generatePackageJson(api, options),
    generateReadme(api, options),
    generateIndexJs(api, options),
    generateApiJs(api, options),
    generateSchemaDoc(api, options)
  ];
  Object.keys(api.resources).forEach((r) => {
    if (RESERVED.indexOf(r) !== -1) {
      throw new Error(`${r} is reserved and cannot be used as a resource name`);
    }
    promises.push(generateResourceJs(api, r, options));
    promises.push(generateResourceDoc(api, r, options));
  });
  Object.keys(api.schemaMap).forEach((s) => {
    promises.push(generateSchemaJson(api, s, options));
  });
  await Promise.all(promises);
};
