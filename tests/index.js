QUnit.module("data", {});

function createElement () {
  var div = document.createElement("div");
  return enrich(div);
}

function enrich (obj) {
  obj.data = function (key, value) {
    var args = [].slice.call(arguments);
    return window.Data.data.apply(null, [this].concat(args));
  };

  obj.removeData = function (key) {
    var args = [].slice.call(arguments);
    return window.Data.removeData.apply(null, [this].concat(args));
  };

  return obj;
}

QUnit.test("data & removeData, expected returns", function (assert) {
  assert.expect(4);

  var div = createElement();

  assert.equal(
    div.data("hello", "world"), "world",
    "data(key, value) returns value"
);
  assert.equal(
    div.data("hello"), "world",
    "data(key) returns value"
);
  assert.deepEqual(
    div.data({ goodnight: "moon" }), { goodnight: "moon" },
    "data(obj) returns obj"
);
  assert.equal(
    div.removeData("hello"), undefined,
    "removeData(key, value) returns undefined"
);
});

function dataTests (elem, assert) {
  var dataObj;

  assert.equal(elem.data("foo"), undefined, "No data exists initially");

  dataObj = elem.data();
  assert.equal(typeof dataObj, "object", "Calling data with no args gives us a data object reference");
  assert.strictEqual(elem.data(), dataObj, "Calling elem.data returns the same data object when called multiple times");

  dataObj["foo"] = "bar";
  assert.equal(elem.data("foo"), "bar", "Data is readable by elem.data when set directly on a returned data object");

  elem.data("foo", "baz");
  assert.equal(elem.data("foo"), "baz", "Data can be changed by elem.data");
  assert.equal(dataObj["foo"], "baz", "Changes made through elem.data propagate to referenced data object");

  elem.data("foo", undefined);
  assert.equal(elem.data("foo"), "baz", "Data is not unset by passing undefined to elem.data");

  elem.data("foo", null);
  assert.strictEqual(elem.data("foo"), null, "Setting null using elem.data works OK");

  elem.data("foo", "foo1");

  elem.data({ "bar": "baz", "boom": "bloz" });
  assert.strictEqual(elem.data("foo"), "foo1", "Passing an object extends the data object instead of replacing it");
  assert.equal(elem.data("boom"), "bloz", "Extending the data object works");

  assert.strictEqual(elem.boom, undefined, "Data is never stored directly on the object");

  elem.removeData("foo");
  assert.strictEqual(elem.data("foo"), undefined, "elem.removeData removes single properties");

  elem.removeData();

  elem.data("foo", "foo1");

  assert.equal(elem.data("foo"), "foo1", "(sanity check) Ensure data is set in user data object");
}

QUnit.test("data(div)", function (assert) {
  assert.expect(13);

  dataTests(createElement(), assert);
});

QUnit.test("data({})", function (assert) {
  assert.expect(13);

  dataTests(enrich({}), assert);
});

QUnit.test("data(window)", function (assert) {
  assert.expect(13);

  dataTests(enrich(window), assert);
});

QUnit.test("data(document)", function (assert) {
  assert.expect(13);

  dataTests(enrich(document), assert);
});

QUnit.test(".data()", function (assert) {
  assert.expect(3);

  var div = createElement();
  assert.strictEqual(div.data("foo"), undefined, "Make sure that missing result is undefined");
  div.data("test", "success");

  var dataObj = div.data();

  assert.deepEqual(dataObj, { test: "success" }, "data() returns entire data object with expected properties");
  assert.strictEqual(div.data("foo"), undefined, "Make sure that missing result is still undefined");

  var obj = enrich({ foo: "bar" });
  obj.data("foo", "baz");
});

QUnit.test(".data(<embed>)", function (assert) {
  assert.expect(13);

  dataTests(enrich(document.createElement("embed")), assert);
});

