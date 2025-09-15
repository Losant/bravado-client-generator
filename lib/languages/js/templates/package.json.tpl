{
  "name": "{{{dasherize api.info.title}}}-js",
  "version": "{{{api.info.version}}}",
  "description": "{{{api.info.description}}}",
  "type": "module",
  "main": "lib/index.js",
  "exports": {
    ".": {
      "require": "./lib/index.js",
      "import": "./lib/index.js",
      "default": "./lib/index.js"
    },
    "./lib/schemas/*.json": "./lib/schemas/*.json"
  },
  "dependencies": {
    "axios": "^1.10.0",
    "eventsource": "^4.0.0",
    "form-data": "^4.0.3",
    "qs": "^6.14.0",
    "uri-template": "^2.0.0"
  }
}
