import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'fs-extra';
import _debug from 'debug';
import helpers from './helpers/index.js';
import _ from 'lodash';

const debug = _debug('client-gen:python');

const templates = {
  resourceDoc: './templates/resource.md.tpl'
};

const loadTemplates = async () => {
  await Promise.all(
    Object.keys(templates).map(async (name) => {
      if (typeof templates[name] !== 'string') {
        return;
      }
      templates[name] = handlebars.compile(
        await fs.readFile(path.resolve(import.meta.dirname, templates[name]), {
          encoding: 'utf8'
        })
      );
    })
  );
};

const generateResourceDoc = async (api, resourceName, index, options) => {
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
    resourceName,
    sidebarPosition: index + 2
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

export default async (api, options) => {
  handlebars.registerHelper(helpers);
  await loadTemplates();

  const resourceOrder = _.sortBy(Object.keys(api.resources), (name) => helpers.niceResourceName(name));

  await Promise.all(resourceOrder.map((r, index) => {
    return generateResourceDoc(api, r, index, options);
  }));
};
