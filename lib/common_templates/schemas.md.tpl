# Schemas

{{#stableObjEach api.schemaMap as |wrap defPath|}}
*   [{{wrap.title}}](#{{dasherize wrap.title}})
{{/stableObjEach}}
{{#stableObjEach api.schemaMap as |wrap defPath|}}

## {{wrap.title}}

{{wrap.description}}

```javascript
{{{json wrap.schema}}}
```
{{/stableObjEach}}
