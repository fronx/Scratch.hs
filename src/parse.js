function parseGap (type) {
  return gap(type);
}

function parseEditor (constr, args) {
  return editor(constr, parse(args));
}

function parsePrimitiveValue (value) {
  return value;
}

function parse (code) {
  if (code instanceof Array && code[0] instanceof Array)
    return code.map(parse);

  var parser =
    { "Editor":          parseEditor
    , "Gap":             parseGap
    , "PrimitiveValue":  parsePrimitiveValue
    }[code[0]];

  if (parser)
    return parser.apply(this, code.slice(1))
  else
    throw "no parser found for: " + JSON.stringify(code);
}

module.exports = parse;
