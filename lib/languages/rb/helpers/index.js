const path = require('path');
const commonHelpers = require('../../../common-helpers');

const helpers = { ...commonHelpers };

helpers.commentify = function(str, indent) {
  if (!str) { return; }
  str = String(str).trim();
  if (!str) { return; }
  indent = typeof(indent) === 'string' ? indent : '';

  str = str.split('\n');

  str = str.join(`\n${indent}# `);
  str = `${indent}# ${str}`;

  // replace any trailing spaces
  return str.replace(/\s*\n/gm, '\n');
};


helpers.joinPath = function(basePath, resourcePath, actionPath) {
  const str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return str.replace(/\{(.*?)\}/g, '#{params[:$1]}');
};

helpers.example = function(api, resourceName, actionName) {
  let str = '```ruby\n';
  str += `result = client.${helpers.underscore(resourceName)}.${helpers.underscore(actionName)}`;

  const resource = api.resources[resourceName];
  const action = resource.actions[actionName];

  const params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params: [],
    Array.isArray(action.params) ? action.params: []
  );

  const paramStr = [];
  if (params.length > 0) {
    params.forEach(function(param) {
      if (param.private || !param.required) { return; }
      paramStr.push(`${param.name}: my_${helpers.underscore(param.name)}`);
    });
    if (paramStr.length > 1) {
      str += '(\n';
      str += `  ${paramStr.join(',\n  ')}`;
      str += ')\n';
    } else if (paramStr.length > 0) {
      str += `(${paramStr[0]})\n`;
    } else {
      str += '(optional_params)\n';
    }
  } else {
    str += '\n';
  }
  str += '\n';
  str += 'puts result\n';
  str += '```';
  return str;
};

module.exports = helpers;
