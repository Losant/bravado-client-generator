{
  "name": "REST API",
  "icon": "NAV_API_TOKENS",
  "order": 14,
  "slug": "rest-api",
  "links": [
      { "name": "Overview", "url": "/rest-api/overview/" },
    {{#each niceNames}}
      { "name": "{{this}}", "url": "/rest-api/{{dasherize (titleize (lookup ../nameMap this))}}/" },
    {{/each}}
      { "name": "Schemas", "url": "/rest-api/schemas/" }
  ]
}
