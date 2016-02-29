
var reorg = require("..");

describe("#constructor", function() {

  it("handles no constraints gracefully", function() {
    (function() {
      reorg(function(x) { return x; });
    }).should.not.throw();
  });

  it("wraps a simple function", function() {
    reorg(function(x) { return x; })(5).should.equal(5);
  });

  it("handles constraints", function() {
    (function() {
      reorg(function(x) { return x; }, "number");
    }).should.not.throw();
  });

  it("wraps a more complex function", function() {
    reorg(function(x) { return x; }, "number")(5).should.equal(5);
  });

  it("throws an error in provided function", function() {
    (function() { reorg(function(x) { return x; }, "number!")("Hi") }).should.throw();
  });

});


describe("#args", function() {

  it("handles missing arguments", function() {
    reorg.args().should.deepEqual([]);
  });

  it("handles an empty constraints", function() {
    reorg.args([]).should.deepEqual([]);
  });

  it("handles basic arrays", function() {
    reorg.args(["Hi", 5], ["string", "number"]).should.deepEqual(["Hi", 5]);
  });

  it("reorganizes results", function() {
    reorg.args(["Hi", 5], ["string", "object", "number"]).should.deepEqual(["Hi", {}, 5]);
  });

  it("truncates if requested", function() {
    reorg.args(["Hi", {}, 5], ["string"], true).should.deepEqual(["Hi"]);
  });

  it("throws errors as necessary", function() {
    (function() { reorg.args(["Hi", 5], ["number!", "object", "number"]) }).should.throw();
  });

});


describe("#checkArg", function() {

  it("passes on missing constraint", function() {
    reorg.checkArg(5).should.deepEqual({ pass: true, fallback: 5 });
  });

  it("handles basic constraints", function() {
    reorg.checkArg(5, "number").should.deepEqual({ pass: true, fallback: 5 });
  });

  it("handles array-like constraints", function() {
    reorg.checkArg(5, ["number"]).should.deepEqual({ pass: true, fallback: 5 });
  });

  it("handles user-provided fallbacks", function() {
    reorg.checkArg("Hi", ["number", 5]).should.deepEqual({ pass: false, fallback: 5 });
  });

  it("fails appropriately", function() {
    reorg.checkArg(6, "string").should.deepEqual({ pass: false, fallback: "" });
  });

  it("handles multiple tests", function() {
    function isNumber(x) { return "number" === typeof x; }
    function isPositive(x) { return x > 0; }
    reorg.checkArg(6, [[isNumber, isPositive]]).should.deepEqual({ pass: true, fallback: 6 });
    reorg.checkArg("Hi", [[isNumber, isPositive], 6]).should.deepEqual({ pass: false, fallback: 6 });
    reorg.checkArg("Hi", [["string", isPositive], 6]).should.deepEqual({ pass: false, fallback: 6 });
  });

});


describe("#isType", function() {

  it("checks types appropriately", function() {

    var vars = [, true, 1, "abc", {}, [], function() {}],
        types = ["undefined", "boolean", "number", "string", "object", "array", "function"];

    for (var i = 0, n = vars.length; i < n; i++)
      for (var j = 0, m = vars.length; j < m; j++)
        reorg.isType(vars[i], types[j]).should.equal(i === j);

  });

  it("returns true if no type provided", function() {

    var vars = [, true, 1, "abc", {}, [], function() {}];

    for (var i = 0, n = vars.length; i < n; i++)
      reorg.isType(vars[i]).should.equal(true);

  });

  it("throws error if requested", function() {

    var vars = [, true, 1, "abc", {}, [], function() {}],
        types = ["undefined!", "boolean!", "number!", "string!", "object!", "array!", "function!"];

    for (var i = 0, n = vars.length; i < n; i++)
      for (var j = 0, m = vars.length; j < m; j++) {
        if (i === j)
          reorg.isType(vars[i], types[j]).should.equal(true);
        else
          (function() { reorg.isType(vars[i], types[j]); }).should.throw();
      }

  });

  it("runs custom functions", function() {

    var test = function(x) { return "boolean" === typeof x; };
    reorg.isType(true, test).should.equal(true);
    reorg.isType(6, test).should.equal(false);

  });

  it("throws errors on bad input", function() {
    (function() { reorg.isType(true, 5)}).should.throw();
    (function() { reorg.isType(true, "not-a-type")}).should.throw();
  });

});


describe("#defaultForType", function() {

  it("provides the correct default for arrays", function() {
    reorg.defaultForType("array").should.deepEqual([]);
  });

  it("provides the correct default for string", function() {
    reorg.defaultForType("string").should.equal("");
  });

  it("provides the correct default for object", function() {
    reorg.defaultForType("object").should.deepEqual({});
  });

  it("provides the correct default for arrays", function() {
    reorg.defaultForType.should.throw();
    (function() { reorg.defaultForType("number"); }).should.throw();
    (function() { reorg.defaultForType("function"); }).should.throw();
    (function() { reorg.defaultForType("boolean"); }).should.throw();
    (function() { reorg.defaultForType("symbol"); }).should.throw();
    (function() { reorg.defaultForType("undefined"); }).should.throw();
  });

});
