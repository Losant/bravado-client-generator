var axios = require('axios');
var uriTemplate = require('uri-template');

module.exports = function (options, client) {
  var internals = {};

  {{#each resource.actions as |action actionName|}}
  /**
   {{#if action.deprecated}}
   * ** DEPRECATED **
   {{/if}}
   {{#if action.summary}}
   * {{action.summary}}
   {{/if}}
   {{#if action.description}}
   * {{action.description}}
   {{/if}}
   *
   * Parameters:
   {{#definedParams ../api ../resource action}}
   {{parameterComment ../../options .}}
   {{/definedParams}}
   *
   * Responses:
   {{#each action.responses as |response code|}}
   {{#lt code 400}}
   {{responseComment ../../options code response}}
   {{/lt}}
   {{/each}}
   *
   * Errors:
   {{#each action.responses as |response code|}}
   {{#gte code 400}}
   {{responseComment ../../options code response}}
   {{/gte}}
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
    params = params || {};
    var tpl = uriTemplate.parse('{{{joinPath ../api.basePath ../resource.path action.path}}}');
    var pathParams = {};
    var req = {
      method: '{{action.method}}',{{#ne action.method 'GET'}}
      data: {},{{/ne}}
      params: { _actions: false, _links: true, _embedded: true }
    };
    {{#definedParams ../api ../resource action}}
    {{{setParam .}}}
    {{/definedParams}}
    req.url = tpl.expand(pathParams);
    return client.request(req, opts, cb);
  }

  {{/each}}
  return internals;
};
