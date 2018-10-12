const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('client-gen:javascript');

handlebars.registerHelper(require('./helpers'));

const RESERVED = ['setOption', 'request', 'Resource'];

const packageTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/package.json.tpl'), { encoding: 'utf8' })
);
const readmeTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/readme.md.tpl'), { encoding: 'utf8' })
);
const indexTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/index.js.tpl'), { encoding: 'utf8' })
);
const apiTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/api.js.tpl'), { encoding: 'utf8' })
);
const resourceTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.js.tpl'), { encoding: 'utf8' })
);
const resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/resource.md.tpl'), { encoding: 'utf8' })
);
const schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/schemas.md.tpl'), { encoding: 'utf8' })
);

const generatePackageJson = function(api, options) {
  const file = path.resolve(options.output, 'package.json');
  let exists = false;
  try { fs.statSync(file); exists = true; } catch (e) { }
  if (exists) {
    debug('not generating package.json since it already exists');
  } else {
    debug('generating package.json');
    const packageJson = packageTemplate({ api: api, options: options });
    debug('writing package.json');
    fs.outputFileSync(file, packageJson);
  }
};

const generateReadme = function(api, options) {
  const file = path.resolve(options.output, 'README.md');
  let exists = false;
  try { fs.statSync(file); exists = true; } catch (e) { }
  if (exists) {
    debug('not generating README.md since it already exists');
  } else {
    debug('generating README.md');
    const readmeDoc = readmeTemplate({ api: api, options: options });
    debug('writing README.md');
    fs.outputFileSync(file, readmeDoc);
  }
};

const generateIndexJs = function(api, options) {
  const file = path.resolve(options.output, 'lib/index.js');
  debug('generating lib/index.js');
  const indexSource = indexTemplate({ api: api, options: options });
  debug('writing lib/index.js');
  fs.outputFileSync(file, indexSource);
};

const generateApiJs = function(api, options) {
  const file = path.resolve(options.output, 'lib/api/index.js');
  debug('generating lib/api/index.js');
  const apiSource = apiTemplate({ api: api, options: options });
  debug('writing lib/api/index.js');
  fs.outputFileSync(file, apiSource);
};

const generateResourceJs = function(api, resourceName, options) {
  const resource = api.resources[resourceName];
  const file = path.resolve(options.output, `lib/api/${resourceName}.js`);
  debug(`generating lib/api/${resourceName}.js`);
  const resourceSource = resourceTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug(`writing lib/api/${resourceName}.js`);
  fs.outputFileSync(file, resourceSource);
};

const generateSchemaJson = function(api, defName, options) {
  const wrapper = api.schemaMap[defName];
  const name = `lib/schemas/${wrapper.file}.json`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const schemaSource = JSON.stringify(wrapper.schema, null, 2);
  debug(`writing ${name}`);
  fs.outputFileSync(file, schemaSource);
};

const generateResourceDoc = function(api, resourceName, options) {
  const resource = api.resources[resourceName];
  const file = path.resolve(options.output, `docs/${resourceName}.md`);
  debug(`generating docs/${resourceName}.md`);
  const resourceDoc = resourceDocTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug(`writing docs/${resourceName}.md`);
  fs.outputFileSync(file, resourceDoc);
};

const generateSchemaDoc = function(api, options) {
  let file = path.resolve(options.output, 'docs/_schemas.md');
  debug('generating docs/_schemas.md');
  const schemasDoc = schemasDocTemplate({ api: api, options: options });
  debug('writing docs/_schemas.md');
  fs.outputFileSync(file, schemasDoc);

  file = path.resolve(options.output, 'lib/schemas/apiInfo.json');
  debug('writing lib/schemas/apiInfo.json');
  fs.outputFileSync(file, JSON.stringify(api.resources));

  file = path.resolve(options.output, 'lib/schemas/apiExamples.json');
  debug('writing lib/schemas/apiExamples.json');
  fs.outputFileSync(file, JSON.stringify(api.examples));
};

module.exports = function(api, options) {
  return new Promise(function(resolve) {
    generatePackageJson(api, options);
    generateReadme(api, options);
    generateIndexJs(api, options);
    generateApiJs(api, options);
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function(r) {
      if (RESERVED.indexOf(r) !== -1) {
        throw new Error(`${r} is reserved and cannot be used as a resource name`);
      }
      generateResourceJs(api, r, options);
      generateResourceDoc(api, r, options);
    });
    Object.keys(api.schemaMap).forEach(function(s) {
      generateSchemaJson(api, s, options);
    });

    resolve();
  });
};
