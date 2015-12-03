# {{api.info.title}} - v{{api.info.version}}
{{api.info.description}}

## Installation
To install the module via NPM:
```bash
$ npm install --save {{dasherize api.info.title}}-js
```

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
- [{{titleize resourceName}}](docs/{{resourceName}}.md)
{{/each}}
