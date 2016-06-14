# Schemas

{{#stableObjEach api.schemaMap as |wrap defPath|}}
*   [{{wrap.title}}](#{{dasherize wrap.title}})
{{/stableObjEach}}
{{#stableObjEach api.schemaMap as |wrap defPath|}}

## {{wrap.title}}

{{wrap.description}}

### <a name="{{dasherize wrap.title}}-schema"></a> Schema

```json
{{{json wrap.schema}}}
```
### <a name="{{dasherize wrap.title}}-example"></a> Example

```json
{{{json wrap.example}}}
```

<br/>
{{/stableObjEach}}
