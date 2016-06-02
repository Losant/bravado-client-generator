""" Module for {{api.info.title}} {{classify resourceName}} wrapper class """
# pylint: disable=C0301

class {{classify resourceName}}(object):
    """ Class containing all the actions for the {{titleize resourceName}} Resource """

    def __init__(self, client):
        self.client = client

    {{#each resource.actions as |action actionName|}}
    def {{underscore actionName}}(self, **kwargs):
        """{{#if action.deprecated}} ** DEPRECATED **{{/if}}
        {{#if action.summary}}
        {{trim action.summary}}

        {{/if}}
        {{#if action.description}}
        {{trim action.description}}

        {{/if}}
        Parameters:
        {{#definedParams ../api ../resource action}}
        {{parameterComment ../../options .}}
        {{/definedParams}}

        Responses:
        {{#each action.responses as |response code|}}
        {{#lt code 400}}
        {{responseComment ../../options code response}}
        {{/lt}}
        {{/each}}

        Errors:
        {{#each action.responses as |response code|}}
        {{#gte code 400}}
        {{responseComment ../../options code response}}
        {{/gte}}
        {{/each}}
        """

        query_params = {"_actions": "false", "_links": "true", "_embedded": "true"}
        path_params = {}
        headers = {}
        body = None

        {{#definedParams ../api ../resource action}}
        {{{setParam .}}}
        {{/definedParams}}

        path = "{{{joinPath ../api.basePath ../resource.path action.path}}}".format(**path_params)

        return self.client.request("{{action.method}}", path, params=query_params, headers=headers, body=body)

    {{/each}}
