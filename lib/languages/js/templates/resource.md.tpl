# {{titleize resourceName}}
{{api.info.title}}

{{#each resource.actions as |action actionName|}}
## {{../resourceName}}.{{actionName}}
{{action.summary}}
{{action.description}}
{{#if action.deprecated}}**DEPRECATED**{{/if}}

### Parameters
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
{{#definedParams ../api ../resource action}}
{{parameterDoc ../../api .}}
{{/definedParams}}

### Responses
| Code | Type | Description |
| ---- | ---- | ----------- |
{{#each action.responses as |response code|}}
{{#lt code 400}}
{{responseDoc ../../api code response}}
{{/lt}}
{{/each}}

### Errors
| Code | Type | Description |
| ---- | ---- | ----------- |
{{#each action.responses as |response code|}}
{{#gte code 400}}
{{responseDoc  ../../api code response}}
{{/gte}}
{{/each}}

### Example
```javascript
// with callbacks
client.{{../resourceName}}.{{actionName}}(params, function (err, result) {
  if (err) { return console.error(err); }
  console.log(result);
});
// with promises
client.{{../resourceName}}.{{actionName}}(params)
  .then(console.log)
  .catch(console.error);
```
{{/each}}
