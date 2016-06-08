module {{classify api.info.cleanTitle}}Rest

  # Class containing all the actions for the {{titleize resourceName}} Resource
  class {{classify resourceName}}

    def initialize(client)
      @client = client
    end
    {{#each resource.actions as |action actionName|}}

    {{#if action.deprecated}}
    # ** DEPRECATED **
    {{/if}}
    {{#if action.summary}}
    # {{trim action.summary}}
    #
    {{/if}}
    {{#if action.description}}
    # {{trim action.description}}
    #
    {{/if}}
    # Parameters:
    {{#definedParams ../api ../resource action}}
    # {{parameterComment ../../options .}}
    {{/definedParams}}
    #
    # Responses:
    {{#each action.responses as |response code|}}
    {{#lt code 400}}
    # {{responseComment ../../options code response}}
    {{/lt}}
    {{/each}}
    #
    # Errors:
    {{#each action.responses as |response code|}}
    {{#gte code 400}}
    # {{responseComment ../../options code response}}
    {{/gte}}
    {{/each}}
    def {{underscore actionName}}(params = {})
      query_params = { _actions: false, _links: true, _embedded: true }
      path_params = {}
      headers = {}
      body = nil
      {{#definedParams ../api ../resource action}}

{{{indent (setParam .) '      '}}}
      {{/definedParams}}

      path = "{{{joinPath ../api.basePath ../resource.path action.path}}}"
      path = path % path_params unless path_params.empty?

      @client.request(
        method: :{{lower action.method}},
        path: path,
        query: query_params,
        headers: headers,
        body: body)
    end
    {{/each}}

  end
end