function testDataTypes (elem, assert) {
  var types = {
    "null": null,
    "true": true,
    "false": false,
    "zero": 0,
    "one": 1,
    "empty string": "",
    "empty array": [],
    "array": [1],
    "empty object": {},
    "object": { foo: "bar" },
    "date": new Date(),
    "regex": /test/,
    "function": function () {}
  };

  for (var k in types) {
    if (types.hasOwnProperty(k)) {
      var value = types[k];
      assert.strictEqual(elem.data("test", value), elem.data("test"), value, "Data set to " + k);
    }
  }
}

QUnit.test(".data(String, Object)", function (assert) {
  assert.expect(18);

  var div = createElement();

  assert.strictEqual(div.data("test"), undefined, "No data exists initially");
  assert.strictEqual(div.data("test", "success"), div.data("test"), "success", "Data added");
  assert.strictEqual(div.data("test", "overwritten"), div.data("test"), "overwritten", "Data overwritten");
  assert.strictEqual(div.data("test", undefined), div.data("test"), "overwritten", ".data(key,undefined) does nothing but is chainable (#5571)");
  assert.strictEqual(div.data("notexist"), undefined, "No data exists for unset key");
  testDataTypes(div, assert);
});

QUnit.test("jQuery(plain Object).data(String, Object).data(String)", function (assert) {
  assert.expect(16);

  // #3748
  var $obj = enrich({ exists: true });
  assert.strictEqual($obj.data("nothing"), undefined, "Non-existent data returns undefined");
  assert.strictEqual($obj.data("exists"), undefined, "Object properties are not returned as data");
  testDataTypes($obj, assert);

  // Clean up
  $obj.removeData();
  assert.ok($obj.exists, "removeData does not clear the object");
});

QUnit.test(".data(object) does not retain references. https://bugs.jquery.com/ticket/13815", function (assert) {
  assert.expect(2);

  var val = { type: "foo" };
  var div1 = createElement();
  var div2 = createElement();

  div1.data(val);
  div2.data(val);

  div1.data("type", "bar");

  assert.equal(div1.data("type"), "bar", "Correct updated value");
  assert.equal(div2.data("type"), "foo", "Original value retained");
});

QUnit.test("data-* attributes", function (assert) {
  assert.expect(3);

  var div = createElement();
  div.dataset["foo"] = "foo";
  div.dataset["fooBaz"] = "foo-baz";

  assert.equal(div.data("foo"), "foo");
  assert.equal(div.data("foo-baz"), "foo-baz");
  assert.equal(div.data("fooBaz"), "foo-baz");
});

QUnit.test(".data(Object)", function (assert) {
  assert.expect(2);

  var div = createElement();
  div.data({ "test": "in", "test2": "in2" });
  assert.equal(div.data("test"), "in", "Verify setting an object in data");
  assert.equal(div.data("test2"), "in2", "Verify setting an object in data");
});

QUnit.test(".removeData", function (assert) {
  assert.expect(6);

  var div = createElement();
  div.data("test", "testing");
  div.removeData("test");
  assert.equal(div.data("test"), undefined, "Check removal of data");

  div.data("test2", "testing");
  div.removeData();
  assert.ok(!div.data("test2"), "Make sure that the data property no longer exists.");

  div.data({ test3: "testing", test4: "testing" });
  div.removeData("test3 test4");
  assert.ok(!div.data("test3") || div.data("test4"), "Multiple delete with spaces.");

  div.data({ test3: "testing", test4: "testing" });
  div.removeData(["test3", "test4"]);
  assert.ok(!div.data("test3") || div.data("test4"), "Multiple delete by array.");

  div.data({ "test3 test4": "testing", "test3": "testing" });
  div.removeData("test3 test4");
  assert.ok(!div.data("test3 test4"), "Multiple delete with spaces deleted key with exact name");
  assert.ok(div.data("test3"), "Left the partial matched key alone");
});

