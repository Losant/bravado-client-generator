# {{titleize resourceName}} Actions

Details on the various actions that can be performed on the
{{titleize resourceName}} resource, including the expected
parameters and the potential responses.

##### Contents

{{#stableObjEach resource.actions as |action actionName|}}
*   [{{titleize actionName}}](#{{dasherize (titleize actionName)}})
{{/stableObjEach}}
{{#stableObjEach resource.actions as |action actionName|}}

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
{{{example ../api ../resourceName actionName}}}

{{#if (hasParams ../api ../resource action false)}}
#### Available Parameters

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
{{#definedParams ../api ../resource action false}}
{{parameterDoc ../../api .}}
{{/definedParams}}
{{else}}
#### Available Parameters

No parameters needed for this call.
{{/if}}

#### Successful Responses

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#stableObjEach action.responses as |response code|}}
{{#lt code 400}}
{{responseDoc ../../api code response}}
{{/lt}}
{{/stableObjEach}}

#### Error Responses

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#stableObjEach action.responses as |response code|}}
{{#gte code 400}}
{{responseDoc  ../../api code response}}
{{/gte}}
{{/stableObjEach}}
{{/stableObjEach}}
