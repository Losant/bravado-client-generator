var inflection = require('inflection');
var path = require('path');
var url = require('url');
var util = require('util');
var qs    = require('qs');
var commonHelpers = require('../../../common-helpers');

var helpers = Object.assign({}, commonHelpers);

helpers.joinPathEx = function (basePath, resourcePath, actionPath) {
  str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return str.replace(/\{(.*?)\}/g, function(param){
    param = param.substr(1,param.length-2);
    return helpers.underscore(param).toUpperCase();
  });
};

helpers.joinPath = function (basePath, resourcePath, actionPath) {
  str = path.join(basePath || '/', resourcePath || '', actionPath || '');
  return str.replace(/\{(.*?)\}/g, function(param){
    param = param.substr(1,param.length-2);
    param = helpers.underscore(param).toUpperCase();
    return '**`' + param + '`**';
  });
};

helpers.queryParamDoc = function (api, param) {
  var defVal = param.default === undefined ? '' : String(param.default);
  var example = param.example;

  var desc = param.description;
  if(param.enum){
    if(desc[desc.length-1] !== '.'){ desc += '.'; }
    desc += ' Accepted values are: '+ param.enum.join(', ');
  }

  if (param.schema && param.schema.$ref) {
    var wrapper = api.schemaMap[param.schema.$ref];
    var type = '[' + wrapper.title + '](schemas.md#' + helpers.dasherize(wrapper.title) + ')';
    if(desc[desc.length-1] !== '.'){ desc += '.'; }
    desc += ' See ' + type + ' for more details.';
    if(wrapper.example){
      example = '[' + wrapper.title + ' Example](schemas.md#' +
        helpers.dasherize(wrapper.title) + '-example)';
    }
  }

  if(example === undefined){ throw new Error("Missing example for param: " + param.name); }

  return util.format('| %s | %s | %s | %s | %s |',
    param.name, param.required ? 'Y' : 'N', desc, defVal, example);
};

helpers.paramSchemaLink = function (api, param) {
  var wrapper = api.schemaMap[param.schema.$ref];
  return '[' + wrapper.title + '](schemas.md#' + helpers.dasherize(wrapper.title) + ')';
};

helpers.responseDoc = function (api, code, response) {
  if(!response.description){ throw new Error('Missing Response Description: ' + response); }

  var type = response.type;
  if (response.schema && response.schema.$ref) {
    var wrapper = api.schemaMap[response.schema.$ref];
    type = '[' + wrapper.title + '](schemas.md#' + helpers.dasherize(wrapper.title) + ')';
  }
  return util.format('| %s | %s | %s |', code, type, response.description);
};

helpers.exampleForParam = function(api, param){
  if(param.example){ return param.example; }

  if(param.schema){
    var wrapper = api.schemaMap[param.schema.$ref];
    return wrapper.example;
  }

  throw new Error('Missing example for: ' + param.name);
};

helpers.hasParamType = function(api, resourceName, actionName, type){

  var resource = api.resources[resourceName];
  var action = resource.actions[actionName];

  if(type === 'header' && helpers.hasAuthScopes(api, resource, action))
  { return true; }  // needs auth header

  var params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params : [],
    Array.isArray(action.params) ? action.params : []
  );
  for(var i in params){
    if(!params[i].private && type === params[i].in){ return true; }
  }
  return false;
};

helpers.generateCurlExample = function (api, resourceName, actionName) {
  var resource = api.resources[resourceName];
  var action = resource.actions[actionName];

  var path = helpers.joinPathEx(api.basePath, resource.path, action.path);

  var params = [].concat(
    Array.isArray(api.params) ? api.params : [],
    Array.isArray(resource.params) ? resource.params : [],
    Array.isArray(action.params) ? action.params : []
  );

  var str = '';
  var bodyStr;
  var queryParams = {};

  params.forEach(function(param){
    if(param.private || !param.required){ return; }

    var ex = helpers.exampleForParam(api, param);

    if(params.in === 'path'){
      return;
    } else if(param.in === 'query') {
      queryParams[param.name] = ex;
    } else if(param.in === 'body') {
      bodyStr = '    -d \'' + JSON.stringify(ex) + '\' \\\n';
    } else if(param.in === 'header') {
      str += '    -H \'' + param.name + ': ' + ex + '\' \\\n';
    }
  });

  if(bodyStr){
    str += bodyStr;
  }

  queryParams = qs.stringify(queryParams);
  if(queryParams){
    path += '?' + queryParams;
  }

  str += '    https://api.losant.com' + path;
  return str;
};

module.exports = helpers;
