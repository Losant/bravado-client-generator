const path = require('path');
const commonHelpers = require('../../../common-helpers');

const helpers = { ...commonHelpers };

helpers.commentify = function(str, indent) {
  if (!str) { return; }
  str = String(str).trim();
  if (!str) { return; }
  indent = typeof(indent) === 'string' ? indent : '';

  str = str.split('\n');
  if (str.length === 1) {
    return `${indent}""" ${str[0].trim()} """`;
  }

  str = str.map(function(s) { return s.trim(); }).join(`\n${indent}`);
  str = `${indent}"""\n${indent}${str}\n${indent}"""`;

  return str;
};

helpers.joinPath = function(basePath, resourcePath, actionPath) {
  return path.posix.join(basePath || '/', resourcePath || '', actionPath || '');
};

helpers.pythonActionName = function(name) {
  if (name === 'import') {
    return 'api_import';
  } else {
    return helpers.underscore(name);
  }
};

helpers.setParam = function(param) {
  const code = `if "${param.name}" in kwargs:`;
  switch (param.in) {
    case 'path':
      return `${code}\n            path_params["${param.name}"] = kwargs["${param.name}"]`;
    case 'query': // json.dumps()
      return `${code}\n            query_params["${param.name}"] = ${param.type === 'object' ?
        `json.dumps(kwargs["${param.name}"])` :
        `kwargs["${param.name}"]`}`;
    case 'header':
      return `${code}\n            headers["${param.name}"] = kwargs["${param.name}"]`;
    case 'body':
      return `${code}\n            body = kwargs["${param.name}"]`;
    default:
      throw new Error(`Bad param placement ${param.in}`);
  }
};

helpers.example = function(api, resourceName, actionName) {
  let str = '```python\n';
  str += `result = client.${helpers.underscore(resourceName)}.${helpers.pythonActionName(actionName)}`;

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
      paramStr.push(`${param.name}=my_${helpers.underscore(param.name)}`);
    });
    if (paramStr.length > 1) {
      str += '(\n';
      str += `    ${paramStr.join(',\n    ')}`;
      str += ')\n';
    } else if (paramStr.length > 0) {
      str += `(${paramStr[0]})\n`;
    } else {
      str += '(**optional_params)\n';
    }
  } else {
    str += '()\n';
  }
  str += '\n';
  str += 'print(result)\n';
  str += '```';
  return str;
};

module.exports = helpers;
