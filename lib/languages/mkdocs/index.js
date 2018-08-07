var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs-extra');
var debug = require('debug')('client-gen:python');
var helpers = require('./helpers');

handlebars.registerHelper(helpers);

var resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.md.tpl'), { encoding: 'utf8' })
);
var schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/schemas.md.tpl'), { encoding: 'utf8' })
);

function generateResourceDoc (api, resourceName, options) {
  var resource = api.resources[resourceName];
  var name = 'docs/rest-api/' + helpers.dasherize(helpers.titleize(resourceName)) + '.md';

  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var resourceDoc = resourceDocTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });

  var supplement = 'api-supplements/' + helpers.dasherize(helpers.titleize(resourceName)) + '.md';
  var supplementFile = path.resolve(options.output, supplement);
  if(fs.pathExistsSync(supplementFile)){
    resourceDoc = resourceDoc + '\n' + fs.readFileSync(supplementFile);
  }

  debug('writing ' + name);
  fs.outputFileSync(file, resourceDoc);
}

function generateSchemaDoc (api, options) {
  var name = 'docs/rest-api/schemas.md';
  var file = path.resolve(options.output, name);
  debug('generating ' + name);
  var schemasDoc = schemasDocTemplate({ api: api, options: options });
  debug('writing ' + name);
  fs.outputFileSync(file, schemasDoc);
}

module.exports = function (api, options) {
  return new Promise(function (resolve, reject) {
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function (r) {
      generateResourceDoc(api, r, options);
    });
    resolve();
  });
};
