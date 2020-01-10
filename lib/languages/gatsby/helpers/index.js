const path = require('path');
const util = require('util');
const qs = require('qs');
const commonHelpers = require('../../../common-helpers');
const mkdocsHelpers = require('../../mkdocs/helpers/index');

const helpers = Object.assign({}, commonHelpers, mkdocsHelpers);

helpers.joinPath = function(basePath, resourcePath, actionPath) {
  const str = path.join(basePath || '/', resourcePath || '', actionPath || '');

  return str.replace(/\{(.*?)\}/g, function(param) {
    param = param.substr(1, param.length - 2);
    param = helpers.underscore(param).toUpperCase();
    return `<code style="font-weight:bold" class="language-text">${param}</code>`;
  });
};

helpers.urlPath = function(resourcePath, actionPath) {
  return path.join(resourcePath || '', actionPath || '');
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

  if (param.schema && param.schema.$ref) {
    const wrapper = api.schemaMap[param.schema.$ref];
    const type = `[${wrapper.title}](/rest-api/schemas#${helpers.dasherize(
      wrapper.title
    )})`;
    if (desc[desc.length - 1] !== '.') {
      desc += '.';
    }
    desc += ` See ${type} for more details.`;
    if (wrapper.example) {
      example = wrapper.example;
    }
  }

  if (example === undefined && param.type !== 'file') {
    throw new Error(`Missing example for param: ${param.name}`);
  }
  if (param.type === 'object') { example = JSON.stringify(example); }

  example = qs.stringify({ [param.name]: example }, { encode: false });
  return util.format(
    '| %s | %s | %s | %s | %s |',
    param.name,
    param.required ? 'Y' : 'N',
    desc,
    defVal,
    example
  );
};

helpers.paramSchemaLink = function(api, param) {
  const wrapper = api.schemaMap[param.schema.$ref];
  return `[${wrapper.title}](/rest-api/schemas#${helpers.dasherize(
    wrapper.title
  )})`;
};

helpers.sseResponseDoc = function(api, eventName, eventInfo) {
  if (!eventInfo.description) {
    throw new Error(
      `Missing SSE Event Description: ${eventName}, ${eventInfo}`
    );
  }

  let type = eventInfo.type;
  if (eventInfo.schema && eventInfo.schema.$ref) {
    const wrapper = api.schemaMap[eventInfo.schema.$ref];
    type = `[${wrapper.title}](/rest-api/schemas#${helpers.dasherize(
      wrapper.title
    )})`;
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
  if (response.schema && response.schema.$ref) {
    const wrapper = api.schemaMap[response.schema.$ref];
    type = `[${wrapper.title}](/rest-api/schemas#${helpers.dasherize(
      wrapper.title
    )})`;
  }
  return util.format('| %s | %s | %s |', code, type, response.description);
};

helpers.extraAnchorIfNeeded = function(wrap, defPath) {
  const expectedAnchor = helpers.dasherize(wrap.title);
  const pathAnchor = helpers.dasherize(helpers.titleize(defPath.replace('#/definitions/', '')));
  if (expectedAnchor !== pathAnchor) {
    return `<a id="${pathAnchor}"></a>`;
  }
};

module.exports = helpers;
