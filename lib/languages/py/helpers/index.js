var inflection = require('inflection');
var path = require('path');
var url = require('url');
var util = require('util');
var commonHelpers = require('../../../common-helpers');

var helpers = Object.assign({}, commonHelpers);

helpers.joinPath = function (basePath, resourcePath, actionPath) {
  return path.join(basePath || '/', resourcePath || '', actionPath || '');
};

helpers.setParam = function (param) {
  var code = 'if "' + param.name + '" in kwargs:';
  switch (param.in) {
    case 'path':
      return code + '\n            path_params["' + param.name + '"] = kwargs["' + param.name + '"]';
    case 'query':
      return code + '\n            query_params["' + param.name + '"] = kwargs["' + param.name + '"]';
    case 'header':
      return code + '\n            headers["' + param.name + '"] = kwargs["' + param.name + '"]';
    case 'body':
      return code + '\n            body = kwargs["' + param.name + '"]';
  }
};

helpers.example = function (api, resourceName, actionName) {
  var str = '```python\n';
  str += 'result = client.' + helpers.underscore(resourceName) + '.' + helpers.underscore(actionName);

  var resource = api.resources[resourceName];
  var action = resource.actions[actionName];

  var params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params: [],
    Array.isArray(action.params) ? action.params: []
  );

  var paramStr = [];
  if(params.length > 0){
    params.forEach(function(param){
      if(param.private || !param.required){ return; }
      paramStr.push(param.name + '=' + 'my_' + helpers.underscore(param.name));
    });
    if(paramStr.length > 1){
      str += '(\n';
      str += '    ' + paramStr.join(',\n    ');
      str += ')\n';
    } else if(paramStr.length > 0){
      str += '(' + paramStr[0] + ')\n';
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
