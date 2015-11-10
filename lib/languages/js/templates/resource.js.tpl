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
  internals.{{actionName}} = function (params, cb) {
    if ('function' === typeof params) {
      cb = params;
      params = {};
    }
    params = params || {};
    var tpl = uriTemplate.parse(endpoint + '{{{joinPath ../api.basePath ../resource.path action.path}}}');
    var pathParams = {};
    var req = {
      method: '{{action.method}}',
      headers: {
        'Accept': 'application/json',
        'Accept-Version': '{{../api.info.version}}'
      },{{#ne action.method 'GET'}}
      data: {},{{/ne}}
      params: { _actions: false, _links: true, _embedded: true }
    };
    if (options.accessToken) {
      req.headers['Authorization'] = 'Bearer ' + options.accessToken;
    }
    {{#definedParams ../api ../resource action}}
    {{{setParam .}}}
    {{/definedParams}}
    req.url = tpl.expand(pathParams);
    var promise = axios(req)
      .then(function (response) {
        if (cb) { return cb(null, response.data); }
        return response.data;
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
        if (cb) { return cb(err); }
        throw err;
      });
    if (!cb) { return promise; }
  }

  {{/each}}
  return internals;
};
