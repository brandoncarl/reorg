
var reorg = require("..");


describe("#isType", function() {

  it("checks types appropriately", function() {

    var vars = [, true, 1, "abc", {}, [], function() {}],
        types = ["undefined", "boolean", "number", "string", "object", "array", "function"];

    for (var i = 0, n = vars.length; i < n; i++)
      for (var j = 0, m = vars.length; j < m; j++)
        reorg.isType(vars[i], types[j]).should.equal(i === j);

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
