var inflection = require('inflection');
var path = require('path');
var url = require('url');
var util = require('util');
var commonHelpers = require('../../../common-helpers');

var helpers = Object.assign({}, commonHelpers);

helpers.joinPath = function (basePath, resourcePath, actionPath) {
  str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return str.replace(/\{(.*?)\}/g, '#{params[:$1]}');
};

helpers.example = function (api, resourceName, actionName) {
  var str = '```ruby\n';
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
      if(!param.required){ return; }
      paramStr.push(param.name + ': ' + 'my_' + helpers.underscore(param.name));
    });
    if(paramStr.length > 1){
      str += '(\n';
      str += '  ' + paramStr.join(',\n  ');
      str += ')\n';
    } else if(paramStr.length > 0){
      str += '(' + paramStr[0] + ')\n';
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
