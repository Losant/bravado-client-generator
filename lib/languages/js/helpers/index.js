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

  dasherize: function (str) {
    return inflection.dasherize(str.toLowerCase());
  },

  titleize: function (str) {
    return inflection.transform(str, [ 'underscore', 'titleize' ]);
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
    var type = param.schema ? 'object' : param.type;
    var schema = param.schema && param.schema.$ref?
      '(' + url.resolve(options.url, param.schema.$ref) + ')' : '';
    return util.format(
      '*  {%s} %s - %s %s', type, param.name, param.description, schema
    );
  },

  responseComment: function (options, code, response) {
    var schema = response.schema && response.schema.$ref?
      '(' + url.resolve(options.url, response.schema.$ref) + ')' :
      response.type ? '(' + response.type + ')' : '';
    return util.format(
      '*  %s - %s %s', code, response.description, schema
    );
  },

  parameterDoc: function (api, param) {
    var type = param.type;
    if (param.schema && param.schema.$ref) {
      type = param.schema.$ref.replace('#/definitions/', '');
      type = '[' + type + '](_schemas.md#' + type.toLowerCase() + ')';
    }
    return util.format(
      '| %s | %s | %s | %s |',
      param.name, type, param.required ? 'Y' : 'N', param.description)
  },

  responseDoc: function (api, code, response) {
    var type = response.type;
    if (response.schema && response.schema.$ref) {
      type = response.schema.$ref.replace('#/definitions/', '');
      type = '[' + type + '](_schemas.md#' + type.toLowerCase() + ')';
    }
    return util.format('| %s | %s | %s |', code, type, response.description)
  },

  setParam: function (param) {
    switch (param.in) {
      case 'path':
        return 'if (\'undefined\' !== typeof params[\'' + param.name + '\']) { pathParams[\'' + param.name + '\'] = params[\'' + param.name + '\']; }';
      case 'query':
        return 'if (\'undefined\' !== typeof params[\'' + param.name + '\']) { req.params[\'' + param.name + '\'] = params[\'' + param.name + '\']; }';
      case 'header':
        return 'if (\'undefined\' !== typeof params[\'' + param.name + '\']) { req.headers[\'' + param.name + '\'] = params[\'' + param.name + '\']; }';
      case 'body':
        return 'if (\'undefined\' !== typeof params[\'' + param.name + '\']) { req.data = params[\'' + param.name + '\']; }';
    }
  }

};
