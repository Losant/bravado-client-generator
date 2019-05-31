---
category: Rest API
description: A detailed look at the various REST actions supported by the {{titleize resourceName}} resource of the {{{api.info.title}}}. Learn more.
---

# {{titleize resourceName}} Actions

<p>{{{options.root}}}{{{joinPath api.basePath resource.path ''}}}</p>

Below are the various requests that can be performed against the
{{titleize resourceName}} resource, as well as the expected
parameters and the potential responses.
{{#stableObjEach resource.actions as |action actionName|}}

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
### Method And Url <a name="{{actionName}}-method-url"></a>

<p>{{upper action.method}} {{{../options.root}}}{{{joinPath ../api.basePath ../resource.path action.path}}}</p>

### Authentication <a name="{{actionName}}-authentication"></a>

{{#if (hasAuthScopes ../api ../resource action)}}
A valid api access token is required to access this endpoint. The token must
include at least one of the following scopes:
{{arrayToTextList (validAuthScopes ../api ../resource action)}}.
{{else}}
No authentication is required for this endpoint.
{{/if}}

{{#if (hasParamType ../api ../resourceName actionName "path")}}
### Request Path Components <a name="{{actionName}}-path-components"></a>

| Path Component | Description | Example |
| -------------- | ----------- | ------- |
{{#definedParams ../api ../resource action false}}
{{#eq in "path"}}
| {{upper (underscore name)}} | {{description}} | {{ example }} |
{{/eq}}
{{/definedParams}}

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "query")}}
### Request Query Parameters <a name="{{actionName}}-query-params"></a>

| Name | Required | Description | Default | Example |
| ---- | -------- | ----------- | ------- | ------- |
{{#definedParams ../api ../resource action false}}
{{#eq in "query"}}
{{queryParamDoc ../../api .}}
{{/eq}}
{{/definedParams}}

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "header")}}
### Request Headers <a name="{{actionName}}-headers"></a>

| Name | Required | Description | Default |
| ---- | -------- | ----------- | ------- |
{{#if (hasAuthScopes ../api ../resource action)}}
| Authorization | Y | The token for authenticating the request, prepended with Bearer | |
{{/if}}
{{#definedParams ../api ../resource action false}}
{{#eq in "header"}}
{{queryParamDoc ../../api .}}
{{/eq}}
{{/definedParams}}

{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "body")}}
### Request Body <a name="{{actionName}}-body"></a>

{{#definedParams ../api ../resource action false}}
{{#eq in "body"}}
The body of the request should be serialized JSON that validates against
the {{paramSchemaLink ../../api .}} schema. For example, the following would be a
valid body for this request:

```json
{{{json (exampleForParam ../../api .)}}}
```

{{/eq}}
{{/definedParams}}
{{/if}}
{{#if (hasParamType ../api ../resourceName actionName "multipart")}}
### Request Body <a name="{{actionName}}-body"></a>

{{#definedParams ../api ../resource action false}}
{{#eq in "multipart"}}
The body of the request should be a [multipart form data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) post where `{{name}}` is {{ lower description}}.

{{/eq}}
{{/definedParams}}
{{/if}}
### Curl Example <a name="{{actionName}}-curl-example"></a>

```bash
{{#if (hasParamType ../api ../resourceName actionName "multipart")}}
curl -H 'Content-Type: multipart/form-data' \
{{else}}
curl -H 'Content-Type: application/json' \
{{/if}}
    -H 'Accept: application/json' \
{{#if (hasAuthScopes ../api ../resource action)}}
    -H 'Authorization: Bearer YOUR_API_ACCESS_TOKEN' \
{{/if}}
    -X {{upper action.method}} \
{{{generateCurlExample ../api ../resourceName actionName}}}
```

{{#if action.sseStream}}
### SSE Stream for a Successful Response  <a name="{{actionName}}-successful-responses"></a>

{{#stableObjEach action.responses as |response code|}}
{{#eq code '200'}}
{{ response.description }}

| SSE Event Name | Type | Description |
| -------------- | ---- | ----------- |
{{#stableObjEach response.sseEvents as |eventInfo eventName|}}
{{sseResponseDoc ../../../api eventName eventInfo}}
{{/stableObjEach}}
{{/eq}}
{{/stableObjEach}}
{{else}}
### Successful Responses <a name="{{actionName}}-successful-responses"></a>

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#stableObjEach action.responses as |response code|}}
{{#lt code 400}}
{{responseDoc ../../api code response}}
{{/lt}}
{{/stableObjEach}}
{{/if}}

### Error Responses <a name="{{actionName}}-error-responses"></a>

| Code | Type | Description |
| ---- | ---- | ----------- |
{{#stableObjEach action.responses as |response code|}}
{{#gte code 400}}
{{responseDoc ../../api code response}}
{{/gte}}
{{/stableObjEach}}
{{/stableObjEach}}