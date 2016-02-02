/*
 * reorg
 * Copyright(c) 2016 Brandon Carl
 * MIT Licensed.
 */

var reorg = module.exports = function reorg() {

  var constraints = Array.prototype.slice.call(arguments),
      fn = constraints.shift();

  return function() {
    var args = Array.prototype.slice.call(arguments);
    args = reorg.args(args, constraints, false);
    return fn.apply(null, args)
  }

};



reorg.checkArg = function checkArg(arg, constraint) {

  var pass,
      test,
      tests,
      value;

  // If constraint is array, get first element. e.g. ["object", { key : "value" }]
  if (Array.isArray(constraint)) {

    // If tests are array, get first value
    if (Array.isArray(constraint[0])) {
      tests = constraint[0].slice(0);
      test = tests.shift();
    } else
      test = constraint[0];

    if (constraint.length > 1)
      value = constraint[1];

  } else {
    test = constraint;
  }

  // Determine pass state
  pass = reorg.isType(arg, test);

  // Set value if not defined
  if (!pass && ("undefined" == typeof value))
    value = reorg.defaultForType(test);

  // Run additional tests
  while (tests && tests.length && !pass)
    pass = reorg.isType(arg, tests.shift());

  // Use existing value if ok
  if (pass) value = arg;

  return { pass : pass, fallback : value };

};



reorg.args = function args(argv, constraints, truncate) {

  var newArgv = [],
      argv = argv || [],
      result,
      j = 0;

  // Loop through constraints first
  for (var i = 0, n = constraints.length; i < n; i++) {
    result = reorg.checkArg(argv[j], constraints[i]);

    // arg passes constraint: push to new argv, get next arg
    if (result.pass)
      newArgv.push(argv[j++]);
    else
      newArgv.push(result.fallback);
  }

  // If any arguments are left, add them
  if (argv.length > j)
    newArgv = newArgv.concat(argv.slice(j));

  // Truncate results if requested
  if (truncate)
    newArgv = newArgv.slice(0, Math.max(argv.length, constraints.length));

  return newArgv;

};



reorg.isType = function isType(arg, type) {

  var typeofType = typeof(type)
      isRequired,
      isOk;

  if ("string" === typeofType) {

    // "!" suffix indicates we should throw an error if type mismatch
    if ("!" === type[type.length-1]) {
      isRequired = true;
      type = type.slice(0, -1);
    }

    // Arrays
    if ("array" === type)
      isOk = Array.isArray(arg);
    else
      isOk = (type === typeof(arg));

    if (isRequired && !isOk)
      throw new Error("Expected argument", arg, "to be of type", type);

    return isOk;

  }

  // Ignored variables
  if (type === null || "undefined" === typeofType)
    return true;

  // User-defined functions
  if ("function" === typeofType)
    return type(arg);

};


reorg.defaultForType = function defaultForType(type) {

  // Arrays
  if ("array" === type)
    return [];

  if ("string" === type)
    return "";

  if ("object" === type)
    return {};

  throw new Error("Defaults must be provided unless type is string, array or object")