QUnit.test(".removeData()", function (assert) {
  assert.expect(6);

  var div = createElement();
  div.data("test", "testing");
  div.removeData("test");
  assert.equal(div.data("test"), undefined, "Check removal of data");

  div.data("test", "testing");
  div.data("test.foo", "testing2");
  div.removeData("test.bar");
  assert.equal(div.data("test.foo"), "testing2", "Make sure data is intact");
  assert.equal(div.data("test"), "testing", "Make sure data is intact");

  div.removeData("test");
  assert.equal(div.data("test.foo"), "testing2", "Make sure data is intact");
  assert.equal(div.data("test"), undefined, "Make sure data is intact");

  div.removeData("test.foo");
  assert.equal(div.data("test.foo"), undefined, "Make sure data is intact");
});

if (window.JSON && window.JSON.stringify) {
  QUnit.test("JSON serialization (#8108)", function (assert) {
    assert.expect(1);

    var obj = enrich({ foo: "bar" });
    obj.data("hidden", true);

    assert.equal(JSON.stringify(obj), "{\"foo\":\"bar\"}", "Expando is hidden from JSON.stringify");
  });
}

QUnit.test(".data should follow html5 specification regarding camel casing", function (assert) {
  assert.expect(12);

  var div = createElement();
  div.setAttribute("data-w-t-f", "ftw");
  div.setAttribute("data-big-a-little-a", "bouncing-b");
  div.setAttribute("data-foo", "a");
  div.setAttribute("data-foo-bar", "b");
  div.setAttribute("data-foo-bar-baz", "c");

  assert.equal(div.data()["wTF"], "ftw", "Verify single letter data-* key");
  assert.equal(div.data()["bigALittleA"], "bouncing-b", "Verify single letter mixed data-* key");

  assert.equal(div.data()["foo"], "a", "Verify single word data-* key");
  assert.equal(div.data()["fooBar"], "b", "Verify multiple word data-* key");
  assert.equal(div.data()["fooBarBaz"], "c", "Verify multiple word data-* key");

  assert.equal(div.data("foo"), "a", "Verify single word data-* key");
  assert.equal(div.data("fooBar"), "b", "Verify multiple word data-* key");
  assert.equal(div.data("fooBarBaz"), "c", "Verify multiple word data-* key");

  div.data("foo-bar", "d");

  assert.equal(div.data("fooBar"), "d", "Verify updated data-* key");
  assert.equal(div.data("foo-bar"), "d", "Verify updated data-* key");

  assert.equal(div.data("fooBar"), "d", "Verify updated data-* key (fooBar)");
  assert.equal(div.data("foo-bar"), "d", "Verify updated data-* key (foo-bar)");
});

QUnit.test(".data should not miss preset data-* w/ hyphenated property names", function (assert) {
  assert.expect(4);

  var div = createElement();
  div.data({ "camelBar": "camelBar", "hyphen-foo": "hyphen-foo" });

  assert.equal(div.data("camelBar"), "camelBar", "data with property camelBar was correctly found");
  assert.equal(div.data("camel-bar"), "camelBar", "data with property camelBar was correctly found");
  assert.equal(div.data("hyphenFoo"), "hyphen-foo", "data with property camelBar was correctly found");
  assert.equal(div.data("hyphen-foo"), "hyphen-foo", "data with property camelBar was correctly found");
});

QUnit.test(".data should not miss data-* w/ hyphenated property names https://bugs.jquery.com/ticket/14047", function (assert) {
  assert.expect(1);

  var div = createElement();
  div.data("foo-bar", "baz");

  assert.equal(div.data("foo-bar"), "baz", "data with property 'foo-bar' was correctly found");
});

QUnit.test(".data should not miss attr() set data-* with hyphenated property names", function (assert) {
  assert.expect(2);

  var a, b;

  a = createElement();

  a.dataset["longParam"] = "test";
  a.data("long-param", { a: 2 });

  assert.deepEqual(a.data("long-param"), { a: 2 }, "data with property long-param was found, 1");

  b = createElement();

  b.dataset["longParam"] = "test";
  b.data("long-param");
  b.data("long-param", { a: 2 });

  assert.deepEqual(b.data("long-param"), { a: 2 }, "data with property long-param was found, 2");
});

