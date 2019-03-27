---
description: A comprehensive list of the JSON schemas defining the objects expected by and returned from the {{{api.info.title}}}. Learn More.
---

# Schemas

{{#stableObjEach api.schemaMap as |wrap defPath|}}
## {{wrap.title}}

{{wrap.description}}

### {{wrap.title}} Schema

```json
{{{json wrap.schema}}}
```

### {{wrap.title}} Example

```json
{{{json wrap.example}}}
```

<br/>
{{/stableObjEach}}