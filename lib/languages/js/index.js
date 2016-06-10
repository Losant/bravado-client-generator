var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs-extra');
var debug = require('debug')('client-gen:javascript');

handlebars.registerHelper(require('./helpers'));

var RESERVED = ['setOption', 'request', 'Resource'];

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
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/resource.md.tpl'), { encoding: 'utf8' })
);
var schemasDocTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../../common_templates/schemas.md.tpl'), { encoding: 'utf8' })
);

function generatePackageJson (api, options) {
  var file = path.resolve(options.output, 'package.json');
  var exists = false;
  try{ fs.statSync(file); exists = true; }catch(e){ }
  if(exists){
    debug('not generating package.json since it already exists');
  } else {
    debug('generating package.json');
    var packageJson = packageTemplate({ api: api, options: options });
    debug('writing package.json');
    fs.outputFileSync(file, packageJson);
  }
}

function generateReadme (api, options) {
  var file = path.resolve(options.output, 'README.md');
  var exists = false;
  try{ fs.statSync(file); exists = true; }catch(e){ }
  if(exists){
    debug('not generating README.md since it already exists');
  } else {
    debug('generating README.md');
    var readmeDoc = readmeTemplate({ api: api, options: options });
    debug('writing README.md');
    fs.outputFileSync(file, readmeDoc);
  }
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

function generateSchemaJson (api, defName, options) {
  var wrapper = api.schemaMap[defName];
  var name = 'lib/schemas/' + wrapper.file + '.json';
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
  return new Promise(function (resolve, reject) {
    generatePackageJson(api, options);
    generateReadme(api, options);
    generateIndexJs(api, options);
    generateApiJs(api, options);
    generateSchemaDoc(api, options);
    Object.keys(api.resources).forEach(function (r) {
      if (RESERVED.indexOf(r) !== -1) {
        throw new Error(r + ' is reserved and cannot be used as a resource name');
      }
      generateResourceJs(api, r, options);
      generateResourceDoc(api, r, options);
    });
    Object.keys(api.schemaMap).forEach(function (s) {
      generateSchemaJson(api, s, options);
    });
    resolve();
  });
};
