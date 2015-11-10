/**
 {{#if api.info.title}}
 * {{api.info.title}}
 {{/if}}
 {{#if api.info.description}}
 * {{api.info.description}}
 {{/if}}
 * version: {{api.info.version}}
 */
module.exports = function (options) {
  options = options || {};
  var internals = {};
  {{#each api.resources as |resource name|}}
  internals.{{name}} = require('./{{name}}')(options);
  {{/each}}
  return internals;
};
