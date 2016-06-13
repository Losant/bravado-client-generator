# {{titleize resourceName}} Actions

{{{options.root}}}{{{joinPath api.basePath resource.path ''}}}

Below are the various requests that can be performed against the
{{titleize resourceName}} resource, as well as the expected
parameters and the potential responses.

{{#stableObjEach resource.actions as |action actionName|}}
## {{upper action.method}}{{#if action.path}} - {{action.path}}{{/if}}

{{{../options.root}}}{{{joinPath ../api.basePath ../resource.path action.path}}}

{{#if action.summary}}
{{trim action.summary}}

{{/if}}
{{#if action.description}}
{{trim action.description}}

{{/if}}
{{#if action.deprecated}}
**DEPRECATED**

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "path")}}
#### Request Path Components

| Path Component | Description | Example |
| -------------- | ----------- | ------- |
{{#definedParams ../api ../resource action false}}
{{#eq in "path"}}
| {{upper (underscore name)}} | {{description}} | {{ example }} |
{{/eq}}
{{/definedParams}}

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "query")}}
#### Request Query Parameters

| Name | Required | Description | Default | Example |
| ---- | -------- | ----------- | ------- | ------- |
{{#definedParams ../api ../resource action false}}
{{#eq in "query"}}
{{queryParamDoc ../../api .}}
{{/eq}}
{{/definedParams}}

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "header")}}
#### Request Headers

| Name | Required | Description | Default |
| ---- | -------- | ----------- | ------- |
{{#ne resourceName "auth"}}
| Authorization | Y | The token for authenticating the request, prepended with Bearer | |
{{/ne}}
{{#definedParams ../api ../resource action false}}
{{#eq in "header"}}
{{queryParamDoc ../../api .}}
{{/eq}}
{{/definedParams}}

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "body")}}
#### Request Body

{{#definedParams ../api ../resource action false}}
{{#eq in "body"}}
The body of the request should be serialized JSON that validates against
the {{paramSchemaLink ../../api .}} schema.  For example, the following would be a
valid body for this request:

```json
{{{json (exampleForParam ../../api .)}}}
```
<small><br/></small>
{{/eq}}
{{/definedParams}}

{{/if}}
#### Curl Example

```bash
curl -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
{{#ne ../resourceName "auth"}}
    -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
{{/ne}}
    -X {{upper action.method}} \
{{{generateCurlExample ../api ../resourceName actionName}}}
```
<br/>

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

<br/>

{{/stableObjEach}}
