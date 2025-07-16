{{#if options.license}}
{{{commentify options.license}}}

{{/if}}

import json

""" Module for {{{api.info.cleanTitle}}} API {{{classify resourceName}}} wrapper class """
# pylint: disable=C0301

class {{{classify resourceName}}}(object):
    """ Class containing all the actions for the {{{titleize resourceName}}} Resource """

    def __init__(self, client):
        self.client = client

    {{#stableObjEach resource.actions as |action actionName|}}
    {{#unless action.sseStream ~}}
    {{#unless (isMultipart action.params)}}
    def {{{pythonActionName actionName}}}(self, **kwargs):
        """{{#if action.deprecated}} ** DEPRECATED **{{/if}}
        {{#if action.summary}}
        {{{trim action.summary}}}

        {{/if}}
        {{#if action.description}}
        {{{trim action.description}}}

        {{/if}}
        Authentication:
        {{#if (hasAuthScopes ../api ../resource action)}}
        The client must be configured with a valid api
        access token to call this action. The token
        must include at least one of the following scopes:
        {{arrayToTextList (validAuthScopes ../api ../resource action)}}.
        {{else}}
        No api access token is required to call this action.
        {{/if}}

        Parameters:
        {{#definedParams ../api ../resource action true}}
        {{{parameterComment ../../options .}}}
        {{/definedParams}}

        Responses:
        {{#stableObjEach action.responses as |response code|}}
        {{#lt code 400}}
        {{{responseComment ../../options code response}}}
        {{/lt}}
        {{/stableObjEach}}

        Errors:
        {{#stableObjEach action.responses as |response code|}}
        {{#gte code 400}}
        {{{responseComment ../../options code response}}}
        {{/gte}}
        {{/stableObjEach}}
        """

        query_params = {"_actions": "false", "_links": "true", "_embedded": "true"}
        path_params = {}
        headers = {}
        body = None

        {{#definedParams ../api ../resource action true}}
        {{{setParam .}}}
        {{/definedParams}}

        path = "{{{joinPath ../api.basePath ../resource.path action.path}}}".format(**path_params)

        return self.client.request("{{{action.method}}}", path, params=query_params, headers=headers, body=body)

    {{/unless ~}}
    {{/unless ~}}
    {{/stableObjEach}}
