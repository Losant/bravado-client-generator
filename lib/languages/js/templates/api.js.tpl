{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
var axios = require('axios');
var qs = require('qs');
var { EventSource } = require('eventsource');
var FormData = require('form-data');

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
    opts = { ...options, ...opts };
    req.headers = {
      ...req.headers,
      Accept: 'application/json',
      'Accept-Version': '^{{{api.info.version}}}'
    };
    if (opts.accessToken) {
      req.headers.Authorization = 'Bearer ' + opts.accessToken;
    }
    if (opts.timeout) {
      req.timeout = opts.timeout;
    }
    if (opts.acceptVersion) {
      req.headers['Accept-Version'] = opts.acceptVersion;
    }
    if (opts.multipartTypes) {
      var data = req.data || {};
      req.data = new FormData();
      Object.keys(data).forEach(function(key) {
        if (opts.multipartTypes[key] === 'object') {
          req.data.append(key, JSON.stringify(data[key]));
        } else if (opts.multipartTypes[key] === 'file' && typeof data[key] === 'string') {
          req.data.append(key, data[key], { filename: key });
        } else {
          req.data.append(key, data[key]);
        }
      });
      if (req.data.getHeaders) {
        req.headers = { ...req.data.getHeaders(), ...req.headers };
      }
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
          var errorData = axiosError.response.data || {};
          err = new Error(errorData.message);
          Object.keys(errorData).forEach(function(key) {
            if (key !== 'message') { err[key] = errorData[key]; }
          });
          err.statusCode = axiosError.response.status;
          if (err.statusCode === 413 && !err.message) { err.message = 'Request entity too large.'; }
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
    opts = { ...options, ...opts };

    req.headers = {
      ...req.headers,
      Accept: 'application/json',
      'Accept-Version': '^{{{api.info.version}}}'
    };
    if (opts.accessToken) {
      req.headers.Authorization = 'Bearer ' + opts.accessToken;
    }
    if (opts.acceptVersion) {
      req.headers['Accept-Version'] = opts.acceptVersion;
    }
    var fullUrl = (opts.url || '{{{options.root}}}') + req.url + '?' + qs.stringify(req.params);

    var es = new EventSource(fullUrl, {
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            ...req.headers
          }
        });
      }
    });

    var promise = new Promise(function(resolve, reject) {
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
        } catch {
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
