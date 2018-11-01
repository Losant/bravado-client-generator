{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
var axios = require('axios');
var qs = require('qs');
var EventSource = require('eventsource');
var EsPromise = require('es6-promise');

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
    if (opts.timeout) {
      req.timeout = opts.timeout;
    }
    if (opts.acceptVersion) {
      req.headers['Accept-Version'] = opts.acceptVersion;
    }
    req.url = (opts.url || '{{{options.root}}}') + req.url;
    req.paramsSerializer = function(params) { return qs.stringify(params); };
    var promise = axios(req, cb)
      .then(function (response) {
        response = response.data;
        if (cb) { return setTimeout(function () { cb(null, response); }, 0); }
        return response;
      })
      .catch(function (axiosError) {
        var err;
        if (axiosError.response) {
          err = new Error(axiosError.response.data.message);
          err.type = axiosError.response.data.type;
          err.statusCode = axiosError.response.status;
        } else {
          err = axiosError;
        }
        if (cb) { return setTimeout(function () { cb(err); }, 0); }
        throw err;
      });
    if (!cb) { return promise; }
  };

  internals.attachEventSource = function (req, opts, cb) {
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
    if (opts.acceptVersion) {
      req.headers['Accept-Version'] = opts.acceptVersion;
    }
    var fullUrl = (opts.url || '{{{options.root}}}') + req.url + '?' + qs.stringify(req.params);

    var es = new EventSource(fullUrl, { headers: req.headers });

    var promise = new EsPromise.Promise(function(resolve, reject) {
      es.onopen = function(){ resolve(); };
      es.onerror = function(err){ reject(err); };
    })
      .then(function(){
        es.onopen = null;
        es.onerror = null;
        if (cb) { return setTimeout(function () { cb(null, es); }, 0); }
        return es;
      })
      .catch(function (err) {
        try {
          es.close();
        } catch (e) {
          // Empty
        }
        es.onopen = null;
        es.onerror = null;
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
