{
  "name": "REST API",
  "icon": "NAV_API_TOKENS",
  "order": 14,
  "links": [
      { "name": "Overview", "url": "/rest-api/overview/" },
    {{#each resources}}
      { "name": "{{this}}", "url": "/rest-api/{{dasherize this}}/" },
    {{/each}}
      { "name": "Schemas", "url": "/rest-api/schemas/" }
  ]
}
