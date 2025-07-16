const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('client-gen:python');
const helpers = require('./helpers');
const { capitalize } = require('lodash');

handlebars.registerHelper(helpers);

const RESERVED = ['setOption', 'request', 'Resource'];

const templates = {
  client: './templates/client.py.tpl',
  resource: './templates/resource.py.tpl',
  init: './templates/__init__.py.tpl',
  error: './templates/error.py.tpl',
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

const generateInitPy = async (api, options) => {
  const name = `${api.info.baseDir}/__init__.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const initSource = templates.init({ api, options });
  debug(`writing ${name}`);
  await fs.outputFile(file, initSource);
};

const generateClientPy = async (api, options) => {
  const name = `${api.info.baseDir}/client.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const clientSource = templates.client({ api, options });
  debug(`writing ${name}`);
  await fs.outputFile(file, clientSource);
};

const generateErrorPy = async (api, options) => {
  const name = `${api.info.baseDir}/${helpers.underscore(`${api.info.cleanTitle}Error`)}.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const initSource = templates.error({ api, options });
  debug(`writing ${name}`);
  await fs.outputFile(file, initSource);
};

const generateResourcePy = async (api, resourceName, options) => {
  const resource = api.resources[resourceName];
  const name = `${api.info.baseDir}/${helpers.underscore(resourceName)}.py`;
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const resourceSource = templates.resource({
    api,
    options,
    resource,
    resourceName
  });
  debug(`writing ${name}`);
  await fs.outputFile(file, resourceSource);
};

const generateSchemaJson = async (api, defName, options) => {
  const wrapper = api.schemaMap[defName];
  const name = `schemas/${wrapper.file}.json`;
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
  const file = path.resolve(options.output, 'docs/_schemas.md');
  debug('generating docs/_schemas.md');
  const schemasDoc = templates.schemasDoc({ api, options });
  debug('writing docs/_schemas.md');
  await fs.outputFile(file, schemasDoc);
};

module.exports = async (api, options) => {
  api.info.cleanTitle = capitalize(options.title);
  api.info.baseDir = `${api.info.cleanTitle.toLowerCase()}_rest`;
  await loadTemplates();
  const promises = [
    generateInitPy(api, options),
    generateErrorPy(api, options),
    generateClientPy(api, options),
    generateSchemaDoc(api, options)
  ];
  Object.keys(api.resources).forEach((r) => {
    if (RESERVED.indexOf(r) !== -1) {
      throw new Error(`${r} is reserved and cannot be used as a resource name`);
    }
    promises.push(generateResourcePy(api, r, options));
    promises.push(generateResourceDoc(api, r, options));
  });
  Object.keys(api.schemaMap).forEach((s) => {
    promises.push(generateSchemaJson(api, s, options));
  });
  await Promise.all(promises);
};
