var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs-extra');
var debug = require('debug')('client-gen:javascript');

handlebars.registerHelper(require('./helpers'));

var packageTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/package.json.tpl'), { encoding: 'utf8' })
);
var readmeTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/readme.md.tpl'), { encoding: 'utf8' })
);
var indexTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/index.js.tpl'), { encoding: 'utf8' })
);
var apiTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/api.js.tpl'), { encoding: 'utf8' })
);
var resourceTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.js.tpl'), { encoding: 'utf8' })
);
var resourceDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/resource.md.tpl'), { encoding: 'utf8' })
);

function generatePackageJson (api, options) {
  var file = path.resolve(options.output, 'package.json');
  debug('generating package.json');
  var packageJson = packageTemplate({ api: api, options: options });
  debug('writing package.json');
  fs.outputFileSync(file, packageJson);
}

function generateReadme (api, options) {
  var file = path.resolve(options.output, 'README.md');
  debug('generating README.md');
  var readmeJson = readmeTemplate({ api: api, options: options });
  debug('writing README.md');
  fs.outputFileSync(file, readmeJson);
}

function generateIndexJs (api, options) {
  var file = path.resolve(options.output, 'lib/index.js');
  debug('generating lib/index.js');
  var indexSource = indexTemplate({ api: api, options: options });
  debug('writing lib/index.js');
  fs.outputFileSync(file, indexSource);
}

function generateApiJs (api, options) {
  var file = path.resolve(options.output, 'lib/api/index.js');
  debug('generating lib/api/index.js');
  var apiSource = apiTemplate({ api: api, options: options });
  debug('writing lib/api/index.js');
  fs.outputFileSync(file, apiSource);
}

function generateResourceJs (api, resourceName, options) {
  var resource = api.resources[resourceName];
  var file = path.resolve(options.output, 'lib/api/' + resourceName + '.js');
  debug('generating lib/api/' + resourceName + '.js');
  var resourceSource = resourceTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug('writing lib/api/' + resourceName + '.js');
  fs.outputFileSync(file, resourceSource);
}

function generateResourceDoc (api, resourceName, options) {
  var resource = api.resources[resourceName];
  var file = path.resolve(options.output, 'docs/' + resourceName + '.md');
  debug('generating docs/' + resourceName + '.md');
  var resourceSource = resourceDocTemplate({
    api: api,
    options: options,
    resource: resource,
    resourceName: resourceName
  });
  debug('writing docs/' + resourceName + '.md');
  fs.outputFileSync(file, resourceSource);
}

module.exports = function (api, options) {
  return new Promise(function (resolve, reject) {
    generatePackageJson(api, options);
    generateReadme(api, options);
    generateIndexJs(api, options);
    generateApiJs(api, options);
    Object.keys(api.resources).forEach(function (r) {
      generateResourceJs(api, r, options);
      generateResourceDoc(api, r, options);
    });
    resolve();
  });
};
