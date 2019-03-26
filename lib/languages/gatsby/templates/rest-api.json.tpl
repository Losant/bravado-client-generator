{
  "name": "REST API",
  "icon": "NAV_API_TOKENS",
  "order": 14,
  "links": [
    {{#stableObjEach resources as |wrap defPath|}}
      { "name": "{{titleize wrap}}", "url": "/rest-api/{{dasherizeAndTitleize wrap}}/" },
    {{/stableObjEach}}
  ]
}
