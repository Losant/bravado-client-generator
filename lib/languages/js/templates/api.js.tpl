var axios = require('axios');

/**
 {{#if api.info.title}}
 * {{api.info.title}}
 {{/if}}
 {{#if api.info.description}}
 * {{api.info.description}}
 {{/if}}
 * version: {{api.info.version}}
 */
module.exports = function (options) {
  options = options || {};
  var internals = {};

  {{#each api.resources as |resource name|}}
  internals.{{name}} = require('./{{name}}')(options);
  {{/each}}

  internals.setOption = function (name, value) {
    options[name] = value;
    return internals;
  };
{{!-
  internals.Resource = function (type, data) {
    var resource = {};
    Object.keys(data).forEach(function (p) {
      Object.defineProperty(resource, p, {
        enumerable: true,
        get: function () { return data[p]; }
      });
    });
    Object.keys(internals[type]).forEach(function (a) {
      resource[a] = function (params, cb) {
        var p = Object.assign({}, params, resource)
        return internals[type][a]
      };
    });
    return resource;
  };
--}}

  axios.interceptors.response.use(
    function (response) {
{{!--
      return response.data._type && !options.raw ?
        internals.Resource(response.data._type, response.data) :
        response.data;
--}}
      return response.data;
    },
    function (response) {
      var err;
      if (response instanceof Error) {
        err = response;
      } else {
        err = new Error(response.data.message);
        err.type = response.data.type;
        err.statusCode = response.status;
      }
      throw err;
    }
  );

  return internals;
};
