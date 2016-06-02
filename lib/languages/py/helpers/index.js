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

  indent: function(str) {
    return '    ' + str.split(/(\r|\n)/g).join('    ');
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
    return path.join(basePath || '/', resourcePath || '', actionPath || '');
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
    var type = param.schema ? 'dict' : param.type;
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

  typeRstLink: function (param) {
    var type = param.type;
    if (param.schema && param.schema.$ref) {
      type = param.schema.$ref.replace('#/definitions/', '');
      type = '`' + type + ' <_schemas.rst#' + type.toLowerCase() + '>`_';
    }
    return type;
  },

  setParam: function (param) {
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
  }

};
