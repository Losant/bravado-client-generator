{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
import axios from 'axios';
import qs from 'qs';
import { EventSource } from 'eventsource';
import FormData from 'form-data';
import uriTemplate from 'uri-template';
{{#unless options.compressed}}
{{#stableObjEach api.resources as |resource name|}}
import {{{name}}} from './{{{name}}}.js';
{{/stableObjEach}}
{{/unless}}
import REQUEST_INFO from '../schemas/apiInfo.json' with { type: 'json' };
import GLOBAL_PARAMS from './constants/globalParams.json' with { type: 'json' };

/**
 {{#if api.info.title}}
 * {{{api.info.title}}}
 {{/if}}
 {{#if api.info.description}}
 * {{{api.info.description}}}
 {{/if}}
 * version: {{{api.info.version}}}
 */
export default function(options = {}) {
  const internals = {};
  internals.makeRequestFunction = function(resourceName, actionName) {
    const { params: resourceParams, path: resourcePath } = REQUEST_INFO[resourceName];
    const { path: actionPath, params: actionParams, method, sseStream } = REQUEST_INFO[resourceName].actions[actionName];
    const uriPath = [ resourcePath || '', actionPath || '' ].join('');
    const allParams = [ ...GLOBAL_PARAMS, ...(actionParams || []), ...(resourceParams || []) ];
    const tpl = uriTemplate.parse(uriPath);
    return function(params = {}, opts = {}) {
      const pathParams = {};
      const req = {
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
      return sseStream ? internals.attachEventSource(req, opts) : internals.request(req, opts);
    };
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
  internals.{{{name}}} = {{{name}}}(options, internals);
  {{/stableObjEach}}
  {{/if}}

  /**
   * Make a generic request to the API
   */
  internals.request = async function(req = {}, opts = {}) {
    opts = { ...options, ...opts };
    req.headers = {
      ...req.headers,
      'Accept': 'application/json',
      'Accept-Version': '^{{{api.info.version}}}'
    };
    if (opts.accessToken) {
      req.headers.Authorization = `Bearer ${opts.accessToken}`;
    }
    if (opts.timeout) {
      req.timeout = opts.timeout;
    }
    if (opts.acceptVersion) {
      req.headers['Accept-Version'] = opts.acceptVersion;
    }
    if (opts.multipartTypes) {
      const data = req.data || {};
      req.data = new FormData();
      Object.keys(data).forEach((key) => {
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
    req.paramsSerializer = (params) => { return qs.stringify(params); };
    try {
      const response = await axios(req);
      return response.data;
    } catch (axiosError) {
      let err;
      if (axiosError.response) {
        const errorData = axiosError.response.data || {};
        err = new Error(errorData.message);
        Object.keys(errorData).forEach((key) => {
          if (key !== 'message') { err[key] = errorData[key]; }
        });
        err.statusCode = axiosError.response.status;
        if (err.statusCode === 413 && !err.message) { err.message = 'Request entity too large.'; }
      } else {
        err = axiosError;
      }
      throw err;
    }
  };

  internals.attachEventSource = (req = {}, opts = {}) => {
    opts = { ...options, ...opts };

    req.headers = {
      ...req.headers,
      'Accept': 'application/json',
      'Accept-Version': '^{{{api.info.version}}}'
    };
    if (opts.accessToken) {
      req.headers.Authorization = `Bearer ${opts.accessToken}`;
    }
    if (opts.acceptVersion) {
      req.headers['Accept-Version'] = opts.acceptVersion;
    }
    const fullUrl = `${(opts.url || '{{{options.root}}}')}${req.url}?${qs.stringify(req.params)}`;

    const es = new EventSource(fullUrl, {
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

    return new Promise((resolve, reject) => {
      es.onopen = resolve;
      es.onerror = reject;
    })
      .then(() => {
        es.onopen = null;
        es.onerror = null;
        return es;
      })
      .catch((err) => {
        try {
          es.close();
        } catch {
          // Empty
        }
        es.onopen = null;
        es.onerror = null;
        throw err;
      });
  };

  /**
   * Set a client option
   */
  internals.setOption = function(name, value) {
    options[name] = value;
    return internals;
  };

  /**
   * Get a client option
   */
  internals.getOption = function(name) {
    return options[name];
  };

  return internals;
};
