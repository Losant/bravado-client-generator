{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
var uriTemplate = require('uri-template');

module.exports = function (options, client) {
  var internals = {};

  {{#stableObjEach resource.actions as |action actionName|}}
  {{#unless action.sseStream}}
  /**
   {{#if action.deprecated}}
   * ** DEPRECATED **
   {{/if}}
   {{#if action.summary}}
   * {{{action.summary}}}
   {{/if}}
   {{#if action.description}}
   * {{{action.description}}}
   {{/if}}
   *
   * Authentication:
   {{#if (hasAuthScopes ../api ../resource action)}}
   * The client must be configured with a valid api
   * access token to call this action. The token
   * must include at least one of the following scopes:
   * {{arrayToTextList (validAuthScopes ../api ../resource action)}}.
   {{else}}
   * No api access token is required to call this action.
   {{/if}}
   *
   * Parameters:
   {{#definedParams ../api ../resource action true}}
   {{{parameterComment ../../options .}}}
   {{/definedParams}}
   *
   * Responses:
   {{#stableObjEach action.responses as |response code|}}
   {{#lt code 400}}
   {{{responseComment ../../options code response}}}
   {{/lt}}
   {{/stableObjEach}}
   *
   * Errors:
   {{#stableObjEach action.responses as |response code|}}
   {{#gte code 400}}
   {{{responseComment ../../options code response}}}
   {{/gte}}
   {{/stableObjEach}}
   */
  internals.{{{actionName}}} = function (params, opts, cb) {
    if ('function' === typeof params) {
      cb = params;
      params = {};
      opts = {};
    } else if ('function' === typeof opts) {
      cb = opts;
      opts = {};
    } else if (!opts) {
      opts = {};
    }{{#if (isMultipart action.params)}}
    opts.multipartTypes = {};{{/if}}
    params = params || {};
    var tpl = uriTemplate.parse('{{{joinPath ../api.basePath ../resource.path action.path}}}');
    var pathParams = {};
    var req = {
      method: '{{{action.method}}}',{{#ne action.method 'GET'}}
      data: {},{{/ne}}
      headers: {},
      params: { _actions: false, _links: true, _embedded: true }
    };
    {{#definedParams ../api ../resource action true}}
    {{#eq in 'multipart'}}opts.multipartTypes.{{name}} = '{{type}}';
    {{/eq}}{{{setParam .}}}
    {{/definedParams}}
    req.url = tpl.expand(pathParams);
    return client.request(req, opts, cb);
  };

  {{/unless}}
  {{/stableObjEach}}
  {{#stableObjEach resource.actions as |action actionName|}}
  {{#if action.sseStream}}
  /**
   {{#if action.deprecated}}
   * ** DEPRECATED **
   {{/if}}
   {{#if action.summary}}
   * {{{action.summary}}}
   {{/if}}
   {{#if action.description}}
   * {{{action.description}}}
   {{/if}}
   *
   * Authentication:
   {{#if (hasAuthScopes ../api ../resource action)}}
   * The client must be configured with a valid api
   * access token to call this action. The token
   * must include at least one of the following scopes:
   * {{arrayToTextList (validAuthScopes ../api ../resource action)}}.
   {{else}}
   * No api access token is required to call this action.
   {{/if}}
   *
   * Parameters:
   {{#definedParams ../api ../resource action true true}}
   {{{parameterComment ../../options .}}}
   {{/definedParams}}
   *
   * Returns a Promise for (or calls the provided callback with)
   * an EventSource instance, which will be an
   {{#stableObjEach action.responses as |response code|}}
   {{#eq code '200'}}
   * {{ response.description }}
   *
   * It will have the following message event types:
   {{#stableObjEach response.sseEvents as |eventInfo eventName|}}
   {{sseResponseComment ../../../options eventName eventInfo}}
   {{/stableObjEach}}
   {{/eq}}
   {{/stableObjEach}}
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/EventSource
   * for more information about EventSource instances.
   *
   * Possible Errors:
   {{#stableObjEach action.responses as |response code|}}
   {{#gte code 400}}
   {{{responseComment ../../options code response}}}
   {{/gte}}
   {{/stableObjEach}}
   */
  internals.{{{actionName}}} = function (params, opts, cb) {
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
      headers: {},
      params: {}
    };
    {{#definedParams ../api ../resource action true true}}
    {{{setParam .}}}
    {{/definedParams}}
    req.url = tpl.expand(pathParams);
    return client.attachEventSource(req, opts, cb);
  };

  {{/if}}
  {{/stableObjEach}}
  return internals;
};
