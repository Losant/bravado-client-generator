const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('client-gen:python');
const helpers = require('./helpers');

handlebars.registerHelper(helpers);

const RESERVED = ['setOption', 'request', 'Resource'];

const clientTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/client.py.tpl'), { encoding: 'utf8' })
);
const resourceTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.py.tpl'), { encoding: 'utf8' })
);
const resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/resource.md.tpl'), { encoding: 'utf8' })
);
const schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/schemas.md.tpl'), { encoding: 'utf8' })
);
const initTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/__init__.py.tpl'), { encoding: 'utf8' })
);
const errorTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/error.py.tpl'), { encoding: 'utf8' })
);

const generateInitPy = function(api, options) {
  const name = `${api.info.baseDir}/__init__.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const initSource = initTemplate({ api: api, options: options });
  debug(`writing ${name}`);
  fs.outputFileSync(file, initSource);
};

const generateClientPy = function(api, options) {
  const name = `${api.info.baseDir}/client.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const clientSource = clientTemplate({ api: api, options: options });
  debug(`writing ${name}`);
  fs.outputFileSync(file, clientSource);
};

const generateErrorPy = function(api, options) {
  const name = `${api.info.baseDir}/${helpers.underscore(`${api.info.cleanTitle}Error`)}.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const initSource = errorTemplate({ api: api, options: options });
  debug(`writing ${name}`);
  fs.outputFileSync(file, initSource);
};

const generateResourcePy = function(api, resourceName, options) {
  const resource = api.resources[resourceName];
  const name = `${api.info.baseDir}/${helpers.underscore(resourceName)}.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const resourceSource = resourceTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug(`writing ${name}`);
  fs.outputFileSync(file, resourceSource);
};

const generateSchemaJson = function(api, defName, options) {
  const wrapper = api.schemaMap[defName];
  const name = `schemas/${wrapper.file}.json`;
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
  const file = path.resolve(options.output, 'docs/_schemas.md');
  debug('generating docs/_schemas.md');
  const schemasDoc = schemasDocTemplate({ api: api, options: options });
  debug('writing docs/_schemas.md');
  fs.outputFileSync(file, schemasDoc);
};

module.exports = function(api, options) {
  api.info.cleanTitle = api.info.title.replace(' API', '');
  api.info.baseDir = `${api.info.cleanTitle.toLowerCase()}rest`;
  return new Promise(function(resolve) {
    generateInitPy(api, options);
    generateErrorPy(api, options);
    generateClientPy(api, options);
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function(r) {
      if (RESERVED.indexOf(r) !== -1) {
        throw new Error(`${r} is reserved and cannot be used as a resource name`);
      }
      generateResourcePy(api, r, options);
      generateResourceDoc(api, r, options);
    });
    Object.keys(api.schemaMap).forEach(function(s) {
      generateSchemaJson(api, s, options);
    });
    resolve();
  });
};
