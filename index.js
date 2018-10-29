import camelCase from "lib/camelcase";
import isEmptyObject from "lib/is-empty-object";

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
var rmultiDash = /[A-Z]/g;

function getData (data) {
  if (data === "true") {
    return true;
  }

  if (data === "false") {
    return false;
  }

  if (data === "null") {
    return null;
  }

  // Only convert to a number if it doesn't change the string
  if (data === +data + "") {
    return +data;
  }

  if (rbrace.test(data)) {
    return JSON.parse(data);
  }

  return data;
}

function dataAttr (elem, key, data) {
  var name;

  // If nothing was found internally, try to fetch any
  // data from the HTML5 data-* attribute
  if (data === undefined && elem.nodeType === 1) {
    name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
    data = elem.getAttribute(name);

    if (typeof data === "string") {
      try {
        data = getData(data);
      } catch (e) {}

      // Make sure we set the data so it isn't changed later
      dataUser.set(elem, key, data);
    } else {
      data = undefined;
    }
  }
  return data;
}

var acceptData = function (owner) {
  // Accepts only:
  //  - Node
  //    - Node.ELEMENT_NODE
  //    - Node.DOCUMENT_NODE
  //  - Object
  //    - Any
  return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
};

var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

function Data () {
  this.expando = ("_exd" + Math.random()) + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

  cache: function (owner) {
    // Check if the owner object already has a cache
    var value = owner[this.expando];

    // If not, create one
    if (!value) {
      value = {};

      // We can accept data for non-element nodes in modern browsers,
      // but we should not, see #8335.
      // Always return an empty object.
      if (acceptData(owner)) {
        // If it is a node unlikely to be stringify-ed or looped over
        // use plain assignment
        if (owner.nodeType) {
          owner[this.expando] = value;

        // Otherwise secure it in a non-enumerable property
        // configurable must be true to allow the property to be
        // deleted when data is removed
        } else {
          Object.defineProperty(owner, this.expando, {
            value: value,
            configurable: true,
          });
        }
      }
    }

    return value;
  },
  set: function (owner, data, value) {
    var prop;
    var cache = this.cache(owner);

    // Handle: [owner, key, value] args
    // Always use camelCase key (gh-2257)
    if (typeof data === "string") {
      cache[camelCase(data)] = value;

    // Handle: [owner, { properties }] args
    } else {
      // Copy the properties one-by-one to the cache object
      for (prop in data) {
        cache[camelCase(prop)] = data[prop];
      }
    }
    return cache;
  },
  get: function (owner, key) {
    if (key === undefined) {
      return this.cache(owner);
    }

    // Always use camelCase key (gh-2257)
    var value = owner[this.expando] && owner[this.expando][camelCase(key)];

    if (typeof value != "undefined") {
      return value;
    }

    return dataAttr(owner, key);
  },
  access: function (owner, key, value) {
    // In cases where either:
    //
    //   1. No key was specified
    //   2. A string key was specified, but no value provided
    //
    // Take the "read" path and allow the get method to determine
    // which value to return, respectively either:
    //
    //   1. The entire cache object
    //   2. The data stored at the key
    //
    if (key === undefined) {
      if (owner) {
        var i, name;
        var data = dataUser.get(owner);
        var attrs = owner && owner.attributes;

        if (owner.nodeType === 1 && !dataPriv.get(owner, "hasDataAttrs")) {
          i = attrs.length;
          while (i--) {
            // Support: IE 11 only
            // The attrs elements can be null (#14894)
            if (attrs[i]) {
              name = attrs[i].name;
              if (name.indexOf("data-") === 0) {
                name = camelCase(name.slice(5));
                dataAttr(owner, name, data[name]);
              }
            }
          }
          dataPriv.set(owner, "hasDataAttrs", true);
        }
      }

      return data;
    } else if (key && typeof key === "string" && value === undefined) {
      return this.get(owner, key);
    }

    // When the key is not a string, or both a key and value
    // are specified, set or extend (existing objects) with either:
    //
    //   1. An object of properties
    //   2. A key and value
    //
    this.set(owner, key, value);

    // Since the "set" path can have two possible entry points
    // return the expected data based on which path was taken[*]
    return value !== undefined ? value : key;
  },
  remove: function (owner, key) {
    var i;
    var cache = owner[this.expando];

    if (cache === undefined) {
      return;
    }

    if (key !== undefined) {
      // Support array or space separated string of keys
      if (Array.isArray(key)) {
        // If key is an array of keys...
        // We always set camelCase keys, so remove that.
        key = key.map(camelCase);
      } else {
        key = camelCase(key);

        // If a key with the spaces exists, use it.
        // Otherwise, create an array by matching non-whitespace
        key = key in cache
          ? [key]
          : (key.match(rnothtmlwhite) || []);
      }

      i = key.length;

      while (i--) {
        delete cache[key[i]];
      }
    }

    // Remove the expando if there's no more data
    if (key === undefined || isEmptyObject(cache)) {
      // Support: Chrome <=35 - 45
      // Webkit & Blink performance suffers when deleting properties
      // from DOM nodes, so set to undefined instead
      // https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
      if (owner.nodeType) {
        owner[this.expando] = undefined;
      } else {
        delete owner[this.expando];
      }
    }
  },
  hasData: function (owner) {
    var cache = owner[this.expando];
    return cache !== undefined && !isEmptyObject(cache);
  },
};

var dataUser = new Data();
var dataPriv = new Data();

function data (elem, name, data) {
  return dataUser.access(elem, name, data);
}

function removeData (elem, name) {
  dataUser.remove(elem, name);
}

export {
  data,
  removeData,
};
