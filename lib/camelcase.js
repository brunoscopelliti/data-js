// Matches dashed string for camelizing
var rdashAlpha = /-([a-z])/g;

function fcamelCase (all, letter) {
  return letter.toUpperCase();
}

/**
 * Convert a dashed string to camelCase.
 * @name camelCase
 * @private
 * @param {String} string
 *
 * @return {String}
 */
function camelCase (string) {
  return string.replace(rdashAlpha, fcamelCase);
}

export default camelCase;
