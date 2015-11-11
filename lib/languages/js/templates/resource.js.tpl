var axios = require('axios');
var uriTemplate = require('uri-template');

module.exports = function (options) {
  var internals = {};
  var endpoint = options.url || '{{options.url}}';

  {{#each resource.actions as |action actionName|}}
  /**
   {{#if action.summary}}
   * {{action.summary}}
   {{/if}}
   {{#if action.description}}
   * {{action.description}}
   {{/if}}
   *
   * Parameters:
   {{#definedParams ../api ../resource action}}
   {{descParameter '*   ' ../../options .}}
   {{/definedParams}}
   *
   * Responses:
   {{#each action.responses as |response code|}}
   {{descResponse '*  ' ../../options code response}}
   {{/each}}
   */
  internals.{{actionName}} = function (params, opts, cb) {
    if ('function' === typeof params) {
      cb = params;
      params = {};
      opts = {};
    } else if ('function' === typeof opts) {
      cb = opts;
      opts = {};
    }
    opts = Object.assign({}, options, opts);
    params = params || {};
    var tpl = uriTemplate.parse(endpoint + '{{{joinPath ../api.basePath ../resource.path action.path}}}');
    var pathParams = {};
    var req = {
      method: '{{action.method}}',
      headers: {
        'Accept': 'application/json',
        'Accept-Version': '^{{../api.info.version}}'
      },{{#ne action.method 'GET'}}
      data: {},{{/ne}}
      params: { _actions: false, _links: true, _embedded: true }
    };
    if (opts.accessToken) {
      req.headers['Authorization'] = 'Bearer ' + opts.accessToken;
    }
    {{#definedParams ../api ../resource action}}
    {{{setParam .}}}
    {{/definedParams}}
    req.url = tpl.expand(pathParams);
    var promise = axios(req)
      .then(function (response) {
        if (cb) { return cb(null, response); }
        return response;
      })
      .catch(function (err) {
        if (cb) { return cb(err); }
        throw err;
      });
    if (!cb) { return promise; }
  }

  {{/each}}
  return internals;
};
