const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('client-gen:python');
const helpers = require('./helpers');

handlebars.registerHelper(helpers);

const resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.md.tpl'), { encoding: 'utf8' })
);
const schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/schemas.md.tpl'), { encoding: 'utf8' })
);

const generateResourceDoc = function(api, resourceName, options) {
  const resource = api.resources[resourceName];
  const name = `docs/rest-api/${helpers.dasherize(helpers.titleize(resourceName))}.md`;

  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  let resourceDoc = resourceDocTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });

  const supplement = `api-supplements/${helpers.dasherize(helpers.titleize(resourceName))}.md`;
  const supplementFile = path.resolve(options.output, supplement);
  if (fs.pathExistsSync(supplementFile)) {
    resourceDoc = `${resourceDoc}\n${fs.readFileSync(supplementFile)}`;
  }

  debug(`writing ${name}`);
  fs.outputFileSync(file, resourceDoc);
};

const generateSchemaDoc = function(api, options) {
  const name = 'docs/rest-api/schemas.md';
  const file = path.resolve(options.output, name);
  debug(`generating ${name}`);
  const schemasDoc = schemasDocTemplate({ api: api, options: options });
  debug(`writing ${name}`);
  fs.outputFileSync(file, schemasDoc);
};

module.exports = function(api, options) {
  return new Promise(function(resolve) {
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function(r) {
      generateResourceDoc(api, r, options);
    });
    resolve();
  });
};
