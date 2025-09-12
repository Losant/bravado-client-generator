import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'fs-extra';
import _debug from 'debug';
import helpers from './helpers/index.js';

const debug = _debug('client-gen:python');

const templates = {
  resourceDoc: './templates/resource.md.tpl',
  schemasDoc: './templates/schemas.md.tpl'
};

const loadTemplates = async () => {
  await Promise.all(Object.keys(templates).map(async (name) => {
    if (typeof(templates[name]) !== 'string') { return; }
    templates[name] = handlebars.compile(
      await fs.readFile(path.resolve(import.meta.dirname, templates[name]), { encoding: 'utf8' })
    );
  }));
};

const generateResourceDoc = async (api, resourceName, options) => {
  const resource = api.resources[resourceName];
  const name = `docs/rest-api/${helpers.dasherize(helpers.titleize(resourceName))}.md`;

  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  let resourceDoc = templates.resourceDoc({
    api,
    options,
    resource,
    resourceName
  });

  const supplement = `api-supplements/${helpers.dasherize(helpers.titleize(resourceName))}.md`;
  const supplementFile = path.resolve(options.output, supplement);
  if (await fs.pathExists(supplementFile)) {
    resourceDoc = `${resourceDoc}\n${await fs.readFile(supplementFile)}`;
  }

  debug(`writing ${name}`);
  await fs.outputFile(file, resourceDoc);
};

const generateSchemaDoc = async (api, options) => {
  const name = 'docs/rest-api/schemas.md';
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const schemasDoc = templates.schemasDoc({ api, options });
  debug(`writing ${name}`);
  await fs.outputFile(file, schemasDoc);
};

export default async (api, options) => {
  handlebars.registerHelper(helpers);
  await loadTemplates();
  const promises = [generateSchemaDoc(api, options)];
  Object.keys(api.resources).forEach((r) => {
    promises.push(generateResourceDoc(api, r, options));
  });
  await Promise.all(promises);
};
