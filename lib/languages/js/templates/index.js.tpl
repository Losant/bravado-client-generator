{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
import client from './api/index.js';
/**
 * Returns a new API client
 *
 * Options:
 *   {string} accessToken - The JWT access token
 */
export const createClient = function(options) {
  return client(options);
};

export default {
  createClient: function(options) {
    return client(options);
  }
};
