var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs-extra');
var debug = require('debug')('client-gen:python');
var helpers = require('./helpers');

handlebars.registerHelper(helpers);

var RESERVED = ['setOption', 'request', 'Resource'];

var clientTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/client.py.tpl'), { encoding: 'utf8' })
);
var resourceTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.py.tpl'), { encoding: 'utf8' })
);
var resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/resource.md.tpl'), { encoding: 'utf8' })
);
var schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/schemas.md.tpl'), { encoding: 'utf8' })
);
var initTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/__init__.py.tpl'), { encoding: 'utf8' })
);
var errorTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/error.py.tpl'), { encoding: 'utf8' })
);

function generateInitPy (api, options) {
  var name = api.info.baseDir + '/__init__.py';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var initSource = initTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, initSource);
}

function generateClientPy (api, options) {
  var name = api.info.baseDir + '/client.py';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var clientSource = clientTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, clientSource);
}

function generateErrorPy (api, options) {
  var name = api.info.baseDir + '/' + helpers.underscore(api.info.cleanTitle + 'Error') + '.py';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var initSource = errorTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, initSource);
}

function generateResourcePy (api, resourceName, options) {
  var resource = api.resources[resourceName];
  var name = api.info.baseDir + '/' + helpers.underscore(resourceName) + '.py';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var resourceSource = resourceTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug('writing ' + name);
  fs.outputFileSync(file, resourceSource);
}

function generateSchemaJson (api, defName, options) {
  var wrapper = api.schemaMap[defName];
  var name = 'schemas/' + wrapper.file + '.json';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var schemaSource = JSON.stringify(wrapper.schema, null, 2);
  debug('writing ' + name);
  fs.outputFileSync(file, schemaSource);
}

function generateResourceDoc (api, resourceName, options) {
  var resource = api.resources[resourceName];
  var file = path.resolve(options.output, 'docs/' + resourceName + '.md');
  debug('generating docs/' + resourceName + '.md');
  var resourceDoc = resourceDocTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug('writing docs/' + resourceName + '.md');
  fs.outputFileSync(file, resourceDoc);
}

function generateSchemaDoc (api, options) {
  var file = path.resolve(options.output, 'docs/_schemas.md');
  debug('generating docs/_schemas.md');
  var schemasDoc = schemasDocTemplate({ api: api, options: options });
  debug('writing docs/_schemas.md');
  fs.outputFileSync(file, schemasDoc);
}

module.exports = function (api, options) {
  api.info.cleanTitle = api.info.title.replace(' API', '');
  api.info.baseDir = api.info.cleanTitle.toLowerCase() + 'rest';
  return new Promise(function (resolve, reject) {
    generateInitPy(api, options);
    generateErrorPy(api, options);
    generateClientPy(api, options);
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function (r) {
      if (RESERVED.indexOf(r) !== -1) {
        throw new Error(r + ' is reserved and cannot be used as a resource name');
      }
      generateResourcePy(api, r, options);
      generateResourceDoc(api, r, options);
    });
    Object.keys(api.schemaMap).forEach(function (s) {
      generateSchemaJson(api, s, options);
    });
    resolve();
  });
};