QUnit.test(".data always sets data with the camelCased key (gh-2257)", function (assert) {
  assert.expect(18);

  var div = createElement();
  var datas = {
    "non-empty": {
      key: "nonEmpty",
      value: "a string",
    },
    "empty-string": {
      key: "emptyString",
      value: "",
    },
    "one-value": {
      key: "oneValue",
      value: 1,
    },
    "zero-value": {
      key: "zeroValue",
      value: 0,
    },
    "an-array": {
      key: "anArray",
      value: [],
    },
    "an-object": {
      key: "anObject",
      value: {},
    },
    "bool-true": {
      key: "boolTrue",
      value: true,
    },
    "bool-false": {
      key: "boolFalse",
      value: false,
    },
    "some-json": {
      key: "someJson",
      value: JSON.stringify({ foo: "bar" }),
    },
  };

  for (var key in datas) {
    if (datas.hasOwnProperty(key)) {
      var val = datas[key];
      div.data(key, val.value);
      var allData = div.data();
      assert.equal(allData[key], undefined, ".data does not store with hyphenated keys");
      assert.equal(allData[val.key], val.value, ".data stores the camelCased key");
    }
  }
});

QUnit.test(".data should not strip more than one hyphen when camelCasing (gh-2070)", function (assert) {
  assert.expect(3);
  var div = createElement();
  div.setAttribute("data-nested-single", "single");
  div.setAttribute("data-nested--double", "double");
  div.setAttribute("data-nested---triple", "triple");

  var allData = div.data();

  assert.equal(allData.nestedSingle, "single", "Key is correctly camelCased");
  assert.equal(allData["nested-Double"], "double", "Key with double hyphens is correctly camelCased");
  assert.equal(allData["nested--Triple"], "triple", "Key with triple hyphens is correctly camelCased");
});

QUnit.test(".data supports interoperable hyphenated/camelCase get/set of properties with arbitrary non-null|NaN|undefined values", function (assert) {
  var div = createElement();
  var datas = {
    "non-empty": {
      key: "nonEmpty",
      value: "a string",
    },
    "empty-string": {
      key: "emptyString",
      value: "",
    },
    "one-value": {
      key: "oneValue",
      value: 1,
    },
    "zero-value": {
      key: "zeroValue",
      value: 0,
    },
    "an-array": {
      key: "anArray",
      value: [],
    },
    "an-object": {
      key: "anObject",
      value: {},
    },
    "bool-true": {
      key: "boolTrue",
      value: true,
    },
    "bool-false": {
      key: "boolFalse",
      value: false,
    },
    "some-json": {
      key: "someJson",
      value: JSON.stringify({ foo: "bar" }),
    },

    "num-1-middle": {
      key: "num-1Middle",
      value: true,
    },
    "num-end-2": {
      key: "numEnd-2",
      value: true,
    },
    "2-num-start": {
      key: "2NumStart",
      value: true,
    },
  };

  assert.expect(24);

  for (var key in datas) {
    if (datas.hasOwnProperty(key)) {
      var val = datas[key];
      div.data(key, val.value);
      assert.deepEqual(div.data(key), val.value, "get: " + key);
      assert.deepEqual(div.data(val.key), val.value, "get: " + val.key);
    }
  }
});

