var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs-extra');
var debug = require('debug')('client-gen:python');
var helpers = require('./helpers');

handlebars.registerHelper(helpers);

var RESERVED = ['auth_token', 'request', 'url'];

var clientTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/client.rb.tpl'), { encoding: 'utf8' })
);
var resourceTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.rb.tpl'), { encoding: 'utf8' })
);
var resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.md.tpl'), { encoding: 'utf8' })
);
var schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/schemas.md.tpl'), { encoding: 'utf8' })
);
var indexTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/index.rb.tpl'), { encoding: 'utf8' })
);
var errorTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/error.rb.tpl'), { encoding: 'utf8' })
);
var versionTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/version.rb.tpl'), { encoding: 'utf8' })
);

function generateIndexRb (api, options) {
  var name = 'lib/' + api.info.cleanTitle.toLowerCase() + '_rest.rb';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var initSource = indexTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, initSource);
}

function generateVersionRb (api, options) {
  var name = api.info.baseDir + '/version.rb';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var initSource = versionTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, initSource);
}

function generateClientRb (api, options) {
  var name = api.info.baseDir + '/client.rb';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var clientSource = clientTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, clientSource);
}

function generateErrorRb (api, options) {
  var name = api.info.baseDir + '/error.rb';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var initSource = errorTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, initSource);
}

function generateResourceRb (api, resourceName, options) {
  var resource = api.resources[resourceName];
  var name = api.info.baseDir + '/' + helpers.underscore(resourceName) + '.rb';
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

function generateSchemaJson (api, schemaName, options) {
  var schema = api.definitions[schemaName];
  var file = path.resolve(options.output, 'schemas/' + schemaName + '.json');
  debug('generating schemas/' + schemaName + '.json');
  var schemaSource = JSON.stringify(schema, null, 2);
  debug('writing schemas/' + schemaName + '.json');
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
  api.info.baseDir = 'lib/' + api.info.cleanTitle.toLowerCase() + '_rest';
  return new Promise(function (resolve, reject) {
    generateIndexRb(api, options);
    generateVersionRb(api, options);
    generateErrorRb(api, options);
    generateClientRb(api, options);
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function (r) {
      if (RESERVED.indexOf(r) !== -1) {
        throw new Error(r + ' is reserved and cannot be used as a resource name');
      }
      generateResourceRb(api, r, options);
      generateResourceDoc(api, r, options);
    });
    Object.keys(api.definitions).forEach(function (s) {
      generateSchemaJson(api, s, options);
    });
    resolve();
  });
};
