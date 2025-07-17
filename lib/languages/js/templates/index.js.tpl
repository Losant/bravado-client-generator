{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
/**
 * Returns a new API client
 *
 * Options:
 *   {string} accessToken - The JWT access token
 */
exports.createClient = function (options) {
  return require('./api')(options);
};
