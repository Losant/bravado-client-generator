const path = require('path');
const util = require('util');
const qs = require('qs');
const commonHelpers = require('../../../common-helpers');
const mkdocsHelpers = require('../../mkdocs/helpers/index');

const helpers = Object.assign({}, commonHelpers, mkdocsHelpers);

helpers.inspect = function(obj) {
  return util.inspect(obj, { depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity, breakLength: Infinity, compact: true });
};

helpers.joinPath = function(root, basePath, resourcePath, actionPath) {
  const str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return root.replace('://', '<span>://</span>') + str.replace(/\{(.*?)\}/g, function(param) {
    param = param.substr(1, param.length - 2);
    param = helpers.underscore(param).toUpperCase();
    return `<strong><code className="language-text">${param}</code></strong>`;
  });
};

helpers.urlPath = function(resourcePath, actionPath) {
  return path.join(resourcePath || '', actionPath || '');
};

helpers.schemaAnchor = function(defPath) {
  return helpers.dasherize(helpers.titleize(defPath.replace('#/definitions/', '')));
};

helpers.schemaLink = function(schemaMap, defPath) {
  const wrapper = schemaMap[defPath];
  return `[${wrapper.title}](#${helpers.schemaAnchor(defPath)})`;
};

helpers.queryParamDoc = function(api, param) {
  const defVal = param.default === undefined ? '' : String(param.default);
  let example = param.example;

  let desc = param.description;
  if (param.enum) {
    if (desc[desc.length - 1] !== '.') {
      desc += '.';
    }
    desc += ` Accepted values are: ${param.enum.join(', ')}`;
  }

  if (param.schema?.$ref) {
    const type = helpers.schemaLink(api.schemaMap, param.schema.$ref);
    if (desc[desc.length - 1] !== '.') {
      desc += '.';
    }
    desc += ` See ${type} for more details.`;
    const wrapper = api.schemaMap[param.schema.$ref];
    if (wrapper.example) {
      example = wrapper.example;
    }
  }

  if (example === undefined && param.type !== 'file') {
    throw new Error(`Missing example for param: ${param.name}`);
  }
  if (param.type === 'object') { example = JSON.stringify(example); }

  example = `\`${qs.stringify({ [param.name]: example }, { encode: false })}\``;
  return util.format(
    '| %s | %s | %s | %s | %s |',
    param.name,
    param.required ? 'Y' : 'N',
    desc,
    defVal,
    example
  );
};

helpers.sseResponseDoc = function(api, eventName, eventInfo) {
  if (!eventInfo.description) {
    throw new Error(
      `Missing SSE Event Description: ${eventName}, ${eventInfo}`
    );
  }

  let type = eventInfo.type;
  if (eventInfo.schema?.$ref) {
    type = helpers.schemaLink(api.schemaMap, eventInfo.schema.$ref);
  }

  return util.format(
    '| %s | %s | %s |',
    eventName,
    type,
    eventInfo.description
  );
};

helpers.responseDoc = function(api, code, response) {
  if (!response.description) {
    throw new Error(`Missing Response Description: ${response}`);
  }
  let type = response.type;
  if (response.schema?.$ref) {
    type = helpers.schemaLink(api.schemaMap, response.schema.$ref);
  }
  return util.format('| %s | %s | %s |', code, type, response.description);
};

helpers.niceResourceName = function(name) {
  name = helpers.titleize(name);
  if (name.startsWith('Credential')) {
    return `Service ${name}`;
  } else if (name.startsWith('Flow')) {
    return name.replace('Flow', 'Workflow');
  } else if (name.includes('Org')) {
    return name.replace('Org', 'Organization');
  } else if (name.includes(' Api ')) {
    return name.replace(' Api ', ' API ');
  } else {
    return name;
  }
};

const extractSchemaRefs = (val) => {
  let expectedSchemas = [];
  if (Array.isArray(val)) {
    val.forEach((k) => {
      expectedSchemas = expectedSchemas.concat(extractSchemaRefs(k));
    });
  } else if (typeof val === 'object') {
    if (val.$ref) { expectedSchemas.push(val.$ref); }
    Object.keys(val).forEach((k) => {
      expectedSchemas = expectedSchemas.concat(extractSchemaRefs(val[k]));
    });
  }
  return expectedSchemas;
};


helpers.schemasForResource = function(api, resource) {
  const schemaWraps = {};
  extractSchemaRefs(resource).forEach((ref) => {
    schemaWraps[ref] = api.schemaMap[ref];
  });
  return schemaWraps;
};

module.exports = helpers;
