{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
var axios = require('axios');
var qs = require('qs');
var { EventSource } = require('eventsource');
var FormData = require('form-data');
var uriTemplate = require('uri-template');

var GLOBAL_PARAMS = {{#json globalParams }}{{/json}};

var REQUEST_INFO = require('../schemas/apiInfo.json');

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
  internals.makeRequestFunction = function(name, actionName) {
    var { params: resourceParams, path: resourcePath } = REQUEST_INFO[name];
    var { path: actionPath, params: actionParams, method, sseStream } = REQUEST_INFO[name].actions[actionName];
    var uriPath = [ resourcePath || '', actionPath || '' ].join('');
    var allParams = [ ...GLOBAL_PARAMS, ...(actionParams || []), ...(resourceParams || []) ];
    var tpl = uriTemplate.parse(uriPath);
    return function(params, opts, cb) {
      if ('function' === typeof params) {
        cb = params;
        params = {};
        opts = {};
      } else if ('function' === typeof opts) {
        cb = opts;
        opts = {};
      } else if (!opts) {
        opts = {};
      }
      params = params || {};
      var pathParams = {};
      var req = {
        headers: {},
        params: {}
      };
      if (!sseStream) {
        req.method = method;
        req.params = { _actions: false, _links: true, _embedded: true };
        if (method !== 'GET') {
          req.data = {};
        }
      }
      allParams.forEach(({ name, in: from, required, type }) => {
        if (from === 'path' && !params[name] && required) {
          throw new Error(`${name} is required`);
        }
        if (params[name] === undefined) {
          return;
        }
        if (from === 'path') {
          pathParams[name] = params[name];
        } else if (from === 'query') {
          req.params[name] = type === 'object' ? JSON.stringify(params[name]) : params[name];
        } else if (from === 'header') {
          req.headers[name] = params[name];
        } else if (from === 'body') {
          req.data = params[name];
        } else if (from === 'multipart') {
          if (!opts.multipartTypes) { opts.multipartTypes = {}; }
          opts.multipartTypes[name] = type;
          req.data[name] = params[name];
        }
      });
      req.url = tpl.expand(pathParams);
      return sseStream ? internals.attachEventSource(req, opts, cb) : internals.request(req, opts, cb);
    }
  };
  {{#if options.compressed}}
  Object.keys(REQUEST_INFO).forEach((resource) => {
    internals[resource] = {};
    Object.keys(REQUEST_INFO[resource].actions).forEach((actionName) => {
      internals[resource][actionName] = internals.makeRequestFunction(resource, actionName);
    });
  });
  {{else}}
  {{#stableObjEach api.resources as |resource name|}}
  internals.{{{name}}} = require('./{{{name}}}')(options, internals);
  {{/stableObjEach}}
  {{/if}}

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
