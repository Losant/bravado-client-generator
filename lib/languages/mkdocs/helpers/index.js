const path = require('path');
const util = require('util');
const qs    = require('qs');
const commonHelpers = require('../../../common-helpers');

const helpers = Object.assign({}, commonHelpers);

helpers.joinPathEx = function(basePath, resourcePath, actionPath) {
  const str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return str.replace(/\{(.*?)\}/g, function(param) {
    param = param.substr(1, param.length-2);
    return helpers.underscore(param).toUpperCase();
  });
};

helpers.joinPath = function(basePath, resourcePath, actionPath) {
  const str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return str.replace(/\{(.*?)\}/g, function(param) {
    param = param.substr(1, param.length-2);
    param = helpers.underscore(param).toUpperCase();
    return `**\`${param}\`**`;
  });
};

helpers.queryParamDoc = function(api, param) {
  const defVal = param.default === undefined ? '' : String(param.default);
  let example = param.example;

  let desc = param.description;
  if (param.enum) {
    if (desc[desc.length-1] !== '.') { desc += '.'; }
    desc += ` Accepted values are: ${param.enum.join(', ')}`;
  }

  if (param.schema && param.schema.$ref) {
    const wrapper = api.schemaMap[param.schema.$ref];
    const type = `[${wrapper.title}](schemas.md#${helpers.dasherize(wrapper.title)})`;
    if (desc[desc.length-1] !== '.') { desc += '.'; }
    desc += ` See ${type} for more details.`;
    if (wrapper.example) { example = wrapper.example; }
  }

  if (example === undefined) { throw new Error(`Missing example for param: ${param.name}`); }

  example = qs.stringify({ [param.name]: example }, { encode: false });
  return util.format('| %s | %s | %s | %s | %s |',
    param.name, param.required ? 'Y' : 'N', desc, defVal, example);
};

helpers.paramSchemaLink = function(api, param) {
  const wrapper = api.schemaMap[param.schema.$ref];
  return `[${wrapper.title}](schemas.md#${helpers.dasherize(wrapper.title)})`;
};

helpers.sseResponseDoc = function(api, eventName, eventInfo) {
  if (!eventInfo.description) { throw new Error(`Missing SSE Event Description: ${eventName}, ${eventInfo}`); }

  let type = eventInfo.type;
  if (eventInfo.schema && eventInfo.schema.$ref) {
    const wrapper = api.schemaMap[eventInfo.schema.$ref];
    type = `[${wrapper.title}](schemas.md#${helpers.dasherize(wrapper.title)})`;
  }

  return util.format('| %s | %s | %s |', eventName, type, eventInfo.description);
};

helpers.responseDoc = function(api, code, response) {
  if (!response.description) { throw new Error(`Missing Response Description: ${response}`); }
  let type = response.type;
  if (response.schema && response.schema.$ref) {
    const wrapper = api.schemaMap[response.schema.$ref];
    type = `[${wrapper.title}](schemas.md#${helpers.dasherize(wrapper.title)})`;
  }
  return util.format('| %s | %s | %s |', code, type, response.description);
};

helpers.exampleForParam = function(api, param) {
  if (param.example) { return param.example; }

  if (param.schema) {
    const wrapper = api.schemaMap[param.schema.$ref];
    return wrapper.example;
  }

  throw new Error(`Missing example for: ${param.name}`);
};

helpers.hasParamType = function(api, resourceName, actionName, type) {

  const resource = api.resources[resourceName];
  const action = resource.actions[actionName];

  if (type === 'header' && helpers.hasAuthScopes(api, resource, action)) { return true; }  // needs auth header

  const params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params : [],
    Array.isArray(action.params) ? action.params : []
  );
  for (const i in params) {
    if (!params[i].private && type === params[i].in) { return true; }
  }
  return false;
};

helpers.generateCurlExample = function(api, resourceName, actionName) {
  const resource = api.resources[resourceName];
  const action = resource.actions[actionName];

  let urlPath = helpers.joinPathEx(api.basePath, resource.path, action.path);

  const params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params : [],
    Array.isArray(action.params) ? action.params : []
  );

  let str = '';
  let bodyStr;
  let queryParams = {};

  params.forEach(function(param) {
    if (param.private || !param.required) { return; }

    const ex = helpers.exampleForParam(api, param);

    if (params.in === 'path') {
      return;
    } else if (param.in === 'query') {
      queryParams[param.name] = ex;
    } else if (param.in === 'body') {
      bodyStr = `    -d '${JSON.stringify(ex)}' \\\n`;
    } else if (param.in === 'header') {
      str += `    -H '${param.name}: ${ex}' \\\n`;
    }
  });

  if (bodyStr) {
    str += bodyStr;
  }

  queryParams = qs.stringify(queryParams);
  if (queryParams) {
    urlPath += `?${queryParams}`;
  }

  str += `    https://api.losant.com${urlPath}`;
  return str;
};

module.exports = helpers;
