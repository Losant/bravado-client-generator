var axios = require('axios');
var qs    = require('qs');

/**
 {{#if api.info.title}}
 * {{{api.info.title}}}
 {{/if}}
 {{#if api.info.description}}
 * {{{api.info.description}}}
 {{/if}}
 * version: {{{api.info.version}}}
 */
module.exports = function (options) {
  options = options || {};
  var internals = {};

  {{#stableObjEach api.resources as |resource name|}}
  internals.{{{name}}} = require('./{{{name}}}')(options, internals);
  {{/stableObjEach}}

  /**
   * Make a generic request to the API
   */
  internals.request = function (req, opts, cb) {
    req = req || {};
    if ('function' === typeof opts) {
      cb = opts;
      opts = {};
    }
    opts = Object.assign({}, options, opts);
    req.headers = Object.assign({}, req.headers, {
      Accept: 'application/json',
      'Accept-Version': '^{{{api.info.version}}}'
    });
    if (opts.accessToken) {
      req.headers.Authorization = 'Bearer ' + opts.accessToken;
    }
    req.url = (opts.url || '{{{options.root}}}') + req.url;
    req.paramsSerializer = function(params) { return qs.stringify(params); };
    var promise = axios(req, cb)
      .then(function (response) {
        response = response.data;
        if (cb) { return setTimeout(function () { cb(null, response); }, 0); }
        return response;
      })
      .catch(function (response) {
        var err;
        if (response instanceof Error) {
          err = response;
        } else {
          err = new Error(response.data.message);
          err.type = response.data.type;
          err.statusCode = response.status;
        }
        if (cb) { return setTimeout(function () { cb(err); }, 0); }
        throw err;
      });
    if (!cb) { return promise; }
  };

  /**
   * Set a client option
   */
  internals.setOption = function (name, value) {
    options[name] = value;
    return internals;
  };

  /**
   * Get a client option
   */
  internals.getOption = function (name) {
    return options[name];
  };

  return internals;
};
