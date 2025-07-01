const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('client-gen:python');
const helpers = require('./helpers');
const jsonRefs = require('json-refs');

handlebars.registerHelper(helpers);

const templates = {
  resourceDoc: './templates/resource.md.tpl',
};

const loadTemplates = async () => {
  await Promise.all(
    Object.keys(templates).map(async (name) => {
      if (typeof templates[name] !== 'string') {
        return;
      }
      templates[name] = handlebars.compile(
        await fs.readFile(path.resolve(__dirname, templates[name]), {
          encoding: 'utf8'
        })
      );
    })
  );
};

const generateResourceDoc = async (api, resourceName, options) => {
  const resource = api.resources[resourceName];
  const name = `docs/rest-api/${helpers.dasherize(
    helpers.titleize(resourceName)
  )}.mdx`;

  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  let resourceDoc = templates.resourceDoc({
    api,
    options,
    resource,
    resourceName
  });

  const supplement = `api-supplements/${helpers.dasherize(
    helpers.titleize(resourceName)
  )}.md`;
  const supplementFile = path.resolve(options.output, supplement);
  if (await fs.pathExists(supplementFile)) {
    resourceDoc = `${resourceDoc}\n${await fs.readFile(supplementFile)}`;
  }

  debug(`writing ${name}`);
  await fs.outputFile(file, resourceDoc);
};

module.exports = async (api, options) => {
  await loadTemplates();
  await Promise.all(Object.keys(api.resources).map((r) => {
    return generateResourceDoc(api, r, options);
  }));
};
