var inflection = require('inflection');
var path = require('path');
var url = require('url');
var util = require('util');

module.exports = {

  ne: function (p1, p2, options) {
    if (p1 !== p2) {
      return options.fn(this);
    }
  },

  gte: function (p1, p2, options) {
    if (p1 >= p2) {
      return options.fn(this);
    }
  },

  lt: function (p1, p2, options) {
    if (p1 < p2) {
      return options.fn(this);
    }
  },

  yesNo: function (val) {
    return val ? 'Y' : 'N';
  },

  json: function (obj) {
    return JSON.stringify(obj, null, 2);
  },

  indent: function(str, indenter) {
    return indenter + str.split(/(\r|\n)/g).join(indenter);
  },

  underline: function(str, char) {
    return str.replace(/./g, char);
  },

  dasherize: function (str) {
    str = inflection.underscore(str);
    return inflection.dasherize(str.toLowerCase());
  },

  lower: function (str) {
    return str.toLowerCase();
  },

  titleize: function (str) {
    str = inflection.underscore(str);
    return inflection.titleize(str);
  },

  camelize: function (str) {
    str = inflection.underscore(str);
    return inflection.camelize(str, true);
  },

  classify: function (str) {
    str = inflection.underscore(str);
    return inflection.camelize(str, false);
  },

  underscore: function (str) {
    return inflection.underscore(str);
  },

  trim: function(str){
    return str ? String(str).trim() : '';
  },

  resolveUrl: function (endpoint, basePath, resourcePath, actionPath) {
    var u = url.resolve(endpoint, path.join(basePath || '', resourcePath || '', actionPath || ''));
    return decodeURI(u);
  },

  joinPath: function (basePath, resourcePath, actionPath) {
    return path.join(basePath || '/', resourcePath || '', actionPath || '').replace(/\{/g, '%{');
  },

  definedParams: function (api, resource, action, options) {
    var definedParams = [].concat(
      Array.isArray(api.params) ? api.params : [],
      Array.isArray(resource.params) ? resource.params: [],
      Array.isArray(action.params) ? action.params: [],
      [
        { name: '_actions', in: 'query', type: 'boolean', description: 'Return resource actions in response', default: false },
        { name: '_links', in: 'query', type: 'boolean', description: 'Return resource link in response', default: true },
        { name: '_embedded', in: 'query', type: 'boolean', description: 'Return embedded resources in response', default: true }
      ]
    );
    var ret = "";
    definedParams.forEach(function (param) {
      ret += options.fn(param);
    });
    return ret;
  },

  parameterComment: function (options, param) {
    var type = param.schema ? 'hash' : param.type;
    var schema = param.schema && param.schema.$ref ?
      '(' + url.resolve(options.root, param.schema.$ref) + ')' : '';

    var str = '';
    if(param.description || schema){ str += '-'; }
    if(param.description){ str += ' ' + param.description; }
    if(schema){ str += ' ' + schema; }

    return util.format('*  {%s} %s %s', type, param.name, str).trim();
  },

  responseComment: function (options, code, response) {
    var schema = response.schema && response.schema.$ref ?
      '(' + url.resolve(options.root, response.schema.$ref) + ')' :
      response.type ? '(' + response.type + ')' : '';
    return util.format(
      '*  %s - %s %s', code, response.description, schema
    ).trim();
  },

  parameterDoc: function (api, param) {
    var type = param.type;
    if (param.schema && param.schema.$ref) {
      type = param.schema.$ref.replace('#/definitions/', '');
      type = '[' + type + '](_schemas.md#' + type.toLowerCase() + ')';
    }
    return util.format(
      '| %s | %s | %s | %s |',
      param.name, type, param.required ? 'Y' : 'N', param.description);
  },

  responseDoc: function (api, code, response) {
    var type = response.type;
    if (response.schema && response.schema.$ref) {
      type = response.schema.$ref.replace('#/definitions/', '');
      type = '[' + type + '](_schemas.md#' + type.toLowerCase() + ')';
    }
    return util.format('| %s | %s | %s |', code, type, response.description);
  },

  setParam: function (param) {
    code =  'param_key = if params.has_key?("' + param.name + '")\n';
    code += '  "' + param.name + '"\n';
    code += 'elsif params.has_key?(:"' + param.name + '")\n';
    code += '  :"' + param.name + '"\n';
    code += 'else\n';
    code += '  nil\n';
    code += 'end\n';
    if(param.in === 'path'){
      code += 'path_params[:"' + param.name + '"]';
    } else if(param.in === 'query'){
      code += 'query_params[:"' + param.name + '"]';
    } else if(param.in === 'header'){
      code += 'headers[:"' + param.name + '"]';
    } else if(param.in === 'body'){
      code += 'body';
    }
    code += ' = params[param_key] if param_key';
    return code;
  }

};