QUnit.test(".data supports interoperable removal of hyphenated/camelCase properties", function (assert) {
  var div = createElement();
  var datas = {
    "non-empty": "a string",
    "empty-string": "",
    "one-value": 1,
    "zero-value": 0,
    "an-array": [],
    "an-object": {},
    "bool-true": true,
    "bool-false": false,
    "some-json": JSON.stringify({ foo: "bar" }),
  };
  var camelcase = {
    "non-empty": "nonEmpty",
    "empty-string": "emptyString",
    "one-value": "oneValue",
    "zero-value": "zeroValue",
    "an-array": "anArray",
    "an-object": "anObject",
    "bool-true": "boolTrue",
    "bool-false": "boolFalse",
    "some-json": "someJson",
  };

  assert.expect(27);

  for (var key in datas) {
    if (datas.hasOwnProperty(key)) {
      var val = datas[key];
      div.data(key, val);

      assert.deepEqual(div.data(key), val, "get: " + key);
      assert.deepEqual(div.data(camelcase[key]), val, "get: " + camelcase[key]);

      div.removeData(key);

      assert.equal(div.data(key), undefined, "get: " + key);
    }
  }
});

QUnit.test(".data supports interoperable removal of properties SET TWICE #13850", function (assert) {
  var div = createElement();
  var datas = {
    "non-empty": "a string",
    "empty-string": "",
    "one-value": 1,
    "zero-value": 0,
    "an-array": [],
    "an-object": {},
    "bool-true": true,
    "bool-false": false,
    "some-json": JSON.stringify({ foo: "bar" }),
  };

  assert.expect(9);

  for (var key in datas) {
    if (datas.hasOwnProperty(key)) {
      var val = datas[key];
      div.data(key, val);
      div.data(key, val);

      div.removeData(key);

      assert.equal(div.data(key), undefined, "removal: " + key);
    }
  }
});

QUnit.test(".removeData supports removal of hyphenated properties via array (#12786, gh-2257)", function (assert) {
  assert.expect(4);

  var compare;

  var div = createElement();
  var plain = enrich({});

  // Properties should always be camelCased
  compare = {
    // From batch assignment .data({ "a-a": 1 })
    "aA": 1,

    // From property, value assignment .data("b-b", 1)
    "bB": 1,
  };

  // Mixed assignment
  div.data({ "a-a": 1 });
  div.data("b-b", 1);
  plain.data({ "a-a": 1 });
  plain.data("b-b", 1);

  assert.deepEqual(div.data(), compare, "Data appears as expected. (div)");
  assert.deepEqual(plain.data(), compare, "Data appears as expected. (plain)");

  div.removeData(["a-a", "b-b"]);
  plain.removeData(["a-a", "b-b"]);

  assert.deepEqual(div.data(), {}, "Data is empty. (div)");
  assert.deepEqual(plain.data(), {}, "Data is empty. (plain)");
});

QUnit.test("data-* with JSON value can have newlines", function (assert) {
  assert.expect(1);

  var x = createElement();
  x.dataset.some = JSON.stringify({ foo: "bar" });
  assert.equal(x.data("some").foo, "bar", "got a JSON data- attribute with spaces");
});

QUnit.test("Check that the expando is removed when there's no more data", function (assert) {
  assert.expect(2);

  var key;
  var div = createElement();
  div.data("some", "data");
  assert.equal(div.data("some"), "data", "Data is added");
  div.removeData("some");

  // Make sure the expando is gone
  for (key in div) {
    if (/^_exd/.test(key)) {
      assert.strictEqual(div[key], undefined, "Expando was not removed when there was no more data");
    }
  }
});

QUnit.test("Check that the expando is removed when there's no more data on non-nodes", function (assert) {
  assert.expect(1);

  var key;
  var obj = enrich({ key: 42 });
  obj.data("some", "data");
  assert.equal(obj.data("some"), "data", "Data is added");
  obj.removeData("some");

  // Make sure the expando is gone
  for (key in obj[0]) {
    if (/^_exd/.test(key)) {
      assert.ok(false, "Expando was not removed when there was no more data");
    }
  }
});

QUnit.test(".data(prop) does not create expando", function (assert) {
  assert.expect(1);

  var key;
  var div = createElement();

  assert.strictEqual(div.data("foo"), undefined, "No data exists after access");

  // Make sure no expando has been added
  for (key in div) {
    if (/^_exd/.test(key)) {
      assert.ok(false, "Expando was created on access");
    }
  }
});
