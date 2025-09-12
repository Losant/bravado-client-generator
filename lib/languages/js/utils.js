const VALID_PARAMS_IN = new Set([
  'path',
  'query',
  'body',
  'multipart',
  'header'
]);
const helpers = {};
helpers.pluckParamFields = (src, GLOBAL_PARAMS_NAMES) => {
  const finalParams = [];
  (src?.params || []).forEach(({ name, in: asIn, required, type }) => {
    if (GLOBAL_PARAMS_NAMES.has(name)) { return; }
    if (!VALID_PARAMS_IN.has(asIn)) {
      throw new Error(`Bad param placement ${asIn}`);
    }
    return finalParams.push({ name, required, in: asIn, type });
  });
  return finalParams;
};

module.exports = helpers;
