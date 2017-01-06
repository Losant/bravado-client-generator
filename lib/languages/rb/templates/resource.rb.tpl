module {{{classify api.info.cleanTitle}}}Rest

  # Class containing all the actions for the {{{titleize resourceName}}} Resource
  class {{{classify resourceName}}}

    def initialize(client)
      @client = client
    end
    {{#stableObjEach resource.actions as |action actionName|}}

    {{#if action.deprecated}}
    # ** DEPRECATED **
    {{/if}}
    {{#if action.summary}}
    # {{{trim action.summary}}}
    #
    {{/if}}
    {{#if action.description}}
    # {{{trim action.description}}}
    #
    {{/if}}
    # Parameters:
    {{#definedParams ../api ../resource action true}}
    # {{{parameterComment ../../options .}}}
    {{/definedParams}}
    #
    # Responses:
    {{#stableObjEach action.responses as |response code|}}
    {{#lt code 400}}
    # {{{responseComment ../../options code response}}}
    {{/lt}}
    {{/stableObjEach}}
    #
    # Errors:
    {{#stableObjEach action.responses as |response code|}}
    {{#gte code 400}}
    # {{{responseComment ../../options code response}}}
    {{/gte}}
    {{/stableObjEach}}
    def {{{underscore actionName}}}(params = {})
      params = Utils.symbolize_hash_keys(params)
      query_params = { _actions: false, _links: true, _embedded: true }
      headers = {}
      body = nil

      {{#definedParams ../api ../resource action true}}
      {{#if required}}
      raise ArgumentError.new("{{{name}}} is required") unless params.has_key?(:{{{name}}})
      {{/if}}
      {{/definedParams}}

      {{#definedParams ../api ../resource action true}}
      {{#eq in "body"}}
      body = params[:{{{name}}}] if params.has_key?(:{{{name}}})
      {{/eq}}
      {{#eq in "query"}}
      query_params[:{{{name}}}] = params[:{{{name}}}] if params.has_key?(:{{{name}}})
      {{/eq}}
      {{#eq in "header"}}
      headers[:{{{name}}}] = params[:{{{name}}}] if params.has_key?(:{{{name}}})
      {{/eq}}
      {{/definedParams}}

      path = "{{{joinPath ../api.basePath ../resource.path action.path}}}"

      @client.request(
        method: :{{{lower action.method}}},
        path: path,
        query: query_params,
        headers: headers,
        body: body)
    end
    {{/stableObjEach}}

  end
end
