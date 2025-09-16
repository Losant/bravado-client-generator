import { pluckParamFields } from '../utils.js';
import commonHelpers from '../../../common-helpers.js';

const helpers = { ...commonHelpers };

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
helpers.buildParams = function(src, GLOBAL_PARAMS_NAMES) {
  return JSON.stringify(pluckParamFields(src, GLOBAL_PARAMS_NAMES));
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
    str += 'const params = {\n';
    str += paramStr.join(',\n');
    str += '\n};\n';
  } else {
    str += 'const params = {}; // all params are optional\n';
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

export default helpers;
