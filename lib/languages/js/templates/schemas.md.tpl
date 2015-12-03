# Schemas
{{api.info.title}} - v{{api.info.version}}

{{#each api.definitions as |schema schemaName|}}
## {{schemaName}}
```javascript
{{{json schema}}}
```
{{/each}}
