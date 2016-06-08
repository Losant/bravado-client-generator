# {{titleize resourceName}} Actions

Details on the various actions that can be performed on the
{{titleize resourceName}} resource, including the expected
parameters and the potential responses.

##### Contents

{{#each resource.actions as |action actionName|}}
*   [{{titleize actionName}}](#{{dasherize actionName}})
{{/each}}
{{#each resource.actions as |action actionName|}}

<br/>

## {{titleize actionName}}

{{#if action.summary}}
{{trim action.summary}}

{{/if}}
{{#if action.description}}
{{trim action.description}}

{{/if}}
{{#if action.deprecated}}
**DEPRECATED**

{{/if}}
{{#if (hasParams ../api ../resource action false)}}
```ruby
client.{{underscore ../resourceName}}.{{underscore actionName}}(params)
```

#### Available Parameters

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
{{#definedParams ../api ../resource action false}}
{{parameterDoc ../../api .}}
{{/definedParams}}
{{else}}
```ruby
client.{{underscore ../resourceName}}.{{underscore actionName}}
```

#### Available Parameters

No parameters needed for this call.
{{/if}}

#### Successful Responses

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#each action.responses as |response code|}}
{{#lt code 400}}
{{responseDoc ../../api code response}}
{{/lt}}
{{/each}}

#### Error Responses

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#each action.responses as |response code|}}
{{#gte code 400}}
{{responseDoc  ../../api code response}}
{{/gte}}
{{/each}}
{{/each}}
