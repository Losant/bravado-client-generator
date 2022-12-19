const axios = require('axios');
const defaults = require('defaults');
const path = require('path');
const debug = require('debug')('client-gen');
const jsonRefs = require('json-refs');
const fs = require('fs-extra');
const _ = require('lodash');

const extractSchemaRefs = (val) => {
  let expectedSchemas = [];
  if (Array.isArray(val)) {
    val.forEach((k) => {
      expectedSchemas = expectedSchemas.concat(extractSchemaRefs(k));
    });
  } else if (typeof val === 'object') {
    if (val.$ref) { expectedSchemas.push(val.$ref); }
    Object.keys(val).forEach((k) => {
      expectedSchemas = expectedSchemas.concat(extractSchemaRefs(val[k]));
    });
  }
  return expectedSchemas;
};

const checkForUnresolvedRefs = (refs) => {
  Object.values(refs).forEach((ref) => {
    if (ref.error || ref.warning) {
      throw new Error(ref.error || ref.warning);
    }
  });
};

const resolveSchemaRefs = (api, refs, includePrivate) => {
  const result = {};

  refs = refs.map((ref) => { return ref.replace('#/definitions/', ''); });
  refs = refs.concat(Object.keys(api.definitions));
  refs = _.uniq(refs).sort();

  refs.forEach((ref) => {
    const schema = api.definitions[ref];
    if (ref === 'common') { return; }
    if (!schema) { throw new Error(`Missing Ref: #/definitions/${ref}`); }
    if (!includePrivate && schema.private) { return; }
    if (!schema.title) { throw new Error(`Missing Title: #/definitions/${ref}`); }
    if (!schema.description) { throw new Error(`Missing Description: #/definitions/${ref}`); }
    const example = api.examples[ref];
    if (!example) { throw new Error(`Missing Example: #/definitions/${ref}`); }
    const outSchema = Object.assign({ $schema: 'http://json-schema.org/draft-07/schema#' }, schema);
    delete outSchema.title;
    delete outSchema.description;
    result[`#/definitions/${ref}`] = {
      schema: outSchema,
      title: schema.title,
      description: schema.description,
      file: ref,
      example: example
    };
  });
  return result;
};

module.exports = async (options) => {
  options = defaults(options, {
    version: '*',
    lang: 'js',
    output: '.',
    includePrivate: true
  });
  options.output = path.resolve(options.output);

  debug('fetching api definition');
  const response = await axios.get(options.url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Version': options.version
    }
  });

  debug('expanding api definition');
  const resolvedDefs = await jsonRefs.resolveRefs(response.data, { subDocPath: '#/definitions' });
  checkForUnresolvedRefs(resolvedDefs.refs);

  const resolvedExamples = await jsonRefs.resolveRefs(resolvedDefs.resolved, { subDocPath: '#/examples' });
  checkForUnresolvedRefs(resolvedExamples.refs);

  const apiDef = resolvedExamples.resolved;

  debug('resolving refs', options.lang);
  apiDef.schemaMap = resolveSchemaRefs(apiDef, extractSchemaRefs(apiDef.resources), options.includePrivate);

  if (await fs.pathExists(`${options.output}/LICENSE`)) {
    options.license = await fs.readFile(`${options.output}/LICENSE`);
  }

  debug('loading %s generator', options.lang);
  const generator = require(`./languages/${options.lang}`);
  await generator(apiDef, options);
};
