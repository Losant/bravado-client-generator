{{titleize resourceName}}
{{{underline (titleize resourceName) '='}}}


Actions
-------

{{#each resource.actions as |action actionName|}}
* `{{titleize actionName}} <#{{dasherize actionName}}>`_
{{/each}}
{{#each resource.actions as |action actionName|}}


{{titleize actionName}}
{{underline (titleize actionName) '*'}}

{{#if action.summary}}
{{trim action.summary}}
{{/if}}
{{#if action.description}}
{{trim action.description}}
{{/if}}
{{#if action.deprecated}}
**DEPRECATED**
{{/if}}

::

    client.{{underscore ../resourceName}}.{{underscore actionName}}(**params_dict)


Parameters
``````````
{{#definedParams ../api ../resource action}}

{{name}}
    Type: {{{typeRstLink .}}}

    {{#if required}}
    Required: {{required}}

    {{/if}}
    {{trim description}}
{{/definedParams}}


Responses
`````````
{{#each action.responses as |response code|}}
{{#lt code 400}}

{{code}}
    Type: {{{typeRstLink .}}}

    {{trim description}}
{{/lt}}
{{/each}}


Errors
``````
{{#each action.responses as |response code|}}
{{#gte code 400}}

{{code}}
    Type: {{{typeRstLink .}}}

    {{trim description}}
{{/gte}}
{{/each}}
{{/each}}
