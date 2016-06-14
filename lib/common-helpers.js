var inflection = require('inflection');
var path = require('path');
var url = require('url');
var util = require('util');

helpers = {
  ne: function (p1, p2, options) {
    if (p1 !== p2) {
      return options.fn(this);
    }
  },

  eq: function (p1, p2, options) {
    if (p1 === p2) {
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
    return inflection.dasherize(str.toLowerCase());
  },

  lower: function (str) {
    return str.toLowerCase();
  },

  upper: function (str) {
    return str.toUpperCase();
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

  hasParams: function (api, resource, action, includeHidden, options) {
    if(includeHidden){ return true; }
    var definedParams = [].concat(
      Array.isArray(api.params) ? api.params : [],
      Array.isArray(resource.params) ? resource.params: [],
      Array.isArray(action.params) ? action.params: []
    );
    return definedParams.length > 0;
  },

  definedParams: function (api, resource, action, includeHidden, options) {
    var definedParams = [].concat(
      Array.isArray(api.params) ? api.params : [],
      Array.isArray(resource.params) ? resource.params: [],
      Array.isArray(action.params) ? action.params: []
    );
    if(includeHidden){
      definedParams = definedParams.concat([
        { name: '_actions', in: 'query', type: 'boolean', description: 'Return resource actions in response', default: false },
        { name: '_links', in: 'query', type: 'boolean', description: 'Return resource link in response', default: true },
        { name: '_embedded', in: 'query', type: 'boolean', description: 'Return embedded resources in response', default: true }
      ]);
    }
    var ret = "";
    definedParams.forEach(function (param) {
      ret += options.fn(param);
    });
    return ret;
  },

  stableObjEach: function (object, options) {
    var ret = "";
    Object.keys(object).sort().forEach(function(key) {
      ret += options.fn(object, { data: options.data, blockParams: [object[key], key]});
    });
    return ret;
  },

  parameterComment: function (options, param) {
    var type = param.schema ? 'hash' : param.type;
    var schema = param.schema && param.schema.$ref ?
      ' (' + url.resolve(options.root, param.schema.$ref) + ')' : '';

    var str = '';
    if(param.description || schema){ str += '-'; }
    if(param.description){ str += ' ' + param.description; }
    if(param.enum){
      if(str[str.length-1] !== '.'){ str += '.'; }
      str += ' Accepted values are: '+ param.enum.join(', ');
    }
    if(schema){ str += schema; }

    return util.format('*  {%s} %s %s', type, param.name, str).trim();
  },

  responseComment: function (options, code, response) {
    var schema = response.schema && response.schema.$ref ?
      '(' + url.resolve(options.root, response.schema.$ref) + ')' :
      response.type ? '(' + response.type + ')' : '';
    return util.format(
      '*  %s - %s %s', code, response.description || '', schema
    ).trim();
  },

  parameterDoc: function (api, param) {
    if(!param.description){ throw new Error('Missing Param Description: ' + param.name); }
    var example = param.example;

    var type = param.type;
    if (param.schema && param.schema.$ref) {
      var wrapper = api.schemaMap[param.schema.$ref];
      type = '[' + wrapper.title + '](_schemas.md#' + helpers.dasherize(wrapper.title) + ')';
      if(wrapper.example){
        example = '[' + wrapper.title + ' Example](_schemas.md#' +
          helpers.dasherize(wrapper.title) + '-example)';
      }
    }
    var defVal = param.default === undefined ? '' : String(param.default);

    var desc = param.description;
    if(param.enum){
      if(desc[desc.length-1] !== '.'){ desc += '.'; }
      desc += ' Accepted values are: '+ param.enum.join(', ');
    }

    return util.format(
      '| %s | %s | %s | %s | %s | %s |',
      param.name, type, param.required ? 'Y' : 'N', desc, defVal, example);
  },

  responseDoc: function (api, code, response) {
    if(!response.description){ throw new Error('Missing Response Description: ' + response); }

    var type = response.type;
    if (response.schema && response.schema.$ref) {
      var wrapper = api.schemaMap[response.schema.$ref];
      type = '[' + wrapper.title + '](_schemas.md#' + helpers.dasherize(wrapper.title) + ')';
    }
    return util.format('| %s | %s | %s |', code, type, response.description);
  }

};

module.exports = helpers;
