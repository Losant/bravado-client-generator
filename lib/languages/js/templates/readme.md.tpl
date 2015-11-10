# {{api.info.title}} - v{{api.info.version}}
{{api.info.description}}

## Usage
To create a new API client:
```javascript
var api = require('{{dasherize api.info.title}}-js');

var client = api.createClient({
  accessToken: '...'
});
```
## API Reference
{{#each api.resources as |resource resourceName|}}

{{#each resource.actions as |action actionName|}}

#### {{resourceName}}.{{actionName}}
{{action.summary}}
{{action.description}}

##### Parameters
{{#definedParams ../../api resource action}}
{{descParameter '- ' ../../../options .}}
{{/definedParams}}

##### Responses
{{#each action.responses as |response code|}}
{{descResponse '- ' ../../../options code response}}
{{/each}}

##### Example
```javascript
// with callbacks
client.{{resourceName}}.{{actionName}}(params, function (err, result) {
  if (err) { return console.error(err); }
  console.log(result);
});
// with promises
client.{{resourceName}}.{{actionName}}(params)
  .then(console.log)
  .catch(console.error);
```
{{/each}}
{{/each}}
