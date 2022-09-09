const path = require('path');
const commonHelpers = require('../../../common-helpers');

const helpers = Object.assign({}, commonHelpers);

helpers.commentify = function(str, indent) {
  if (!str) { return; }
  str = String(str).trim();
  if (!str) { return; }
  indent = typeof(indent) === 'string' ? indent : '';

  str = str.split('\n');
  if (str.length === 1) {
    return `${indent}// ${str[0]}`;
  }

  str = str.join(`\n${indent} * `);
  str = `${indent}/**\n${indent} * ${str}\n${indent} */`;

  // replace any trailing spaces
  return str.replace(/\s*\n/gm, '\n');
};

helpers.joinPath = function(basePath, resourcePath, actionPath) {
  return path.posix.join(basePath || '/', resourcePath || '', actionPath || '');
};

helpers.setParam = function(param) {
  switch (param.in) {
    case 'path':
      return `if ('undefined' !== typeof params.${param.name}) { pathParams.${param.name} = params.${param.name}; }`;
    case 'query':
      return `if ('undefined' !== typeof params.${param.name}) { req.params.${param.name} = ${param.type === 'object' ?
        `JSON.stringify(params.${param.name})` :
        `params.${param.name}`}; }`;
    case 'header':
      return `if ('undefined' !== typeof params.${param.name}) { req.headers.${param.name} = params.${param.name}; }`;
    case 'body':
      return `if ('undefined' !== typeof params.${param.name}) { req.data = params.${param.name}; }`;
    case 'multipart':
      return `if ('undefined' !== typeof params.${param.name}) { req.data.${param.name} = ${param.type === 'object' ? `JSON.stringify(params.${param.name})` : `params.${param.name}`}; }`;
    default:
      throw new Error(`Bad param placement ${param.in}`);
  }
};

helpers.example = function(api, resourceName, actionName) {
  let str = '```javascript\n';

  const resource = api.resources[resourceName];
  const action = resource.actions[actionName];

  const params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params: [],
    Array.isArray(action.params) ? action.params: []
  );

  const paramStr = [];
  params.forEach(function(param) {
    if (param.private || !param.required) { return; }
    paramStr.push(`  ${param.name}: my${helpers.classify(param.name)}`);
  });
  if (paramStr.length > 0) {
    str += 'var params = {\n';
    str += paramStr.join(',\n');
    str += '\n};\n';
  } else {
    str += 'var params = {}; // all params are optional\n';
  }
  str += '\n';

  str += '// with callbacks\n';
  str += `client.${resourceName}.${actionName}(params, function (err, result) {\n`;
  str += '  if (err) { return console.error(err); }\n';
  str += '  console.log(result);\n';
  str += '});\n';
  str += '\n';
  str += '// with promises\n';
  str += `client.${resourceName}.${actionName}(params)\n`;
  str += '  .then(console.log)\n';
  str += '  .catch(console.error);\n';
  str += '```';

  return str;
};

helpers.parameterDoc = function(api, params, options) {
  return commonHelpers.parameterDoc(api, params, '../lib/schemas', options);
};

helpers.responseDoc = function(api, code, response, options) {
  return commonHelpers.responseDoc(api, code, response, '../lib/schemas', options);
};

helpers.sseResponseDoc = function(api, eventName, eventInfo, options) {
  return commonHelpers.sseResponseDoc(api, eventName, eventInfo, '../lib/schemas', options);
};

module.exports = helpers;
