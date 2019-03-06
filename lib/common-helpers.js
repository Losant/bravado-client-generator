const inflection = require('inflection');
const path = require('path');
const url = require('url');
const util = require('util');
const _ = require('lodash');

const helpers = {
  ne: function(p1, p2, options) {
    if (p1 !== p2) {
      return options.fn(this);
    }
  },

  eq: function(p1, p2, options) {
    if (p1 === p2) {
      return options.fn(this);
    }
  },

  gte: function(p1, p2, options) {
    if (p1 >= p2) {
      return options.fn(this);
    }
  },

  lt: function(p1, p2, options) {
    if (p1 < p2) {
      return options.fn(this);
    }
  },

  yesNo: function(val) {
    return val ? 'Y' : 'N';
  },

  json: function(obj) {
    return JSON.stringify(obj, null, 2);
  },

  indent: function(str, indenter) {
    return indenter + str.split(/(\r|\n)/g).join(indenter);
  },

  underline: function(str, char) {
    return str.replace(/./g, char);
  },

  dasherize: function(str) {
    return inflection.dasherize(str.toLowerCase());
  },

  lower: function(str) {
    return str.toLowerCase();
  },

  upper: function(str) {
    return str.toUpperCase();
  },

  titleize: function(str) {
    str = inflection.underscore(str);
    return inflection.titleize(str);
  },

  camelize: function(str) {
    str = inflection.underscore(str);
    return inflection.camelize(str, true);
  },

  classify: function(str) {
    str = inflection.underscore(str);
    return inflection.camelize(str, false);
  },

  underscore: function(str) {
    return inflection.underscore(str);
  },

  trim: function(str) {
    return str ? String(str).trim() : '';
  },

  resolveUrl: function(endpoint, basePath, resourcePath, actionPath) {
    const u = url.resolve(endpoint, path.join(basePath || '', resourcePath || '', actionPath || ''));
    return decodeURI(u);
  },

  hasParams: function(api, resource, action, includeHidden) {
    if (includeHidden) { return true; }
    const definedParams = [].concat(
      Array.isArray(api.params) ? api.params : [],
      Array.isArray(resource.params) ? resource.params: [],
      Array.isArray(action.params) ? action.params: []
    );
    for (let i=0; i<definedParams.length; i++) {
      if (includeHidden || !definedParams[i].private) { return true; }
    }
    return false;
  },

  definedParams: function(api, resource, action, includePrivate, noDefaults, options) {
    if (!options) {
      options = noDefaults;
      noDefaults = false;
    }

    let definedParams = [].concat(
      Array.isArray(resource.params) ? resource.params: [],
      Array.isArray(action.params) ? action.params: [],
      Array.isArray(api.params) ? api.params : []
    );

    if (!noDefaults) {
      definedParams = definedParams.concat([
        {
          private: true, name: '_actions', in: 'query', type: 'boolean', description: 'Return resource actions in response', default: false
        },
        {
          private: true, name: '_links', in: 'query', type: 'boolean', description: 'Return resource link in response', default: true
        },
        {
          private: true, name: '_embedded', in: 'query', type: 'boolean', description: 'Return embedded resources in response', default: true
        }
      ]);
    }

    let ret = '';
    definedParams.forEach(function(param) {
      if (!includePrivate && param.private) { return; }
      ret += options.fn(param);
    });
    return ret;
  },

  stableObjEach: function(object, options) {
    let ret = '';
    Object.keys(object).sort().forEach(function(key) {
      ret += options.fn(object, { data: options.data, blockParams: [object[key], key] });
    });
    return ret;
  },

  parameterComment: function(options, param) {
    const type = param.schema ? 'hash' : param.type;
    const schema = param.schema && param.schema.$ref ?
      ` (${url.resolve(options.root, param.schema.$ref)})` : '';

    let str = '';
    if (param.description || schema) { str += '-'; }
    if (param.description) { str += ` ${param.description}`; }
    if (param.enum) {
      if (str[str.length-1] !== '.') { str += '.'; }
      str += ` Accepted values are: ${param.enum.join(', ')}`;
    }
    if (schema) { str += schema; }

    return util.format('*  {%s} %s %s', type, param.name, str).trim();
  },

  responseComment: function(options, code, response) {
    let schema = '';
    if (response.schema && response.schema.$ref) {
      schema = `(${url.resolve(options.root, response.schema.$ref)})`;
    } else if (response.type) {
      schema = `(${response.type})`;
    }

    return util.format(
      '*  %s - %s %s', code, response.description || '', schema
    ).trim();
  },

  sseResponseComment: function(options, eventName, eventInfo) {
    if (!eventInfo.description) { throw new Error(`Missing SSE Event Description: ${eventName}, ${eventInfo}`); }

    let schema = '';
    if (eventInfo.schema && eventInfo.schema.$ref) {
      schema = `(${url.resolve(options.root, eventInfo.schema.$ref)})`;
    } else if (eventInfo.type) {
      schema = `(${eventInfo.type})`;
    }

    return util.format(
      '*  %s - %s %s', eventName, eventInfo.description || '', schema
    ).trim();
  },

  parameterDoc: function(api, param) {
    if (!param.description) { throw new Error(`Missing Param Description: ${param.name}`); }
    let example = param.example;

    let type = param.type;
    if (param.schema && param.schema.$ref) {
      const wrapper = api.schemaMap[param.schema.$ref];
      type = `[${wrapper.title}](_schemas.md#${helpers.dasherize(wrapper.title)})`;
      if (wrapper.example) {
        example = `[${wrapper.title} Example](_schemas.md#${
          helpers.dasherize(wrapper.title)}-example)`;
      }
    }
    const defVal = param.default === undefined ? '' : String(param.default);

    let desc = param.description;
    if (param.enum) {
      if (desc[desc.length-1] !== '.') { desc += '.'; }
      desc += ` Accepted values are: ${param.enum.join(', ')}`;
    }

    return util.format(
      '| %s | %s | %s | %s | %s | %s |',
      param.name, type, param.required ? 'Y' : 'N', desc, defVal, example);
  },

  responseDoc: function(api, code, response) {
    if (!response.description) { throw new Error(`Missing Response Description: ${response}`); }

    let type = response.type;
    if (response.schema && response.schema.$ref) {
      const wrapper = api.schemaMap[response.schema.$ref];
      type = `[${wrapper.title}](_schemas.md#${helpers.dasherize(wrapper.title)})`;
    }
    return util.format('| %s | %s | %s |', code, type, response.description);
  },

  sseResponseDoc: function(api, eventName, eventInfo) {
    if (!eventInfo.description) { throw new Error(`Missing SSE Event Description: ${eventName}, ${eventInfo}`); }

    let type = eventInfo.type;
    if (eventInfo.schema && eventInfo.schema.$ref) {
      const wrapper = api.schemaMap[eventInfo.schema.$ref];
      type = `[${wrapper.title}](_schemas.md#${helpers.dasherize(wrapper.title)})`;
    }
    return util.format('| %s | %s | %s |', eventName, type, eventInfo.description);
  },

  hasAuthScopes: function(api, resource, action) {
    const validScopes = [].concat(
      Array.isArray(api.auth) ? api.auth : [],
      Array.isArray(resource.auth) ? resource.auth: [],
      Array.isArray(action.auth) ? action.auth: []
    );
    return validScopes.length > 0;
  },

  validAuthScopes: function(api, resource, action) {
    const validScopes = [].concat(
      Array.isArray(api.auth) ? api.auth : [],
      Array.isArray(resource.auth) ? resource.auth: [],
      Array.isArray(action.auth) ? action.auth: []
    );
    Object.keys(api.authGroups).forEach((authGroup) => {
      if (api.deprecatedAuthScopes.indexOf(authGroup) >= 0) { return; }
      if (_.some(api.authGroups[authGroup], (scope) => { return validScopes.indexOf(scope) >= 0; })) { validScopes.push(authGroup); }
    });

    return _.uniq(validScopes).sort();
  },

  arrayToTextList: function(array) {
    return array.join(', ').replace(/, ([^,]*)$/, ', or $1');
  },

  isMultipart: function(params) {
    if (!params) { return false; }
    let bodyCount = 0;
    let multipartCount = 0;

    params.forEach((param) => {
      if (param.in === 'multipart') {
        multipartCount++;
      }
      if (param.in === 'body') {
        bodyCount++;
      }
    });

    if (multipartCount > 0 && bodyCount > 0) {
      throw new Error('Mixed body/multitype params');
    }

    if (bodyCount > 1) {
      throw new Error('Only one body param allowed');
    }

    return multipartCount > 0;
  }

};

module.exports = helpers;
