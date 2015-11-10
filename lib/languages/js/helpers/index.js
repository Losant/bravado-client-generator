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

  dasherize: function (str) {
    return inflection.dasherize(str.toLowerCase());
  },

  resolveUrl: function (endpoint, basePath, resourcePath, actionPath) {
    var u = url.resolve(endpoint, path.join(basePath || '', resourcePath || '', actionPath || ''));
    return decodeURI(u);
  },

  definedParams: function (api, resource, action, options) {
    var definedParams = [].concat(
      Array.isArray(api.params) ? api.params : [],
      Array.isArray(resource.params) ? resource.params: [],
      Array.isArray(action.params) ? action.params: [],
      [
        { name: '_actions', in: 'query', type: 'boolean', description: 'Return resource actions in response' },
        { name: '_links', in: 'query', type: 'boolean', description: 'Return resource link in response' },
        { name: '_embedded', in: 'query', type: 'boolean', description: 'Return embedded resources in response' }
      ]
    );
    var ret = "";
    definedParams.forEach(function (param) {
      ret += options.fn(param);
    });
    return ret;
  },

  descParameter: function (options, param) {
    var type = param.schema ? 'object' : param.type;
    var schema = param.schema && param.schema.$ref?
      '(' + url.resolve(options.url, param.schema.$ref) + ')' : '';
    return util.format(
      '*   {%s} %s - %s %s', type, param.name, param.description, schema
    );
  },

  descResponse: function (options, code, response) {
    var schema = response.schema && response.schema.$ref?
      '(' + url.resolve(options.url, response.schema.$ref) + ')' : '';
    return util.format(
      '*   %s - %s %s', code, response.description, schema
    );
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
