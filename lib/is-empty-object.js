/**
 * @name isEmptyObject
 * @private
 * @param {Object} obj
 *
 * @returns {Boolean}
 */
function isEmptyObject (obj) {
  var name;
  for (name in obj) {
    return false;
  }
  return true;
}

export default isEmptyObject;
