# {{titleize resourceName}}

## Actions

{{#each resource.actions as |action actionName|}}
*   [{{titleize actionName}}](#{{dasherize actionName}})
{{/each}}
{{#each resource.actions as |action actionName|}}

### {{titleize actionName}}

{{#if action.summary}}
{{trim action.summary}}

{{/if}}
{{#if action.description}}
{{trim action.description}}

{{/if}}
{{#if action.deprecated}}
**DEPRECATED**

{{/if}}
```ruby
client.{{underscore ../resourceName}}.{{underscore actionName}}(params)
```

#### Parameters

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
{{#definedParams ../api ../resource action}}
{{parameterDoc ../../api .}}
{{/definedParams}}

#### Responses

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#each action.responses as |response code|}}
{{#lt code 400}}
{{responseDoc ../../api code response}}
{{/lt}}
{{/each}}

#### Errors

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#each action.responses as |response code|}}
{{#gte code 400}}
{{responseDoc  ../../api code response}}
{{/gte}}
{{/each}}
{{/each}}
