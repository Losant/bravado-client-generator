var axios = require('axios');
var defaults = require('defaults');
var path = require('path');
var debug = require('debug')('client-gen');
var jsonRefs = require('json-refs');

var extractSchemaRefs = function(val){
  var expectedSchemas = [];
  if (Array.isArray(val)) {
    val.forEach(function(k) {
      expectedSchemas = expectedSchemas.concat(extractSchemaRefs(k));
    });
  } else if (typeof val === 'object') {
    if(val.$ref){ expectedSchemas.push(val.$ref); }
    Object.keys(val).forEach(function(k) {
      expectedSchemas = expectedSchemas.concat(extractSchemaRefs(val[k]));
    });
  }
  return expectedSchemas;
};

var resolveSchemaRefs = function(api, refs){
  result = {};
  refs.sort().forEach(function(ref) {
    unDefRef = ref.replace('#/definitions/', '');
    if(result[unDefRef]){ return; }
    var schema = api.definitions[unDefRef];
    if(!schema){ throw new Error('Missing Ref: ' + ref); }
    if(!schema.title){ throw new Error('Missing Title: ' + ref); }
    if(!schema.description){ throw new Error('Missing Description: ' + ref); }
    var example = api.examples[unDefRef];
    if(!example){ throw new Error('Missing Example: ' + ref); }
    var outSchema = Object.assign({ $schema: 'http://json-schema.org/draft-04/schema#' }, schema);
    delete outSchema.title;
    delete outSchema.description;
    result[ref] = {
      schema: outSchema,
      title: schema.title,
      description: schema.description,
      file: unDefRef,
      example: example
    };
  });
  return result;
};

module.exports = function (options) {
  options = defaults(options, {
    version: '*',
    lang: 'js',
    output: '.'
  });
  options.output = path.resolve(options.output);
  debug('fetching api definition');
  return axios
    .get(options.url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Version': options.version
      }
    })
    .then(function (response){
      debug('expanding api definition');
      return jsonRefs.resolveRefs(response.data, { subDocPath: '#/definitions' })
      .then(function (results) {
        return jsonRefs.resolveRefs(results.resolved, { subDocPath: '#/examples' });
      })
      .then(function (results) {
        return results.resolved;
      });
    })
    .then(function (api) {
      debug('resolving refs', options.lang);
      api.schemaMap = resolveSchemaRefs(api, extractSchemaRefs(api.resources));
      debug('loading %s generator', options.lang);
      var generator = require('./languages/' + options.lang);
      return generator(api, options);
    })
    .catch(function (err) {
      if (!(err instanceof Error)) {
        err = new Error(err.data.message);
        err.type = err.data.type;
        err.statusCode = err.status;
      }
      debug('throwing error: %s', err.stack);
      throw err;
    });
};
