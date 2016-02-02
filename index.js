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

  return { pass : pass, value : value };

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
      newArgv.push(result.value);
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

  var typeType = typeof(type);

  // Ignored variables
  if (type === null || "undefined" === typeofType)
    return true;

  // User-defined functions
  if ("function" === typeType)
    return type(arg);

  // Arrays
  if ("array" === type)
    return Array.isArray(arg);

  // Everything else
  return (type === typeof(arg));

}


reorg.defaultForType = function defaultForType(type) {

  // Arrays
  if ("array" === type)
    return [];

  if ("string" === type)
    return "";

  if ("object" === type)
    return {};

  throw new Error("Defaults must be provided unless type is string, array or object")

