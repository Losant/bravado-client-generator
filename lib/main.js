var axios = require('axios');
var defaults = require('defaults');
var path = require('path');
var debug = require('debug')('client-gen');

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
    .then(function (response) {
      debug('loading %s generator', options.lang);
      var generator = require('./languages/' + options.lang);
      return generator(response.data, options);
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
